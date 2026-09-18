/**
 * Privacy Policy & Data Protection Page
 * 
 * @agent support-legal-compliance-checker
 * @agent 21-pii-sanitization-agent
 * @agent security-appsec-engineer
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Database, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 dark:bg-brand-950/60 rounded-2xl mb-4 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Privacy Policy & Data Protection
          </h1>
          <p className="mt-3 text-base text-surface-600 dark:text-surface-400">
            Last Updated: August 2026 &bull; Compliant with GDPR, CCPA, and PCI-DSS Standards
          </p>
        </div>

        {/* Key Guarantees Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Zero PII Leakage</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400">Automated regex masking sanitizes all credentials and payment data before logging.</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">No Data Selling</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400">We never sell, broker, or monetize your browsing history or personal identity.</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">AES-256 Encryption</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400">All database records and session tokens are encrypted at rest and in transit via TLS 1.3.</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Legal Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              1. Information We Collect
            </h2>
            <p className="mb-3">
              To provide a reliable multi-vendor marketplace experience, Nexus collects essential information necessary for transaction settlement, order fulfillment, and account authentication:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400">
              <li><strong>Account Credentials:</strong> Full name, email address, password hashes (bcrypt salted).</li>
              <li><strong>Shipping & Delivery:</strong> Physical delivery address, recipient contact numbers for logistics.</li>
              <li><strong>Vendor Verification:</strong> Business registry IDs, payout routing details (governed via Stripe Connect).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. PII Sanitization & Automated Masking
            </h2>
            <p>
              In accordance with our <strong>21-pii-sanitization-agent</strong> governance invariant, all backend structured logging platforms strip sensitive credit card numbers, CVVs, and JWT authentication secrets using automated pre-ingestion regex filters. Raw payment information is handled exclusively by PCI-DSS Level 1 certified Stripe infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Data Retention & User Rights
            </h2>
            <p className="mb-3">
              Under GDPR and CCPA regulations, you hold full sovereignty over your account data:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400">
              <li><strong>Right to Access:</strong> Request a complete JSON export of all your stored profile records.</li>
              <li><strong>Right to Erasure:</strong> Purge all personal identifiers and deactivate seller stores with a single click.</li>
              <li><strong>Cookie Sovereignty:</strong> Essential session cookies only; zero third-party behavioral advertising trackers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. Contact Our Compliance Office
            </h2>
            <p>
              If you have any questions regarding our security protocols, privacy standards, or data protection policies, please contact our automated compliance officer at <span className="font-semibold text-brand-600 dark:text-brand-400">privacy@nexus-ecommerce.com</span>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
