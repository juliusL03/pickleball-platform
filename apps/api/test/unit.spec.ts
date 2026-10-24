import { BadRequestException } from '@nestjs/common';
import { assertTransition, canTransition } from '../src/bookings/booking-state';
import { PricingService } from '../src/bookings/pricing.service';
import {
  formatLocalDate,
  formatLocalTime,
  resolveVenueSettings,
  zonedTimeToUtc,
} from '../src/bookings/time.util';

describe('booking state machine', () => {
  it('allows valid transitions', () => {
    expect(canTransition('hold', 'confirmed')).toBe(true);
    expect(canTransition('pending_payment', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'completed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
    expect(() => assertTransition('completed', 'confirmed')).toThrow(
      BadRequestException,
    );
  });
});

describe('time utilities', () => {
  it('converts Manila local time to UTC', () => {
    const utc = zonedTimeToUtc('2026-11-01', '09:00', 'Asia/Manila');
    expect(utc.toISOString()).toBe('2026-11-01T01:00:00.000Z');
  });

  it('round-trips local date and time', () => {
    const utc = zonedTimeToUtc('2026-11-01', '18:30', 'Asia/Manila');
    expect(formatLocalDate(utc, 'Asia/Manila')).toBe('2026-11-01');
    expect(formatLocalTime(utc, 'Asia/Manila')).toBe('18:30');
  });

  it('resolves venue settings with defaults', () => {
    const settings = resolveVenueSettings(null);
    expect(settings.timezone).toBe('Asia/Manila');
    expect(settings.granularityMinutes).toBe(15);
  });
});

describe('pricing service', () => {
  const service = new PricingService();
  const court = {
    name: 'Court A',
    pricing: [
      { duration: 60, price: 500, isActive: true },
      { duration: 120, price: 900, isActive: false },
    ],
  };

  it('returns the configured price', () => {
    expect(service.quote(court, 60)).toMatchObject({ total: 500, currency: 'PHP' });
  });

  it('rejects unsupported durations', () => {
    expect(() => service.quote(court, 120)).toThrow(BadRequestException);
  });
});
