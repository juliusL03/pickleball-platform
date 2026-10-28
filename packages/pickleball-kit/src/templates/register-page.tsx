import type { ChangeEventHandler, ComponentType, FormEventHandler } from 'react';
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
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../ui/form';

export type AuthLinkProps = TemplateLinkProps;

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
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
          <FormField>
            <FormLabel htmlFor="firstName" className={fieldLabel}>
              First name
            </FormLabel>
            <FormControl
              id="firstName"
              autoComplete="given-name"
              value={form.firstName}
              onChange={onChange('firstName')}
              required
              className="mt-2"
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="lastName" className={fieldLabel}>
              Last name
            </FormLabel>
            <FormControl
              id="lastName"
              autoComplete="family-name"
              value={form.lastName}
              onChange={onChange('lastName')}
              required
              className="mt-2"
            />
          </FormField>
        </div>

        <FormField>
          <FormLabel htmlFor="email" className={fieldLabel}>
            Email
          </FormLabel>
          <FormControl
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange('email')}
            required
            className="mt-2"
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="phone" className={fieldLabel}>
            Phone (optional)
          </FormLabel>
          <FormControl
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={onChange('phone')}
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
            autoComplete="new-password"
            value={form.password}
            onChange={onChange('password')}
            required
            className="mt-2"
          />
          <FormDescription>At least 8 characters</FormDescription>
        </FormField>

        {form.confirmPassword !== undefined && (
          <FormField>
            <FormLabel htmlFor="confirmPassword" className={fieldLabel}>
              Confirm password
            </FormLabel>
            <FormControl
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={onChange('confirmPassword')}
              required
              className="mt-2"
            />
          </FormField>
        )}

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
