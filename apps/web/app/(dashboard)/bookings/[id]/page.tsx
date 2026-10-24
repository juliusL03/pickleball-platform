'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Booking, ChangeRequest } from '@juls/pickleball-kit/types';
import {
  BOOKING_QUERY,
  CANCEL_HOLD_MUTATION,
  MY_CHANGE_REQUESTS_QUERY,
  REQUEST_BOOKING_CANCELLATION_MUTATION,
  REQUEST_BOOKING_CHANGE_MUTATION,
} from '@juls/pickleball-kit/graphql';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Input,
  Label,
  Stack,
  Textarea,
} from '@juls/pickleball-kit/ui';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { formatCurrency, formatDateTime } from '@/lib/format';

const ACTIVE_STATUSES = ['hold', 'pending_payment', 'confirmed'];

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [cancelReason, setCancelReason] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('');

  const load = useCallback(async () => {
    if (!params?.id) return;
    try {
      const [bookingData, requestData] = await Promise.all([
        api.request<{ booking: Booking | null }>(BOOKING_QUERY, {
          id: params.id,
        }),
        api.request<{ myChangeRequests: ChangeRequest[] }>(
          MY_CHANGE_REQUESTS_QUERY,
        ),
      ]);
      setBooking(bookingData.booking);
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
  }, [user, authLoading, load]);

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
      <Container>
        <p className="py-8">Loading…</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <div className="py-12">
          <p className="mb-4">Sign in to view this booking.</p>
          <Button onClick={() => router.push('/login')}>Sign in</Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <p className="py-8">Loading booking…</p>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container>
        <div className="py-12">
          <p className="mb-4">{error ?? 'Booking not found.'}</p>
          <Link href="/bookings" className="underline">
            Back to bookings
          </Link>
        </div>
      </Container>
    );
  }

  const isActive = ACTIVE_STATUSES.includes(booking.status);
  const hasPendingRequest = requests.some(
    (request) => request.status === 'pending',
  );

  return (
    <Container>
      <div className="py-8">
        <Link href="/bookings" className="text-sm text-gray-600 underline">
          ← Back to bookings
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle>{booking.bookingNumber}</CardTitle>
                <Badge>{booking.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Stack gap={2}>
                <p className="text-sm">
                  <span className="text-gray-500">When: </span>
                  {formatDateTime(booking.startTime)}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Duration: </span>
                  {booking.duration} minutes
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Total: </span>
                  {formatCurrency(
                    booking.pricing.total,
                    booking.pricing.currency,
                  )}
                </p>
                {booking.holdExpiresAt && booking.status === 'hold' ? (
                  <p className="text-sm text-gray-600">
                    Hold expires {formatDateTime(booking.holdExpiresAt)}
                  </p>
                ) : null}
                {booking.cancellationReason ? (
                  <p className="text-sm text-gray-600">
                    Reason: {booking.cancellationReason}
                  </p>
                ) : null}
                {booking.status === 'hold' ? (
                  <Button
                    variant="destructive"
                    onClick={handleCancelHold}
                    disabled={busy}
                    className="mt-2 self-start"
                  >
                    Cancel hold
                  </Button>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-sm text-gray-500">No requests yet.</p>
              ) : (
                <Stack gap={3}>
                  {requests.map((request) => (
                    <div key={request.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium capitalize">
                          {request.type} request
                        </p>
                        <Badge variant="secondary">{request.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {request.reason}
                      </p>
                      {request.staffResponse ? (
                        <p className="mt-1 text-sm text-gray-500">
                          Staff: {request.staffResponse}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </div>

        {isActive && !hasPendingRequest ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Request a change</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestChange}>
                  <Stack gap={3}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="new-date">New date (optional)</Label>
                        <Input
                          id="new-date"
                          type="date"
                          value={newDate}
                          onChange={(event) => setNewDate(event.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-time">New time (optional)</Label>
                        <Input
                          id="new-time"
                          type="time"
                          value={newTime}
                          onChange={(event) => setNewTime(event.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-duration">
                        New duration (optional)
                      </Label>
                      <Input
                        id="new-duration"
                        type="number"
                        min={60}
                        step={30}
                        value={newDuration}
                        onChange={(event) => setNewDuration(event.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="change-reason">Reason</Label>
                      <Textarea
                        id="change-reason"
                        value={changeReason}
                        onChange={(event) => setChangeReason(event.target.value)}
                        minLength={5}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" disabled={busy} className="self-start">
                      Submit change request
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request cancellation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestCancellation}>
                  <Stack gap={3}>
                    <div>
                      <Label htmlFor="cancel-reason">Reason</Label>
                      <Textarea
                        id="cancel-reason"
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        minLength={5}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={busy}
                      className="self-start"
                    >
                      Submit cancellation request
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {message ? <p className="mt-4 text-sm text-primary-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>
    </Container>
  );
}
