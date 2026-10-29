import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[rgb(var(--color-primary-600))] text-[rgb(var(--color-chalk))] hover:bg-[rgb(var(--color-primary-700))]',
        destructive: 'bg-[rgb(var(--color-error))] text-[rgb(var(--color-chalk))] hover:opacity-90',
        outline: 'border border-[rgb(var(--color-line))] bg-transparent hover:bg-[rgb(var(--color-surface-raised))]',
        secondary: 'bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-chalk))] hover:bg-[rgb(var(--color-surface))]',
        ghost: 'hover:bg-[rgb(var(--color-surface-raised))] hover:text-[rgb(var(--color-chalk))]',
        link: 'text-[rgb(var(--color-primary-400))] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
