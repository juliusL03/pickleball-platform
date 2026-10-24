import * as React from 'react';
import { cn } from '../../utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = 'column',
      gap = 4,
      align = 'stretch',
      justify = 'start',
      style,
      ...props
    },
    ref
  ) => {
    const gapClass = `gap-${gap}`;
    const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }[align];
    const justifyClass = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    }[justify];

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClass,
          gapClass,
          alignClass,
          justifyClass,
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';
