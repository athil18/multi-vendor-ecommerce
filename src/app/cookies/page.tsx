/**
 * Cookie Policy & Tracking Disclosure Page
 * Production legal page adhering to GDPR, ePrivacy Directive, and CCPA standards.
 */

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Nexus Marketplace',
  description: 'Nexus Marketplace cookie policy and tracking disclosure. We do not use third-party advertising or tracking cookies.',
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
            Cookie Policy
          </h1>
          <p className="mt-3 text-base text-surface-600 dark:text-surface-400">
            Effective Date: October 2026 &bull; Compliant with GDPR and ePrivacy Regulations
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Essential Cookies Only</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                We only store cookies necessary to maintain authenticated sessions, secure cart states, and enforce CSRF protection.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Zero Behavioral Ad Tracking</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                We do not sell personal browsing data, embed third-party ad networks, or run persistent cross-site tracking pixels.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your browser or device by web services. They permit web applications to remember your session state, your authentication token, and your user preferences across navigation requests.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. Cookies We Use
            </h2>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border border-surface-200 dark:border-surface-800">
                <thead className="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white">
                  <tr>
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  <tr>
                    <td className="p-3 font-mono font-medium">nexus_session</td>
                    <td className="p-3">Strictly Necessary</td>
                    <td className="p-3">Authenticates user session via JWT token</td>
                    <td className="p-3">Session / 7 days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium">theme-storage</td>
                    <td className="p-3">Functional</td>
                    <td className="p-3">Preserves your dark/light color mode preference</td>
                    <td className="p-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium">csrf_token</td>
                    <td className="p-3">Security</td>
                    <td className="p-3">Prevents cross-site request forgery attacks</td>
                    <td className="p-3">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Managing Your Cookie Preferences
            </h2>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, because our cookies are strictly essential for authentication and cart checkout, disabling cookies will prevent login and checkout operations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. Contact for Privacy Inquiries
            </h2>
            <p>
              If you have questions regarding this Cookie Policy or our data storage practices, contact our data protection officer at <a href="mailto:privacy@nexus.market" className="text-brand-600 dark:text-brand-400 hover:underline">privacy@nexus.market</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
