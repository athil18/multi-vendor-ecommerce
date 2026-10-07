/**
 * Returns, Refunds & Cancellation Policy Page
 * Production legal page detailing escrow return arbitration, cancellation rules, and refund timelines.
 */

import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, CheckCircle2, ShieldCheck, DollarSign, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refunds & Returns Policy | Nexus Marketplace',
  description: 'Nexus Marketplace policy on returns, refunds, order cancellations, and escrow dispute arbitration.',
};

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 dark:bg-brand-950/60 rounded-xl mb-4 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
            <RotateCcw className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Refunds & Returns Policy
          </h1>
          <p className="mt-3 text-base text-surface-600 dark:text-surface-400">
            30-Day Inspection Window &bull; Escrow Protection Guarantee
          </p>
        </div>

        {/* Key Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">30-Day Window</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Standard catalog items can be returned within 30 days of carrier-confirmed physical delivery.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Escrow Backed</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                If an item arrives damaged or materially divergent from its description, escrow funds are refunded immediately.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Direct Mediation</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Our support desk reviews disputes within 24 hours to ensure fair treatment for both buyers and independent makers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              1. Return Eligibility
            </h2>
            <p className="mb-2">
              To be eligible for a return and refund:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400">
              <li>The item must be in its original condition, unworn, unused, and with all original packaging and accessories.</li>
              <li>The return request must be initiated within 30 days of the verified delivery date.</li>
              <li>Custom, personalized, or perishable items are non-returnable unless defective upon arrival.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. Order Cancellations
            </h2>
            <p>
              Orders may be cancelled free of charge at any time prior to carrier label creation and item dispatch. Once an item has been marked as shipped with an active tracking number, the order cannot be cancelled and must follow the standard return process upon arrival.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Refund Process & Timelines
            </h2>
            <p>
              Once a returned item is received and inspected by the seller, the refund is initiated through Stripe Connect. Refunds are credited to the original payment method (card, Apple Pay, Google Pay) within 3 to 7 business days, depending on your financial institution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. How to Request a Return
            </h2>
            <p>
              To request a return, navigate to your <Link href="/customer" className="text-brand-600 dark:text-brand-400 hover:underline">Customer Dashboard</Link>, locate the order under Order History, and select &quot;Request Return&quot;. Alternatively, email <a href="mailto:support@nexus.market" className="text-brand-600 dark:text-brand-400 hover:underline">support@nexus.market</a> with your Order ID.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
