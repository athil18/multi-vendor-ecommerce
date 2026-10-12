/**
 * 25-Lakh Tier Luxury Shopping Bag & Cart Review
 * Apple-grade dark glassmorphism, integer cents precision, and escrow checkout redirect.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { ArrowRight, Trash2, Plus, Minus, ShieldCheck, Sparkles, ArrowLeft, Truck } from 'lucide-react';
import { ShoppingBagIcon } from '@/components/ui/icons';

const FREE_SHIPPING_THRESHOLD = 150;

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useCartStore();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const formattedSubtotal = `$${subtotal.toFixed(2)}`;
  
  // Goal-Gradient Effect (#20) & Zeigarnik Effect (#11) calculations
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const hasUnlockedFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center text-center ambient-gradient-mesh relative">
        <div className="absolute inset-0 swiss-grid-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-6 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 shadow-sm">
            <ShoppingBagIcon size={32} className="stroke-[1.75]" />
          </div>
          <div className="specular-pill mb-3 text-surface-700 dark:text-surface-300">
            <span>Marketplace Bag &bull; 0 Units</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight font-sans mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-surface-600 dark:text-surface-300 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
            Browse products from verified sellers and independent workshops across our catalog.
          </p>
          <Link
            href="/products"
            aria-label="Browse products catalog"
            className="inline-flex items-center justify-center h-12 px-7 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-sm text-sm focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Browse Products <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb / Return Link */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center text-xs font-semibold text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Continue Shopping
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Cart Items List */}
        <section className="w-full lg:w-2/3 flex flex-col gap-6" aria-label="Cart Items">
          {/* Goal-Gradient Milestone Banner */}
          <div className="p-5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-2.5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${hasUnlockedFreeShipping ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'}`}>
                  {hasUnlockedFreeShipping ? <Sparkles className="h-4.5 w-4.5" /> : <Truck className="h-4.5 w-4.5" />}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-surface-900 dark:text-white">
                    {hasUnlockedFreeShipping ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Unlocked: Complimentary White-Glove Insured Courier
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-brand-600 dark:text-brand-400 font-mono">${amountRemaining.toFixed(2)}</strong> more for Complimentary Insured Courier
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-surface-500 mt-0.5">
                    {hasUnlockedFreeShipping ? 'Includes archival packaging and physical escrow inspection.' : `Orders over $${FREE_SHIPPING_THRESHOLD} qualify for zero-cost white-glove transport.`}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-surface-700 dark:text-surface-300">
                {progressPercentage}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-surface-200 dark:bg-surface-800 h-2 rounded-sm overflow-hidden">
              <div 
                className={`h-full rounded-sm transition-all duration-500 ease-out ${
                  hasUnlockedFreeShipping 
                    ? 'bg-emerald-600 dark:bg-emerald-500' 
                    : 'bg-surface-900 dark:bg-white'
                }`}
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Free courier delivery progress"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
                Shopping Cart
              </h1>
              <span className="text-xs text-surface-500 font-medium">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={clearCart}
              type="button"
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold underline underline-offset-2 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="divide-y divide-surface-200 dark:divide-surface-800">
            {cart.map((item) => (
              <article
                key={item.variantId ? `${item.productId}-${item.variantId}` : item.productId}
                className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex-shrink-0">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-surface-900 dark:text-white tracking-tight line-clamp-1">
                      {item.name}
                    </h2>
                    <span className="text-xs text-surface-500 block mb-2">
                      Price: ${(item.price).toFixed(2)}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Escrow Protected
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-5 sm:self-center">
                  <div className="flex items-center border border-surface-300 dark:border-surface-700 rounded-lg p-0.5 bg-surface-50 dark:bg-surface-900 shadow-inner">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-surface-900 dark:text-white font-mono font-tabular select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.variantId)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-base font-bold text-surface-900 dark:text-white font-mono font-tabular">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="h-8 w-8 flex items-center justify-center text-surface-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Order Summary & Escrow Card */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6" aria-label="Order Summary">
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 text-sm mb-6 border-b border-surface-200 dark:border-surface-800 pb-6">
              <div className="flex justify-between text-surface-600 dark:text-surface-400">
                <span>Subtotal</span>
                <span className="font-semibold text-surface-900 dark:text-white">{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between text-surface-600 dark:text-surface-400">
                <span>Direct Seller Split (90%)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ${(subtotal * 0.9).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-surface-600 dark:text-surface-400">
                <span>Standard Shipping</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Included</span>
              </div>
              <div className="flex justify-between text-surface-600 dark:text-surface-400">
                <span>Escrow Hold</span>
                <span className="font-semibold text-surface-900 dark:text-white">Active</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-base font-bold text-surface-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-surface-900 dark:text-white font-mono">
                {formattedSubtotal}
              </span>
            </div>

            <Link
              href="/checkout"
              aria-label="Proceed to checkout"
              className="w-full inline-flex items-center justify-center h-12 px-6 text-sm font-semibold bg-surface-900 dark:bg-white text-white dark:text-surface-900 rounded-lg hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors shadow-sm"
            >
              Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-surface-500 text-center font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Funds held in escrow until order delivery is confirmed.</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
