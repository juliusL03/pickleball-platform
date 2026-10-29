import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[rgb(var(--color-primary-600))] text-[rgb(var(--color-chalk))]',
        secondary: 'border-transparent bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-chalk))]',
        destructive: 'border-transparent bg-[rgb(var(--color-error))] text-[rgb(var(--color-chalk))]',
        outline: 'text-[rgb(var(--color-chalk))] border-[rgb(var(--color-line))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
