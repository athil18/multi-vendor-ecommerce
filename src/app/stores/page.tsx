/**
 * Dedicated Creator & Store Directory Page (React Server Component)
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent engineering-frontend-developer
 * @agent testing-performance-benchmarker
 * @agent testing-accessibility-auditor
 */

import React from 'react';
import Link from 'next/link';
import { Store, Star, CheckCircle, ArrowRight, Sparkles, Search, ShieldCheck } from 'lucide-react';
import { VendorCard } from '@/components/VendorCard';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Creator Stores Directory',
  description: 'Explore verified independent artisan stores, makers, and boutique creators on Nexus.',
};

const STORES_DIRECTORY = [
  {
    _id: 'store-1',
    name: 'TechGear Pro',
    description: 'Custom CNC mechanical keyboards, planar magnetic audio gear, and artisanal desk accessories.',
    isVerified: true,
    rating: 4.95,
    productCount: 48,
    category: 'Tech & Audio',
    coverUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    _id: 'store-2',
    name: 'Apex Velocity Lab',
    description: 'Precision carbon-fiber aerodynamic road frames, Olympic fitness systems, and high-performance endurance gear.',
    isVerified: true,
    rating: 4.92,
    productCount: 26,
    category: 'Sports & Fitness',
    coverUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    _id: 'store-3',
    name: 'Verdant Eco Living',
    description: 'Sustainable hydroponic indoor nurseries, heirloom organic botanicals, and zero-waste living goods.',
    isVerified: true,
    rating: 4.88,
    productCount: 34,
    category: 'Sustainable Living',
    coverUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    _id: 'store-4',
    name: 'Atelier Veloce',
    description: 'Hand-stitched full-grain Tuscan leather weekender bags, bespoke cardholders, and luxury timepieces.',
    isVerified: true,
    rating: 4.96,
    productCount: 19,
    category: 'Luxury Goods',
    coverUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  },
  {
    _id: 'store-5',
    name: 'Minimalist Creators',
    description: 'Curated architectural workspace setups, solid walnut monitor stands, and organic merino wool desk mats.',
    isVerified: true,
    rating: 4.85,
    productCount: 52,
    category: 'Workspace',
    coverUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    _id: 'store-6',
    name: 'Lumina Studio',
    description: 'Handcrafted stoneware ceramic mugs with volcanic mineral glazes and architectural spun brass ambient lamps.',
    isVerified: true,
    rating: 4.98,
    productCount: 22,
    category: 'Home & Living',
    coverUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
];

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      {/* Header Banner */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-surface-200 dark:border-surface-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold uppercase tracking-wider mb-6">
            Store Directory
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white tracking-tight mb-4">
            Independent Seller Stores
          </h1>

          <p className="text-base sm:text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Browse dedicated storefronts from vetted independent creators and workshops. Purchases are secured with escrow buyer protection.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-surface-600 dark:text-surface-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Verified Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-surface-500" />
              <span>Direct Workshop Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Directory Grid */}
      <section className="py-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STORES_DIRECTORY.map((store) => (
            <div key={store._id} className="h-full">
              <VendorCard store={store} />
            </div>
          ))}
        </div>

        {/* Call to Action for New Sellers */}
        <div className="mt-16 p-8 sm:p-12 text-center rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-3">
              Sell on Nexus
            </h2>
            <p className="text-surface-600 dark:text-surface-300 text-sm sm:text-base mb-8 leading-relaxed">
              Launch your storefront on Nexus. Manage your catalog, receive automated Stripe escrow payouts, and connect directly with customers.
            </p>
            <Link href="/seller/store" prefetch={false}>
              <Button size="lg" className="rounded-lg px-6 py-3 font-medium">
                Open Your Storefront <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
