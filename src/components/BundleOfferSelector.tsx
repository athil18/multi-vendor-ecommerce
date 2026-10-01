/**
 * Level 6 — Bundle & Value Psychology Component
 * 
 * Transparent volume tiering: Buy 1 (Standard), Buy 2 (10% Off / Most Popular), Buy 3 (15% Off / Best Value).
 * Emphasizes per-unit economics, exact dollar savings, and bonus care item inclusion.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent testing-accessibility-auditor
 */

'use client';

import React from 'react';
import { Sparkles, Check, Gift } from 'lucide-react';

export interface BundleTier {
  quantity: number;
  label: string;
  badge?: string;
  discountPercentage: number;
  bonusItem?: string;
}

interface BundleOfferSelectorProps {
  unitPrice: number;
  selectedQuantity: number;
  onSelectQuantity: (qty: number, bundlePrice: number, savings: number) => void;
}

export function BundleOfferSelector({
  unitPrice,
  selectedQuantity,
  onSelectQuantity,
}: BundleOfferSelectorProps) {
  const tiers: BundleTier[] = [
    {
      quantity: 1,
      label: 'Single Specimen',
      discountPercentage: 0,
    },
    {
      quantity: 2,
      label: 'Duo Studio Set',
      badge: 'Popular Pair',
      discountPercentage: 10,
    },
    {
      quantity: 3,
      label: 'Master Collector Trio',
      badge: 'Best Value',
      discountPercentage: 15,
      bonusItem: 'Includes Complimentary Leather Balm ($35 Value)',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-surface-900 dark:text-white uppercase tracking-wider text-[11px]">
          Volume & Bundle Advantage:
        </span>
        <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
          Save up to 15% + Bonus Gift
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Bundle quantity options">
        {tiers.map((tier) => {
          const isSelected = selectedQuantity === tier.quantity;
          const standardTotal = unitPrice * tier.quantity;
          const effectiveTotal = standardTotal * (1 - tier.discountPercentage / 100);
          const effectivePerUnit = effectiveTotal / tier.quantity;
          const totalSavings = standardTotal - effectiveTotal;

          return (
            <button
              key={tier.quantity}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectQuantity(tier.quantity, effectiveTotal, totalSavings)}
              className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 text-left transition-all duration-200 outline-none ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 shadow-sm shadow-brand-500/15'
                  : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-surface-50/40 dark:bg-surface-900/40'
              }`}
            >
              {/* Highlight Badge */}
              {tier.badge && (
                <div
                  className={`absolute -top-2.5 right-3 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${
                    tier.quantity === 3 ? 'bg-amber-600' : 'bg-brand-600'
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {tier.badge}
                </div>
              )}

              {/* Title & Selection */}
              <div>
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-xs text-surface-900 dark:text-white">
                    {tier.quantity}× {tier.label}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'border border-surface-300 dark:border-surface-600'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-geist font-black text-sm text-surface-900 dark:text-white">
                    ${effectiveTotal.toFixed(2)}
                  </span>
                  {tier.discountPercentage > 0 && (
                    <span className="text-[10px] text-surface-400 line-through">
                      ${standardTotal.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-surface-500 font-medium">
                  ${effectivePerUnit.toFixed(2)} / unit
                </p>
              </div>

              {/* Savings & Bonus */}
              <div className="mt-2 pt-2 border-t border-surface-200/50 dark:border-surface-800/50 space-y-1">
                {tier.discountPercentage > 0 ? (
                  <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Save ${totalSavings.toFixed(2)} ({tier.discountPercentage}% OFF)
                  </span>
                ) : (
                  <span className="text-[10px] text-surface-400">
                    Standard Workshop Unit
                  </span>
                )}

                {tier.bonusItem && (
                  <p className="text-[9px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 leading-tight">
                    <Gift className="w-2.5 h-2.5 flex-shrink-0" />
                    <span>Free Care Balm ($35 Value)</span>
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
