import type { ComponentType } from 'react';
import { buttonVariants, Container } from '../ui';
import { cn } from '../utils';
import { CourtMap } from './_court-map';
import { DefaultLink, type TemplateLinkProps } from './_link';
import {
  displayHeading,
  eyebrow,
  primaryAction,
  secondaryAction,
} from './_styles';

export type HomePageLinkProps = TemplateLinkProps;

export interface HomePageProps {
  LinkComponent?: ComponentType<HomePageLinkProps>;
}

const facts = [
  { value: '30', unit: 'min', label: 'Slot length' },
  { value: '10', unit: 'min', label: 'Hold while you pay' },
  { value: '24/7', unit: '', label: 'Booking online' },
];

const steps = [
  { title: 'Pick a start time', meta: 'Live' },
  { title: 'Hold it while you pay', meta: '10 min' },
  { title: 'Play once confirmed', meta: 'Online' },
];

export default function HomePage({ LinkComponent = DefaultLink }: HomePageProps) {
  const Link = LinkComponent;
  return (
    <div className="min-h-screen bg-ink text-chalk">
      <section className="relative">
        <Container size="xl">
          <div className="grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
            <div className="rise">
              <p className={cn(eyebrow, 'flex items-center gap-3')}>
                <span aria-hidden className="h-px w-6 bg-line" />
                Manila · Singles / Doubles · 30-min slots
              </p>

              <h1
                className={cn(
                  displayHeading,
                  'mt-6 text-5xl leading-[0.9] sm:text-6xl lg:text-7xl'
                )}
              >
                The court
                <br />
                is{' '}
                <span className="relative inline-block text-ball">
                  yours.
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-[3px] bg-ball/60"
                  />
                </span>
              </h1>

              <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted sm:text-lg">
                Premium courts, thirty-minute slots, and a ten-minute hold while you
                pay. Book from your phone and walk on when the lights come up.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/courts"
                  className={cn(buttonVariants({ size: 'lg' }), primaryAction, 'px-7')}
                >
                  Book a court
                </Link>
                <Link
                  href="/about"
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    secondaryAction,
                    'px-7'
                  )}
                >
                  About the venue
                </Link>
              </div>

              <div className="mt-12 grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="py-4 sm:px-5 sm:first:pl-0"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl leading-none text-chalk">
                        {fact.value}
                      </span>
                      {fact.unit ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ball">
                          {fact.unit}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                      {fact.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rise" style={{ animationDelay: '120ms' }}>
              <CourtMap
                caption="Tonight · Court 01"
                slots={[
                  { time: '18:00', state: 'next', price: '₱850' },
                  { time: '18:30', state: 'open' },
                  { time: '19:00', state: 'booked' },
                  { time: '19:30', state: 'open' },
                ]}
              />
              <ol className="mt-7 divide-y divide-line border-t border-line">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex items-baseline gap-4 py-3"
                  >
                    <span className="font-mono text-[9px] tabular-nums text-ball">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-sm text-chalk">{step.title}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                      {step.meta}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-line bg-court-deep/40">
        <Container size="xl">
          <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ball">
                Open daily
              </p>
              <p
                className={cn(
                  displayHeading,
                  'mt-3 max-w-xl text-2xl leading-tight sm:text-3xl'
                )}
              >
                Bring a paddle. We&apos;ll keep the lights on.
              </p>
            </div>
            <Link
              href="/courts"
              className={cn(buttonVariants({ size: 'lg' }), primaryAction, 'px-7')}
            >
              Book a court
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
