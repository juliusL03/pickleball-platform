import type { ReactNode } from 'react';
import { cn } from '../utils';
import { CourtMap, CourtMark, Floodlight } from './_court-map';
import { displayHeading } from './_styles';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-chalk lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-court-deep lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
        <Floodlight className="-top-1/4 -right-12 rotate-6" />

        <div className="relative flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-chalk/80">
          <CourtMark className="text-ball" />
          Manila · Pickleball
        </div>

        <div className="relative">
          <p className={cn(displayHeading, 'text-3xl leading-[0.95]')}>
            Tonight
            <br />
            on court
          </p>
          <CourtMap
            compact
            className="mt-6"
            caption="Court 01 · 18:00"
            slots={[
              { time: '18:00', state: 'next', price: '₱850' },
              { time: '18:30', state: 'open' },
              { time: '19:00', state: 'booked' },
              { time: '19:30', state: 'open' },
            ]}
          />
        </div>

        <p className="relative font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
          30-minute slots · 10-minute hold · Instant confirmation
        </p>
      </aside>

      <main className="flex min-h-screen items-center px-4 py-12 sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md rise">
          <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted lg:hidden">
            <CourtMark className="text-ball" />
            Manila · Pickleball
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
