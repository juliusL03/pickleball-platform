'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import type { Booking, BookingStatus, Court } from '@juls/pickleball-kit/types';
import { COURTS_QUERY } from '@juls/pickleball-kit/graphql';
import { buttonVariants, Container } from '@juls/pickleball-kit/ui';
import { cn } from '@juls/pickleball-kit/utils';
import { api } from '@/lib/api';
import {
  formatCurrency,
  formatDayParts,
  formatLongDate,
  formatTime24,
  formatTimeRange,
} from '@/lib/format';

const SLOT_MINUTES = 30;

export const display =
  '[font-family:var(--font-display)] [font-stretch:108%] font-extrabold uppercase tracking-[-0.02em]';
export const eyebrow =
  'font-mono text-[10px] uppercase tracking-[0.28em] text-muted';
export const metaLabel =
  'font-mono text-[9px] uppercase tracking-[0.18em] text-muted';
export const fieldLabel =
  'font-mono text-[10px] font-normal uppercase tracking-[0.24em] text-muted';

export const primaryAction =
  'rounded-[2px] bg-ball font-semibold text-ink hover:bg-ball/90 focus-visible:ring-ball focus-visible:ring-offset-ink';
export const secondaryAction =
  'rounded-[2px] border-line bg-transparent text-chalk hover:bg-surface-raised hover:text-chalk focus-visible:ring-ball focus-visible:ring-offset-ink';
export const dangerAction =
  'rounded-[2px] border-line bg-transparent text-alert hover:border-clay hover:bg-clay/10 hover:text-alert focus-visible:ring-clay focus-visible:ring-offset-ink';
export const field =
  'mt-2 h-11 rounded-[2px] border-line bg-surface text-chalk placeholder:text-muted/60 focus-visible:ring-ball focus-visible:ring-offset-ink';
export const textField =
  'mt-2 rounded-[2px] border-line bg-surface text-chalk placeholder:text-muted/60 focus-visible:ring-ball focus-visible:ring-offset-ink';
export const alertPanel =
  'border border-line border-l-2 border-l-clay bg-surface px-4 py-3 text-sm text-alert';

type ChipTone = 'live' | 'calm' | 'dead' | 'alert';

const STATUS: Record<BookingStatus, { label: string; tone: ChipTone }> = {
  hold: { label: 'Held', tone: 'live' },
  pending_payment: { label: 'Payment due', tone: 'live' },
  confirmed: { label: 'Confirmed', tone: 'calm' },
  completed: { label: 'Played', tone: 'dead' },
  cancelled: { label: 'Cancelled', tone: 'alert' },
  no_show: { label: 'Missed', tone: 'alert' },
};

const TONE: Record<ChipTone, string> = {
  live: 'border-ball/40 bg-ball/10 text-ball',
  calm: 'border-line text-chalk',
  dead: 'border-line text-muted',
  alert: 'border-clay/40 bg-clay/10 text-alert',
};

export function needsPayment(booking: Booking, now: number) {
  if (booking.status === 'pending_payment') return !isHoldExpired(booking, now);
  return isHoldLive(booking, now);
}

export function isHoldLive(booking: Booking, now: number) {
  if (booking.status !== 'hold' || !booking.holdExpiresAt) return false;
  return new Date(booking.holdExpiresAt).getTime() > now;
}

