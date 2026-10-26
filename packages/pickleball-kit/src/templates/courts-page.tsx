import type { ComponentType } from 'react';
import { buttonVariants, Container } from '../ui';
import { cn } from '../utils';
import { DefaultLink, type TemplateLinkProps } from './_link';
import { displayHeading, eyebrow, primaryAction } from './_styles';

export interface CourtItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  amenities?: string[];
  pricing?: Array<{ duration: number; price: number }>;
  isActive?: boolean;
}

export type CourtsPageLinkProps = TemplateLinkProps;

export interface CourtsPageProps {
  courts?: CourtItem[];
  loading?: boolean;
  error?: string | null;
  LinkComponent?: ComponentType<CourtsPageLinkProps>;
}

function priceLabel(court: CourtItem) {
  const pricing =
    court.pricing?.find((item) => item.duration === 60) || court.pricing?.[0];
  return pricing ? `₱${pricing.price.toLocaleString()}` : null;
}

function SkeletonCard() {
  return (
    <div className="border border-line bg-surface p-6 motion-safe:animate-pulse">
      <div className="h-2 w-16 bg-surface-raised" />
      <div className="mt-4 h-6 w-40 bg-surface-raised" />
      <div className="mt-5 h-3 w-full bg-surface-raised" />
      <div className="mt-2 h-3 w-2/3 bg-surface-raised" />
      <div className="mt-8 h-9 w-full bg-surface-raised" />
    </div>
  );
}

export default function CourtsPage({
  courts = [],
  loading = false,
  error = null,
  LinkComponent = DefaultLink,
}: CourtsPageProps) {
  const Link = LinkComponent;
  const available = courts.filter((court) => court.isActive).length;

  return (
    <div className="min-h-screen bg-ink text-chalk">
      <Container size="xl">
        <section className="py-12 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl rise">
              <p className={cn(eyebrow, 'flex items-center gap-3')}>
                <span aria-hidden className="h-px w-6 bg-line" />
                Courts · Live availability
              </p>
              <h1 className={cn(displayHeading, 'mt-5 text-4xl leading-[0.95] sm:text-5xl')}>
                Choose your court
              </h1>
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted">
                Pick a court to see open start times, hold a slot for ten minutes,
                and pay online.
              </p>
            </div>

            {!loading && !error && courts.length > 0 ? (
              <div className="flex items-center gap-4 border border-line bg-surface px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                <span>
                  <span className="text-chalk">{courts.length}</span> courts
                </span>
                <span aria-hidden className="h-3 w-px bg-line" />
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-ball motion-safe:animate-pulse"
                  />
                  <span className="text-chalk">{available}</span> available
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-10">
            {loading ? (
              <>
                <div aria-hidden className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                <p className="sr-only" role="status">
                  Loading courts
                </p>
              </>
            ) : null}

            {error ? (
              <p role="alert" className="border border-line border-l-2 border-l-clay bg-surface px-5 py-4 text-sm text-alert">
                {error} Reload the page to try again.
              </p>
            ) : null}

            {!loading && !error && courts.length === 0 ? (
              <div className="border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ball">
                  No courts listed
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  Courts appear here as soon as the venue publishes them. Ask the
                  venue if you expected to see one.
                </p>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'mt-6 border-line bg-transparent text-chalk hover:bg-surface-raised hover:text-chalk focus-visible:ring-ball focus-visible:ring-offset-ink'
                  )}
                >
                  Contact the venue
                </Link>
              </div>
            ) : null}
          </div>

          {!loading && !error && courts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courts.map((court, index) => {
                const price = priceLabel(court);
                const open = Boolean(court.isActive);
                return (
                  <article
                    key={court.id}
                    className="group flex flex-col border border-line bg-surface transition-colors hover:border-chalk/25 hover:bg-surface-raised"
                  >
                    <div
                      aria-hidden
                      className={cn(
                        'h-[3px] w-full transition-colors',
                        open ? 'bg-court group-hover:bg-ball' : 'bg-line'
                      )}
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                            Court {String(index + 1).padStart(2, '0')}
                          </p>
                          <h2 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-[-0.01em] text-chalk">
                            {court.name}
                          </h2>
                        </div>
                        <span className="mt-1 flex shrink-0 items-center gap-2">
                          <span
                            aria-hidden
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              open ? 'bg-ball motion-safe:animate-pulse' : 'bg-muted/40'
                            )}
                          />
                          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                            {open ? 'Available' : 'Unavailable'}
                          </span>
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-muted">
                        {court.description ||
                          'Tournament-grade court with a quality playing surface.'}
                      </p>

                      {court.amenities && court.amenities.length > 0 ? (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {court.amenities.slice(0, 3).map((amenity) => (
                            <li
                              key={amenity}
                              className="border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted"
                            >
                              {amenity}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-5">
                        <div>
                          {price ? (
                            <>
                              <p className="font-mono text-lg leading-none text-chalk">
                                {price}
                              </p>
                              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                                per 60 min
                              </p>
                            </>
                          ) : (
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                              See details
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/courts/${court.slug}`}
                          aria-label={`Book ${court.name}`}
                          className={cn(
                            buttonVariants({ size: 'sm' }),
                            primaryAction,
                            'px-4'
                          )}
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </Container>
    </div>
  );
}
