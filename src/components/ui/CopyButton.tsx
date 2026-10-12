'use client';

import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

export interface CopyButtonProps {
  textToCopy?: string;
  text?: string;
  label?: string;
  className?: string;
  variant?: 'icon' | 'badge' | 'button';
  size?: 'sm' | 'md';
}

export function CopyButton({
  textToCopy,
  text,
  label = 'Copy',
  className = '',
  variant = 'badge',
  size = 'sm',
}: CopyButtonProps) {
  const valueToCopy = textToCopy || text || '';
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(valueToCopy);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = valueToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  const getAriaLabel = () => {
    if (status === 'copied') return 'Copied to clipboard';
    if (status === 'error') return 'Unable to copy';
    return `Copy ${label}`;
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={getAriaLabel()}
        title={status === 'copied' ? 'Copied!' : 'Copy'}
        className={`h-7 w-7 rounded-md flex items-center justify-center text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${className}`}
      >
        {status === 'copied' ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : status === 'error' ? (
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    );
  }

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={getAriaLabel()}
      className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer ${
        isSmall ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'
      } ${
        status === 'copied'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
          : status === 'error'
          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800'
          : 'bg-surface-100 dark:bg-surface-800/80 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:bg-surface-200 dark:hover:bg-surface-700'
      } ${className}`}
    >
      {status === 'copied' ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span>Copied</span>
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span>Unable to copy</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 text-surface-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
