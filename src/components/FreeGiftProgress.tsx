/**
 * Level 7 — Free-Gift Experience Component
 * 
 * Transparent progress tracker towards unlocking a genuine complimentary gift.
 * Clearly differentiates: Product Price vs Bonus Gift Value ($35 Free) vs Actual Amount Paid.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent testing-accessibility-auditor
 */

'use client';

import React from 'react';
import { Gift, CheckCircle2, Sparkles } from 'lucide-react';

interface FreeGiftProgressProps {
  currentTotal: number;
  threshold?: number;
  giftName?: string;
  giftValue?: number;
}

export function FreeGiftProgress({
  currentTotal,
  threshold = 200,
  giftName = 'Artisan Leather Care Balm & Velvet Pouch',
  giftValue = 35,
}: FreeGiftProgressProps) {
  const isUnlocked = currentTotal >= threshold;
  const remaining = Math.max(0, threshold - currentTotal);
  const percentage = Math.min(100, Math.round((currentTotal / threshold) * 100));

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/5 via-surface-50 to-surface-100 dark:from-brand-950/20 dark:via-surface-900 dark:to-surface-850 border border-brand-500/20 dark:border-brand-500/30 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              isUnlocked
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            {isUnlocked ? (
              <CheckCircle2 className="w-4.5 h-4.5" />
            ) : (
              <Gift className="w-4.5 h-4.5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-surface-900 dark:text-white">
                {isUnlocked ? 'Complimentary Gift Unlocked!' : `Free Gift at $${threshold}`}
              </span>
              <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                ${giftValue} VALUE
              </span>
            </div>
            <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-tight">
              {giftName}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold font-mono text-brand-600 dark:text-brand-400 flex-shrink-0">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to unlock complimentary gift"
        className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isUnlocked
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-brand-600 to-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status & Transparent Economics */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-surface-200/60 dark:border-surface-800">
        <span className="text-surface-600 dark:text-surface-300">
          {isUnlocked ? (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Automatically included in your parcel
            </span>
          ) : (
            <span>
              Add <strong className="text-surface-900 dark:text-white">${remaining.toFixed(2)}</strong> more to qualify
            </span>
          )}
        </span>

        <span className="text-surface-400">
          Gift charge: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">$0.00</strong>
        </span>
      </div>
    </div>
  );
}
