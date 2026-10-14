/**
 * Cookie Policy & Local Storage Transparency Portal
 * Production compliance documentation detailing all tracking and storage mechanisms,
 * DPDP Act 2023 compliance, ePrivacy standards, and zero third-party ad-tracker guarantee.
 */

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, ArrowLeft, CheckCircle2, Lock, Sliders, Database, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { CookiePreferencesTrigger } from '@/components/ui/CookiePreferencesTrigger';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy & Storage Transparency | Nexus Marketplace',
  description: 'Learn about cookies, session tokens, and local storage keys used on Nexus Multi-Vendor Marketplace. We never use third-party ad pixels or sell personal data.',
};

export default function CookiePolicyPage() {
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
            <Cookie className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Cookie Policy & Storage Transparency
          </h1>
          <p className="mt-3 text-base text-surface-600 dark:text-surface-400">
            Effective Date: October 2026 &bull; Compliant with DPDP Act 2023, IT Rules 2021 &amp; ePrivacy Standards
          </p>
          <div className="mt-6 flex justify-center">
            <CookiePreferencesTrigger label="Open Interactive Cookie Settings" />
          </div>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Strict Data Minimization</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                We only store cookies and tokens necessary to maintain secure authenticated sessions, enforce CSRF protection, and support cryptographic Stripe escrow transactions.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Zero Third-Party Ad Trackers</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Nexus does not embed Meta/Facebook Pixels, Google AdSense, cross-site telemetry beacons, or third-party behavioral fingerprinting scripts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              1. What Are Cookies and Client Storage Keys?
            </h2>
            <p>
              Cookies are small data files deposited on your browser by web servers to remember your identity, maintain logged-in state across page reloads, and safeguard payment flows. In modern web architectures, cookies are supplemented by HTML5 LocalStorage for non-sensitive interface preferences such as UI themes and shopping cart contents.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. Exhaustive Audit of Cookies and Local Storage
            </h2>
            <p className="mb-4">
              Below is the comprehensive list of every cookie and client-side storage element utilized across the Nexus Multi-Vendor Marketplace:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-surface-200 dark:border-surface-800">
                <thead className="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white">
                  <tr>
                    <th className="p-3">Key / Cookie Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Purpose &amp; Security Attributes</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  <tr>
                    <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">auth_token</td>
                    <td className="p-3">HTTP Cookie</td>
                    <td className="p-3 font-semibold text-emerald-600">Strictly Essential</td>
                    <td className="p-3">Cryptographically signed JWT session access token. Flags: <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite=Lax</code>. Inaccessible to JavaScript.</td>
                    <td className="p-3">15 minutes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">auth_role</td>
                    <td className="p-3">HTTP Cookie</td>
                    <td className="p-3 font-semibold text-emerald-600">Strictly Essential</td>
                    <td className="p-3">Role-based routing credential (<code>customer</code>, <code>seller</code>, <code>admin</code>) for server-side Next.js route protection.</td>
                    <td className="p-3">Session / 7 days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">nexus_consent_status</td>
                    <td className="p-3">HTTP Cookie</td>
                    <td className="p-3 font-semibold text-emerald-600">Strictly Essential</td>
                    <td className="p-3">Stores user privacy consent decision (<code>granted</code> or <code>denied</code>) to prevent intrusive banner re-prompting. Flags: <code>SameSite=Lax</code>.</td>
                    <td className="p-3">180 days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">nexus_cart_storage</td>
                    <td className="p-3">LocalStorage</td>
                    <td className="p-3 font-semibold text-emerald-600">Strictly Essential</td>
                    <td className="p-3">Maintains selected artisan products, item quantities, and commission notes in your shopping bag across tabs.</td>
                    <td className="p-3">Persistent until cleared</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">theme-storage</td>
                    <td className="p-3">LocalStorage</td>
                    <td className="p-3 font-semibold text-indigo-600">Functional</td>
                    <td className="p-3">Remembers your user display preference (Dark, Light, or System mode) for visual ergonomics and contrast standards.</td>
                    <td className="p-3">Persistent</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">nexus_cookie_consent</td>
                    <td className="p-3">LocalStorage</td>
                    <td className="p-3 font-semibold text-indigo-600">Functional</td>
                    <td className="p-3">Granular category selections (Functional, Analytics, Marketing) recorded locally with timestamp.</td>
                    <td className="p-3">Persistent until reset</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">nexus_utm_first_touch</td>
                    <td className="p-3">LocalStorage</td>
                    <td className="p-3 font-semibold text-amber-600">Marketing &amp; Attribution</td>
                    <td className="p-3"><strong>Opt-In Only:</strong> Preserves partner creator referral links so artisan collaborators receive fair commission splits. Strictly disabled without explicit user consent.</td>
                    <td className="p-3">30 days / Cleared on consent revocation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Right to Withdraw Consent &amp; Reset Preferences
            </h2>
            <p className="mb-3">
              Under Section 6(4) of the DPDP Act 2023 and global privacy standards, you have the absolute legal right to withdraw your consent at any time without punitive consequences or denial of core marketplace features.
            </p>
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 space-y-3">
              <p className="text-xs">
                You can invoke our persistent preference manager at any moment by clicking the floating cookie launcher in the bottom-left corner of the screen or using the control button below:
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <CookiePreferencesTrigger label="Manage Cookie Choices" variant="primary" />
              </div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400">
                Choosing &quot;Withdraw / Reset All&quot; immediately deletes your consent record, purges all non-essential attribution keys from local storage, and sets <code>nexus_consent_status=denied</code>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. Browser-Level Cookie Management
            </h2>
            <p>
              In addition to our on-site consent controls, you can manage, block, or delete cookies directly via your browser settings (Chrome, Firefox, Safari, Edge, or Brave). Note that blocking strictly essential cookies will prevent authentication into the customer or seller dashboards and block Stripe checkout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              5. Grievance Officer &amp; Privacy Contact
            </h2>
            <p className="mb-3">
              For privacy audits, consent inquiries, or data protection concerns:
            </p>
            <div className="bg-surface-50 dark:bg-surface-950 p-4 rounded-xl border border-surface-200 dark:border-surface-800 text-xs space-y-1 text-surface-600 dark:text-surface-400">
              <p><strong>Grievance Redressal Desk:</strong> Nexus Marketplace Privacy Team</p>
              <p><strong>Email:</strong> <a href="mailto:privacy@nexus.market" className="text-brand-600 dark:text-brand-400 underline font-semibold">privacy@nexus.market</a></p>
              <p><strong>SLA:</strong> Grievance acknowledged within 48 hours; resolved within 30 days per IT Rules 2021 &amp; DPDP Act 2023</p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
