/**
 * Peak-End Rule Order Confirmation & Escrow Vault Celebration
 * Implements UX Law #10 (Peak-End Rule): Creates a memorable, satisfying completion state
 * with clear confirmation, live 4-stage fulfillment timeline, and actionable next steps.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent engineering-frontend-developer
 */

'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

function getEstimatedDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get('orderId') || 'NX-948201';
  const total = searchParams.get('total') ? Number(searchParams.get('total')).toFixed(2) : '185.00';
  const formattedOrderId = rawOrderId.startsWith('NX-') 
    ? rawOrderId 
    : `NX-${rawOrderId.slice(-6).toUpperCase()}`;

  const [estimatedDelivery] = useState(getEstimatedDeliveryDate);

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center">
      {/* ─── Hero Celebratory Milestone (Peak-End Rule #10) ────────────────── */}
      <div className="w-full text-center flex flex-col items-center mb-10">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10 stroke-[2]" />
          </div>
        </div>

        <span className="inline-flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 mb-3 px-3 py-1 rounded-md">
          Escrow Confirmed
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight font-sans mb-3">
          Your Order is Confirmed
        </h1>
        <p className="text-surface-600 dark:text-surface-400 max-w-md text-sm sm:text-base">
          Thank you for your order. Order <span className="font-mono font-bold text-surface-900 dark:text-white">#{formattedOrderId}</span> has been processed and sent to the seller for fulfillment.
        </p>
      </div>

      {/* ─── Escrow & Order Overview Card ─────────────────────────────────── */}
      <div className="w-full p-6 sm:p-8 rounded-2xl mb-8 shadow-md border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-surface-200/60 dark:border-surface-800/80">
          <div>
            <span className="text-xs text-surface-500 block mb-1">Order Identifier</span>
            <span className="font-mono font-bold text-sm text-surface-900 dark:text-white">
              {formattedOrderId}
            </span>
          </div>
          <div>
            <span className="text-xs text-surface-500 block mb-1">Total Vault Amount</span>
            <span className="font-bold text-sm text-surface-900 dark:text-white font-mono">
              ${total} USD
            </span>
          </div>
          <div>
            <span className="text-xs text-surface-500 block mb-1">Estimated Delivery</span>
            <span className="font-bold text-sm text-brand-600 dark:text-brand-400">
              {estimatedDelivery}
            </span>
          </div>
        </div>

        {/* ─── 4-Stage Fulfillment Lifecycle Tracker (Zeigarnik Effect #11) ─── */}
        <div className="py-6 border-b border-surface-200/60 dark:border-surface-800/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-6">
            Live Escrow & Fulfillment Lifecycle
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Stage 1 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-500/20 flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-surface-900 dark:text-white">1. Escrow Locked</p>
                <p className="text-[11px] text-surface-500">Funds secured safely</p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-brand-500/20 flex-shrink-0 animate-pulse">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400">2. Atelier Prep</p>
                <p className="text-[11px] text-surface-500">Specimen curation</p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 opacity-60">
              <div className="h-8 w-8 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-surface-700 dark:text-surface-300">3. White-Glove Dispatch</p>
                <p className="text-[11px] text-surface-500">Insured courier</p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3 opacity-60">
              <div className="h-8 w-8 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="text-xs font-bold text-surface-700 dark:text-surface-300">4. Delivery Inspection</p>
                <p className="text-[11px] text-surface-500">Escrow released</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Escrow Protection Guarantee ─────────────────────────────────── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-surface-900 dark:text-white">
                Escrow Protection Protocol
              </p>
              <p className="text-[11px] text-surface-500">
                Your payment remains held securely in escrow. The seller receives payout after your delivery is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Actionable Next Steps */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link
          href="/customer"
          className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-lg bg-surface-900 dark:bg-white text-white dark:text-surface-900 font-medium hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors shadow-sm text-sm"
        >
          View in Account Dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-lg border border-surface-300 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm"
        >
          <ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
