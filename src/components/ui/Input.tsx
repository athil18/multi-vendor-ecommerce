import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            'w-full bg-surface-container-low text-body-sm py-2.5 pr-4 rounded-md border focus:outline-none focus:ring-2 transition-all text-on-surface placeholder:text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50',
            Icon ? 'pl-10' : 'pl-4',
            error
              ? 'border-error focus:ring-error'
              : 'border-outline-variant focus:ring-primary focus:border-primary',
            className
          )}
          ref={ref}
          {...props}
        />
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
