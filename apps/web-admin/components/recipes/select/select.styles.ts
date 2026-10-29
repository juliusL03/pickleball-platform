import { cva } from 'class-variance-authority';

export const selectTriggerVariants = cva(
  'flex h-9 w-full items-center justify-between rounded-md border border-[rgb(var(--color-line))] bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-[rgb(var(--color-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-400))] disabled:cursor-not-allowed disabled:opacity-50'
);

export const selectContentVariants = cva(
  'relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-chalk))] shadow-md'
);

export const selectItemVariants = cva(
  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-[rgb(var(--color-surface-raised))] data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
);
