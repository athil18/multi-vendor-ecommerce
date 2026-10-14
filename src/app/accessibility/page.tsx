/**
 * Accessibility Statement & Conformance Commitment (WCAG 2.2 Level AA & Section 508)
 * Production documentation detailing inclusive interface design, keyboard mechanics,
 * screen reader interoperability, and continuous audit mechanisms.
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Keyboard, Sparkles, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement (WCAG 2.2 Level AA) | Nexus Marketplace',
  description: 'Nexus Marketplace commitment to digital accessibility, WCAG 2.2 Level AA compliance, Section 508 standards, and inclusive e-commerce experiences.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-100 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Eye className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            W3C WCAG 2.2 Level AA Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-4">
            Accessibility Statement
          </h1>
          <p className="text-base text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Nexus Marketplace is committed to digital inclusivity, ensuring that individuals of all abilities can browse, discover artisan craftsmanship, and complete escrow-secured transactions seamlessly.
          </p>
        </div>

        {/* Key Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <Keyboard className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Keyboard &amp; Focus Interoperability</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                All interactive menus, cart drawers, filter accordions, and checkout steps feature visible 2px high-contrast focus rings (WCAG 2.4.11) with standard Tab, Shift-Tab, Escape, and Enter navigation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Color Contrast &amp; Typography</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Typography pairs exceed the mandatory 4.5:1 contrast ratio for normal body copy and 3:1 for large display headers in both Light and Curated Dark modes, preventing visual fatigue.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              1. Conformance Status
            </h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Nexus Marketplace strives for full conformity with <strong>WCAG 2.2 Level AA</strong> standards across all customer and vendor workflows.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. Technical Implementation Highlights
            </h2>
            <ul className="list-disc list-inside space-y-2 text-surface-600 dark:text-surface-400 pl-1">
              <li><strong>Descriptive Image Alt Text:</strong> All artisan product studio views, category banners, and creator avatars include contextual alternative text describing materials, colorways, and craft details.</li>
              <li><strong>Target Size (WCAG 2.5.8):</strong> Interactive elements, including cart buttons, size chips, and menu toggles, meet or exceed minimum touch target dimensions (44x44px on mobile viewports).</li>
              <li><strong>Form Accessibility &amp; Validation:</strong> Input controls feature programmatic <code>&lt;label&gt;</code> association, explicit <code>aria-invalid</code> and <code>aria-describedby</code> error messaging, and never rely exclusively on color to convey validation status.</li>
              <li><strong>Screen-Reader Friendly Consent &amp; Modals:</strong> Cookie consent banners, confirmation dialogs, and cart drawers trap focus correctly, expose proper ARIA roles (<code>role=&quot;dialog&quot;</code>, <code>aria-modal=&quot;true&quot;</code>), and dismiss gracefully on the <kbd className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono text-xs">Escape</kbd> key.</li>
              <li><strong>Accessible Authentication (WCAG 3.3.8):</strong> Password fields support standard password managers, credential autofill, and show/hide toggles without imposing cognitive puzzle barriers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Continuous Testing &amp; Tooling
            </h2>
            <p>
              Our automated CI/CD pipeline validates every build with Axe-core, Playwright accessibility audits, and Lighthouse checks. We continuously test across assistive technologies, including NVDA, VoiceOver, and Orca screen readers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. Feedback &amp; Accessibility Assistance
            </h2>
            <p className="mb-3">
              We welcome your feedback on the accessibility of Nexus Marketplace. If you encounter accessibility barriers, need materials in an alternative format, or require assistance completing an escrow order:
            </p>
            <div className="bg-surface-50 dark:bg-surface-950 p-4 rounded-xl border border-surface-200 dark:border-surface-800 text-xs space-y-1.5 text-surface-600 dark:text-surface-400">
              <p><strong>Accessibility Coordinator:</strong> Nexus Inclusivity Team</p>
              <p><strong>Email:</strong> <a href="mailto:accessibility@nexus.market" className="text-brand-600 dark:text-brand-400 underline font-semibold">accessibility@nexus.market</a></p>
              <p><strong>Response SLA:</strong> We acknowledge reports within 1 business day and prioritize remediation in our weekly deployment cycle.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
