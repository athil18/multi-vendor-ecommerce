/**
 * Artisan Verification Standards & Quality Tiers
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent quality-assurance-lead
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { IconDesignSystemGallery } from '@/components/ui/IconDesignSystemGallery';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artisan Verification & Vector Design Standards | Nexus Quality Charter',
  description: 'Learn about our rigorous curation process, material provenance verification, and zero-runtime vector design system.',
};

export default function StandardsPage() {
  const tiers = [
    {
      title: 'Provenance & Authenticity Verification',
      desc: 'All merchants must provide verified documentation of workshop origin, raw material sourcing, and physical fabrication capacity.',
      points: ['Zero drop-shipping tolerance', 'Workshop photographic & video audits', 'Material batch chemical safety compliance'],
    },
    {
      title: 'Craftsmanship Benchmarking',
      desc: 'Physical sample evaluation conducted by independent craft guilds before catalogue onboarding.',
      points: ['Tolerances inspected to millimeter accuracy', 'Stress-testing of joints, stitching, and electronic circuits', 'Durability & repairability scoring'],
    },
    {
      title: 'Ethical & Sustainable Production',
      desc: 'Makers must demonstrate fair-wage labor practices and environmental responsibility across their supply chains.',
      points: ['Fair living wages for all atelier artisans', 'Plastic-free or 100% recycled packaging', 'Carbon-conscious regional fulfillment routing'],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Platform Standards
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight mb-4">
            Nexus Platform & Catalog Standards
          </h1>
          <p className="text-base text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            From seller vetting to secure escrow settlement and data protection, explore the standards governing the Nexus marketplace.
          </p>
        </div>

        {/* Curation Standards Tiers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight font-geist">
            Artisan Curation Charter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t, idx) => (
              <Card key={idx} className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold font-mono text-lg flex-shrink-0">
                      0{idx + 1}
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                        {t.title}
                      </h3>
                      <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                        {t.desc}
                      </p>
                      <ul className="space-y-2 pt-2">
                        {t.points.map((pt, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs font-medium text-surface-700 dark:text-surface-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Vector Icon Design System Explorer */}
        <div>
          <IconDesignSystemGallery />
        </div>
      </div>
    </div>
  );
}
