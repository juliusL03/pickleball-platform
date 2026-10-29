import * as React from 'react';
import { cn } from '../../../lib/utils';
import { stackVariants } from './stack.styles';

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  wrap?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, align, justify, gap, wrap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(stackVariants({ direction, align, justify, gap, wrap }), className)}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';
