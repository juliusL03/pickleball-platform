import type { ComponentType } from 'react';
import { buttonVariants, Container } from '../ui';
import { cn } from '../utils';
import { CourtMark } from './_court-map';
import { DefaultLink, type TemplateLinkProps } from './_link';
import { displayHeading, eyebrow, primaryAction, secondaryAction } from './_styles';

export type ContactPageLinkProps = TemplateLinkProps;

export interface ContactPageProps {
  LinkComponent?: ComponentType<ContactPageLinkProps>;
}

const supportActions = [
  'See upcoming bookings and the status of a hold',
  'Check the payment state of a reservation',
  'Request a change to a confirmed booking',
];

const venueDetails = [
  { label: 'Slots', value: '30 minutes' },
  { label: 'Hold', value: '10 minutes' },
  { label: 'Play', value: 'Singles & doubles' },
  { label: 'Hours', value: 'Daily' },
];

export default function ContactPage({ LinkComponent = DefaultLink }: ContactPageProps) {
  const Link = LinkComponent;
  return (
    <div className="min-h-screen bg-ink text-chalk">
      <Container size="xl">
        <section className="py-12 lg:py-16">
          <div className="max-w-2xl rise">
            <p className={cn(eyebrow, 'flex items-center gap-3')}>
              <span aria-hidden className="h-px w-6 bg-line" />
              Contact
            </p>
            <h1 className={cn(displayHeading, 'mt-5 text-4xl leading-[0.95] sm:text-5xl')}>
              Get in touch
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted">
              Questions about bookings or the venue? Most answers live in your
              account, where you can also make changes to a reservation.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col border border-line bg-surface rise">
              <div aria-hidden className="h-[3px] w-full bg-court" />
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                  Booking support
                </p>
                <h2 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-[-0.01em] text-chalk sm:text-3xl">
                  Start with your account
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                  Sign in to manage your bookings, view upcoming reservations, or
                  request changes.
                </p>

                <ul className="mt-6 space-y-3">
                  {supportActions.map((action) => (
                    <li key={action} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ball"
                      />
                      <span className="text-sm leading-relaxed text-chalk">{action}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/login" className={cn(buttonVariants(), primaryAction)}>
                    Sign in
                  </Link>
                  <Link
                    href="/courts"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      secondaryAction
                    )}
                  >
                    Browse courts
                  </Link>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-6 rise" style={{ animationDelay: '120ms' }}>
              <div className="border border-line bg-court-deep p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ball">
                    The venue
                  </p>
                  <CourtMark className="text-chalk/60" />
                </div>
                <p
                  className={cn(
                    displayHeading,
                    'mt-4 text-3xl leading-[0.95] text-chalk sm:text-4xl'
                  )}
                >
                  Manila,
                  <br />
                  Philippines
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Open daily for singles and doubles. Book ahead to hold a start time.
                </p>
              </div>

              <dl className="divide-y divide-line border border-line bg-surface">
                {venueDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-baseline justify-between gap-6 px-5 py-4"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      {detail.label}
                    </dt>
                    <dd className="text-sm text-chalk">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>
      </Container>
    </div>
  );
}
