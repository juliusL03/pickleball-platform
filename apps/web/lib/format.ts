const VENUE_TIMEZONE = 'Asia/Manila';

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: VENUE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: VENUE_TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function formatTime24(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: VENUE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime24(start)}–${formatTime24(end)}`;
}

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: VENUE_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

export function formatMonthLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: VENUE_TIMEZONE,
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDayParts(iso: string): { day: string; weekday: string } {
  const date = new Date(iso);
  return {
    day: new Intl.DateTimeFormat('en-PH', {
      timeZone: VENUE_TIMEZONE,
      day: '2-digit',
    }).format(date),
    weekday: new Intl.DateTimeFormat('en-PH', {
      timeZone: VENUE_TIMEZONE,
      weekday: 'short',
    }).format(date),
  };
}

export function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function todayInVenueTimezone(offsetDays = 0): string {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VENUE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
