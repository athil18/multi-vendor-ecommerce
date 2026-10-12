/**
 * New Arrivals Showcase
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ambient-gradient-mesh relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 swiss-grid-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <Link 
            href="/" 
            aria-label="Back to store homepage"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="specular-pill mb-4 text-surface-700 dark:text-surface-300">
            <Clock className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>Latest Atelier Releases &bull; Verified Fresh Drops</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-4 font-sans">
            New Artisan Arrivals
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Recently added catalog releases and small-batch items direct from independent workshops. Protected by Stripe Connect escrow.
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
