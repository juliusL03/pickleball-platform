'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Booking, ChangeRequest, Court } from '@juls/pickleball-kit/types';
import {
  BOOKING_QUERY,
  CANCEL_HOLD_MUTATION,
  MY_CHANGE_REQUESTS_QUERY,
  REQUEST_BOOKING_CANCELLATION_MUTATION,
  REQUEST_BOOKING_CHANGE_MUTATION,
} from '@juls/pickleball-kit/graphql';
import { Button, buttonVariants, Container, Input, Label, Textarea } from '@juls/pickleball-kit/ui';
import { cn } from '@juls/pickleball-kit/utils';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { formatCurrency, formatLongDate, formatTime24 } from '@/lib/format';
import {
  BackLink,
  courtName,
  dangerAction,
  display,
  ErrorPanel,
  eyebrow,
  field,
  fieldLabel,
  formatCountdown,
  isHoldExpired,
  loadCourtIndex,
  metaLabel,
  needsPayment,
  primaryAction,
  secondaryAction,
  SignedOutPanel,
  SlotStrip,
  StatusChip,
  textField,
  useNow,
} from '../_ui';

const ACTIVE_STATUSES = ['hold', 'pending_payment', 'confirmed'];

const REQUEST_TONE: Record<string, string> = {
  pending: 'border-line text-muted',
  approved: 'border-ball/40 bg-ball/10 text-ball',
  rejected: 'border-clay/40 bg-clay/10 text-alert',
};

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [courts, setCourts] = useState<Map<string, Court>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [cancelReason, setCancelReason] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const now = useNow(booking?.status === 'hold' ? 1000 : 60000);

  const load = useCallback(async () => {
    if (!params?.id) return;
    try {
      const [bookingData, requestData, courtIndex] = await Promise.all([
        api.request<{ booking: Booking | null }>(BOOKING_QUERY, {
          id: params.id,
        }),
        api.request<{ myChangeRequests: ChangeRequest[] }>(
          MY_CHANGE_REQUESTS_QUERY,
        ),
        loadCourtIndex(),
      ]);
      setBooking(bookingData.booking);
      setCourts(courtIndex);
      setRequests(
        requestData.myChangeRequests.filter(
          (request) => request.bookingId === params.id,
        ),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    if (user) void load();
    else setLoading(authLoading);
  }, [user, authLoading, load, reloadKey]);

  async function handleCancelHold() {
    if (!booking) return;
    setBusy(true);
    setError(null);
    try {
      const data = await api.request<{ cancelHold: Booking }>(
        CANCEL_HOLD_MUTATION,
        { bookingId: booking.id },
      );
      setBooking(data.cancelHold);
      setMessage('Hold cancelled.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestCancellation(event: React.FormEvent) {
    event.preventDefault();
    if (!booking) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await api.request(REQUEST_BOOKING_CANCELLATION_MUTATION, {
        input: { bookingId: booking.id, reason: cancelReason },
      });
      setMessage('Cancellation request submitted.');
      setCancelReason('');
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestChange(event: React.FormEvent) {
    event.preventDefault();
    if (!booking) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const input: Record<string, unknown> = {
        bookingId: booking.id,
        reason: changeReason,
      };
      if (newDate && newTime) {
        input.newStartTime = new Date(`${newDate}T${newTime}:00`).toISOString();
      }
      if (newDuration) {
        input.newDuration = Number(newDuration);
      }
      await api.request(REQUEST_BOOKING_CHANGE_MUTATION, { input });
      setMessage('Change request submitted.');
      setChangeReason('');
      setNewDate('');
      setNewTime('');
      setNewDuration('');
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

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
      <SignedOutPanel message="Sign in to see this booking, pay for it, or request a change." />
    );
  }

  if (loading) {
    return (
      <Container size="xl">
        <div className="py-16">
          <p className={eyebrow}>Loading session</p>
        </div>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container size="xl">
        <div className="py-12">
          <div className="max-w-md">
            <ErrorPanel
              message={error ?? 'Booking not found.'}
              onRetry={() => setReloadKey((key) => key + 1)}
            />
            <div className="mt-6">
              <BackLink href="/bookings">All bookings</BackLink>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const court = courts.get(booking.courtId);
  const isActive = ACTIVE_STATUSES.includes(booking.status);
  const hasPendingRequest = requests.some(
    (request) => request.status === 'pending',
  );
  const expired = isHoldExpired(booking, now);
  const pay = needsPayment(booking, now);

  return (
    <Container size="xl">
      <div className="py-8 lg:py-12">
        <BackLink href="/bookings">All bookings</BackLink>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <article className="rise border border-line bg-surface">
              <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
                <p className={cn(metaLabel, 'text-chalk')}>Session pass</p>
                <StatusChip status={booking.status} expired={expired} />
              </div>

              <div className="p-5 sm:p-6">
                <h1 className={cn(display, 'text-3xl leading-none text-chalk sm:text-4xl')}>
                  {courtName(court)}
                </h1>
                <p className="mt-3 text-sm text-muted">
                  {formatLongDate(booking.startTime)}
                </p>

                <div className="mt-6 flex items-end gap-3">
                  <p className="font-mono text-4xl leading-none text-chalk sm:text-5xl">
                    {formatTime24(booking.startTime)}
                  </p>
                  <p className={cn(metaLabel, 'pb-1')}>
                    to {formatTime24(booking.endTime)}
                  </p>
                </div>

                <SlotStrip
                  className="mt-5"
                  startTime={booking.startTime}
                  duration={booking.duration}
                />

                <dl className="mt-6 divide-y divide-line border-t border-line">
                  <div className="flex items-baseline justify-between gap-6 py-3">
                    <dt className={metaLabel}>Reference</dt>
                    <dd className="font-mono text-sm text-chalk">
                      {booking.bookingNumber}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6 py-3">
                    <dt className={metaLabel}>Duration</dt>
                    <dd className="font-mono text-sm text-chalk">
                      {booking.duration} min
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6 py-3">
                    <dt className={metaLabel}>Total</dt>
                    <dd className="font-mono text-sm text-chalk">
                      {formatCurrency(
                        booking.pricing.total,
                        booking.pricing.currency,
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {booking.status === 'hold' && booking.holdExpiresAt ? (
                <p
                  className={cn(
                    'border-t border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em]',
                    expired ? 'text-alert' : 'text-ball',
                  )}
                >
                  {expired
                    ? 'Hold expired — this slot was released'
                    : `Held · ${formatCountdown(
                        new Date(booking.holdExpiresAt).getTime() - now,
                      )} left to pay`}
                </p>
              ) : null}

              {booking.cancellationReason ? (
                <p className="border-t border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Reason · {booking.cancellationReason}
                </p>
              ) : null}
            </article>

            {pay || booking.status === 'hold' ? (
              <div className="flex flex-wrap gap-3">
                {pay ? (
                  <Link
                    href={`/bookings/${booking.id}/pay`}
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      primaryAction,
                      'px-6',
                    )}
                  >
                    Pay{' '}
                    {formatCurrency(
                      booking.pricing.total,
                      booking.pricing.currency,
                    )}
                  </Link>
                ) : null}
                {booking.status === 'hold' ? (
                  <Button
                    variant="destructive"
                    onClick={handleCancelHold}
                    disabled={busy}
                    className={dangerAction}
                  >
                    Cancel hold
                  </Button>
                ) : null}
              </div>
            ) : null}

            {message ? (
              <p className="border border-line border-l-2 border-l-ball bg-surface px-4 py-3 text-sm text-chalk">
                {message}
              </p>
            ) : null}

            {error ? <ErrorPanel message={error} /> : null}
          </div>

          <aside className="flex flex-col gap-6">
            <section className="border border-line bg-surface">
              <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
                <p className={metaLabel}>Requests</p>
                <span className={metaLabel}>{requests.length}</span>
              </div>

              {requests.length === 0 ? (
                <p className="px-5 py-6 text-sm leading-relaxed text-muted">
                  No requests yet. If your plans move, ask for a change below.
                </p>
              ) : (
                <div className="divide-y divide-line">
                  {requests.map((request) => (
                    <div key={request.id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm capitalize text-chalk">
                          {request.type} request
                        </p>
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em]',
                            REQUEST_TONE[request.status] ?? 'border-line text-muted',
                          )}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {request.reason}
                      </p>
                      {request.staffResponse ? (
                        <p className={cn(metaLabel, 'mt-3')}>
                          Staff · {request.staffResponse}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {isActive && !hasPendingRequest ? (
              <>
                <section className="border border-line bg-surface">
                  <div className="border-b border-line px-5 py-3">
                    <p className={metaLabel}>Request a change</p>
                  </div>
                  <form onSubmit={handleRequestChange} className="space-y-4 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="new-date" className={fieldLabel}>
                          New date
                        </Label>
                        <Input
                          id="new-date"
                          type="date"
                          value={newDate}
                          onChange={(event) => setNewDate(event.target.value)}
                          className={field}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-time" className={fieldLabel}>
                          New time
                        </Label>
                        <Input
                          id="new-time"
                          type="time"
                          value={newTime}
                          onChange={(event) => setNewTime(event.target.value)}
                          className={field}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-duration" className={fieldLabel}>
                        New duration
                      </Label>
                      <Input
                        id="new-duration"
                        type="number"
                        min={60}
                        step={30}
                        value={newDuration}
                        onChange={(event) => setNewDuration(event.target.value)}
                        className={field}
                      />
                      <p className={cn(metaLabel, 'mt-2')}>
                        Optional · leave blank to keep {booking.duration} min
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="change-reason" className={fieldLabel}>
                        Reason
                      </Label>
                      <Textarea
                        id="change-reason"
                        value={changeReason}
                        onChange={(event) => setChangeReason(event.target.value)}
                        minLength={5}
                        required
                        className={textField}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={busy}
                      className={cn(secondaryAction, 'w-full')}
                    >
                      Submit change request
                    </Button>
                  </form>
                </section>

                <section className="border border-line border-l-2 border-l-clay bg-surface">
                  <div className="border-b border-line px-5 py-3">
                    <p className={metaLabel}>Cancel this session</p>
                  </div>
                  <form
                    onSubmit={handleRequestCancellation}
                    className="space-y-4 p-5"
                  >
                    <div>
                      <Label htmlFor="cancel-reason" className={fieldLabel}>
                        Reason
                      </Label>
                      <Textarea
                        id="cancel-reason"
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        minLength={5}
                        required
                        className={textField}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={busy}
                      className={cn(dangerAction, 'w-full')}
                    >
                      Submit cancellation request
                    </Button>
                  </form>
                </section>
              </>
            ) : null}
          </aside>
        </div>
      </div>
    </Container>
  );
}
