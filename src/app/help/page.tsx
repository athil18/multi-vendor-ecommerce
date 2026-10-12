/**
 * Help Center & Customer Support
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Mail, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Accordion } from '@/components/ui/Accordion';
import { LastUpdatedBadge } from '@/components/ui/LastUpdatedBadge';
import { CopyButton } from '@/components/ui/CopyButton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Customer Care | Nexus Support',
  description: 'Frequently asked questions, order tracking assistance, escrow dispute arbitration, and direct support contacts.',
};

export default function HelpPage() {
  const faqs = [
    {
      q: 'How does the Nexus Escrow Protection work?',
      a: 'When you place an order, your payment is securely vaulted in Stripe Connect escrow. The artisan prepares and dispatches your order. Funds are released to the artisan only once the postal carrier confirms successful delivery to your address.',
    },
    {
      q: 'How can I track my order?',
      a: 'Once an artisan packages your order, tracking credentials (FedEx, UPS, DHL, or USPS) are instantly dispatched to your email and accessible in your Customer Dashboard under Orders.',
    },
    {
      q: 'What is the return & refund policy?',
      a: 'Buyers enjoy a 14-day inspection window upon delivery. If an item is damaged or does not match the maker atelier specifications, you can initiate a dispute from your Customer Portal for an immediate return authorization.',
    },
    {
      q: 'How do I contact an artisan directly?',
      a: 'Each product page and atelier store profile features a direct creator messaging link. You can request bespoke customizations, dimensions, or lead times directly with the craftsman.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="h-3.5 w-3.5 text-surface-600 dark:text-surface-400" />
            Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight mb-3">
            Customer Support and Help Center
          </h1>
          <p className="text-base text-surface-600 dark:text-surface-300 max-w-xl mx-auto leading-relaxed">
            Find answers regarding orders, escrow protection, seller inquiries, and shipping status.
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Mail className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-1">Email Concierge</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 mb-4">Priority support response within 2 business hours.</p>
              <div className="flex items-center gap-3">
                <a href="mailto:support@nexus.market" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                  support@nexus.market
                </a>
                <CopyButton text="support@nexus.market" label="Copy support email address" size="sm" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-1">Dispute Arbitration</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 mb-4">Escrow mediation team for unresolved order issues.</p>
              <Link href="/buyer-protection" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                View Escrow Terms &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <LastUpdatedBadge date="2026-10-09" label="Policy updated:" />
          </div>

          <Accordion
            items={faqs.map((f, idx) => ({
              id: `faq-${idx}`,
              title: f.q,
              content: f.a,
            }))}
            defaultOpenIndex={0}
          />
        </div>
      </div>
    </div>
  );
}
