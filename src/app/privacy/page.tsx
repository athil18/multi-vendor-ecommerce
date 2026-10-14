/**
 * Comprehensive Privacy Policy & Data Protection Disclosure
 * Formulated in compliance with:
 * - Digital Personal Data Protection (DPDP) Act, 2023 (India)
 * - Consumer Protection (E-Commerce) Rules, 2020 & IT Rules 2021 (India)
 * - General Data Protection Regulation (GDPR - EU) & California Consumer Privacy Act (CCPA)
 * 
 * @agent security-and-hardening
 * @agent ecommerce
 * @agent frontend-ui-engineering
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Lock, Eye, Database, ArrowLeft, 
  CheckCircle2, Mail, AlertCircle, FileText, UserCheck, 
  Trash2, ExternalLink 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center justify-center p-3.5 bg-brand-100 dark:bg-brand-950/60 rounded-2xl mb-4 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Privacy Policy & Personal Data Governance
          </h1>
          <p className="mt-3 text-sm text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
            Effective Date: October 2026 &bull; Compliant with the Digital Personal Data Protection (DPDP) Act, 2023, Consumer Protection (E-Commerce) Rules, 2020, IT Intermediary Rules, 2021, and GDPR.
          </p>
        </div>

        {/* Quick Action Banner: Exercise Data Rights */}
        <div className="mb-10 p-5 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-900 dark:text-brand-200">
              <UserCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span>Exercise Your Data Principal Rights Online</span>
            </div>
            <p className="text-xs text-brand-700 dark:text-brand-300/80 leading-relaxed">
              Export a machine-readable JSON copy of your personal data or submit a verified account erasure request directly.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/customer/privacy">
              <Button variant="primary" size="sm" className="text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white">
                Privacy Dashboard & Erasure
              </Button>
            </Link>
            <Link href="/unsubscribe">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                Email Unsubscribe
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Guarantees Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 shadow-sm">
            <CardContent className="p-6">
              <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1.5 text-sm">Data Minimization</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                We only collect data strictly necessary for order fulfillment, escrow payouts, and account security. No extraneous profiling.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 shadow-sm">
            <CardContent className="p-6">
              <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1.5 text-sm">Zero Data Selling</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Nexus never sells, leases, or monetizes personal customer or vendor data to third-party data brokers or advertising networks.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 shadow-sm">
            <CardContent className="p-6">
              <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1.5 text-sm">Cryptographic Escrow</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Raw payment card data is processed exclusively by PCI-DSS Level 1 certified Stripe infrastructure. Never stored on our servers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Legal Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          {/* Section 1: Business Identity & Data Fiduciary */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              1. Identity of the Data Fiduciary (Platform Operator)
            </h2>
            <p>
              Under Section 2(i) of the Digital Personal Data Protection Act, 2023 and the Consumer Protection (E-Commerce) Rules, 2020, this marketplace platform is operated by:
            </p>
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 text-xs space-y-1.5">
              <p><strong>Platform Name:</strong> Nexus Multi-Vendor E-Commerce Platform (&quot;Nexus Marketplace&quot;)</p>
              <p><strong>Operating Model:</strong> Multi-Vendor Marketplace Intermediary connecting independent artisans, specialized workshops, and consumers.</p>
              <p><strong>Official Web Portal:</strong> <span className="font-mono">https://nexus-ecommerce.com</span></p>
              <p><strong>Support &amp; Inquiries:</strong> <a href="mailto:support@nexus.market" className="text-brand-600 underline">support@nexus.market</a></p>
              <p><strong>Legal &amp; Privacy Office:</strong> <a href="mailto:privacy@nexus.market" className="text-brand-600 underline">privacy@nexus.market</a></p>
            </div>
          </section>

          {/* Section 2: Personal Data We Collect */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              2. Personal Data We Collect &amp; Specific Purpose of Processing
            </h2>
            <p>
              We process personal data only on lawful grounds (such as user consent, contract fulfillment for purchases, and compliance with statutory law under DPDP Act Section 4):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
                <thead className="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white">
                  <tr>
                    <th className="p-3 font-bold">Category</th>
                    <th className="p-3 font-bold">Data Elements</th>
                    <th className="p-3 font-bold">Specific Lawful Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800 text-surface-600 dark:text-surface-400">
                  <tr>
                    <td className="p-3 font-semibold text-surface-900 dark:text-white">Account Profile</td>
                    <td className="p-3">Full name, email address, salted password hash (bcrypt)</td>
                    <td className="p-3">Account authentication, password recovery, customer identification</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-surface-900 dark:text-white">Logistics &amp; Delivery</td>
                    <td className="p-3">Physical delivery address, recipient contact name</td>
                    <td className="p-3">Order delivery, courier parcel generation, customs clearance</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-surface-900 dark:text-white">Payment &amp; Escrow</td>
                    <td className="p-3">Stripe token identifiers, last 4 digits of card, transaction timestamps</td>
                    <td className="p-3">PCI-DSS compliant payment authorization, split-escrow vaulting</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-surface-900 dark:text-white">Vendor KYC (Sellers)</td>
                    <td className="p-3">Store legal name, tax registry identification, Stripe Connect account ID</td>
                    <td className="p-3">Disbursement of marketplace payouts, anti-money-laundering (AML) compliance</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-surface-900 dark:text-white">Customer Support</td>
                    <td className="p-3">Support email communications, dispute submissions, review feedback</td>
                    <td className="p-3">Arbitration of order disputes, grievance redressal, quality assurance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Third-Party Data Processors & Infrastructure */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              3. Third-Party Data Processors &amp; SDK Auditing
            </h2>
            <p>
              Nexus enforces strict data minimization. We do not load third-party advertising pixels, social media trackers, or cross-site fingerprinting scripts. We partner only with essential enterprise infrastructure providers under strict Data Processing Agreements (DPAs):
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-surface-600 dark:text-surface-400 text-xs">
              <li><strong>Stripe, Inc. (Payments &amp; Escrow):</strong> Processes credit/debit card payments, manages multi-vendor payout splits, and ensures PCI-DSS Level 1 compliance.</li>
              <li><strong>Neon Inc. (Managed PostgreSQL Database):</strong> Encrypted database infrastructure storing relational product, order, and user data with automated TLS 1.3 transit encryption.</li>
              <li><strong>Upstash Inc. (Queue &amp; Redis Cache):</strong> Manages asynchronous BullMQ background job queues with in-flight TLS encryption.</li>
              <li><strong>Cloudflare R2 / AWS S3 (Media Storage):</strong> Hosts static product studio photography and media assets.</li>
              <li><strong>Resend / SMTP (Transactional Delivery):</strong> Dispatches critical order confirmation invoices, shipping tracking alerts, and password reset tokens.</li>
            </ul>
          </section>

          {/* Section 4: Children's Privacy (DPDP Act Section 9) */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              4. Protection of Children&apos;s Privacy (DPDP Act Section 9)
            </h2>
            <p>
              In accordance with <strong>Section 9 of the Digital Personal Data Protection Act, 2023</strong> and the <strong>Indian Contract Act, 1872</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400 text-xs">
              <li>The Nexus marketplace is strictly intended for individuals who have completed <strong>18 years of age</strong> and can enter into legally binding contracts.</li>
              <li>Nexus does not knowingly collect, solicit, or process personal data from children under 18 years of age.</li>
              <li>We do not undertake behavioral tracking, targeted advertising, or profiling directed at minors.</li>
              <li>If a parent or legal guardian discovers that a child has created an account without parental consent, they may contact our Grievance Officer at <span className="font-semibold text-brand-600">grievance@nexus.market</span> for immediate account termination and permanent data erasure.</li>
            </ul>
          </section>

          {/* Section 5: Data Principal Rights (Access, Correction, Erasure) */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              5. Your Rights as a Data Principal (DPDP Act Sections 11–13 / GDPR)
            </h2>
            <p>
              You maintain full sovereignty over your personal data and can exercise the following statutory rights at any time:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40">
                <span className="font-bold text-surface-900 dark:text-white block mb-1">Right to Access &amp; Portability</span>
                <p className="text-surface-500">Download a complete, machine-readable JSON export of all personal profile information via the <Link href="/customer/privacy" className="text-brand-600 underline">Privacy Dashboard</Link>.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40">
                <span className="font-bold text-surface-900 dark:text-white block mb-1">Right to Correction &amp; Updation</span>
                <p className="text-surface-500">Update inaccurate addresses, contact details, or profile parameters directly in your account settings.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40">
                <span className="font-bold text-surface-900 dark:text-white block mb-1">Right to Erasure (Data Deletion)</span>
                <p className="text-surface-500">Initiate permanent account deletion. All names, emails, credentials, and saved addresses are immediately sanitized and anonymized.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40">
                <span className="font-bold text-surface-900 dark:text-white block mb-1">Right to Withdraw Consent</span>
                <p className="text-surface-500">Revoke marketing consent at <Link href="/unsubscribe" className="text-brand-600 underline">/unsubscribe</Link> or adjust cookie choices via the persistent Cookie Preferences tool.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Data Retention & Statutory Preservations */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              6. Data Retention Policy &amp; Statutory Accounting Requirements
            </h2>
            <p>
              We retain personal data only for as long as necessary to fulfill the operational purpose for which it was collected, or as required by applicable law:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-surface-600 dark:text-surface-400 text-xs">
              <li><strong>Account Credentials:</strong> Retained until the user requests account erasure.</li>
              <li><strong>Completed Transaction Records:</strong> In compliance with Section 128 of the Companies Act, GST/VAT regulations, and consumer protection laws, completed order invoices and accounting ledgers are retained for <strong>8 statutory years</strong>. Upon an erasure request, personal identifiers in past order entries are pseudonymized while financial amounts remain for audit integrity.</li>
              <li><strong>Session Cookies:</strong> Ephemeral session tokens expire after 15 minutes of inactivity; persistent refresh tokens expire after 7 days.</li>
            </ul>
          </section>

          {/* Section 7: Grievance Redressal Mechanism & Officer */}
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
              7. Grievance Redressal Officer (Mandated under DPDP &amp; Consumer Protection)
            </h2>
            <p>
              In accordance with <strong>Rule 5(6) of the Consumer Protection (E-Commerce) Rules, 2020</strong>, Rule 3(2) of the Information Technology Intermediary Rules, 2021, and Section 8(10) of the DPDP Act, 2023, Nexus has appointed a dedicated Grievance Officer:
            </p>
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 text-xs space-y-1.5">
              <p><strong>Designation:</strong> Grievance Redressal Officer &amp; Data Protection Officer</p>
              <p><strong>Entity:</strong> Nexus Multi-Vendor Marketplace Intermediary</p>
              <p><strong>Direct Email:</strong> <a href="mailto:grievance@nexus.market" className="text-brand-600 font-bold underline">grievance@nexus.market</a></p>
              <p><strong>Acknowledgment Time:</strong> Within 48 hours of ticket receipt</p>
              <p><strong>Resolution Turnaround:</strong> Maximum 30 business days from receipt of grievance</p>
              <p><strong>Appeals:</strong> In the event a consumer grievance is not resolved satisfactorily, Data Principals may submit an appeal to the Data Protection Board of India under Section 28 of the DPDP Act.</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
