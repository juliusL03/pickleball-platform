import * as React from 'react';
import { cn } from '../../../lib/utils';
import { inputVariants } from './input.styles';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'default' | 'sm' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