export function isHoldExpired(booking: Booking, now: number) {
  if (booking.status !== 'hold' || !booking.holdExpiresAt) return false;
  return new Date(booking.holdExpiresAt).getTime() <= now;
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatStartsIn(ms: number) {
  if (ms <= 0) return 'starting now';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest ? `in ${hours}h ${rest}m` : `in ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'tomorrow' : `in ${days} days`;
}

export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export async function loadCourtIndex(): Promise<Map<string, Court>> {
  try {
    const data = await api.request<{ courts: Court[] }>(COURTS_QUERY);
    return new Map((data.courts ?? []).map((court) => [court.id, court]));
  } catch {
    return new Map();
  }
}

export function courtName(court: Court | undefined) {
  return court?.name ?? 'Court reserved';
}

export function StatusChip({
  status,
  expired = false,
  className,
}: {
  status: BookingStatus;
  expired?: boolean;
  className?: string;
}) {
  const meta = expired
    ? { label: 'Expired', tone: 'alert' as const }
    : STATUS[status] ?? { label: status, tone: 'dead' as const };

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em]',
        TONE[meta.tone],
        className,
      )}
    >
      {meta.tone === 'live' && !expired ? (
        <span
          aria-hidden
          className="h-1 w-1 rounded-full bg-ball motion-safe:animate-pulse"
        />
      ) : null}
      {meta.label}
    </span>
  );
}

function slotCells(startTime: string, duration: number) {
  const start = new Date(startTime).getTime();
  const step = SLOT_MINUTES * 60 * 1000;
  const booked = Math.max(1, Math.round(duration / SLOT_MINUTES));
  const first = start - step;
  return Array.from({ length: booked + 3 }, (_, index) => ({
    iso: new Date(first + index * step).toISOString(),
    mine: index >= 1 && index <= booked,
  }));
}

export function SlotStrip({
  startTime,
  duration,
  className,
}: {
  startTime: string;
  duration: number;
  className?: string;
}) {
  const cells = slotCells(startTime, duration);
  return (
    <div
      role="img"
      aria-label={`Session from ${formatTime24(startTime)}, ${duration} minutes`}
      className={cn('flex gap-px', className)}
    >
      {cells.map((cell) => (
        <div
          key={cell.iso}
          className={cn(
            'flex min-w-0 flex-1 items-center justify-center border py-2 font-mono text-[9px] leading-none tracking-tight',
            cell.mine
              ? 'border-ball/60 bg-ball font-semibold text-ink'
              : 'border-line/70 text-muted/70',
          )}
        >
          {formatTime24(cell.iso)}
        </div>
      ))}
    </div>
  );
}

export function SessionRow({
  booking,
  court,
}: {
  booking: Booking;
  court?: Court;
}) {
  const { day, weekday } = formatDayParts(booking.startTime);
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-5"
    >
      <div className="w-9 shrink-0 text-center font-mono">
        <p className="text-lg leading-none text-chalk">{day}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-muted">
          {weekday}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-chalk">
            {courtName(court)}
          </p>
          <StatusChip status={booking.status} />
        </div>
        <p className="mt-1.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {formatTimeRange(booking.startTime, booking.endTime)} ·{' '}
          {booking.duration} min ·{' '}
          {formatCurrency(booking.pricing.total, booking.pricing.currency)}
        </p>
      </div>
      <span
        aria-hidden
        className="hidden shrink-0 text-muted transition-colors group-hover:text-ball sm:block"
      >
        →
      </span>
    </Link>
  );
}

export function MonthGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <p className={cn(metaLabel, 'border-b border-line pb-2')}>{label}</p>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

export function NextSessionPass({
  booking,
  court,
  now,
}: {
  booking: Booking;
  court?: Court;
  now: number;
}) {
  const start = new Date(booking.startTime).getTime();
  const live = isHoldLive(booking, now);
  const expired = isHoldExpired(booking, now);
  const pay = needsPayment(booking, now);

  return (
    <section className="rise border border-line bg-surface">
      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="p-5 sm:p-6">
          <p className={eyebrow}>Next session</p>
          <h2 className={cn(display, 'mt-3 text-2xl leading-none text-chalk sm:text-3xl')}>
            {courtName(court)}
          </h2>
          <p className="mt-3 text-sm text-muted">
            {formatLongDate(booking.startTime)}
          </p>

          <SlotStrip
            className="mt-5"
            startTime={booking.startTime}
            duration={booking.duration}
          />

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <span>{booking.bookingNumber}</span>
            <span aria-hidden className="h-3 w-px bg-line" />
            <span>{booking.duration} min</span>
            <span aria-hidden className="h-3 w-px bg-line" />
            <span className="text-chalk">
              {formatCurrency(booking.pricing.total, booking.pricing.currency)}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 border-t border-line bg-court-deep p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div>
            <p className="font-mono text-4xl leading-none text-chalk sm:text-5xl">
              {formatTime24(booking.startTime)}
            </p>
            <p className={cn(metaLabel, 'mt-2')}>
              until {formatTime24(booking.endTime)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.18em]',
                live ? 'text-ball' : expired ? 'text-alert' : 'text-muted',
              )}
            >
              {live && booking.holdExpiresAt
                ? `Held · ${formatCountdown(new Date(booking.holdExpiresAt).getTime() - now)} to pay`
                : expired
                  ? 'Hold expired'
                  : `Starts ${formatStartsIn(start - now)}`}
            </p>

            {pay ? (
              <Link
                href={`/bookings/${booking.id}/pay`}
                className={cn(buttonVariants({ size: 'lg' }), primaryAction, 'w-full')}
              >
                Pay{' '}
                {formatCurrency(
                  booking.pricing.total,
                  booking.pricing.currency,
                )}
              </Link>
            ) : (
              <Link
                href={`/bookings/${booking.id}`}
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  secondaryAction,
                  'w-full',
                )}
              >
                View booking
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LedgerSkeleton() {
  return (
    <div className="mt-8">
      <div aria-hidden className="border border-line bg-surface">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-line p-4 last:border-b-0 motion-safe:animate-pulse"
          >
            <div className="h-8 w-9 shrink-0 bg-surface-raised" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 bg-surface-raised" />
              <div className="h-2.5 w-56 bg-surface-raised" />
            </div>
          </div>
        ))}
      </div>
      <p role="status" className="sr-only">
        Loading your sessions
      </p>
    </div>
  );
}

export function SignedOutPanel({ message }: { message: string }) {
  return (
    <Container size="xl">
      <div className="mx-auto max-w-md py-16 text-center sm:py-24">
        <p className={eyebrow}>Sign in required</p>
        <p className={cn(display, 'mt-4 text-3xl leading-none text-chalk sm:text-4xl')}>
          Your sessions live here
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ size: 'lg' }), primaryAction, 'px-6')}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'outline' }),
              secondaryAction,
              'px-6',
            )}
          >
            Create account
          </Link>
        </div>
      </div>
    </Container>
  );
}

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className={cn(alertPanel, 'flex flex-wrap items-center justify-between gap-4')}>
      <span>We couldn&apos;t load this. {message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            buttonVariants({ size: 'sm', variant: 'outline' }),
            secondaryAction,
          )}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}
