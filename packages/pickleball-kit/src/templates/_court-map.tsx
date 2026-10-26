import { cn } from '../utils';

export type CourtMapSlotState = 'next' | 'open' | 'booked';

export interface CourtMapSlot {
  time: string;
  state: CourtMapSlotState;
  price?: string;
}

export interface CourtMapProps {
  slots: CourtMapSlot[];
  caption?: string;
  compact?: boolean;
  className?: string;
}

export function Floodlight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute h-[160%] w-[68%] opacity-70 [clip-path:polygon(42%_0,64%_0,100%_100%,0_100%)] bg-[linear-gradient(180deg,rgba(233,255,87,0.18),rgba(233,255,87,0)_68%)]',
        className
      )}
    />
  );
}

export function CourtMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      className={cn('h-3 w-[17px]', className)}
    >
      <rect x="0.5" y="0.5" width="19" height="13" />
      <path d="M10 0.5v13" />
      <path d="M0.5 7h19" />
      <path d="M4.5 0.5v13M15.5 0.5v13" opacity="0.45" />
    </svg>
  );
}

const stateLabel: Record<CourtMapSlotState, string> = {
  next: 'Next open',
  open: 'Open',
  booked: 'Booked',
};

const dotClass: Record<CourtMapSlotState, string> = {
  next: 'bg-ink',
  open: 'bg-ball',
  booked: 'bg-muted/40',
};

export function CourtMap({
  slots,
  caption = 'Tonight',
  compact = false,
  className,
}: CourtMapProps) {
  return (
    <div className={cn('relative overflow-hidden border border-line bg-court-deep', className)}>
      <div className={cn('relative', compact ? 'p-3' : 'p-3 sm:p-5')}>
        <div className="relative border border-chalk/20">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line"
          />
          <div className="grid grid-cols-2 gap-px bg-line/60">
            {slots.map((slot) => (
              <div
                key={`${slot.time}-${slot.state}`}
                className={cn(
                  'flex flex-col justify-between gap-3',
                  compact ? 'min-h-20 p-3' : 'min-h-24 p-4 sm:min-h-28 lg:min-h-32',
                  slot.state === 'next'
                    ? 'bg-ball text-ink'
                    : 'bg-[#0b2620] text-chalk',
                  slot.state === 'booked' && 'text-muted'
                )}
              >
                <span className="font-mono text-lg leading-none tracking-tight sm:text-xl">
                  {slot.time}
                </span>
                <span className="flex items-end justify-between gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em]">
                    {stateLabel[slot.state]}
                  </span>
                  {slot.price ? (
                    <span className="font-mono text-[10px] leading-none">{slot.price}</span>
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        'mb-0.5 h-1.5 w-1.5 rounded-full',
                        dotClass[slot.state],
                        slot.state === 'next' && 'motion-safe:animate-pulse'
                      )}
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
          <span>{caption}</span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-1 w-1 rounded-full bg-ball motion-safe:animate-pulse" />
            Live
          </span>
        </div>
      </div>
      <Floodlight className="inset-y-0 right-0 h-full w-3/4 rotate-0 opacity-60 mix-blend-screen" />
    </div>
  );
}
