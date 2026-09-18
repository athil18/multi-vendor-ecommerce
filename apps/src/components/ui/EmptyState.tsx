import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, actionLabel, onAction, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center p-8 text-center', className)}
        {...props}
      >
        {Icon && (
          <div className="mb-4 rounded-full bg-surface-100 p-4 dark:bg-surface-800">
            <Icon className="h-8 w-8 text-surface-400" />
          </div>
        )}
        <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50">{title}</h3>
        {description && <p className="mt-2 max-w-sm text-sm text-surface-500">{description}</p>}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-6">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
