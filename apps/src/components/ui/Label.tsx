import * as React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-xs font-bold uppercase tracking-wider text-surface-500',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
