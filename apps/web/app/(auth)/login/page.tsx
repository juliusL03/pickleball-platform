'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
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
import { useAuth } from '@/components/auth-provider';
import { errorMessage } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/bookings');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container size="sm">
      <section className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                {error ? <p className="text-sm text-error">{error}</p> : null}
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </Button>
                <p className="text-sm text-gray-600">
                  No account? <Link href="/register">Create one</Link>
                </p>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
