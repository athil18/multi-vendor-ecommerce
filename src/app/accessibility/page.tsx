/**
 * Section 508 & WCAG 2.1 AA Accessibility Statement
 * 
 * @agent engineering-section-508-specialist
 * @agent testing-accessibility-auditor
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Keyboard, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement (WCAG 2.1 AA) | Nexus',
  description: 'Nexus commitment to Section 508 and WCAG 2.1 AA digital accessibility standards across all storefront interfaces.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Eye className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            Universal Design
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-geist mb-4">
            Accessibility Statement
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Nexus is engineered from the ground up to comply with Section 508 of the Rehabilitation Act and W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Keyboard className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Full Keyboard Navigation</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                All interactive menus, cart drawers, filter facets, and checkout buttons feature visible 2px focus rings and standard Tab / Shift-Tab / Enter / Space semantics.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">High-Contrast Typography</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                Color pairings meet or exceed the mandatory 4.5:1 contrast ratio for normal text and 3:1 for large headers across both light and curated dark themes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
