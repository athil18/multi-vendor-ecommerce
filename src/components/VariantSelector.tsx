/**
 * Level 4 — Intelligent Variant Selector Component
 * 
 * Pre-selects the commercially preferred option with a genuine "Most Popular" label.
 * Reactively triggers price, image, stock, and SKU updates.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent testing-accessibility-auditor
 */

'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';

export interface ProductVariantOption {
  id: string;
  name: string;
  colorHex?: string;
  sku: string;
  priceModifier: number; // Delta relative to base price (e.g. 0, +25, etc.)
  isPopular?: boolean;
  stockCount: number;
  imageIndex: number;
}

interface VariantSelectorProps {
  variants: ProductVariantOption[];
  selectedVariantId: string;
  onSelectVariant: (variant: ProductVariantOption) => void;
  basePrice: number;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  basePrice,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-surface-900 dark:text-white uppercase tracking-wider text-[11px]">
          Configuration / Finish:{' '}
          <strong className="text-brand-600 dark:text-brand-400 font-semibold normal-case">
            {activeVariant.name}
          </strong>
        </span>
        <span className="text-[11px] text-surface-400 font-mono">
          SKU: {activeVariant.sku}
        </span>
      </div>

      {/* Variant Pills / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Product configuration variants">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const currentPrice = basePrice + variant.priceModifier;

          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectVariant(variant)}
              className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 text-left transition-all duration-200 outline-none ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 shadow-sm shadow-brand-500/10'
                  : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-surface-50/40 dark:bg-surface-900/40'
              }`}
            >
              {/* Popular Badge */}
              {variant.isPopular && (
                <div className="absolute -top-2.5 right-3 bg-brand-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  {variant.colorHex && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                  )}
                  <span className="font-bold text-xs text-surface-900 dark:text-white truncate">
                    {variant.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              <div className="flex items-baseline justify-between w-full text-[11px] mt-1 pt-1 border-t border-surface-200/50 dark:border-surface-800/50">
                <span className="font-geist font-bold text-surface-900 dark:text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {variant.stockCount > 5 ? 'In Stock' : `Only ${variant.stockCount} left`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
