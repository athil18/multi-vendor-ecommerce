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
              1. Return Eligibility & 30-Day Inspection Window
            </h2>
            <p className="mb-2">
              In accordance with consumer protection standards and Nexus Marketplace quality commitments, buyers enjoy a 30-day inspection period starting from the timestamp carrier tracking records physical delivery:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400">
              <li><strong>Standard Catalog Goods:</strong> Eligible for return if unused, in original condition with intact artisan tags, certificates of authenticity, and original packaging.</li>
              <li><strong>Damaged, Defective, or Misdescribed Items:</strong> 100% eligible for an immediate full refund or complimentary replacement. Return shipping fees are entirely covered by the seller or platform.</li>
              <li><strong>Bespoke / Customized Commissions:</strong> Custom monogrammed or made-to-order items are exempt from standard returns unless they arrive damaged or deviate materially from approved commission specifications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. Order Cancellations & Pre-Dispatch Rights
            </h2>
            <p>
              Buyers may cancel any standard order free of charge at any point prior to carrier label creation and dispatch. Upon cancellation, your vaulted escrow authorization is immediately released, and funds reflect on your original payment card within 1 to 3 banking days. Once tracking is generated, orders must proceed through the standard 30-day return process upon arrival.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Reverse Shipping & Logistics Transparency
            </h2>
            <div className="space-y-2 text-surface-600 dark:text-surface-400">
              <p>
                <strong>Defective / Incorrect Goods:</strong> A pre-paid, fully insured carrier return label will be provided directly via your Customer Dashboard at no cost to you.
              </p>
              <p>
                <strong>Buyer Discretion / Remorse Returns:</strong> For elective returns of pristine items, the buyer is responsible for standard return postage. We recommend utilizing tracked, insured transit to guarantee safe return to the artisan atelier.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. Refund Processing & Timelines
            </h2>
            <p>
              Once the return parcel is delivered to the artisan atelier and inspected (maximum 48 business hours), the escrow refund is triggered automatically via Stripe Connect. Funds are credited directly back to the original funding source (credit card, debit card, Apple Pay, Google Pay). Depending on your banking institution, funds will appear on your statement within 3 to 7 business days. Nexus never charges hidden restocking or return penalty fees.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              5. Dispute Arbitration & Grievance Redressal
            </h2>
            <p className="mb-3">
              If an artisan denies a valid return or fails to respond within 48 hours, buyers can escalate directly to Nexus Dispute Mediation. Under the Consumer Protection (E-Commerce) Rules 2020:
            </p>
            <div className="bg-surface-50 dark:bg-surface-950 p-4 rounded-xl border border-surface-200 dark:border-surface-800 text-xs space-y-1.5 text-surface-600 dark:text-surface-400">
              <p><strong>Grievance Redressal Officer:</strong> Nexus Compliance & Support Desk</p>
              <p><strong>Email:</strong> <a href="mailto:grievance@nexus.market" className="text-brand-600 dark:text-brand-400 underline font-semibold">grievance@nexus.market</a></p>
              <p><strong>Acknowledgement SLA:</strong> Within 48 hours with a formal dispute tracking number</p>
              <p><strong>Resolution SLA:</strong> Fair arbitration and final settlement within 30 days of grievance filing</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
