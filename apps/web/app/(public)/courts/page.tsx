'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Court } from '@juls/pickleball-kit/types';
import { COURTS_QUERY } from '@juls/pickleball-kit/graphql';
import { CourtsPage } from '@juls/pickleball-kit/templates';
import { api, errorMessage } from '@/lib/api';

export default function CourtsPageWrapper() {
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

  return <CourtsPage courts={courts} loading={loading} error={error} LinkComponent={Link} />;
}
