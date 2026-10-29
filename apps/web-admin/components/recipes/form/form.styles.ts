import { cva } from 'class-variance-authority';

export const formFieldVariants = cva('grid gap-2');

export const formLabelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export const formInputVariants = cva(
  'flex h-9 w-full rounded-md border border-[rgb(var(--color-line))] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(var(--color-muted))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgb(var(--color-primary-400))] disabled:cursor-not-allowed disabled:opacity-50'
);

export const formDescriptionVariants = cva(
  'text-sm text-[rgb(var(--color-muted))]'
);

export const formMessageVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-[rgb(var(--color-chalk))]',
      error: 'text-[rgb(var(--color-error))]',
      success: 'text-[rgb(var(--color-success))]',
    },
  },
  defaultVariants: {
    variant: 'error',
  },
});
