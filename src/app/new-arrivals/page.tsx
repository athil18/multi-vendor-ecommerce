/**
 * New Arrivals Showcase
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Artisan Arrivals | Nexus Marketplace',
  description: 'Fresh studio drops from verified independent creators, freshly listed this week.',
};

export default function NewArrivalsPage() {
  // Fresh arrivals (reverse order for latest)
  const arrivals = [...FALLBACK_PRODUCTS_LIST].reverse().slice(0, 6);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            Fresh From The Ateliers
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-geist mb-4">
            New Artisan Arrivals
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Recently completed handcrafted releases and limited production runs from our vetted creators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {arrivals.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
