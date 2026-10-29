'use client';

import * as React from 'react';
import { Select } from '@ark-ui/react/select';
import { Portal } from '@ark-ui/react/portal';
import { cn } from '../../../lib/utils';
import { selectContentVariants, selectItemVariants, selectTriggerVariants } from './select.styles';

const SelectRoot: typeof Select.Root = Select.Root;
const SelectLabel = Select.Label;
const SelectValueText = Select.ValueText;

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Select.Trigger>
>(({ className, children, ...props }, ref) => (
  <Select.Trigger ref={ref} className={cn(selectTriggerVariants(), className)} {...props}>
    {children}
    <Select.Indicator>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.60753 8.74392 7.89245 8.74392 8.06819 8.56819L10.5682 6.06819C10.7439 5.89245 10.7439 5.60753 10.5682 5.43179C10.3924 5.25606 10.1075 5.25606 9.93179 5.43179L7.75 7.61362L5.56819 5.43179C5.39245 5.25606 5.10753 5.25606 4.93179 5.43179Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
      </svg>
    </Select.Indicator>
  </Select.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Select.Content>
>(({ className, ...props }, ref) => (
  <Portal>
    <Select.Positioner>
      <Select.Content
        ref={ref}
        className={cn(selectContentVariants(), className)}
        {...props}
      />
    </Select.Positioner>
  </Portal>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Select.Item>
>(({ className, children, ...props }, ref) => (
  <Select.Item ref={ref} className={cn(selectItemVariants(), className)} {...props}>
    <Select.ItemText>{children}</Select.ItemText>
    <Select.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
      </svg>
    </Select.ItemIndicator>
  </Select.Item>
));
SelectItem.displayName = 'SelectItem';

export {
  SelectRoot as Select,
  SelectLabel,
  SelectValueText,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
export { Select as SelectPrimitive } from '@ark-ui/react/select';
