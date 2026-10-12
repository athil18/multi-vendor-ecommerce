'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmationModalProps) {
  const finalCancel = onCancel || onClose || (() => {});
  const finalConfirmText = confirmLabel || confirmText || 'Confirm';
  const finalCancelText = cancelLabel || cancelText || 'Cancel';
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store previously focused element and restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus cancel button by default for safety on destructive actions
      setTimeout(() => {
        if (variant === 'danger') {
          cancelBtnRef.current?.focus();
        } else {
          confirmBtnRef.current?.focus();
        }
      }, 50);
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen, variant]);

  // Handle Escape key and Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        finalCancel();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, finalCancel]);

  if (!isOpen) return null;

  const iconMap = {
    danger: <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />,
    warning: <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    primary: <Info className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
  };

  const bgMap = {
    danger: 'bg-red-100 dark:bg-red-950/60 border-red-200 dark:border-red-900',
    warning: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    primary: 'bg-brand-100 dark:bg-brand-950/60 border-brand-200 dark:border-brand-900',
  };

  const confirmBtnVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150 print:hidden"
      onClick={() => {
        if (!isLoading) finalCancel();
      }}
    >
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-desc"
        className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl p-6 flex flex-col gap-5 text-surface-900 dark:text-surface-100 transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${bgMap[variant]}`}>
            {iconMap[variant]}
          </div>

          <div className="flex-1">
            <h2 id="confirmation-modal-title" className="text-base sm:text-lg font-bold text-surface-900 dark:text-white leading-tight">
              {title}
            </h2>
            <div id="confirmation-modal-desc" className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 mt-1.5 leading-relaxed">
              {message}
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={finalCancel}
            aria-label="Close dialog"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100 dark:border-surface-800">
          <Button
            ref={cancelBtnRef}
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={finalCancel}
            className="text-xs font-semibold"
          >
            {finalCancelText}
          </Button>

          <Button
            ref={confirmBtnRef}
            variant={confirmBtnVariant}
            size="sm"
            loading={isLoading}
            onClick={onConfirm}
            className="text-xs font-bold"
          >
            {finalConfirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
