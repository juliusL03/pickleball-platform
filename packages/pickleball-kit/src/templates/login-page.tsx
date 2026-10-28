import type { ComponentType, FormEventHandler } from 'react';
import { Button } from '../ui/button';
import { cn } from '../utils';
import { AuthShell } from './_auth-shell';
import { DefaultLink, type TemplateLinkProps } from './_link';
import {
  displayHeading,
  fieldLabel,
  primaryAction,
} from './_styles';
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from '../ui/form';

export type AuthLinkProps = TemplateLinkProps;

export interface LoginPageProps {
  email: string;
  password: string;
  error: string | null;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  LinkComponent?: ComponentType<AuthLinkProps>;
}

export default function LoginPage({
  email,
  password,
  error,
  submitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  LinkComponent = DefaultLink,
}: LoginPageProps) {
  const Link = LinkComponent;
  return (
    <AuthShell>
      <h1
        className={cn(
          displayHeading,
          'mt-8 text-4xl leading-none sm:text-5xl lg:mt-0'
        )}
      >
        Sign in
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Access your bookings, holds, and payment status.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <FormField>
          <FormLabel htmlFor="email" className={fieldLabel}>
            Email
          </FormLabel>
          <FormControl
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
            className="mt-2"
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="password" className={fieldLabel}>
            Password
          </FormLabel>
          <FormControl
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
            className="mt-2"
          />
        </FormField>

        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        <Button
          type="submit"
          disabled={submitting}
          className={cn(primaryAction, 'h-11 w-full')}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-ink motion-safe:animate-pulse"
              />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="mt-6 border-t border-line pt-6 text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-ball underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
