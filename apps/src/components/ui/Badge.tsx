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
      glass: 'border-white/20 bg-white/10 text-white backdrop-blur-md shadow-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase font-bold tracking-widest transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 will-change-transform',
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
