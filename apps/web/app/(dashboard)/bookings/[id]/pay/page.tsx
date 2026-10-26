'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Booking, Court } from '@juls/pickleball-kit/types';
import { BOOKING_QUERY, INITIATE_PAYMENT_MUTATION } from '@juls/pickleball-kit/graphql';
import { Button, buttonVariants, Container, Input, Label } from '@juls/pickleball-kit/ui';
import { cn } from '@juls/pickleball-kit/utils';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import {
  formatCurrency,
  formatLongDate,
  formatTimeRange,
} from '@/lib/format';
import {
  alertPanel,
  BackLink,
  courtName,
  display,
  ErrorPanel,
  eyebrow,
  field,
  fieldLabel,
  formatCountdown,
  isHoldExpired,
  loadCourtIndex,
  metaLabel,
  primaryAction,
  SignedOutPanel,
  SlotStrip,
  StatusChip,
  useNow,
} from '../../_ui';

type PaymentMethod = 'gcash' | 'maya' | 'qrph' | 'bank_transfer';

const METHODS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: 'gcash', label: 'GCash', hint: 'Pay from your GCash wallet' },
  { value: 'maya', label: 'Maya', hint: 'Pay from your Maya wallet' },
  { value: 'qrph', label: 'QR Ph', hint: 'Scan with any banking app' },
  {
    value: 'bank_transfer',
    label: 'Bank transfer',
    hint: 'Send proof for staff to verify',
  },
];

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [courts, setCourts] = useState<Map<string, Court>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('gcash');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const now = useNow(booking?.status === 'hold' ? 1000 : 60000);

  const load = useCallback(async () => {
    if (!params?.id) return;
    try {
      const [bookingData, courtIndex] = await Promise.all([
        api.request<{ booking: Booking | null }>(BOOKING_QUERY, {
          id: params.id,
        }),
        loadCourtIndex(),
      ]);
      setBooking(bookingData.booking);
      setCourts(courtIndex);
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

  async function handleInitiate() {
    if (!booking) return;
    setSubmitting(true);
    setError(null);
    try {
      const input: Record<string, unknown> = { bookingId: booking.id, method };
      if (method === 'bank_transfer') {
        if (proofImageUrl) input.proofImageUrl = proofImageUrl;
        if (referenceNumber) input.referenceNumber = referenceNumber;
      }
      const data = await api.request<{
        initiatePayment: { checkoutUrl?: string | null };
      }>(INITIATE_PAYMENT_MUTATION, { input });
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
      <Container size="xl">
        <div className="py-16">
          <p className={eyebrow}>Loading</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return <SignedOutPanel message="Sign in to pay for this booking." />;
  }

  if (loading) {
    return (
      <Container size="xl">
        <div className="py-16">
          <p className={eyebrow}>Loading booking</p>
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

  const expired = isHoldExpired(booking, now);
  const total = formatCurrency(booking.pricing.total, booking.pricing.currency);
  const methodMeta = METHODS.find((option) => option.value === method);

  if (expired) {
    return (
      <Container size="xl">
        <div className="py-8 lg:py-12">
          <BackLink href={`/bookings/${booking.id}`}>Back to booking</BackLink>
          <div className="mt-8 max-w-md">
            <div className={alertPanel}>
              This hold expired before payment, so the slot went back on the
              board.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/courts"
                className={cn(buttonVariants(), primaryAction, 'px-5')}
              >
                Find another slot
              </Link>
              <Link
                href={`/bookings/${booking.id}`}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'rounded-[2px] border-line bg-transparent text-chalk hover:bg-surface-raised hover:text-chalk focus-visible:ring-ball focus-visible:ring-offset-ink',
                )}
              >
                View booking
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <div className="py-8 lg:py-12">
        <BackLink href={`/bookings/${booking.id}`}>Back to booking</BackLink>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={eyebrow}>Payment</p>
            <h1 className={cn(display, 'mt-3 text-4xl leading-none text-chalk sm:text-5xl')}>
              Confirm your slot
            </h1>
          </div>
          {booking.status === 'hold' && booking.holdExpiresAt ? (
            <p className="flex items-center gap-2 border border-ball/40 bg-ball/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ball">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-ball motion-safe:animate-pulse"
              />
              {formatCountdown(new Date(booking.holdExpiresAt).getTime() - now)}{' '}
              left to pay
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <article className="border border-line bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
              <p className={metaLabel}>Booking</p>
              <StatusChip status={booking.status} />
            </div>

            <div className="p-5 sm:p-6">
              <h2 className={cn(display, 'text-2xl leading-none text-chalk sm:text-3xl')}>
                {courtName(courts.get(booking.courtId))}
              </h2>
              <p className="mt-3 text-sm text-muted">
                {formatLongDate(booking.startTime)}
              </p>
              <p className="mt-1 font-mono text-sm text-chalk">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </p>

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
              </dl>
            </div>

            <div className="flex items-end justify-between gap-4 border-t border-line bg-court-deep px-5 py-4">
              <p className={metaLabel}>Total</p>
              <p className="font-mono text-3xl leading-none text-chalk">{total}</p>
            </div>
          </article>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-3">
              <p className={metaLabel}>
                {checkoutUrl ? 'Complete payment' : 'Pay with'}
              </p>
            </div>

            {checkoutUrl ? (
              <div className="flex flex-col gap-4 p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-muted">
                  Finish the payment on the provider&apos;s secure page. Your
                  booking confirms automatically once it clears.
                </p>
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: 'lg' }), primaryAction)}
                >
                  Pay with PayMongo
                </a>
                <p className={metaLabel}>
                  Keep this tab open — you can come back to check the status.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 p-5 sm:p-6">
                <fieldset>
                  <legend className={fieldLabel}>Payment method</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {METHODS.map((option) => {
                      const active = method === option.value;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            'flex cursor-pointer items-start justify-between gap-3 border px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-ball focus-within:ring-offset-2 focus-within:ring-offset-ink',
                            active
                              ? 'border-ball/60 bg-ball/5'
                              : 'border-line bg-surface hover:bg-surface-raised',
                          )}
                        >
                          <span>
                            <span className="block text-sm text-chalk">
                              {option.label}
                            </span>
                            <span className={cn(metaLabel, 'mt-1 block')}>
                              {option.hint}
                            </span>
                          </span>
                          <input
                            type="radio"
                            name="method"
                            value={option.value}
                            checked={active}
                            onChange={() => setMethod(option.value)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={cn(
                              'mt-1 h-3 w-3 shrink-0 rounded-full border',
                              active ? 'border-ball bg-ball' : 'border-line',
                            )}
                          />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {method === 'bank_transfer' ? (
                  <div className="flex flex-col gap-4 border border-line border-l-2 border-l-clay bg-surface px-4 py-4">
                    <div>
                      <Label htmlFor="ref" className={fieldLabel}>
                        Reference number
                      </Label>
                      <Input
                        id="ref"
                        value={referenceNumber}
                        onChange={(event) => setReferenceNumber(event.target.value)}
                        className={field}
                      />
                    </div>
                    <div>
                      <Label htmlFor="proof" className={fieldLabel}>
                        Proof image URL
                      </Label>
                      <Input
                        id="proof"
                        value={proofImageUrl}
                        onChange={(event) => setProofImageUrl(event.target.value)}
                        className={field}
                      />
                    </div>
                    <p className="text-xs leading-relaxed text-muted">
                      Send the payment to the venue account, then add the
                      reference and proof. Staff verify it before the booking
                      confirms.
                    </p>
                  </div>
                ) : null}

                <Button
                  onClick={handleInitiate}
                  disabled={submitting}
                  size="lg"
                  className={cn(primaryAction, 'w-full')}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-ink motion-safe:animate-pulse"
                      />
                      Processing…
                    </span>
                  ) : method === 'bank_transfer' ? (
                    'Submit for verification'
                  ) : (
                    `Continue to ${methodMeta?.label ?? 'payment'}`
                  )}
                </Button>

                <p className={cn(metaLabel, 'leading-relaxed')}>
                  Your slot is held while you pay. Payments are verified
                  server-side before the booking confirms.
                </p>
              </div>
            )}

            {error ? (
              <div className="border-t border-line p-5">
                <ErrorPanel message={error} />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </Container>
  );
}
