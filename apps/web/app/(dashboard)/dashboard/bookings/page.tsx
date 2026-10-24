'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  Booking,
  BlockedSlot,
  ChangeRequest,
  Court,
} from '@juls/pickleball-kit/types';
import {
  ALL_BOOKINGS_QUERY,
  BLOCK_SLOT_MUTATION,
  BLOCKED_SLOTS_QUERY,
  CHANGE_REQUESTS_QUERY,
  COURTS_QUERY,
  PAYMENTS_QUERY,
  REFUND_PAYMENT_MUTATION,
  REVIEW_CHANGE_REQUEST_MUTATION,
  UNBLOCK_SLOT_MUTATION,
  VERIFY_BANK_TRANSFER_MUTATION,
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
} from '@juls/pickleball-kit/ui';
import { api, errorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/format';

export default function StaffBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [blockForm, setBlockForm] = useState({
    courtId: '',
    startTime: '',
    endTime: '',
    reason: '',
    type: 'maintenance',
  });

  const load = useCallback(async () => {
    try {
      const [bookingData, requestData, courtData, blockedData, paymentData] =
        await Promise.all([
          api.request<{ bookings: Booking[] }>(ALL_BOOKINGS_QUERY, { limit: 100 }),
          api.request<{ changeRequests: ChangeRequest[] }>(CHANGE_REQUESTS_QUERY, { status: 'pending' }),
          api.request<{ courts: Court[] }>(COURTS_QUERY),
          api.request<{ blockedSlots: BlockedSlot[] }>(BLOCKED_SLOTS_QUERY),
          api.request<{ payments: any[] }>(PAYMENTS_QUERY),
        ]);
      setBookings(bookingData.bookings);
      setRequests(requestData.changeRequests);
      setCourts(courtData.courts);
      setBlocked(blockedData.blockedSlots);
      setPayments(paymentData.payments);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(request: ChangeRequest, approve: boolean) {
    setBusyId(request.id);
    setError(null);
    setMessage(null);
    try {
      await api.request(REVIEW_CHANGE_REQUEST_MUTATION, { id: request.id, input: { approve } });
      setMessage(`Request ${approve ? 'approved' : 'rejected'} successfully.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleBlock(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.request(BLOCK_SLOT_MUTATION, {
        input: {
          courtId: blockForm.courtId || undefined,
          startTime: new Date(blockForm.startTime).toISOString(),
          endTime: new Date(blockForm.endTime).toISOString(),
          reason: blockForm.reason,
          type: blockForm.type,
        },
      });
      setMessage('Slot blocked.');
      setBlockForm({ courtId: '', startTime: '', endTime: '', reason: '', type: 'maintenance' });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function unblock(id: string) {
    setError(null);
    try {
      await api.request(UNBLOCK_SLOT_MUTATION, { id });
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function verifyPayment(paymentId: string, approved: boolean) {
    setBusyId(paymentId);
    setError(null);
    setMessage(null);
    try {
      await api.request(VERIFY_BANK_TRANSFER_MUTATION, { input: { paymentId, approved } });
      setMessage(`Bank transfer ${approved ? 'approved' : 'rejected'}.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function refund(paymentId: string) {
    const reason = window.prompt('Refund reason');
    if (!reason) return;
    setBusyId(paymentId);
    setError(null);
    setMessage(null);
    try {
      await api.request(REFUND_PAYMENT_MUTATION, { input: { paymentId, reason } });
      setMessage('Refund processed.');
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Container>
      <div className="py-8">
        <h1 className="mb-6 text-3xl font-bold">Bookings</h1>
        {error ? <p className="mb-4 text-sm text-error">{error}</p> : null}
        {message ? <p className="mb-4 text-sm text-primary-700">{message}</p> : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending change requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing pending.</p>
              ) : (
                <Stack gap={3}>
                  {requests.map((request) => (
                    <div key={request.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium capitalize">{request.type} request</p>
                        <span className="text-xs text-gray-500">{formatDateTime(request.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">Booking: {request.bookingId}</p>
                      <p className="mt-1 text-sm">{request.reason}</p>
                      {request.requestedChanges ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {request.requestedChanges.newStartTime ? `New start: ${formatDateTime(request.requestedChanges.newStartTime)} ` : ''}
                          {request.requestedChanges.newDuration ? `Duration: ${request.requestedChanges.newDuration} min` : ''}
                        </p>
                      ) : null}
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" onClick={() => review(request, true)} disabled={busyId === request.id}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => review(request, false)} disabled={busyId === request.id}>Reject</Button>
                      </div>
                    </div>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Block a slot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBlock}>
                <Stack gap={3}>
                  <div>
                    <Label htmlFor="block-court">Court (optional)</Label>
                    <select id="block-court" value={blockForm.courtId} onChange={(e) => setBlockForm((c) => ({ ...c, courtId: e.target.value }))} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                      <option value="">All courts</option>
                      {courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="block-start">Start</Label>
                      <Input id="block-start" type="datetime-local" value={blockForm.startTime} onChange={(e) => setBlockForm((c) => ({ ...c, startTime: e.target.value }))} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="block-end">End</Label>
                      <Input id="block-end" type="datetime-local" value={blockForm.endTime} onChange={(e) => setBlockForm((c) => ({ ...c, endTime: e.target.value }))} required className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="block-type">Type</Label>
                    <select id="block-type" value={blockForm.type} onChange={(e) => setBlockForm((c) => ({ ...c, type: e.target.value }))} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                      <option value="maintenance">Maintenance</option>
                      <option value="holiday">Holiday</option>
                      <option value="private_event">Private event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="block-reason">Reason</Label>
                    <Input id="block-reason" value={blockForm.reason} onChange={(e) => setBlockForm((c) => ({ ...c, reason: e.target.value }))} required className="mt-1" />
                  </div>
                  <Button type="submit" className="self-start">Block slot</Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Blocked slots</CardTitle>
          </CardHeader>
          <CardContent>
            {blocked.length === 0 ? <p className="text-sm text-gray-500">No blocked slots.</p> : (
              <Stack gap={2}>
                {blocked.map((slot) => (
                  <div key={slot.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                    <div>
                      <p>{formatDateTime(slot.startTime)} – {formatDateTime(slot.endTime)}</p>
                      <p className="text-gray-500">{slot.type} · {slot.reason}{slot.courtId ? ` · ${slot.courtId}` : ' · All courts'}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => unblock(slot.id)}>Unblock</Button>
                  </div>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? <p className="text-sm text-gray-500">No bookings yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-2 pr-4">Number</th>
                      <th className="py-2 pr-4">Start</th>
                      <th className="py-2 pr-4">Duration</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b">
                        <td className="py-2 pr-4">{booking.bookingNumber}</td>
                        <td className="py-2 pr-4">{formatDateTime(booking.startTime)}</td>
                        <td className="py-2 pr-4">{booking.duration} min</td>
                        <td className="py-2 pr-4"><Badge variant="secondary">{booking.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? <p className="text-sm text-gray-500">No payments yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-2 pr-4">Booking</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Method</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment: any) => (
                      <tr key={payment.id} className="border-b">
                        <td className="py-2 pr-4">{payment.bookingId}</td>
                        <td className="py-2 pr-4">{payment.amount} {payment.currency}</td>
                        <td className="py-2 pr-4">{payment.method}</td>
                        <td className="py-2 pr-4"><Badge variant="secondary">{payment.status}</Badge></td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            {payment.method === 'bank_transfer' && payment.status === 'pending' ? (
                              <>
                                <Button size="sm" onClick={() => verifyPayment(payment.id, true)} disabled={busyId === payment.id}>Approve</Button>
                                <Button size="sm" variant="destructive" onClick={() => verifyPayment(payment.id, false)} disabled={busyId === payment.id}>Reject</Button>
                              </>
                            ) : null}
                            {payment.status === 'paid' ? (
                              <Button size="sm" variant="outline" onClick={() => refund(payment.id)} disabled={busyId === payment.id}>Refund</Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
