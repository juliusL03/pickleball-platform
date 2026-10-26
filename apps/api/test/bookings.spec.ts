import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { createTestContext, TestContext } from './test-context';

describe('Bookings and availability', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await ctx.teardown();
  });

  it('returns slots within operating hours', async () => {
    const slots = await ctx.availabilityService.getAvailableSlots(
      ctx.courtId,
      ctx.dateStr,
    );
    expect(slots).toHaveLength(24);
    expect(slots.every((slot) => slot.available)).toBe(true);
    expect(slots[0].price).toBe(500);
  });

  it('quotes a valid booking', async () => {
    const quote = await ctx.availabilityService.getQuote(
      ctx.courtId,
      ctx.at('10:00'),
      60,
    );
    expect(quote.available).toBe(true);
    expect(quote.pricing?.total).toBe(500);
  });

  it('creates a hold and blocks its slots', async () => {
    const userId = new Types.ObjectId().toString();
    const booking = await ctx.bookingsService.createHold({
      userId,
      input: {
        courtId: ctx.courtId,
        startTime: ctx.at('10:00'),
        duration: 60,
      },
    });

    expect(booking.status).toBe('hold');
    expect(booking.holdExpiresAt).toBeDefined();

    const slots = await ctx.availabilityService.getAvailableSlots(
      ctx.courtId,
      ctx.dateStr,
    );
    const ten = slots.find((slot) => slot.startTime === ctx.at('10:00'));
    const tenThirty = slots.find((slot) => slot.startTime === ctx.at('10:30'));
    const eleven = slots.find((slot) => slot.startTime === ctx.at('11:00'));
    expect(ten?.available).toBe(false);
    expect(tenThirty?.available).toBe(false);
    expect(eleven?.available).toBe(true);
  });

  it('allows an adjacent booking', async () => {
    const userId = new Types.ObjectId().toString();
    const booking = await ctx.bookingsService.createHold({
      userId,
      input: {
        courtId: ctx.courtId,
        startTime: ctx.at('11:00'),
        duration: 60,
      },
    });
    expect(booking.status).toBe('hold');
  });

  it('rejects overlapping holds', async () => {
    const userId = new Types.ObjectId().toString();
    await expect(
      ctx.bookingsService.createHold({
        userId,
        input: {
          courtId: ctx.courtId,
          startTime: ctx.at('10:30'),
          duration: 60,
        },
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents double-booking under concurrent requests', async () => {
    const attempts = Array.from({ length: 6 }, () =>
      ctx.bookingsService.createHold({
        userId: new Types.ObjectId().toString(),
        input: {
          courtId: ctx.courtId,
          startTime: ctx.at('14:00'),
          duration: 60,
        },
      }),
    );

    const results = await Promise.allSettled(attempts);
    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(5);
  });

  it('expires stale holds and frees the slot', async () => {
    const userId = new Types.ObjectId().toString();
    const booking = await ctx.bookingsService.createHold({
      userId,
      input: {
        courtId: ctx.courtId,
        startTime: ctx.at('16:00'),
        duration: 60,
      },
    });

    const model = ctx.connection.model('Booking');
    await model
      .updateOne(
        { _id: booking._id },
        { $set: { holdExpiresAt: new Date(Date.now() - 60_000) } },
      )
      .exec();

    const expired = await ctx.bookingsService.expireStaleHolds();
    expect(expired).toBeGreaterThanOrEqual(1);

    const updated = await model.findById(booking._id).lean().exec();
    expect((updated as any).status).toBe('cancelled');
    expect((updated as any).cancellationReason).toBe('hold_expired');

    const available = await ctx.availabilityService.checkAvailability(
      ctx.courtId,
      new Date(ctx.at('16:00')),
      new Date(ctx.at('17:00')),
    );
    expect(available.available).toBe(true);
  });

  it('rejects unsupported durations', async () => {
    const userId = new Types.ObjectId().toString();
    await expect(
      ctx.bookingsService.createHold({
        userId,
        input: {
          courtId: ctx.courtId,
          startTime: ctx.at('11:00'),
          duration: 75,
        },
      }),
    ).rejects.toThrow();
  });

  it('processes an approved cancellation request', async () => {
    const userId = new Types.ObjectId().toString();
    const booking = await ctx.bookingsService.createHold({
      userId,
      input: {
        courtId: ctx.courtId,
        startTime: ctx.at('12:00'),
        duration: 60,
      },
    });

    const request = await ctx.changeRequestsService.requestCancellation(userId, {
      bookingId: booking._id.toString(),
      reason: 'Schedule conflict',
    });
    expect(request.status).toBe('pending');

    const reviewed = await ctx.changeRequestsService.review(
      request._id.toString(),
      new Types.ObjectId().toString(),
      { approve: true, staffResponse: 'Approved' },
    );
    expect(reviewed.status).toBe('approved');

    const updated = await ctx.bookingsService.findBookingOrThrow(
      booking._id.toString(),
    );
    expect(updated.status).toBe('cancelled');

    const available = await ctx.availabilityService.checkAvailability(
      ctx.courtId,
      new Date(ctx.at('12:00')),
      new Date(ctx.at('13:00')),
    );
    expect(available.available).toBe(true);
  });

  it('processes an approved schedule change', async () => {
    const userId = new Types.ObjectId().toString();
    const booking = await ctx.bookingsService.createHold({
      userId,
      input: {
        courtId: ctx.courtId,
        startTime: ctx.at('13:00'),
        duration: 60,
      },
    });

    const request = await ctx.changeRequestsService.requestChange(userId, {
      bookingId: booking._id.toString(),
      newStartTime: ctx.at('15:00'),
      newDuration: 90,
      reason: 'Need a later slot',
    });

    await ctx.changeRequestsService.review(
      request._id.toString(),
      new Types.ObjectId().toString(),
      { approve: true },
    );

    const updated = await ctx.bookingsService.findBookingOrThrow(
      booking._id.toString(),
    );
    expect(updated.startTime.toISOString()).toBe(ctx.at('15:00'));
    expect(updated.duration).toBe(90);
    expect(updated.pricing.total).toBe(750);

    const oldRange = await ctx.availabilityService.checkAvailability(
      ctx.courtId,
      new Date(ctx.at('13:00')),
      new Date(ctx.at('14:00')),
    );
    expect(oldRange.available).toBe(true);

    const newRange = await ctx.availabilityService.checkAvailability(
      ctx.courtId,
      new Date(ctx.at('15:00')),
      new Date(ctx.at('16:30')),
    );
    expect(newRange.available).toBe(false);
  });
});
