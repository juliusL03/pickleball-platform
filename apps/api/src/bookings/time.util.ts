import { Venue } from '../venue/schemas/venue.schema';

export interface ResolvedVenueSettings {
  timezone: string;
  slotMinutes: number;
  granularityMinutes: number;
  minDuration: number;
  maxDuration: number;
  holdMinutes: number;
  advanceDays: number;
  defaultOpenTime: string;
  defaultCloseTime: string;
  currency: string;
}

export const DEFAULT_VENUE_SETTINGS: ResolvedVenueSettings = {
  timezone: 'Asia/Manila',
  slotMinutes: 30,
  granularityMinutes: 15,
  minDuration: 60,
  maxDuration: 180,
  holdMinutes: 10,
  advanceDays: 30,
  defaultOpenTime: '06:00',
  defaultCloseTime: '22:00',
  currency: 'PHP',
};

export interface OperatingHours {
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

function toInt(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export function resolveVenueSettings(
  venue?: Pick<Venue, 'settings' | 'timezone'> | null,
): ResolvedVenueSettings {
  const raw = (venue?.settings ?? {}) as Record<string, unknown>;
  return {
    timezone: toStr(raw.timezone, toStr(venue?.timezone, DEFAULT_VENUE_SETTINGS.timezone)),
    slotMinutes: toInt(raw.slotMinutes, DEFAULT_VENUE_SETTINGS.slotMinutes),
    granularityMinutes: toInt(
      raw.granularityMinutes,
      DEFAULT_VENUE_SETTINGS.granularityMinutes,
    ),
    minDuration: toInt(raw.minDuration, DEFAULT_VENUE_SETTINGS.minDuration),
    maxDuration: toInt(raw.maxDuration, DEFAULT_VENUE_SETTINGS.maxDuration),
    holdMinutes: toInt(raw.holdMinutes, DEFAULT_VENUE_SETTINGS.holdMinutes),
    advanceDays: toInt(raw.advanceDays, DEFAULT_VENUE_SETTINGS.advanceDays),
    defaultOpenTime: toStr(raw.defaultOpenTime, DEFAULT_VENUE_SETTINGS.defaultOpenTime),
    defaultCloseTime: toStr(raw.defaultCloseTime, DEFAULT_VENUE_SETTINGS.defaultCloseTime),
    currency: toStr(raw.currency, DEFAULT_VENUE_SETTINGS.currency),
  };
}

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZonedParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }
  }
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: parseInt(hour, 10),
    minute: parseInt(parts.minute, 10),
    second: parseInt(parts.second, 10),
  };
}

export function zonedTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string,
): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const parts = getZonedParts(new Date(guess), timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  const offset = asUtc - guess;
  return new Date(guess - offset);
}

export function formatLocalDate(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function formatLocalTime(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, timeZone);
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function timeStringToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function minutesToTimeString(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function diffMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

export function getOperatingHours(
  venue: Pick<Venue, 'operatingHours'> | null | undefined,
  dayOfWeek: number,
  settings: ResolvedVenueSettings,
): OperatingHours {
  const configured = venue?.operatingHours?.find(
    (entry) => entry.dayOfWeek === dayOfWeek,
  );
  if (!configured) {
    return {
      isClosed: false,
      openTime: settings.defaultOpenTime,
      closeTime: settings.defaultCloseTime,
    };
  }
  return {
    isClosed: Boolean(configured.isClosed),
    openTime: configured.openTime,
    closeTime: configured.closeTime,
  };
}

export function isAlignedToGranularity(date: Date, granularityMinutes: number): boolean {
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  return minutes % granularityMinutes === 0 && seconds === 0;
}
