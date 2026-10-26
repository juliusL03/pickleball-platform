import type { ComponentType } from 'react';
import { buttonVariants, Container } from '../ui';
import { cn } from '../utils';
import { CourtMark } from './_court-map';
import { DefaultLink, type TemplateLinkProps } from './_link';
import { displayHeading, eyebrow, primaryAction, secondaryAction } from './_styles';

export type AboutPageLinkProps = TemplateLinkProps;

export interface AboutPageProps {
  LinkComponent?: ComponentType<AboutPageLinkProps>;
}

const principles = [
  {
    title: 'Well kept',
    body: 'Courts are maintained and ready before your slot starts.',
  },
  {
    title: 'Booked online',
    body: 'Availability is live, so what you see is what you can reserve.',
  },
  {
    title: 'Singles or doubles',
    body: 'Reserve for one player or bring a full four.',
  },
];

const venueDetails = [
  { label: 'Location', value: 'Manila, Philippines' },
  { label: 'Hours', value: 'Daily' },
  { label: 'Play', value: 'Singles & doubles' },
  { label: 'Slots', value: '30 minutes' },
];

export default function AboutPage({ LinkComponent = DefaultLink }: AboutPageProps) {
  const Link = LinkComponent;
  return (
    <div className="min-h-screen bg-ink text-chalk">
      <Container size="xl">
        <section className="py-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="rise">
              <p className={cn(eyebrow, 'flex items-center gap-3')}>
                <span aria-hidden className="h-px w-6 bg-line" />
                About the venue
              </p>
              <h1
                className={cn(
                  displayHeading,
                  'mt-5 max-w-xl text-4xl leading-[0.92] sm:text-5xl lg:text-6xl'
                )}
              >
                A court that&apos;s ready when you are.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                Premium pickleball courts in Manila with easy online booking. We keep
                the surface ready and the schedule honest, so you can turn up and
                play instead of chasing a reservation.
              </p>

              <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-3">
                {principles.map((principle) => (
                  <div key={principle.title} className="bg-surface p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ball">
                      {principle.title}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {principle.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rise" style={{ animationDelay: '120ms' }}>
              <div className="border border-line bg-surface">
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                    Venue
                  </p>
                  <CourtMark className="text-ball" />
                </div>
                <dl className="divide-y divide-line">
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
                <div className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row">
                  <Link
                    href="/contact"
                    className={cn(buttonVariants(), primaryAction, 'w-full sm:w-auto')}
                  >
                    Get in touch
                  </Link>
                  <Link
                    href="/courts"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      secondaryAction,
                      'w-full sm:w-auto'
                    )}
                  >
                    See courts
                  </Link>
                </div>
              </div>
              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                Standard court · 44 × 20 ft
              </p>
            </aside>
          </div>
        </section>
      </Container>
    </div>
  );
}
