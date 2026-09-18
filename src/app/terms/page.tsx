/**
 * Terms of Service & Multi-Vendor Escrow Policies
 * 
 * @agent support-legal-compliance-checker
 * @agent engineering-payments-billing-engineer
 * @agent finance-bookkeeper-controller
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, DollarSign, RefreshCw, Scale, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-950/60 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Terms of Service & Seller Agreements
          </h1>
          <p className="mt-3 text-base text-surface-600 dark:text-surface-400">
            Effective Date: August 2026 &bull; Multi-Vendor Escrow, Payouts & Commission Standards
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <DollarSign className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">10% Platform Fee</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400">Transparent commission. Sellers receive 90% of item revenue automatically on fulfillment.</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <RefreshCw className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Escrow Payouts</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400">Stripe Connect locks funds in escrow until shipment tracking confirms delivery.</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Dispute Protection</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400">Automated double-entry refund ledger ensures zero fund loss for legitimate disputes.</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              1. Multi-Vendor Marketplace Overview
            </h2>
            <p>
              Nexus operates an independent vendor marketplace enabling creators to list physical and digital goods directly to global buyers. By registering as a seller or completing a checkout as a buyer, you agree to abide by our platform guidelines, escrow milestones, and anti-fraud stipulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. Fee Schedule & Automated Payouts
            </h2>
            <p className="mb-3">
              Our automated billing infrastructure operates under strict double-entry ledger bookkeeping:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400">
              <li><strong>Platform Commission:</strong> A fixed 10% fee is deducted from each successful transaction.</li>
              <li><strong>Vendor Net Payout:</strong> 90% of product subtotal is held in Stripe Connect escrow and transferred to the vendor bank account upon order fulfillment.</li>
              <li><strong>Zero Hidden Fees:</strong> No monthly listing charges or SKU slot rental fees for verified creators.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Inventory Accuracy & PostgreSQL ACID Locks
            </h2>
            <p>
              To maintain absolute inventory integrity during high-volume flash sales, stock quantities are decremented within atomic database transactions. Vendors are prohibited from listing duplicate or fictitious SKUs. Any deliberate attempt to oversell or ship unverified inventory will result in immediate store suspension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. Return, Refund & Dispute Lifecycle
            </h2>
            <p>
              Buyers have 14 days from delivery confirmation to initiate a dispute. Our automated support copilot and human arbitration team review shipment tracking logs to process instant refunds to original payment methods when items are damaged or unfulfilled.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
