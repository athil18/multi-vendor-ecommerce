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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-500 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] border border-brand-500/50',
      secondary: 'bg-surface-800 text-white hover:bg-surface-700 shadow-sm border border-surface-700',
      outline: 'border-2 border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 bg-transparent',
      ghost: 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm border border-red-500/50',
      glass: 'bg-white/10 dark:bg-surface-800/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-surface-900 dark:text-white hover:bg-white/20 dark:hover:bg-surface-700/50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-full',
      md: 'h-11 px-6 py-2 text-sm rounded-full',
      lg: 'h-14 px-8 text-base rounded-full',
      icon: 'h-11 w-11 justify-center rounded-full',
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
