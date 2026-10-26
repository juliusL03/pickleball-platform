import type { ChangeEventHandler, ComponentType, FormEventHandler } from 'react';
import { Button, Input, Label } from '../ui';
import { cn } from '../utils';
import { AuthShell } from './_auth-shell';
import { DefaultLink, type TemplateLinkProps } from './_link';
import {
  alertPanel,
  displayHeading,
  fieldClass,
  fieldLabel,
  primaryAction,
} from './_styles';

export type AuthLinkProps = TemplateLinkProps;

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterPageProps {
  form: RegisterForm;
  error: string | null;
  submitting: boolean;
  onChange: (field: keyof RegisterForm) => ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  LinkComponent?: ComponentType<AuthLinkProps>;
}

export default function RegisterPage({
  form,
  error,
  submitting,
  onChange,
  onSubmit,
  LinkComponent = DefaultLink,
}: RegisterPageProps) {
  const Link = LinkComponent;
  return (
    <AuthShell>
      <h1
        className={cn(
          displayHeading,
          'mt-8 text-4xl leading-none sm:text-5xl lg:mt-0'
        )}
      >
        Create account
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Set up your account to book courts and manage reservations.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName" className={fieldLabel}>
              First name
            </Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              value={form.firstName}
              onChange={onChange('firstName')}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName" className={fieldLabel}>
              Last name
            </Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              value={form.lastName}
              onChange={onChange('lastName')}
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className={fieldLabel}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange('email')}
            className={fieldClass}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className={fieldLabel}>
            Phone (optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={onChange('phone')}
            className={fieldClass}
          />
        </div>

        <div>
          <Label htmlFor="password" className={fieldLabel}>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={onChange('password')}
            className={fieldClass}
            required
          />
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
            At least 8 characters
          </p>
        </div>

        {error ? (
          <p role="alert" className={alertPanel}>
            {error}
          </p>
        ) : null}

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
              Creating…
            </span>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="mt-6 border-t border-line pt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-ball underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
