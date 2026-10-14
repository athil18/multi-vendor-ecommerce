/**
 * Terms of Service & Multi-Vendor Marketplace Agreement
 * Formulated under:
 * - Consumer Protection (E-Commerce) Rules, 2020 (India)
 * - Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
 * - Indian Contract Act, 1872
 * 
 * @agent support-legal-compliance-checker
 * @agent ecommerce
 * @agent frontend-ui-engineering
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, RefreshCw, Scale, ShieldAlert, ArrowLeft, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
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
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Terms of Service &amp; Marketplace Operating Agreement
          </h1>
          <p className="mt-3 text-sm text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
            Effective Date: October 2026 &bull; Governed under the Consumer Protection (E-Commerce) Rules, 2020, Information Technology Act, 2000, and Intermediary Guidelines.
          </p>
        </div>

        {/* Core Principles Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 shadow-sm">
            <CardContent className="p-6">
              <DollarSign className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1.5 text-sm">Transparent 10% Fee</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Zero hidden charges. Sellers receive 90% of item revenue automatically disbursed upon verified customer inspection.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 shadow-sm">
            <CardContent className="p-6">
              <RefreshCw className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1.5 text-sm">Escrow Protection</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Stripe Connect vaults funds securely. Payouts are transferred to vendors only when carrier confirms physical delivery.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 shadow-sm">
            <CardContent className="p-6">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1.5 text-sm">Dispute Arbitration</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                30-day inspection window with automated double-entry ledger refund protection for damaged or misdescribed goods.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              1. Platform Status &amp; Intermediary Role
            </h2>
            <p>
              Nexus Marketplace (&quot;Nexus&quot;, &quot;Platform&quot;) operates as an electronic commerce marketplace entity and digital intermediary under Section 79 of the Information Technology Act, 2000 and Rule 3 of the Consumer Protection (E-Commerce) Rules, 2020.
            </p>
            <p className="text-xs text-surface-600 dark:text-surface-400">
              Nexus provides an architectural platform, payment escrow coordination, catalog hosting, and dispute settlement infrastructure. Contracts for sale are made directly between the buyer and the verified independent seller or artisan workshop.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              2. User Eligibility &amp; Children&apos;s Privacy (18+ Age Requirement)
            </h2>
            <p>
              Under Section 11 of the Indian Contract Act, 1872 and Section 9 of the DPDP Act, 2023, access to transactional features and account creation is strictly restricted to individuals who are <strong>18 years of age or older</strong> and possess the legal capacity to enter binding contracts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              3. Honest Commerce &amp; Zero Hidden Fees Invariant
            </h2>
            <p>
              Nexus strictly prohibits deceptive commercial practices, misleading discounts, drip pricing, and dark patterns:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400 text-xs">
              <li><strong>All-Inclusive Pricing:</strong> All product listings display the full retail price inclusive of applicable sales taxes or GST. No surprise fees are introduced at the final payment step.</li>
              <li><strong>No Fabricated Discounts:</strong> Strike-through compare-at prices are permitted only when representing a genuine, verified manufacturer suggested retail price (MSRP) or bona fide prior selling price.</li>
              <li><strong>Authentic Ratings &amp; Reviews:</strong> Only customers with verified carrier-confirmed deliveries can submit product ratings. Synthetic, paid, or automated reviews are strictly banned.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              4. Multi-Vendor Escrow &amp; Split Settlement Pipeline
            </h2>
            <p>
              When a buyer completes checkout, payments are handled under a split-escrow vault model:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400 text-xs">
              <li><strong>Hold in Escrow:</strong> Funds are locked securely in Stripe Connect escrow (<span className="font-mono">ESCROW_LOCKED</span>) upon payment authorization.</li>
              <li><strong>Artisan Cut:</strong> The artisan receives 90% of item revenue; Nexus retains a 10% platform take-rate to fund server operations, fraud prevention, and customer care.</li>
              <li><strong>Settlement Trigger:</strong> Payout transfers are executed to the vendor&apos;s connected banking account once the postal tracking confirms physical delivery, subject to the 30-day inspection guarantee.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              5. Returns, Refunds &amp; Dispute Arbitration
            </h2>
            <p>
              All purchases on Nexus are governed by our unified <Link href="/returns" className="text-brand-600 underline font-semibold">30-Day Refunds &amp; Returns Policy</Link>. In the event of transit loss, damage, or non-conformity with maker specifications, buyers may initiate a dispute directly from the customer dashboard. Legitimate disputes trigger automated double-entry ledger reversals to the original payment method.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              6. Asset Licensing &amp; Intellectual Property
            </h2>
            <p>
              All typography, branding icons, studio photography, and software code deployed on Nexus are licensed for commercial use:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400 text-xs">
              <li><strong>Typography:</strong> Inter typeface distributed under the SIL Open Font License (OFL) 1.1.</li>
              <li><strong>Vector Icons:</strong> Lucide Icons distributed under the MIT License.</li>
              <li><strong>Photography:</strong> Curated studio specimens sourced under royalty-free commercial licenses (Unsplash License).</li>
            </ul>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              7. Grievance Redressal &amp; Dispute Resolution
            </h2>
            <p>
              Consumers and vendors may submit grievances regarding platform services, order arbitration, or legal notices to our appointed Grievance Officer:
            </p>
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 text-xs space-y-1.5">
              <p><strong>Grievance Officer:</strong> Legal &amp; Compliance Office, Nexus Marketplace</p>
              <p><strong>Official Contact Email:</strong> <a href="mailto:grievance@nexus.market" className="text-brand-600 font-bold underline">grievance@nexus.market</a></p>
              <p><strong>Acknowledgment:</strong> Within 48 hours &bull; <strong>Resolution Target:</strong> Within 30 days</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
