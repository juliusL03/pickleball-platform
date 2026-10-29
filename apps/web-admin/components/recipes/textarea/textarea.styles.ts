import { cva } from 'class-variance-authority';

export const textareaVariants = cva(
  'flex min-h-[60px] w-full rounded-md border border-[rgb(var(--color-line))] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-[rgb(var(--color-muted))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgb(var(--color-primary-400))] disabled:cursor-not-allowed disabled:opacity-50'
);
