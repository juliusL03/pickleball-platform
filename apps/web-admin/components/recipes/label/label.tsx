import * as React from 'react';
import { cn } from '../../../lib/utils';
import { labelVariants } from './label.styles';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = 'Label';
