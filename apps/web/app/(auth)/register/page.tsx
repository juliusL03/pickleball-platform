'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterPage } from '@juls/pickleball-kit/templates';
import { useAuth } from '@/components/auth-provider';
import { errorMessage } from '@/lib/api';

export default function RegisterPageWrapper() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register({
        ...form,
        phone: form.phone || undefined,
      });
      router.push('/bookings');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RegisterPage form={form} error={error} submitting={submitting} onChange={update} onSubmit={handleSubmit} LinkComponent={Link} />
  );
}
