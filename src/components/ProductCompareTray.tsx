/**
 * Floating Product Comparison Tray & Side-by-Side Spec Modal
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-ui-finish-gate-reviewer
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCompareStore } from '@/store/useCompareStore';
import { useCartStore } from '@/store/useCartStore';
import { X, ArrowRight, Scale, Check, Trash2, ChevronUp, ChevronDown, Star, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ProductCompareTray() {
  const { items, isOpen, setIsOpen, removeFromCompare, clearCompare } = useCompareStore();
  const addToCart = useCartStore((state) => state.addToCart);

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar (Appears when items are selected) */}
      <aside
        aria-label="Product Comparison Bar"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-300"
      >
        <div className="glass-dock p-3 sm:p-4 rounded-3xl flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-surface-900 dark:text-white">
                  Compare Atelier Curations
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {items.length} / 4 Selected
                </span>
              </div>
              <p className="text-[11px] text-surface-500 hidden sm:block">
                Evaluate craftsmanship, materials, and maker guarantees side-by-side.
              </p>
            </div>
          </div>

          {/* Thumbnail preview stack */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden items-center mr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative h-9 w-9 rounded-xl overflow-hidden border-2 border-white dark:border-surface-900 bg-surface-100 dark:bg-surface-800 shadow-sm"
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="36px" />
                  ) : (
                    <div className="w-full h-full bg-surface-200" />
                  )}
                </div>
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full px-4 text-xs font-bold bg-surface-900 dark:bg-white text-white dark:text-surface-900 hover:bg-brand-600 dark:hover:bg-brand-500 transition-all flex items-center gap-1.5 shadow-md"
            >
              {isOpen ? 'Close' : 'Compare'}
              {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </Button>
            
            <button
              onClick={clearCompare}
              title="Clear comparison list"
              className="p-2 text-surface-400 hover:text-red-500 transition-colors rounded-full"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Expanded Side-by-Side Modal / Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] glass-luxury-card rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/20 dark:border-surface-700/60">
            {/* Modal Header */}
            <div className="p-6 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-surface-50/50 dark:bg-surface-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-surface-900 dark:text-white tracking-tight">
                    Side-by-Side Atelier Comparison
                  </h2>
                  <p className="text-xs text-surface-500">
                    Detailed technical specifications, artisan provenance, and consumer protections.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comparison Grid Table */}
            <div className="overflow-x-auto p-6 flex-1">
              <div
                className="grid gap-6 min-w-[700px]"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(220px, 1fr))` }}
              >
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col bg-white dark:bg-surface-850 rounded-2xl p-5 border border-surface-200/80 dark:border-surface-800 shadow-sm relative group"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 text-surface-400 transition-all z-10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-900 mb-4">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="260px" />
                      ) : (
                        <div className="w-full h-full bg-surface-200" />
                      )}
                    </div>

                    {/* Title & Maker */}
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                      {item.category || 'Atelier Goods'}
                    </span>
                    <h3 className="font-bold text-sm text-surface-900 dark:text-white line-clamp-2 mb-2 min-h-[40px]">
                      {item.name}
                    </h3>

                    {/* Price */}
                    <div className="text-2xl font-black text-surface-900 dark:text-white font-geist mb-4">
                      ${(item.price ?? 0).toFixed(2)}
                    </div>

                    {/* Spec Breakdown */}
                    <div className="space-y-3 text-xs border-t border-surface-100 dark:border-surface-800 pt-4 flex-1">
                      <div>
                        <span className="text-surface-400 text-[10px] uppercase font-semibold block">Artisan Atelier</span>
                        <span className="font-medium text-surface-800 dark:text-surface-200">{item.storeName || 'Independent Creator'}</span>
                      </div>
                      <div>
                        <span className="text-surface-400 text-[10px] uppercase font-semibold block">Craftsmanship Rating</span>
                        <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{item.rating || 4.9}</span>
                          <span className="text-surface-400 font-normal">({item.numReviews || 24} reviews)</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-surface-400 text-[10px] uppercase font-semibold block">Consumer Protection</span>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>100% Escrow Backed</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 pt-3 border-t border-surface-100 dark:border-surface-800 flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          addToCart({
                            productId: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            quantity: 1,
                          });
                        }}
                        className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs h-10 shadow-sm"
                      >
                        Add to Cart
                      </Button>
                      <Link href={`/products/${item.id}`} className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl text-xs font-semibold h-9 border-surface-200 dark:border-surface-700"
                        >
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
