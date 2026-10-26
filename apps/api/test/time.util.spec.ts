import {
  formatLocalDate,
  formatLocalTime,
  resolveVenueSettings,
  zonedTimeToUtc,
} from '../src/bookings/time.util';

describe('time utilities', () => {
  it('converts Manila local time to UTC', () => {
    const utc = zonedTimeToUtc('2026-11-01', '09:00', 'Asia/Manila');
    expect(utc.toISOString()).toBe('2026-11-01T01:00:00.000Z');
  });

  it('formats local date and time', () => {
    const date = new Date('2026-11-01T01:00:00.000Z');
    expect(formatLocalDate(date, 'Asia/Manila')).toBe('2026-11-01');
    expect(formatLocalTime(date, 'Asia/Manila')).toBe('09:00');
  });

  it('resolves venue settings with defaults', () => {
    const settings = resolveVenueSettings(null);
    expect(settings.timezone).toBe('Asia/Manila');
    expect(settings.granularityMinutes).toBe(15);
    expect(settings.minDuration).toBe(60);
    expect(settings.maxDuration).toBe(180);
  });
});
