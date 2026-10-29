import { cva } from 'class-variance-authority';

export const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      default: 'max-w-7xl',
      sm: 'max-w-3xl',
      lg: 'max-w-screen-xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});
