'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Booking } from '@juls/pickleball-kit/types';
import { MY_BOOKINGS_QUERY } from '@juls/pickleball-kit/graphql';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Stack,
} from '@juls/pickleball-kit/ui';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { formatCurrency, formatDateTime } from '@/lib/format';

function badgeVariant(status: string) {
  switch (status) {
    case 'confirmed':
      return 'default' as const;
    case 'cancelled':
      return 'destructive' as const;
    case 'hold':
    case 'pending_payment':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .request<{ myBookings: Booking[] }>(MY_BOOKINGS_QUERY, { limit: 50 })
      .then((data) => setBookings(data.myBookings))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

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
          <p className="mb-4">Sign in to view your bookings.</p>
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </Container>
    );
  }

  const now = Date.now();
  const upcoming = bookings.filter(
    (booking) =>
      new Date(booking.endTime).getTime() >= now &&
      !['cancelled', 'completed', 'no_show'].includes(booking.status),
  );
  const past = bookings.filter(
    (booking) =>
      new Date(booking.endTime).getTime() < now ||
      ['cancelled', 'completed', 'no_show'].includes(booking.status),
  );

  function renderList(items: Booking[], title: string) {
    return (
      <section className="py-4">
        <h2 className="mb-3 text-xl font-semibold">{title}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No bookings.</p>
        ) : (
          <Stack gap={3}>
            {items.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">
                      {booking.bookingNumber}
                    </CardTitle>
                    <Badge variant={badgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                      <p>{formatDateTime(booking.startTime)}</p>
                      <p className="text-gray-500">
                        {booking.duration} minutes ·{' '}
                        {formatCurrency(
                          booking.pricing.total,
                          booking.pricing.currency,
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="underline"
                    >
                      View details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </section>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <h1 className="mb-4 text-3xl font-bold">My bookings</h1>
        {loading ? <p className="text-gray-500">Loading bookings…</p> : null}
        {error ? <p className="text-error">{error}</p> : null}
        {!loading ? (
          <>
            {renderList(upcoming, 'Upcoming')}
            {renderList(past, 'Past and cancelled')}
          </>
        ) : null}
      </div>
    </Container>
  );
}
