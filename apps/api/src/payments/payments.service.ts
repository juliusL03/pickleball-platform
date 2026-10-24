import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { PaymongoGateway } from './gateways/paymongo.gateway';
import { InitiatePaymentInput, RefundPaymentInput, VerifyBankTransferInput } from './dto/payment.dto';
import { canTransition, assertTransition } from '../bookings/booking-state';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly paymongo: PaymongoGateway,
    private readonly configService: ConfigService,
  ) {}

  async initiatePayment(userId: string, input: InitiatePaymentInput) {
    const booking = await this.bookingModel.findById(input.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('Not authorized');
    }
    const status = booking.status;
    if (status !== 'hold' && status !== 'pending_payment') {
      throw new BadRequestException('Booking not eligible for payment');
    }

    // Check existing unpaid payment
    const existing = await this.paymentModel.findOne({
      bookingId: booking._id,
      status: { $in: ['pending', 'processing'] },
    });
    if (existing) {
      return existing;
    }

    const amount = booking.pricing?.total || 0;
    const currency = booking.pricing?.currency || 'PHP';

    const payment = await this.paymentModel.create({
      bookingId: booking._id,
      userId: new Types.ObjectId(userId),
      amount,
      currency,
      method: input.method,
      status: input.method === 'bank_transfer' ? 'pending' : 'processing',
      bankTransfer:
        input.method === 'bank_transfer'
          ? {
              referenceNumber: input.referenceNumber,
              proofImageUrl: input.proofImageUrl,
            }
          : undefined,
      gateway:
        input.method !== 'bank_transfer'
          ? {
              provider: 'paymongo',
            }
          : undefined,
      webhookEvents: [],
      metadata: { bookingNumber: booking.bookingNumber },
    });

    if (input.method !== 'bank_transfer') {
      const result = await this.paymongo.createPayment(
        {
          amount,
          currency,
          description: `Booking ${booking.bookingNumber}`,
          bookingId: booking._id.toString(),
          metadata: { bookingNumber: booking.bookingNumber },
        },
        input.method as any,
      );
      payment.gateway = {
        provider: 'paymongo',
        transactionId: result.id,
        referenceNumber: result.referenceNumber,
      };
      (payment as any).checkoutUrl = result.checkoutUrl;
      await payment.save();
    }

    // Transition booking to pending_payment if currently hold
    if (status === 'hold') {
      if (canTransition(status, 'pending_payment')) {
        booking.status = 'pending_payment';
        await booking.save();
      }
    }

    return payment;
  }

  async handleWebhook(rawBody: Buffer | string, signature: string) {
    const verification = this.paymongo.verifyWebhook({ rawBody, signature });
    if (!verification.valid || !verification.event) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = verification.event;
    const eventId = event.id;

    // Try to find payment by transaction id
    let payment: PaymentDocument | null = null;
    const intentId =
      event?.data?.attributes?.data?.id ||
      event?.data?.attributes?.payment_intent?.id ||
      event?.data?.id;

    if (intentId) {
      payment = await this.paymentModel.findOne({ 'gateway.transactionId': intentId });
    }

    if (!payment) {
      const bookingId = event?.data?.attributes?.data?.attributes?.metadata?.bookingId;
      if (bookingId && Types.ObjectId.isValid(bookingId)) {
        const booking = await this.bookingModel.findById(bookingId);
        if (booking) {
          payment = await this.paymentModel.findOne({
            bookingId: booking._id,
            status: { $in: ['pending', 'processing'] },
          });
        }
      }
    }

    if (!payment) {
      return { received: true };
    }

    // Idempotency check
    if (payment.webhookEvents?.some((e) => e.eventId === eventId && e.processed)) {
      return { received: true, duplicate: true };
    }

    const eventType = event.type;

    if (eventType === 'payment.paid' || eventType === 'payment_intent.succeeded') {
      if (payment.status !== 'paid') {
        payment.status = 'paid';
        payment.paidAt = new Date();
        if (event?.data?.attributes?.fee) {
          payment.gateway = payment.gateway || {};
          payment.gateway.fee = event.data.attributes.fee / 100;
        }
        await payment.save();

        const booking = await this.bookingModel.findById(payment.bookingId);
        if (booking) {
          const bStatus = booking.status;
          if (canTransition(bStatus, 'confirmed')) {
            booking.status = 'confirmed';
            booking.confirmedAt = new Date();
            await booking.save();
          }
        }
      }
    } else if (eventType === 'payment.failed' || eventType === 'payment_intent.payment_failed') {
      if (payment.status !== 'paid') {
        payment.status = 'failed';
        await payment.save();
      }
    }

    payment.webhookEvents.push({
      eventId,
      receivedAt: new Date(),
      processed: true,
    });
    await payment.save();

    return { received: true };
  }

  async verifyBankTransfer(staffId: string, input: VerifyBankTransferInput) {
    const staff = await this.userModel.findById(staffId);
    if (!staff || (staff.role !== 'staff' && staff.role !== 'owner')) {
      throw new ForbiddenException('Staff access required');
    }

    const payment = await this.paymentModel.findById(input.paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.method !== 'bank_transfer') {
      throw new BadRequestException('Not a bank transfer payment');
    }
    if (payment.status === 'paid') {
      return payment;
    }

    if (input.approved) {
      payment.status = 'paid';
      payment.paidAt = new Date();
      payment.bankTransfer = payment.bankTransfer || {};
      (payment.bankTransfer as any).verifiedBy = new Types.ObjectId(staffId);
      payment.bankTransfer.verifiedAt = new Date();
      if (input.notes) payment.bankTransfer.notes = input.notes;
      await payment.save();

      const booking = await this.bookingModel.findById(payment.bookingId);
      if (booking) {
        const bStatus = booking.status;
        if (canTransition(bStatus, 'confirmed')) {
          booking.status = 'confirmed';
          booking.confirmedAt = new Date();
          await booking.save();
        }
      }
    } else {
      payment.status = 'failed';
      payment.bankTransfer = payment.bankTransfer || {};
      if (input.notes) payment.bankTransfer.notes = input.notes;
      await payment.save();
    }

    return payment;
  }

  async refundPayment(staffId: string, input: RefundPaymentInput) {
    const staff = await this.userModel.findById(staffId);
    if (!staff || (staff.role !== 'staff' && staff.role !== 'owner')) {
      throw new ForbiddenException('Staff access required');
    }

    const payment = await this.paymentModel.findById(input.paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'paid') {
      throw new BadRequestException('Payment not refundable');
    }

    try {
      if (payment.gateway?.provider === 'paymongo' && payment.gateway?.transactionId) {
        await this.paymongo.refund({
          paymentId: payment.gateway.transactionId,
          amount: input.amount,
          reason: input.reason,
        });
      }
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Refund failed');
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundAmount = input.amount || payment.amount;
    payment.refundReason = input.reason;
    await payment.save();

    const booking = await this.bookingModel.findById(payment.bookingId);
    if (booking) {
      const bStatus = booking.status;
      if (canTransition(bStatus, 'cancelled')) {
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancellationReason = input.reason || 'Refunded';
        await booking.save();
      }
    }

    return payment;
  }

  async myPayments(userId: string) {
    return this.paymentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async payments(status?: string, limit = 50) {
    const query: any = {};
    if (status) query.status = status;
    return this.paymentModel.find(query).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async payment(id: string) {
    const payment = await this.paymentModel.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async paymentByBooking(bookingId: string) {
    return this.paymentModel.findOne({ bookingId: new Types.ObjectId(bookingId) }).sort({ createdAt: -1 });
  }
}
