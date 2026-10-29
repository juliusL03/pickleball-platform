import * as React from 'react';
import { cn } from '../../../lib/utils';
import { textareaVariants } from './textarea.styles';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants(), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
