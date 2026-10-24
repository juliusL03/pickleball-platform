'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Court } from '@juls/pickleball-kit/types';
import { COURT_QUERY } from '@juls/pickleball-kit/graphql';
import {
  Card,
  CardContent,
  Container,
} from '@juls/pickleball-kit/ui';
import { api, errorMessage } from '@/lib/api';
import { BookingWidget } from '@/components/booking-widget';

export default function CourtDetailPage() {
  const params = useParams<{ slug: string }>();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.slug) return;
    api
      .request<{ court: Court | null }>(COURT_QUERY, { slug: params.slug })
      .then((data) => {
        setCourt(data.court);
        if (!data.court) setError('Court not found');
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  return (
    <Container>
      <section className="py-8">
        <Link href="/courts" className="text-sm text-gray-600 underline">
          ← Back to courts
        </Link>
        {loading ? <p className="mt-6 text-gray-500">Loading court…</p> : null}
        {error ? <p className="mt-6 text-error">{error}</p> : null}
        {court ? (
          <div className="mt-4 grid gap-8 lg:grid-cols-[2fr_3fr]">
            <div>
              <h1 className="text-3xl font-bold">{court.name}</h1>
              <p className="mt-2 text-gray-600">
                {court.description ?? 'Premium pickleball court'}
              </p>
              {court.amenities.length > 0 ? (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <h2 className="font-semibold">Amenities</h2>
                    <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                      {court.amenities.map((amenity) => (
                        <li key={amenity}>{amenity}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}
            </div>
            <BookingWidget court={court} />
          </div>
        ) : null}
      </section>
    </Container>
  );
}
