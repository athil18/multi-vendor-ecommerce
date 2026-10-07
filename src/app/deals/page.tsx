/**
 * Curated Deals & Drops Showcase
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, Sparkles, ShieldCheck } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deals & Artisan Drops | Nexus Marketplace',
  description: 'Limited-edition studio sample sales, seasonal creator discounts, and bundle drops on Nexus.',
};

export default function DealsPage() {
  // Curated discounted items
  const deals = FALLBACK_PRODUCTS_LIST.slice(0, 6);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Tag className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            Special Offers
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white tracking-tight mb-3">
            Deals and Promotions
          </h1>
          <p className="text-base text-surface-600 dark:text-surface-300 max-w-xl mx-auto leading-relaxed">
            Discounted prices offered directly by sellers across active catalog categories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
