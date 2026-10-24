import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingsService } from './bookings.service';
import {
  ChangeRequest,
  ChangeRequestDocument,
} from './schemas/change-request.schema';
import {
  RequestBookingCancellationInput,
  RequestBookingChangeInput,
  ReviewChangeRequestInput,
} from './dto/change-request.dto';

@Injectable()
export class ChangeRequestsService {
  constructor(
    @InjectModel(ChangeRequest.name)
    private changeRequestModel: Model<ChangeRequestDocument>,
    private bookingsService: BookingsService,
  ) {}

  private async assertOwnedActiveBooking(userId: string, bookingId: string) {
    const booking = await this.bookingsService.findBookingOrThrow(bookingId);
    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('You can only request changes to your own bookings');
    }
    if (!['hold', 'pending_payment', 'confirmed'].includes(booking.status)) {
      throw new BadRequestException('This booking can no longer be changed');
    }
    return booking;
  }

  private async assertNoPendingRequest(bookingId: string) {
    const existing = await this.changeRequestModel
      .findOne({ bookingId: new Types.ObjectId(bookingId), status: 'pending' })
      .exec();
    if (existing) {
      throw new ConflictException('A request is already pending for this booking');
    }
  }

  async requestChange(
    userId: string,
    input: RequestBookingChangeInput,
  ): Promise<ChangeRequestDocument> {
    await this.assertOwnedActiveBooking(userId, input.bookingId);
    if (!input.newStartTime && !input.newDuration && !input.newCourtId) {
      throw new BadRequestException('At least one change must be requested');
    }
    await this.assertNoPendingRequest(input.bookingId);

    const request = new this.changeRequestModel({
      bookingId: new Types.ObjectId(input.bookingId),
      userId: new Types.ObjectId(userId),
      type: 'change',
      status: 'pending',
      requestedChanges: {
        newStartTime: input.newStartTime ? new Date(input.newStartTime) : undefined,
        newDuration: input.newDuration,
        newCourtId: input.newCourtId,
      },
      reason: input.reason,
    });
    return request.save();
  }

  async requestCancellation(
    userId: string,
    input: RequestBookingCancellationInput,
  ): Promise<ChangeRequestDocument> {
    await this.assertOwnedActiveBooking(userId, input.bookingId);
    await this.assertNoPendingRequest(input.bookingId);

    const request = new this.changeRequestModel({
      bookingId: new Types.ObjectId(input.bookingId),
      userId: new Types.ObjectId(userId),
      type: 'cancel',
      status: 'pending',
      reason: input.reason,
    });
    return request.save();
  }

  async listMine(userId: string): Promise<ChangeRequestDocument[]> {
    return this.changeRequestModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async listAll(status?: string): Promise<ChangeRequestDocument[]> {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    return this.changeRequestModel.find(query).sort({ createdAt: 1 }).exec();
  }

  async review(
    requestId: string,
    reviewerId: string,
    input: ReviewChangeRequestInput,
  ): Promise<ChangeRequestDocument> {
    if (!Types.ObjectId.isValid(requestId)) {
      throw new NotFoundException('Change request not found');
    }
    const request = await this.changeRequestModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException('Change request not found');
    }
    if (request.status !== 'pending') {
      throw new ConflictException('This request has already been reviewed');
    }

    if (input.approve) {
      if (request.type === 'cancel') {
        await this.bookingsService.applyApprovedCancellation(
          request.bookingId.toString(),
        );
      } else {
        const booking = await this.bookingsService.findBookingOrThrow(
          request.bookingId.toString(),
        );
        const changes = request.requestedChanges ?? {};
        await this.bookingsService.applyApprovedChange(
          request.bookingId.toString(),
          {
            courtId: changes.newCourtId ?? booking.courtId.toString(),
            startTime: changes.newStartTime
              ? new Date(changes.newStartTime)
              : booking.startTime,
            duration: changes.newDuration ?? booking.duration,
            userId: request.userId.toString(),
          },
        );
      }
    }

    request.status = input.approve ? 'approved' : 'rejected';
    request.staffResponse = input.staffResponse;
    request.reviewedBy = new Types.ObjectId(reviewerId);
    request.reviewedAt = new Date();
    return request.save();
  }
}
