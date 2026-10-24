'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Court } from '@juls/pickleball-kit/types';
import { COURTS_QUERY } from '@juls/pickleball-kit/graphql';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
} from '@juls/pickleball-kit/ui';
import { api, errorMessage } from '@/lib/api';

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .request<{ courts: Court[] }>(COURTS_QUERY)
      .then((data) => setCourts(data.courts))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container>
      <section className="py-8">
        <h1 className="mb-6 text-3xl font-bold">Our Courts</h1>
        {loading ? <p className="text-gray-500">Loading courts…</p> : null}
        {error ? <p className="text-error">{error}</p> : null}
        {!loading && courts.length === 0 ? (
          <p className="text-gray-500">No courts are available yet.</p>
        ) : null}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => (
            <Card key={court.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{court.name}</CardTitle>
                  <Badge variant="secondary">
                    {court.isActive ? 'Open' : 'Closed'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-gray-600">
                  {court.description ?? 'Premium pickleball court'}
                </p>
                {court.amenities.length > 0 ? (
                  <p className="mb-4 text-sm text-gray-500">
                    {court.amenities.join(' · ')}
                  </p>
                ) : null}
                <Link
                  href={`/courts/${court.slug}`}
                  className="text-sm font-medium text-primary-700 underline"
                >
                  View availability
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  );
}
