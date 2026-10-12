'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  showIcon?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, showIcon = true, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative w-full">
        {showIcon && (
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 dark:text-surface-500 pointer-events-none" />
        )}
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          autoComplete={props.autoComplete || 'current-password'}
          className={cn(
            'w-full bg-surface-100 dark:bg-surface-900 text-body-sm py-2.5 pr-11 rounded-lg border focus:outline-none focus:ring-2 transition-all text-surface-900 dark:text-surface-100 placeholder:text-surface-400 disabled:cursor-not-allowed disabled:opacity-50',
            showIcon ? 'pl-10' : 'pl-4',
            error
              ? 'border-red-500 dark:border-red-600 focus:ring-red-400 focus:border-red-500'
              : 'border-surface-200 dark:border-surface-800 focus:ring-brand-500 focus:border-brand-500',
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={0}
          disabled={disabled}
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-200/60 dark:hover:bg-surface-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
