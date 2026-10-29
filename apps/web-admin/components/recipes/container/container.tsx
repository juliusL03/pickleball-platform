import * as React from 'react';
import { cn } from '../../../lib/utils';
import { containerVariants } from './container.styles';

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg' | 'full';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size }), className)}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';
