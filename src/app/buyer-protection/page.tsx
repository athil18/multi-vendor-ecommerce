/**
 * Buyer Protection & Escrow Guarantee
 * 
 * @agent engineering-payments-billing-engineer
 * @agent support-legal-compliance-checker
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, RefreshCw, CheckCircle2, DollarSign, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buyer Protection & Escrow Policy | Nexus Marketplace',
  description: 'Learn how our Stripe Connect multi-vendor escrow system protects every transaction until delivery is verified.',
};

export default function BuyerProtectionPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            100% Escrow Secured
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-geist mb-4">
            Nexus Buyer Protection Guarantee
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Every transaction is safeguarded by cryptographically audited escrow contracts. The seller does not receive funds until you receive your order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <RefreshCw className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Carrier-Verified Delivery</h3>
              <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                Funds are held in secure Stripe Connect escrow. Automatic release triggers only upon carrier delivery confirmation (FedEx, UPS, DHL, or national post).
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Scale className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">14-Day Return Arbitration</h3>
              <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                If an item arrives damaged, materially different from specification, or fails to arrive, our dispute arbitration team processes an instant 100% refund.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 border border-surface-200 dark:border-surface-800 space-y-4">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">
            What is Covered Under Nexus Guarantee?
          </h3>
          <ul className="space-y-3">
            {[
              'Item is not received within the carrier estimated delivery window',
              'Item arrives damaged, defective, or missing primary components',
              'Item does not match the maker atelier specifications or dimensions',
              'Unauthorized payment transactions or fraudulent checkout activity',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-sm text-surface-700 dark:text-surface-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
