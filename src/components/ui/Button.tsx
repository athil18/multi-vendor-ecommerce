/**
 * High-Performance Accessible Button Component
 * Native GPU-accelerated micro-interactions (Zero client framer-motion overhead)
 * 
 * @agent design-ui-designer
 * @agent design-whimsy-injector
 * @agent engineering-frontend-developer
 * @agent testing-performance-benchmarker
 * @agent testing-accessibility-auditor
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm border border-brand-700/20 active:bg-brand-800',
      secondary: 'bg-surface-800 text-white hover:bg-surface-700 shadow-sm border border-surface-700',
      outline: 'border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 bg-transparent',
      ghost: 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-700/20',
      glass: 'bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-surface-700 shadow-sm',
      subtle: 'bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white hover:bg-surface-200 dark:hover:bg-surface-700 shadow-sm',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-md font-medium',
      md: 'h-10 px-4 py-2 text-sm rounded-lg font-medium',
      lg: 'h-12 px-6 text-base rounded-lg font-semibold',
      icon: 'h-10 w-10 justify-center rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
