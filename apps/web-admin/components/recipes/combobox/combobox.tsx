'use client';

import * as React from 'react';
import { Combobox } from '@ark-ui/react/combobox';
import { Portal } from '@ark-ui/react/portal';
import { cn } from '../../../lib/utils';
import { comboboxContentVariants, comboboxInputVariants, comboboxItemVariants } from './combobox.styles';

const ComboboxRoot: typeof Combobox.Root = Combobox.Root;
const ComboboxLabel = Combobox.Label;
const ComboboxControl = Combobox.Control;

const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Combobox.Input>
>(({ className, ...props }, ref) => (
  <Combobox.Input ref={ref} className={cn(comboboxInputVariants(), className)} {...props} />
));
ComboboxInput.displayName = 'ComboboxInput';

const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Combobox.Trigger>
>(({ className, ...props }, ref) => (
  <Combobox.Trigger ref={ref} className={cn('absolute right-2 top-1/2 -translate-y-1/2', className)} {...props}>
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.60753 8.74392 7.89245 8.74392 8.06819 8.56819L10.5682 6.06819C10.7439 5.89245 10.7439 5.60753 10.5682 5.43179C10.3924 5.25606 10.1075 5.25606 9.93179 5.43179L7.75 7.61362L5.56819 5.43179C5.39245 5.25606 5.10753 5.25606 4.93179 5.43179Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
    </svg>
  </Combobox.Trigger>
));
ComboboxTrigger.displayName = 'ComboboxTrigger';

const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Combobox.Content>
>(({ className, ...props }, ref) => (
  <Portal>
    <Combobox.Positioner>
      <Combobox.Content ref={ref} className={cn(comboboxContentVariants(), className)} {...props} />
    </Combobox.Positioner>
  </Portal>
));
ComboboxContent.displayName = 'ComboboxContent';

const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Combobox.Item>
>(({ className, children, ...props }, ref) => (
  <Combobox.Item ref={ref} className={cn(comboboxItemVariants(), className)} {...props}>
    <Combobox.ItemText>{children}</Combobox.ItemText>
    <Combobox.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
      </svg>
    </Combobox.ItemIndicator>
  </Combobox.Item>
));
ComboboxItem.displayName = 'ComboboxItem';

export {
  ComboboxRoot as Combobox,
  ComboboxLabel,
  ComboboxControl,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
};
export { Combobox as ComboboxPrimitive } from '@ark-ui/react/combobox';
