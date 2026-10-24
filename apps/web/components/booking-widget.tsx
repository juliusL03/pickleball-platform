'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  Booking,
  BookingQuote,
  Court,
  TimeSlot,
} from '@juls/pickleball-kit/types';
import {
  AVAILABLE_SLOTS_QUERY,
  BOOKING_QUOTE_QUERY,
  CREATE_BOOKING_HOLD_MUTATION,
} from '@juls/pickleball-kit/graphql';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Stack,
} from '@juls/pickleball-kit/ui';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from './auth-provider';
import { formatCurrency, formatTime, todayInVenueTimezone } from '@/lib/format';

const DURATIONS = [60, 90, 120];

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function BookingWidget({ court }: { court: Court }) {
  const router = useRouter();
  const { user } = useAuth();
  const [date, setDate] = useState(todayInVenueTimezone(1));
  const [duration, setDuration] = useState(60);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Booking | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setError(null);
    try {
      const data = await api.request<{ availableSlots: TimeSlot[] }>(
        AVAILABLE_SLOTS_QUERY,
        { courtId: court.id, date },
      );
      setSlots(data.availableSlots);
      setSelectedStart((current) =>
        current && data.availableSlots.some((slot) => slot.startTime === current && slot.available)
          ? current
          : null,
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingSlots(false);
    }
  }, [court.id, date]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    if (!selectedStart) {
      setQuote(null);
      return;
    }
    let active = true;
    setQuoteLoading(true);
    api
      .request<{ bookingQuote: BookingQuote }>(BOOKING_QUOTE_QUERY, {
        courtId: court.id,
        startTime: selectedStart,
        duration,
      })
      .then((data) => {
        if (active) setQuote(data.bookingQuote);
      })
      .catch((err) => {
        if (active) {
          setQuote(null);
          setError(errorMessage(err));
        }
      })
      .finally(() => {
        if (active) setQuoteLoading(false);
      });
    return () => {
      active = false;
    };
  }, [court.id, selectedStart, duration]);

  useEffect(() => {
    if (!created?.holdExpiresAt) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((new Date(created.holdExpiresAt as string).getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(seconds);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [created]);

  const availableCount = useMemo(
    () => slots.filter((slot) => slot.available).length,
    [slots],
  );

  async function handleReserve() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!selectedStart) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await api.request<{ createBookingHold: Booking }>(
        CREATE_BOOKING_HOLD_MUTATION,
        {
          input: {
            courtId: court.id,
            startTime: selectedStart,
            duration,
          },
        },
      );
      setCreated(data.createBookingHold);
      await loadSlots();
    } catch (err) {
      setError(errorMessage(err));
      await loadSlots();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book this court</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap={5}>
          {created ? (
            <div className="rounded-md border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-primary-800">
                  Hold created · {created.bookingNumber}
                </p>
                <Badge>{created.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-700">
                {formatTime(created.startTime)} – {formatTime(created.endTime)} ·{' '}
                {formatCurrency(created.pricing.total, created.pricing.currency)}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Complete payment within{' '}
                <span className="font-semibold">{formatCountdown(remainingSeconds)}</span>{' '}
                to keep this slot.
              </p>
              <div className="mt-3 flex gap-3">
                <Link
                  href={`/bookings/${created.id}/pay`}
                  className="text-sm font-medium underline"
                >
                  Proceed to payment
                </Link>
                <Link href="/bookings" className="text-sm underline">
                  View my bookings
                </Link>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="booking-date">Date</Label>
              <input
                id="booking-date"
                type="date"
                value={date}
                min={todayInVenueTimezone()}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="booking-duration">Duration</Label>
              <select
                id="booking-duration"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {DURATIONS.map((option) => (
                  <option key={option} value={option}>
                    {option / 60} hour{option === 60 ? '' : 's'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Available start times</Label>
              <span className="text-xs text-gray-500">
                {loadingSlots ? 'Loading…' : `${availableCount} available`}
              </span>
            </div>
            {slots.length === 0 && !loadingSlots ? (
              <p className="text-sm text-gray-500">
                No slots for this date. The venue may be closed.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const selected = slot.startTime === selectedStart;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedStart(slot.startTime)}
                      className={[
                        'rounded-md border px-2 py-2 text-sm transition-colors',
                        selected
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-300 bg-white hover:border-primary-400',
                        !slot.available ? 'cursor-not-allowed opacity-40' : '',
                      ].join(' ')}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedStart ? (
            <div className="rounded-md border p-4">
              {quoteLoading ? (
                <p className="text-sm text-gray-500">Calculating price…</p>
              ) : quote ? (
                quote.available ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {formatTime(quote.startTime)} – {formatTime(quote.endTime)}
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(quote.total ?? 0, quote.currency)}
                      </p>
                    </div>
                    <Button onClick={handleReserve} disabled={submitting}>
                      {submitting ? 'Reserving…' : user ? 'Reserve' : 'Sign in to book'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-error">{quote.reason ?? 'Slot unavailable'}</p>
                )
              ) : (
                <p className="text-sm text-gray-500">Select a start time.</p>
              )}
            </div>
          ) : null}

          {error ? <p className="text-sm text-error">{error}</p> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
