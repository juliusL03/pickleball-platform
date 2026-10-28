import { cva } from 'class-variance-authority';

export const formFieldVariants = cva('space-y-2', {
  variants: {
    size: {
      default: '',
      sm: 'space-y-1.5',
      lg: 'space-y-2.5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const formLabelVariants = cva(
  'font-mono text-[10px] font-normal uppercase tracking-[0.24em] text-muted peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export const formInputVariants = cva(
  'flex h-11 w-full rounded-[2px] border border-line bg-surface px-3 py-2 text-sm text-chalk transition-colors placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50'
);

export const formDescriptionVariants = cva(
  'font-mono text-[9px] uppercase tracking-[0.16em] text-muted'
);

export const formMessageVariants = cva('border border-line border-l-2 px-4 py-3 text-sm', {
  variants: {
    variant: {
      default: 'border-l-ball bg-surface text-chalk',
      error: 'border-l-clay bg-surface text-alert',
      success: 'border-l-emerald-400 bg-surface text-emerald-400',
    },
  },
  defaultVariants: {
    variant: 'error',
  },
});
