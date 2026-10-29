import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'flex h-9 w-full rounded-md border border-[rgb(var(--color-line))] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(var(--color-muted))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgb(var(--color-primary-400))] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-9',
        sm: 'h-8 text-xs',
        lg: 'h-10',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);
