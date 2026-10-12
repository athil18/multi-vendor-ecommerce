/**
 * High-Performance Accessible Badge Component
 * Zero-JS rendering with native CSS animations
 * 
 * @agent engineering-frontend-developer
 * @agent testing-performance-benchmarker
 * @agent testing-accessibility-auditor
 * @agent design-ui-designer
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'glass';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'border-transparent bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 shadow-sm',
      secondary: 'border-transparent bg-surface-200 text-surface-800 dark:bg-surface-800 dark:text-surface-300 shadow-sm',
      destructive: 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 shadow-sm',
      outline: 'text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700',
      success: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-sm',
      warning: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shadow-sm',
      glass: 'border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 shadow-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
