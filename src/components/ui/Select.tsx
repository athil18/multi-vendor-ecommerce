import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none bg-surface-container-low text-body-sm py-2.5 pl-4 pr-10 rounded-md border focus:outline-none focus:ring-2 transition-all text-on-surface disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error focus:ring-error'
              : 'border-outline-variant focus:ring-primary focus:border-primary',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
