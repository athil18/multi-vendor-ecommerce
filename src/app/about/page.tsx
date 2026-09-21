/**
 * About Nexus - Platform Vision & Artisan Charter
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent marketing-seo-specialist
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Globe, ShieldCheck, HeartHandshake, Award, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Nexus | Curated Independent Creator Platform',
  description: 'Learn about the Nexus mission: empowering independent artisans, master craftspeople, and innovative designers through transparent decentralized commerce.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            Our Mission & Manifesto
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-geist mb-4">
            Democratizing Prestige Commerce for Master Artisans
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Nexus was established to bridge the divide between discerning collectors and world-class independent creators, free from exploitative marketplace algorithms.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Award className="h-7 w-7 text-brand-600 dark:text-brand-400 mb-4" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Artisanal Integrity</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                Zero mass-manufactured drop-shipped inventory. Every seller must pass human curation and provenance audits.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400 mb-4" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Escrow Protection</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                Stripe Connect escrow secures buyer funds until verified carrier delivery, protecting both buyer and creator.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <HeartHandshake className="h-7 w-7 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Fair 90% Direct Payouts</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                Creators retain 90% of their gross merchandise value. Platform commission is capped at a sustainable 10%.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-8 sm:p-12 border border-surface-200 dark:border-surface-800 shadow-sm space-y-6 mb-16">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
            The Nexus Story
          </h2>
          <p className="text-base text-surface-600 dark:text-surface-300 leading-relaxed">
            In an era dominated by opaque drop-shipping platforms and disposable consumerism, true artistry has become increasingly difficult to discover. Independent ceramicists, bespoke horologists, bespoke keyboard builders, and organic botanical cultivators were relegated to algorithm traps or high-friction direct websites.
          </p>
          <p className="text-base text-surface-600 dark:text-surface-300 leading-relaxed">
            Nexus re-engineers the digital bazaar. By providing Apple-grade minimalist aesthetic presentation, automated escrow splits, Section 508 accessibility, and international fulfillment tracking, we allow craftsmen to focus entirely on their craft while we handle the enterprise infrastructure.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/products">
            <Button variant="primary" size="lg">
              Explore Curated Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
