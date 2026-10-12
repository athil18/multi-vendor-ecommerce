/**
 * Postel's Law (#14 & #15) Proactive Validated Input
 * Implements:
 * - Postel's Law (Error Prevention & Graceful Recovery): Accepts reasonable variations, provides instant visual feedback
 * - Doherty Threshold (<400ms): Instant micro-interactions and validation indicators
 * - Section 508 / WCAG 2.1 AA: Accessible labels, aria-invalid, and aria-describedby
 * 
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export type ValidationRule = 'email' | 'zip' | 'phone' | 'currency' | 'url' | 'required';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  errorMessage?: string;
  validationRule?: ValidationRule;
  customValidator?: (value: string) => boolean | string;
  icon?: LucideIcon;
  onValidChange?: (isValid: boolean) => void;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      className,
      type = 'text',
      label,
      hint,
      errorMessage,
      validationRule,
      customValidator,
      icon: Icon,
      onValidChange,
      value,
      onChange,
      onBlur,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const [isTouched, setIsTouched] = React.useState(false);
    const [computedError, setComputedError] = React.useState<string | null>(null);
    const [isValid, setIsValid] = React.useState<boolean | null>(null);

    const validate = React.useCallback(
      (val: string) => {
        const trimmed = (val ?? '').toString().trim();

        if (!trimmed) {
          if (props.required || validationRule === 'required') {
            return 'This field is required.';
          }
          return null; // Empty and not required is valid/neutral
        }

        if (customValidator) {
          const result = customValidator(trimmed);
          if (typeof result === 'string') return result;
          if (!result) return errorMessage || 'Please check this value.';
          return null;
        }

        switch (validationRule) {
          case 'email': {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(trimmed)
              ? null
              : 'Please enter a valid email address (e.g. name@atelier.com).';
          }
          case 'zip': {
            const zipDigits = trimmed.replace(/\D/g, '');
            return zipDigits.length >= 5
              ? null
              : 'Enter a valid 5-digit postal code (e.g. 94103).';
          }
          case 'currency': {
            const num = parseFloat(trimmed);
            return !isNaN(num) && num > 0
              ? null
              : 'Enter a positive monetary value (e.g. 45.00).';
          }
          case 'url': {
            try {
              new URL(trimmed);
              return null;
            } catch {
              return 'Enter a valid web URL (e.g. https://images.com/sample.jpg).';
            }
          }
          default:
            return null;
        }
      },
      [customValidator, errorMessage, props.required, validationRule]
    );

    const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (isTouched) {
        const error = validate(e.target.value);
        setComputedError(error);
        const validState = error === null && e.target.value.trim().length > 0;
        setIsValid(validState);
        if (onValidChange) onValidChange(validState);
      }
    };

    const handleInternalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true);
      const error = validate(e.target.value);
      setComputedError(error);
      const validState = error === null && e.target.value.trim().length > 0;
      setIsValid(validState);
      if (onValidChange) onValidChange(validState);
      if (onBlur) onBlur(e);
    };

    const activeError = computedError || (isTouched ? errorMessage : null);
    const showSuccess = isValid && !activeError;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-on-surface flex items-center justify-between"
          >
            <span>
              {label} {props.required && <span className="text-rose-500">*</span>}
            </span>
            {showSuccess && (
              <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Validated
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={type}
            value={value}
            onChange={handleInternalChange}
            onBlur={handleInternalBlur}
            aria-invalid={!!activeError}
            aria-describedby={activeError ? errorId : hint ? hintId : undefined}
            className={cn(
              'w-full bg-surface-container-low text-body-sm py-2.5 rounded-xl border transition-all duration-200 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2',
              Icon ? 'pl-10' : 'pl-3.5',
              showSuccess ? 'pr-10' : activeError ? 'pr-10' : 'pr-3.5',
              activeError
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5'
                : showSuccess
                  ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-500/5'
                  : 'border-outline-variant/30 focus:border-primary focus:ring-primary/20',
              className
            )}
            {...props}
          />

          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
          )}

          {showSuccess && (
            <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
          )}

          {activeError && (
            <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" />
          )}
        </div>

        {activeError ? (
          <p id={errorId} className="text-xs text-rose-500 flex items-center gap-1 mt-0.5" role="alert">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{activeError}</span>
          </p>
        ) : hint ? (
          <p id={hintId} className="text-[11px] text-on-surface-variant/70 mt-0.5">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';
