/**
 * Dynamic Merchant Storefront / Atelier Detail Page
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent engineering-frontend-developer
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, ShieldCheck, CheckCircle2, PackageOpen, Award, MapPin, Sparkles, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProductCard } from '@/components/ProductCard';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

const STORES_DIRECTORY_MAP: Record<string, any> = {
  'store-1': {
    _id: 'store-1',
    name: 'TechGear Pro',
    tagline: 'Custom CNC mechanical keyboards, planar magnetic audio gear, and artisanal desk accessories.',
    location: 'Austin, Texas',
    category: 'Tech & Audio',
    isVerified: true,
    rating: 4.95,
    numReviews: 142,
    productCount: 48,
    coverUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Pioneering tactile typing instruments and high-fidelity acoustics. Every keyboard is milled from solid aircraft-grade 6063 aluminum and hand-assembled with tuned stabilizers.',
    matchingCategory: 'Tech Gear',
  },
  'store-2': {
    _id: 'store-2',
    name: 'Apex Velocity Lab',
    tagline: 'Precision carbon-fiber aerodynamic road frames, Olympic fitness systems, and high-performance endurance gear.',
    location: 'Boulder, Colorado',
    category: 'Sports & Fitness',
    isVerified: true,
    rating: 4.92,
    numReviews: 98,
    productCount: 26,
    coverUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Crafting the next generation of athletic excellence. Wind-tunnel tested carbon fiber layups paired with biometric telemetry for serious endurance athletes.',
    matchingCategory: 'Fitness',
  },
  'store-3': {
    _id: 'store-3',
    name: 'Verdant Eco Living',
    tagline: 'Sustainable hydroponic indoor nurseries, heirloom organic botanicals, and zero-waste living goods.',
    location: 'Portland, Oregon',
    category: 'Sustainable Living',
    isVerified: true,
    rating: 4.88,
    numReviews: 76,
    productCount: 34,
    coverUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    bio: 'Dedicated to circular design and carbon-negative home living. All botanical cultivation kits utilize reclaimed maritime polymers and solar-distilled nutrients.',
    matchingCategory: 'Sustainable',
  },
  'store-4': {
    _id: 'store-4',
    name: 'Atelier Veloce',
    tagline: 'Hand-stitched full-grain Tuscan leather weekender bags, bespoke cardholders, and luxury timepieces.',
    location: 'Florence, Italy',
    category: 'Luxury Goods',
    isVerified: true,
    rating: 4.96,
    numReviews: 189,
    productCount: 19,
    coverUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    bio: 'Rooted in multi-generational Italian leather artistry. Each hide is vegetable-tanned in Santa Croce sull\'Arno using organic chestnut tannins and hand-stitched with waxed linen thread.',
    matchingCategory: 'Luxury',
  },
  'store-5': {
    _id: 'store-5',
    name: 'Minimalist Creators',
    tagline: 'Curated architectural workspace setups, solid walnut monitor stands, and organic merino wool desk mats.',
    location: 'Copenhagen, Denmark',
    category: 'Workspace',
    isVerified: true,
    rating: 4.85,
    numReviews: 114,
    productCount: 52,
    coverUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Scandinavia-inspired ergonomics for modern knowledge workers. We believe your physical environment dictates cognitive clarity and flow state endurance.',
    matchingCategory: 'Workspace',
  },
  'store-6': {
    _id: 'store-6',
    name: 'Lumina Studio',
    tagline: 'Handcrafted stoneware ceramic mugs with volcanic mineral glazes and architectural spun brass ambient lamps.',
    location: 'Kyoto, Japan',
    category: 'Home & Living',
    isVerified: true,
    rating: 4.98,
    numReviews: 210,
    productCount: 22,
    coverUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    bio: 'Harmonizing ancient Japanese ceramic traditions with contemporary ambient luminaires. Every vessel is wheel-thrown, wood-fired, and uniquely textured.',
    matchingCategory: 'Home & Living',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const store = STORES_DIRECTORY_MAP[id] || { name: 'Independent Creator Atelier' };

  return {
    title: `${store.name} | Nexus Creator Atelier`,
    description: store.tagline || 'Explore curated creations from this verified artisan on Nexus.',
  };
}

export default async function StoreDetailPage({ params }: Props) {
  const { id } = await params;
  const store = STORES_DIRECTORY_MAP[id] || {
    _id: id,
    name: 'Independent Creator Atelier',
    tagline: 'Verified boutique merchant crafting high-grade items for the Nexus marketplace.',
    location: 'Verified Maker Network',
    category: 'Curated Artisan',
    isVerified: true,
    rating: 4.9,
    numReviews: 45,
    productCount: 12,
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Committed to craftsmanship, sustainable materials, and rigorous quality standards under the Nexus platform guarantee.',
    matchingCategory: 'Tech Gear',
  };

  // Filter or show curated catalog items for this store
  const storeProducts = FALLBACK_PRODUCTS_LIST.slice(0, 6);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      {/* Cover Banner */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-surface-900">
        <Image
          src={store.coverUrl}
          alt={`${store.name} Atelier Cover`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent" />
        
        {/* Navigation Breadcrumb */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-900/80 backdrop-blur-md border border-surface-700/60 text-surface-200 text-xs font-semibold hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Stores
          </Link>
        </div>
      </div>

      {/* Store Header Identity Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-16">
        <div className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-surface-200/80 dark:border-surface-800/80 shadow-2xl shadow-surface-950/20 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-2 border-brand-500/30 shadow-lg flex-shrink-0 bg-surface-100 dark:bg-surface-800">
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white tracking-tight font-geist">
                    {store.name}
                  </h1>
                  {store.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Verified Atelier
                    </span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {store.category}
                  </Badge>
                </div>

                <p className="text-sm text-surface-600 dark:text-surface-300 max-w-2xl leading-relaxed">
                  {store.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-surface-500 dark:text-surface-400 font-medium">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {store.rating} ({store.numReviews} verified reviews)
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-surface-400" />
                    {store.location}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <PackageOpen className="h-3.5 w-3.5 text-surface-400" />
                    {store.productCount} Handcrafted Items
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/products">
                <Button variant="primary" className="w-full sm:w-auto">
                  Explore Catalog
                </Button>
              </Link>
            </div>
          </div>

          {/* About Creator Bio */}
          <div className="mt-8 pt-6 border-t border-surface-200/60 dark:border-surface-800/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-2">
              Atelier Philosophy & Standards
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed max-w-4xl">
              {store.bio}
            </p>
          </div>
        </div>

        {/* Featured Atelier Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight font-geist">
                Crafted by {store.name}
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Direct artisan order with 100% money-back escrow protection
              </p>
            </div>
            <Link href="/products" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
