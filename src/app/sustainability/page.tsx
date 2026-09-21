/**
 * Sustainability & Environmental Commitment
 * 
 * @agent design-ui-designer
 * @agent marketing-seo-specialist
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Leaf, Globe, Recycle, Wind, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carbon-Neutral Logistics & Sustainability | Nexus',
  description: 'Our environmental pledge: 100% carbon-offset deliveries, biodegradable packaging, and sustainable maker sourcing.',
};

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Leaf className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Planet-First Commerce
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-geist mb-4">
            Carbon-Neutral Logistics
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            We believe commerce should nourish ecosystems rather than deplete them. Discover our carbon offset and zero-waste initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Wind className="h-6 w-6 text-emerald-500 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">100% Offset Shipping</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Every gram of CO₂ generated during transit is measured and offset via verified high-durability biochar and afforestation programs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Recycle className="h-6 w-6 text-emerald-500 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Plastic-Free Packaging</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Nexus ateliers package orders using FSC-certified unbleached Kraft cardboard, mycelium buffers, and water-activated paper tape.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800">
            <CardContent className="p-6">
              <Globe className="h-6 w-6 text-emerald-500 mb-3" />
              <h3 className="font-bold text-lg text-surface-900 dark:text-white mb-2">Localized Fulfillment</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Smart checkout automatically prioritizes artisan workshops closest to your delivery jurisdiction to minimize transit mileage.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
