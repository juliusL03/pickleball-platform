import * as React from 'react';
import { Field } from '@ark-ui/react/field';
import { cn } from '../../utils';
import {
  formDescriptionVariants,
  formFieldVariants,
  formInputVariants,
  formLabelVariants,
  formMessageVariants,
} from './form.styles';

export interface FormFieldProps
  extends React.ComponentProps<typeof Field.Root> {
  size?: 'default' | 'sm' | 'lg';
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <Field.Root
        ref={ref}
        className={cn(formFieldVariants({ size }), className)}
        {...props}
      />
    );
  }
);
FormField.displayName = 'FormField';

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<typeof Field.Label>
>(({ className, ...props }, ref) => (
  <Field.Label
    ref={ref}
    className={cn(formLabelVariants(), className)}
    {...props}
  />
));
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Field.Input>
>(({ className, ...props }, ref) => (
  <Field.Input
    ref={ref}
    className={cn(formInputVariants(), className)}
    {...props}
  />
));
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof Field.HelperText>
>(({ className, ...props }, ref) => (
  <Field.HelperText
    ref={ref}
    className={cn(formDescriptionVariants(), className)}
    {...props}
  />
));
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof Field.ErrorText> & {
    variant?: 'default' | 'error' | 'success';
  }
>(({ className, variant = 'error', ...props }, ref) => (
  <Field.ErrorText
    ref={ref}
    className={cn(formMessageVariants({ variant }), className)}
    {...props}
  />
));
FormMessage.displayName = 'FormMessage';

export { FormControl, FormDescription, FormField, FormLabel, FormMessage };
