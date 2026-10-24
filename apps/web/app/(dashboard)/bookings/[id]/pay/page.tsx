'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Booking } from '@juls/pickleball-kit/types';
import {
  BOOKING_QUERY,
  INITIATE_PAYMENT_MUTATION,
  MY_PAYMENTS_QUERY,
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
import { useAuth } from '@/components/auth-provider';
import { formatCurrency, formatDateTime } from '@/lib/format';

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'gcash' | 'maya' | 'qrph' | 'bank_transfer'>('gcash');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!params?.id) return;
    try {
      const data = await api.request<{ booking: Booking | null }>(BOOKING_QUERY, {
        id: params.id,
      });
      setBooking(data.booking);
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

  async function handleInitiate() {
    if (!booking) return;
    setSubmitting(true);
    setError(null);
    try {
      const input: any = { bookingId: booking.id, method };
      if (method === 'bank_transfer') {
        if (proofImageUrl) input.proofImageUrl = proofImageUrl;
        if (referenceNumber) input.referenceNumber = referenceNumber;
      }
      const data = await api.request<{ initiatePayment: any }>(
        INITIATE_PAYMENT_MUTATION,
        { input },
      );
      if (data.initiatePayment.checkoutUrl) {
        setCheckoutUrl(data.initiatePayment.checkoutUrl);
      } else if (method === 'bank_transfer') {
        router.push(`/bookings/${booking.id}`);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
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
          <p className="mb-4">Sign in to pay.</p>
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

  return (
    <Container>
      <div className="py-8">
        <Link href={`/bookings/${booking.id}`} className="text-sm text-gray-600 underline">
          ← Back to booking
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap={2}>
                <p className="text-sm">
                  <span className="text-gray-500">Booking: </span>
                  {booking.bookingNumber}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">When: </span>
                  {formatDateTime(booking.startTime)}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Duration: </span>
                  {booking.duration} minutes
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(booking.pricing.total, booking.pricing.currency)}
                </p>
                <Badge>{booking.status}</Badge>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {checkoutUrl ? (
                <Stack gap={3}>
                  <p className="text-sm">
                    Complete your payment using the secure checkout.
                  </p>
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary-600 px-4 text-sm text-white"
                  >
                    Pay with PayMongo
                  </a>
                  <p className="text-xs text-gray-500">
                    After payment, the booking will be confirmed automatically via webhook.
                  </p>
                </Stack>
              ) : (
                <Stack gap={4}>
                  <div>
                    <Label>Payment method</Label>
                    <select
                      value={method}
                      onChange={(event) => setMethod(event.target.value as any)}
                      className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="gcash">GCash</option>
                      <option value="maya">Maya</option>
                      <option value="qrph">QRPh</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {method === 'bank_transfer' ? (
                    <Stack gap={3}>
                      <div>
                        <Label htmlFor="ref">Reference number</Label>
                        <Input
                          id="ref"
                          value={referenceNumber}
                          onChange={(event) => setReferenceNumber(event.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="proof">Proof image URL</Label>
                        <Input
                          id="proof"
                          value={proofImageUrl}
                          onChange={(event) => setProofImageUrl(event.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Send payment to the venue account and upload proof. Staff will verify.
                      </p>
                    </Stack>
                  ) : null}

                  <Button onClick={handleInitiate} disabled={submitting}>
                    {submitting ? 'Processing…' : method === 'bank_transfer' ? 'Submit for verification' : 'Continue to payment'}
                  </Button>
                </Stack>
              )}
              {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
