import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AvailabilityService } from './availability.service';
import { PricingService } from './pricing.service';
import { ACTIVE_BOOKING_STATUSES, assertTransition } from './booking-state';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';
import { BookingSlot, BookingSlotDocument } from './schemas/booking-slot.schema';
import { BlockedSlot, BlockedSlotDocument } from './schemas/blocked-slot.schema';
import { CreateBookingHoldInput } from './dto/booking.dto';
import { addMinutes } from './time.util';

interface CreateHoldOptions {
  userId: string;
  input: CreateBookingHoldInput;
}

interface ApprovedChange {
  courtId: string;
  startTime: Date;
  duration: number;
  userId: string;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(BookingSlot.name)
    private bookingSlotModel: Model<BookingSlotDocument>,
    @InjectModel(BlockedSlot.name)
    private blockedSlotModel: Model<BlockedSlotDocument>,
    @InjectConnection() private connection: Connection,
    private availabilityService: AvailabilityService,
    private pricingService: PricingService,
  ) {}

  private generateBookingNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PB-${date}-${random}`;
  }

  private slotStarts(startTime: Date, endTime: Date, granularity: number): Date[] {
    const slots: Date[] = [];
    const step = granularity * 60 * 1000;
    for (let time = startTime.getTime(); time < endTime.getTime(); time += step) {
      slots.push(new Date(time));
    }
    return slots;
  }

  private isDuplicateKeyError(error: unknown): boolean {
    const anyError = error as { code?: number; message?: string; writeErrors?: unknown[] };
    return (
      anyError?.code === 11000 ||
      anyError?.code === 11001 ||
      Boolean(anyError?.writeErrors)
    );
  }

  private isTransactionUnsupported(error: unknown): boolean {
    const message = (error as { message?: string })?.message ?? '';
    return (
      message.includes('Transaction numbers are only allowed') ||
      message.includes('replica set') ||
      message.includes('mongos')
    );
  }

  async createHold({ userId, input }: CreateHoldOptions): Promise<BookingDocument> {
    const { court, venue, settings } = await this.availabilityService.getCourtContext(
      input.courtId,
    );
    this.availabilityService.validateDuration(input.duration, settings);
    const startTime = new Date(input.startTime);
    this.availabilityService.validateStartTime(startTime, settings);
    const endTime = addMinutes(startTime, input.duration);
    this.availabilityService.validateWithinOperatingHours(
      startTime,
      endTime,
      venue,
      settings,
    );
    const pricing = this.pricingService.quote(court, input.duration, settings.currency);

    const slotStarts = this.slotStarts(
      startTime,
      endTime,
      settings.granularityMinutes,
    );
    const holdExpiresAt = addMinutes(new Date(), settings.holdMinutes);
    const bookingNumber = this.generateBookingNumber();

    const buildBooking = (bookingId: Types.ObjectId) => ({
      _id: bookingId,
      bookingNumber,
      userId: new Types.ObjectId(userId),
      courtId: court._id,
      venueId: court.venueId,
      startTime,
      endTime,
      duration: input.duration,
      status: 'hold' as BookingStatus,
      pricing,
      holdExpiresAt,
    });

    const session = await this.connection.startSession();
    try {
      let created: BookingDocument | null = null;
      await session.withTransaction(async () => {
        const free = await this.availabilityService.isRangeFree(
          court._id.toString(),
          startTime,
          endTime,
          { session },
        );
        if (!free) {
          throw new ConflictException({
            message: 'The selected time slot is no longer available',
            code: 'BOOKING_CONFLICT',
          });
        }
        const bookingId = new Types.ObjectId();
        const slots = slotStarts.map((startAt) => ({
          courtId: court._id,
          startAt,
          bookingId,
        }));
        await this.bookingSlotModel.insertMany(slots, { session, ordered: true });
        const booking = new this.bookingModel(buildBooking(bookingId));
        created = await booking.save({ session });
      });
      if (!created) {
        throw new ConflictException('Unable to create booking hold');
      }
      return created;
    } catch (error) {
      if (this.isTransactionUnsupported(error)) {
        return this.createHoldWithoutTransaction(buildBooking, slotStarts, court._id);
      }
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException({
          message: 'The selected time slot is no longer available',
          code: 'BOOKING_CONFLICT',
        });
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async createHoldWithoutTransaction(
    buildBooking: (bookingId: Types.ObjectId) => Record<string, unknown>,
    slotStarts: Date[],
    courtId: Types.ObjectId,
  ): Promise<BookingDocument> {
    const bookingId = new Types.ObjectId();
    const slots = slotStarts.map((startAt) => ({ courtId, startAt, bookingId }));
    try {
      await this.bookingSlotModel.insertMany(slots, { ordered: true });
    } catch (error) {
      await this.bookingSlotModel.deleteMany({ bookingId }).exec();
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException({
          message: 'The selected time slot is no longer available',
          code: 'BOOKING_CONFLICT',
        });
      }
      throw error;
    }

    try {
      const booking = new this.bookingModel(buildBooking(bookingId));
      return await booking.save();
    } catch (error) {
      await this.bookingSlotModel.deleteMany({ bookingId }).exec();
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException({
          message: 'The selected time slot is no longer available',
          code: 'BOOKING_CONFLICT',
        });
      }
      throw error;
    }
  }

  async cancelHold(userId: string, bookingId: string): Promise<BookingDocument> {
    const booking = await this.findBookingOrThrow(bookingId);
    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }
    assertTransition(booking.status, 'cancelled');
    if (booking.status !== 'hold') {
      throw new ForbiddenException('Only pending holds can be cancelled here');
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'cancelled_by_customer';
    const saved = await booking.save();
    await this.bookingSlotModel.deleteMany({ bookingId: booking._id }).exec();
    return saved;
  }

  async getMyBookings(
    userId: string,
    status?: string,
    limit = 50,
  ): Promise<BookingDocument[]> {
    const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (status) query.status = status;
    return this.bookingModel
      .find(query)
      .sort({ startTime: -1 })
      .limit(Math.min(Math.max(limit, 1), 100))
      .exec();
  }

  async getBooking(
    id: string,
    userId: string,
    role: string,
  ): Promise<BookingDocument> {
    const booking = await this.findBookingOrThrow(id);
    if (role === 'customer' && booking.userId.toString() !== userId) {
      throw new ForbiddenException('You cannot access this booking');
    }
    return booking;
  }

  async getAllBookings(status?: string, limit = 100): Promise<BookingDocument[]> {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    return this.bookingModel
      .find(query)
      .sort({ startTime: -1 })
      .limit(Math.min(Math.max(limit, 1), 200))
      .exec();
  }

  async expireStaleHolds(): Promise<number> {
    const now = new Date();
    const stale = await this.bookingModel
      .find({ status: 'hold', holdExpiresAt: { $lt: now } })
      .limit(500)
      .exec();
    if (stale.length === 0) return 0;

    const ids = stale.map((booking) => booking._id);
    await this.bookingModel
      .updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: now,
            cancellationReason: 'hold_expired',
          },
        },
      )
      .exec();
    await this.bookingSlotModel.deleteMany({ bookingId: { $in: ids } }).exec();
    return stale.length;
  }

  async applyApprovedCancellation(bookingId: string): Promise<BookingDocument> {
    const booking = await this.findBookingOrThrow(bookingId);
    if (booking.status === 'cancelled') return booking;
    assertTransition(booking.status, 'cancelled');
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'change_request_approved';
    const saved = await booking.save();
    await this.bookingSlotModel.deleteMany({ bookingId: booking._id }).exec();
    return saved;
  }

  async applyApprovedChange(
    bookingId: string,
    change: ApprovedChange,
  ): Promise<BookingDocument> {
    const booking = await this.findBookingOrThrow(bookingId);
    if (booking.status === 'cancelled') {
      throw new ForbiddenException('Cancelled bookings cannot be changed');
    }
    const { court, venue, settings } =
      await this.availabilityService.getCourtContext(change.courtId);
    this.availabilityService.validateDuration(change.duration, settings);
    this.availabilityService.validateStartTime(change.startTime, settings);
    const endTime = addMinutes(change.startTime, change.duration);
    this.availabilityService.validateWithinOperatingHours(
      change.startTime,
      endTime,
      venue,
      settings,
    );
    const pricing = this.pricingService.quote(
      court,
      change.duration,
      settings.currency,
    );
    const slotStarts = this.slotStarts(
      change.startTime,
      endTime,
      settings.granularityMinutes,
    );

    const session = await this.connection.startSession();
    try {
      let updated: BookingDocument | null = null;
      try {
        await session.withTransaction(async () => {
          const free = await this.availabilityService.isRangeFree(
            change.courtId,
            change.startTime,
            endTime,
            { excludeBookingId: bookingId, session },
          );
          if (!free) {
            throw new ConflictException({
              message: 'The requested new time is no longer available',
              code: 'BOOKING_CONFLICT',
            });
          }
          await this.bookingSlotModel
            .deleteMany({ bookingId: booking._id }, { session })
            .exec();
          await this.bookingSlotModel.insertMany(
            slotStarts.map((startAt) => ({
              courtId: court._id,
              startAt,
              bookingId: booking._id,
            })),
            { session, ordered: true },
          );
          booking.courtId = court._id;
          booking.venueId = court.venueId;
          booking.startTime = change.startTime;
          booking.endTime = endTime;
          booking.duration = change.duration;
          booking.pricing = pricing;
          updated = await booking.save({ session });
        });
      } catch (error) {
        if (this.isTransactionUnsupported(error)) {
          const free = await this.availabilityService.isRangeFree(
            change.courtId,
            change.startTime,
            endTime,
            { excludeBookingId: bookingId },
          );
          if (!free) {
            throw new ConflictException({
              message: 'The requested new time is no longer available',
              code: 'BOOKING_CONFLICT',
            });
          }
          await this.bookingSlotModel.deleteMany({ bookingId: booking._id }).exec();
          await this.bookingSlotModel.insertMany(
            slotStarts.map((startAt) => ({
              courtId: court._id,
              startAt,
              bookingId: booking._id,
            })),
            { ordered: true },
          );
          booking.courtId = court._id;
          booking.venueId = court.venueId;
          booking.startTime = change.startTime;
          booking.endTime = endTime;
          booking.duration = change.duration;
          booking.pricing = pricing;
          updated = await booking.save();
        } else {
          throw error;
        }
      }
      if (!updated) throw new ConflictException('Unable to apply booking change');
      return updated;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException({
          message: 'The requested new time is no longer available',
          code: 'BOOKING_CONFLICT',
        });
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async createBlockedSlot(data: {
    courtId?: string;
    startTime: Date;
    endTime: Date;
    reason: string;
    type: string;
    createdBy?: string;
  }): Promise<BlockedSlotDocument> {
    const block = new this.blockedSlotModel({
      courtId: data.courtId ? new Types.ObjectId(data.courtId) : undefined,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
      type: data.type,
      createdBy: data.createdBy ? new Types.ObjectId(data.createdBy) : undefined,
    });
    return block.save();
  }

  async deleteBlockedSlot(id: string): Promise<boolean> {
    const result = await this.blockedSlotModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }

  async getBlockedSlots(
    courtId?: string,
    from?: string,
    to?: string,
  ): Promise<BlockedSlotDocument[]> {
    const query: Record<string, unknown> = {};
    if (courtId) {
      query.$or = [
        { courtId: new Types.ObjectId(courtId) },
        { courtId: { $exists: false } },
        { courtId: null },
      ];
    }
    if (from || to) {
      query.startTime = {};
      query.endTime = {};
      if (to) (query.startTime as Record<string, unknown>).$lt = new Date(to);
      if (from) (query.endTime as Record<string, unknown>).$gt = new Date(from);
    }
    return this.blockedSlotModel.find(query).sort({ startTime: 1 }).exec();
  }

  async findBookingOrThrow(id: string): Promise<BookingDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Booking not found');
    }
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  static isActiveStatus(status: string): boolean {
    return ACTIVE_BOOKING_STATUSES.includes(status as BookingStatus);
  }
}
