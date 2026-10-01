/**
 * Level 8 — Sticky Mobile Add-to-Cart Component
 * 
 * Mobile-first sticky bottom purchasing dock with iOS/Android safe-area padding.
 * Automatically conceals itself when the primary in-page CTA is visible to prevent duplicate CTA confusion.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent testing-accessibility-auditor
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingCart, ShieldCheck, Check } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

interface StickyMobilePurchaseBarProps {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  variantId?: string;
  variantName?: string;
  quantity?: number;
  isVisible: boolean;
}

export function StickyMobilePurchaseBar({
  productId,
  name,
  price,
  originalPrice,
  image,
  variantId,
  variantName,
  quantity = 1,
  isVisible,
}: StickyMobilePurchaseBarProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      productId,
      name: variantName ? `${name} (${variantName})` : name,
      price,
      quantity,
      image,
      variantId,
    });

    toast.success(`Added ${quantity}× ${name} to your bag`);
    setJustAdded(true);
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(false);
    }, 1500);
  };

  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <aside
      aria-label="Mobile Quick Purchase Dock"
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out transform will-change-transform ${
        isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      } pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-4`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Product Info & Selected Variant */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0 border border-surface-200 dark:border-surface-700">
            <Image src={image} alt={name} fill className="object-cover" sizes="44px" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-surface-900 dark:text-white truncate">
              {name}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm text-brand-600 dark:text-brand-400 font-geist">
                ${price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-[10px] text-surface-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              {variantName && (
                <span className="text-[9px] text-surface-500 font-medium bg-surface-100 dark:bg-surface-800 px-1.5 py-0.2 rounded truncate max-w-[90px]">
                  {variantName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={`Add ${name} to cart for $${price.toFixed(2)}`}
            className={`h-11 px-4 sm:px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
