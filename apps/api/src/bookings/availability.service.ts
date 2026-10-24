import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { CourtsService } from '../courts/courts.service';
import { VenueService } from '../venue/venue.service';
import { PricingService, PriceQuote } from './pricing.service';
import { ACTIVE_BOOKING_STATUSES } from './booking-state';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { BookingSlot, BookingSlotDocument } from './schemas/booking-slot.schema';
import { BlockedSlot, BlockedSlotDocument } from './schemas/blocked-slot.schema';
import {
  OperatingHours,
  ResolvedVenueSettings,
  addMinutes,
  diffMinutes,
  formatLocalDate,
  formatLocalTime,
  getDayOfWeek,
  getOperatingHours,
  isAlignedToGranularity,
  resolveVenueSettings,
  timeStringToMinutes,
  zonedTimeToUtc,
} from './time.util';
import { CourtDocument } from '../courts/schemas/court.schema';
import { VenueDocument } from '../venue/schemas/venue.schema';

export interface CourtContext {
  court: CourtDocument;
  venue: VenueDocument | null;
  settings: ResolvedVenueSettings;
}

export interface TimeSlotResult {
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
}

export interface QuoteResult {
  available: boolean;
  reason?: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricing?: PriceQuote;
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(BookingSlot.name)
    private bookingSlotModel: Model<BookingSlotDocument>,
    @InjectModel(BlockedSlot.name)
    private blockedSlotModel: Model<BlockedSlotDocument>,
    private courtsService: CourtsService,
    private venueService: VenueService,
    private pricingService: PricingService,
  ) {}

  async getCourtContext(courtId: string): Promise<CourtContext> {
    if (!Types.ObjectId.isValid(courtId)) {
      throw new NotFoundException('Court not found');
    }
    const court = await this.courtsService.findById(courtId);
    if (!court || !court.isActive) {
      throw new NotFoundException('Court not found');
    }
    const venue = await this.venueService.findById(court.venueId);
    return { court, venue, settings: resolveVenueSettings(venue) };
  }

  validateDuration(duration: number, settings: ResolvedVenueSettings): void {
    if (!Number.isInteger(duration)) {
      throw new BadRequestException('Duration must be a whole number of minutes');
    }
    if (duration < settings.minDuration || duration > settings.maxDuration) {
      throw new BadRequestException(
        `Duration must be between ${settings.minDuration} and ${settings.maxDuration} minutes`,
      );
    }
    if (duration % settings.granularityMinutes !== 0) {
      throw new BadRequestException(
        `Duration must be a multiple of ${settings.granularityMinutes} minutes`,
      );
    }
  }

  validateStartTime(startTime: Date, settings: ResolvedVenueSettings): void {
    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid start time');
    }
    if (!isAlignedToGranularity(startTime, settings.granularityMinutes)) {
      throw new BadRequestException(
        `Start time must be aligned to ${settings.granularityMinutes}-minute intervals`,
      );
    }
    const now = Date.now();
    if (startTime.getTime() < now - 60_000) {
      throw new BadRequestException('Start time must be in the future');
    }
    const latest = now + settings.advanceDays * 24 * 60 * 60 * 1000;
    if (startTime.getTime() > latest) {
      throw new BadRequestException(
        `Bookings can only be made up to ${settings.advanceDays} days in advance`,
      );
    }
  }

  validateWithinOperatingHours(
    startTime: Date,
    endTime: Date,
    venue: VenueDocument | null,
    settings: ResolvedVenueSettings,
  ): void {
    const localDate = formatLocalDate(startTime, settings.timezone);
    const endLocalDate = formatLocalDate(endTime, settings.timezone);
    if (localDate !== endLocalDate) {
      throw new BadRequestException('Bookings cannot cross midnight');
    }
    const hours = this.getHoursForDate(venue, localDate, settings);
    if (hours.isClosed) {
      throw new BadRequestException('The venue is closed on this date');
    }
    const startMinutes = timeStringToMinutes(formatLocalTime(startTime, settings.timezone));
    const endMinutes = timeStringToMinutes(formatLocalTime(endTime, settings.timezone));
    if (
      startMinutes < timeStringToMinutes(hours.openTime) ||
      endMinutes > timeStringToMinutes(hours.closeTime)
    ) {
      throw new BadRequestException(
        `Booking must be between ${hours.openTime} and ${hours.closeTime}`,
      );
    }
  }

  getHoursForDate(
    venue: VenueDocument | null,
    localDate: string,
    settings: ResolvedVenueSettings,
  ): OperatingHours {
    return getOperatingHours(venue, getDayOfWeek(localDate), settings);
  }

  private overlapQuery(courtId: string | Types.ObjectId, start: Date, end: Date) {
    return {
      courtId: new Types.ObjectId(courtId),
      startTime: { $lt: end },
      endTime: { $gt: start },
    };
  }

  private blockedOverlapQuery(courtId: string | Types.ObjectId, start: Date, end: Date) {
    return {
      $and: [
        {
          $or: [
            { courtId: new Types.ObjectId(courtId) },
            { courtId: { $exists: false } },
            { courtId: null },
          ],
        },
        { startTime: { $lt: end } },
        { endTime: { $gt: start } },
      ],
    };
  }

  async checkAvailability(
    courtId: string,
    startTime: Date,
    endTime: Date,
    options: { excludeBookingId?: string; session?: ClientSession } = {},
  ): Promise<{ available: boolean; reason?: string }> {
    const bookingQuery: Record<string, unknown> = {
      ...this.overlapQuery(courtId, startTime, endTime),
      status: { $in: ACTIVE_BOOKING_STATUSES },
    };
    if (options.excludeBookingId) {
      bookingQuery._id = { $ne: new Types.ObjectId(options.excludeBookingId) };
    }

    let bookingQueryExec = this.bookingModel.findOne(bookingQuery);
    if (options.session) bookingQueryExec = bookingQueryExec.session(options.session);
    const conflictingBooking = await bookingQueryExec.lean().exec();
    if (conflictingBooking) {
      return { available: false, reason: 'The selected time slot is no longer available' };
    }

    let blockedQueryExec = this.blockedSlotModel.findOne(
      this.blockedOverlapQuery(courtId, startTime, endTime),
    );
    if (options.session) blockedQueryExec = blockedQueryExec.session(options.session);
    const blocked = await blockedQueryExec.lean().exec();
    if (blocked) {
      return { available: false, reason: 'The court is blocked during the selected time' };
    }

    return { available: true };
  }

  async getAvailableSlots(courtId: string, dateStr: string): Promise<TimeSlotResult[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }
    const { court, venue, settings } = await this.getCourtContext(courtId);
    const dayOfWeek = getDayOfWeek(dateStr);
    const hours = getOperatingHours(venue, dayOfWeek, settings);
    if (hours.isClosed) {
      return [];
    }

    const dayStart = zonedTimeToUtc(dateStr, hours.openTime, settings.timezone);
    const dayEnd = zonedTimeToUtc(dateStr, hours.closeTime, settings.timezone);
    const openMinutes = timeStringToMinutes(hours.openTime);
    const closeMinutes = timeStringToMinutes(hours.closeTime);
    const step = settings.slotMinutes;

    const bookings = await this.bookingModel
      .find({
        courtId: court._id,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        startTime: { $lt: dayEnd },
        endTime: { $gt: dayStart },
      })
      .lean()
      .exec();

    const blocks = await this.blockedSlotModel
      .find({
        ...this.blockedOverlapQuery(court._id, dayStart, dayEnd),
      })
      .lean()
      .exec();

    const { price } = this.pricingService.fromPrice(
      court,
      settings.minDuration,
      settings.currency,
    );

    const slots: TimeSlotResult[] = [];
    const now = Date.now();
    for (let minutes = openMinutes; minutes + step <= closeMinutes; minutes += step) {
      const startTime = zonedTimeToUtc(dateStr, minutesToHhMm(minutes), settings.timezone);
      const endTime = addMinutes(startTime, step);
      const overlapsBooking = bookings.some(
        (booking) =>
          booking.startTime.getTime() < endTime.getTime() &&
          booking.endTime.getTime() > startTime.getTime(),
      );
      const overlapsBlock = blocks.some((block) => {
        const blockStart = new Date(block.startTime).getTime();
        const blockEnd = new Date(block.endTime).getTime();
        return blockStart < endTime.getTime() && blockEnd > startTime.getTime();
      });
      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        available: !overlapsBooking && !overlapsBlock && startTime.getTime() >= now - 60_000,
        price,
      });
    }
    return slots;
  }

  async getQuote(courtId: string, startIso: string, duration: number): Promise<QuoteResult> {
    const { court, venue, settings } = await this.getCourtContext(courtId);
    this.validateDuration(duration, settings);
    const startTime = new Date(startIso);
    this.validateStartTime(startTime, settings);
    const endTime = addMinutes(startTime, duration);
    this.validateWithinOperatingHours(startTime, endTime, venue, settings);
    const pricing = this.pricingService.quote(court, duration, settings.currency);
    const availability = await this.checkAvailability(courtId, startTime, endTime);
    return {
      available: availability.available,
      reason: availability.reason,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: diffMinutes(startTime, endTime),
      pricing,
    };
  }

  async isRangeFree(
    courtId: string,
    startTime: Date,
    endTime: Date,
    options: { excludeBookingId?: string; session?: ClientSession } = {},
  ): Promise<boolean> {
    const result = await this.checkAvailability(courtId, startTime, endTime, options);
    return result.available;
  }
}

function minutesToHhMm(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
