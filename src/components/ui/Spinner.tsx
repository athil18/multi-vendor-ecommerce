import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    return (
      <div ref={ref} role="status" aria-label="Loading" className={cn('animate-spin text-brand-600', sizes[size], className)} {...props}>
        <Loader2 className="h-full w-full" />
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };
