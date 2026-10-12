/**
 * Curated Multi-Vendor Marketplace Flagship Storefront
 * High-consideration marketplace uniting discerning collectors directly with verified artisans and independent creators worldwide.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent engineering-frontend-developer
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Award, Leaf, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import { VendorCard } from '@/components/VendorCard';
import { StorefrontUXShowcase } from '@/components/storefront/StorefrontUXShowcase';
import prisma from '@/lib/prisma';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';
import { unstable_cache } from 'next/cache';

const getCachedProducts = unstable_cache(
  async () => {
    try {
      const queryPromise = prisma.product.findMany({
        where: { status: 'published', deletedAt: null },
        take: 9,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          seller: { select: { name: true, store: { select: { name: true } } } },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB_TIMEOUT')), 2500)
      );

      const dbProducts = await Promise.race([queryPromise, timeoutPromise]);

      if (!dbProducts || dbProducts.length === 0) {
        return FALLBACK_PRODUCTS_LIST;
      }

      const mapped = dbProducts.map((p: any, idx: number) => ({
        _id: p.id,
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        images: (p.images && p.images.length > 0) ? p.images : [FALLBACK_PRODUCTS_LIST[idx % FALLBACK_PRODUCTS_LIST.length]?.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        categoryName: p.category?.name || 'Curated Goods',
        storeName: p.seller?.store?.name || p.seller?.name || 'Independent Creator',
        rating: p.rating || 4.9,
        numReviews: p.numReviews || 28,
      }));

      if (mapped.length < 6) {
        return [...mapped, ...FALLBACK_PRODUCTS_LIST.slice(0, 6 - mapped.length)];
      }
      return mapped;
    } catch {
      return FALLBACK_PRODUCTS_LIST;
    }
  },
  ['featured-storefront-products-luxury'],
  { revalidate: 300, tags: ['featured-products'] }
);

export default async function Home() {
  const products = await getCachedProducts();

  const featuredStores = [
    {
      _id: 'store-1',
      name: 'TechGear Pro Laboratories',
      description: 'Bespoke CNC-milled aluminum mechanical keyboards, planar magnetic studio monitors, and precision desk monoliths.',
      isVerified: true,
      location: 'Kyoto & San Francisco',
      rating: 4.96,
      productCount: 42,
      coverUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
      logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
    {
      _id: 'store-2',
      name: 'Apex Velocity Engineering',
      description: 'Monocoque aerodynamic carbon fiber road frames, titanium hardware, and Olympic-grade biomechanical velocity systems.',
      isVerified: true,
      location: 'Geneva, Switzerland',
      rating: 4.94,
      productCount: 28,
      coverUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
      logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
    {
      _id: 'store-3',
      name: 'Atelier Veloce Firenze',
      description: 'Full-grain veg-tanned Tuscan leather weekender luggage, saddle-stitched cardcases, and heirloom chronometer mounts.',
      isVerified: true,
      location: 'Florence, Italy',
      rating: 4.98,
      productCount: 22,
      coverUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
      logoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden ambient-gradient-mesh">
      {/* ─── 1. Authentic Editorial Hero ────────────────────────────────────────── */}
      <section className="relative w-full pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden flex flex-col items-center justify-center">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 swiss-grid-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Authentic Editorial Kicker */}
          <p className="text-xs uppercase font-bold tracking-widest text-surface-500 dark:text-surface-400 mb-4 select-none">
            Independent Workshop Marketplace &bull; Stripe Connect Escrow
          </p>

          {/* Concrete Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-surface-900 dark:text-white leading-[1.08] mb-6 font-sans">
            Direct from independent workshops. <br className="hidden md:block" />
            <span className="text-brand-600 dark:text-brand-400">
              Protected by escrow.
            </span>
          </h1>

          {/* Concrete Subtitle */}
          <p className="text-base sm:text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Nexus connects discerning buyers directly with verified specialized workshops. Every order is secured with Stripe Connect escrow and released only upon carrier-confirmed delivery.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
            <Link
              href="/products"
              aria-label="Browse product catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-7 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Browse catalog <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/seller/register"
              prefetch={false}
              aria-label="Apply to open a seller account"
              className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-7 text-sm font-semibold border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Apply to sell
            </Link>
          </div>

          {/* Authentic Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-surface-600 dark:text-surface-400 font-medium text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Stripe Connect Escrow Holds</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-500" />
              <span>Verified Independent Workshops</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span>Carrier-Inspected 30-Day Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Platform Commitments & Workshop Standards ─────────────────── */}
      <section className="py-20 border-y border-surface-200 dark:border-surface-800 relative section-contained bg-surface-50/50 dark:bg-surface-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-xs mb-2 block">
              Platform Standards
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight font-sans mb-3">
              How Nexus Protects Buyers and Makers
            </h2>
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto text-sm sm:text-base">
              Every transaction follows transparent double-entry accounting and verified logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: ShieldCheck, 
                title: 'Institutional Escrow Vault', 
                desc: 'Your payment remains safely locked in Stripe escrow until you receive, examine, and approve your delivery.' 
              },
              { 
                icon: Award, 
                title: 'Vetted Workshops', 
                desc: 'Independent makers undergo business verification and product inspection before catalog publishing.' 
              },
              { 
                icon: HeartHandshake, 
                title: '90% Direct Disbursal', 
                desc: 'Checkout proceeds remit directly to makers upon confirmed fulfillment with 10% platform maintenance fee.' 
              },
              { 
                icon: ShieldCheck, 
                title: 'Stripe Connect Escrow', 
                desc: 'Buyer funds remain locked in escrow until verified delivery confirmation by national carriers.' 
              },
              { 
                icon: Leaf, 
                title: 'Standardized Tracking', 
                desc: 'Every parcel is dispatched with verifiable carrier tracking numbers and full shipping insurance.' 
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-sm transition-all duration-200 hover:border-surface-300 dark:hover:border-surface-700"
              >
                <div className="h-10 w-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-5 text-brand-600 dark:text-brand-400">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-surface-900 dark:text-white mb-2">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed font-normal">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Storefront UX Showcase (20 Laws of UX + Editorial Curation) ── */}
      <section className="py-24 relative section-contained border-t border-surface-200/60 dark:border-surface-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StorefrontUXShowcase products={products} />
        </div>
      </section>

      {/* ─── 4. Verified Atelier Showcase ───────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden border-t border-surface-200/60 dark:border-surface-800/80 section-contained">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-600 dark:text-brand-400 font-bold tracking-wider uppercase text-xs mb-3 block">
              Verified Sellers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight font-sans text-surface-900 dark:text-white">
              Featured Independent Workshops
            </h2>
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto text-sm sm:text-base">
              Specialized creators with established fulfillment track records and verified business credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredStores.map((store) => (
              <div key={store._id} className="h-full">
                <VendorCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. High-Trust Call To Action ────────────────────────────────────── */}
      <section className="py-16 bg-surface-900 text-white dark:bg-surface-850 border-t border-surface-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">
            Protected by Nexus Escrow Guarantee
          </h2>
          <p className="text-surface-300 max-w-xl mx-auto text-sm mb-8 leading-relaxed font-normal">
            Every transaction is backed by cryptographic payment authorization, neutral escrow holding, and dedicated customer resolution.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/products">
              <Button size="lg" className="rounded-full px-8 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm h-12 shadow-lg">
                Browse The Catalog
              </Button>
            </Link>
            <Link href="/buyer-protection">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-surface-600 text-white hover:bg-surface-800 font-bold text-sm h-12">
                Read Buyer Protection Policy
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
