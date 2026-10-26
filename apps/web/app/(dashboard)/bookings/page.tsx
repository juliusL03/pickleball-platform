'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Booking, Court } from '@juls/pickleball-kit/types';
import { MY_BOOKINGS_QUERY } from '@juls/pickleball-kit/graphql';
import { buttonVariants, Container } from '@juls/pickleball-kit/ui';
import { cn } from '@juls/pickleball-kit/utils';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { formatMonthLabel } from '@/lib/format';
import {
  display,
  ErrorPanel,
  eyebrow,
  LedgerSkeleton,
  loadCourtIndex,
  MonthGroup,
  needsPayment,
  NextSessionPass,
  primaryAction,
  secondaryAction,
  SessionRow,
  SignedOutPanel,
  useNow,
} from './_ui';

const INACTIVE_STATUSES = ['cancelled', 'completed', 'no_show'];

function byStart(a: Booking, b: Booking, direction: 1 | -1) {
  return (
    (new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) *
    direction
  );
}

function groupByMonth(items: Booking[]) {
  const groups: Array<{ key: string; label: string; items: Booking[] }> = [];
  for (const booking of items) {
    const key = formatMonthLabel(booking.startTime);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(booking);
    else groups.push({ key, label: key, items: [booking] });
  }
  return groups;
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [courts, setCourts] = useState<Map<string, Court>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const hasHold = bookings.some(
    (booking) => booking.status === 'hold' || booking.status === 'pending_payment',
  );
  const now = useNow(hasHold ? 1000 : 60000);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.request<{ myBookings: Booking[] }>(MY_BOOKINGS_QUERY, { limit: 50 }),
      loadCourtIndex(),
    ])
      .then(([bookingData, courtIndex]) => {
        if (cancelled) return;
        setBookings(bookingData.myBookings ?? []);
        setCourts(courtIndex);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  if (authLoading) {
    return (
      <Container size="xl">
        <div className="py-16">
          <p className={eyebrow}>Loading</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <SignedOutPanel message="Sign in to see your sessions, pay for a held slot, or request a change." />
    );
  }

  const isUpcoming = (booking: Booking) =>
    new Date(booking.endTime).getTime() >= now &&
    !INACTIVE_STATUSES.includes(booking.status);

  const upcoming = bookings
    .filter(isUpcoming)
    .sort((a, b) => byStart(a, b, 1));
  const past = bookings
    .filter((booking) => !isUpcoming(booking))
    .sort((a, b) => byStart(a, b, -1));

  const nextSession = upcoming[0];
  const awaitingPayment = upcoming.filter((booking) =>
    needsPayment(booking, now),
  ).length;
  const upcomingGroups = groupByMonth(upcoming);
  const pastGroups = groupByMonth(past);

  return (
    <Container size="xl">
      <section className="py-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="rise">
            <p className={cn(eyebrow, 'flex items-center gap-3')}>
              <span aria-hidden className="h-px w-6 bg-line" />
              Your sessions
            </p>
            <h1 className={cn(display, 'mt-4 text-4xl leading-none text-chalk sm:text-5xl')}>
              My bookings
            </h1>
          </div>

          {!loading && !error ? (
            <div className="flex items-center gap-4 border border-line bg-surface px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>
                <span className="text-chalk">{upcoming.length}</span>{' '}
                {upcoming.length === 1 ? 'session' : 'sessions'} ahead
              </span>
              {awaitingPayment > 0 ? (
                <>
                  <span aria-hidden className="h-3 w-px bg-line" />
                  <span className="flex items-center gap-2 text-ball">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-ball motion-safe:animate-pulse"
                    />
                    {awaitingPayment} awaiting payment
                  </span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {loading ? <LedgerSkeleton /> : null}

        {!loading && error ? (
          <div className="mt-8">
            <ErrorPanel message={error} onRetry={retry} />
          </div>
        ) : null}

        {!loading && !error && bookings.length === 0 ? (
          <div className="mt-8 border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
            <p className={cn(eyebrow, 'text-ball')}>No sessions booked</p>
            <p className={cn(display, 'mx-auto mt-4 max-w-sm text-2xl leading-tight text-chalk')}>
              The court is free. Pick a slot.
            </p>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Choose a court and start time. Your slot is held for ten minutes
              while you pay, then confirmed.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/courts"
                className={cn(buttonVariants({ size: 'lg' }), primaryAction, 'px-6')}
              >
                Browse courts
              </Link>
              <Link
                href="/about"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  secondaryAction,
                  'px-6',
                )}
              >
                How booking works
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && !error && bookings.length > 0 ? (
          <>
            {nextSession ? (
              <div className="mt-8">
                <NextSessionPass
                  booking={nextSession}
                  court={courts.get(nextSession.courtId)}
                  now={now}
                />
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface px-5 py-6">
                <div>
                  <p className={eyebrow}>Nothing booked</p>
                  <p className="mt-2 text-sm text-muted">
                    You have no upcoming sessions.
                  </p>
                </div>
                <Link
                  href="/courts"
                  className={cn(buttonVariants(), primaryAction, 'px-5')}
                >
                  Book a court
                </Link>
              </div>
            )}

            {upcoming.length > 0 ? (
              <div className="mt-12">
                {upcomingGroups.map((group) => (
                  <MonthGroup key={group.key} label={group.label}>
                    {group.items.map((booking) => (
                      <SessionRow
                        key={booking.id}
                        booking={booking}
                        court={courts.get(booking.courtId)}
                      />
                    ))}
                  </MonthGroup>
                ))}
              </div>
            ) : null}

            {past.length > 0 ? (
              <section className="mt-12 border-t border-line pt-6">
                <button
                  type="button"
                  onClick={() => setShowPast((value) => !value)}
                  aria-expanded={showPast}
                  aria-controls="past-sessions"
                  className="flex w-full items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  <span>
                    Past and cancelled · <span className="text-chalk">{past.length}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {showPast ? 'Hide' : 'Show'}
                    <span
                      aria-hidden
                      className={cn(
                        'transition-transform duration-200',
                        showPast && 'rotate-180',
                      )}
                    >
                      ⌄
                    </span>
                  </span>
                </button>

                {showPast ? (
                  <div id="past-sessions" className="mt-8">
                    {pastGroups.map((group) => (
                      <MonthGroup key={group.key} label={group.label}>
                        {group.items.map((booking) => (
                          <SessionRow
                            key={booking.id}
                            booking={booking}
                            court={courts.get(booking.courtId)}
                          />
                        ))}
                      </MonthGroup>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </Container>
  );
}
