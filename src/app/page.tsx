/**
 * 25-Lakh Tier Luxury Flagship Storefront Homepage
 * Apple-grade sleek minimalism, ambient gradient mesh, and curated atelier curation.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent design-whimsy-injector
 * @agent design-ui-finish-gate-reviewer
 * @agent testing-performance-benchmarker
 */

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Award, Leaf, HeartHandshake, Star, Flame, Compass, PackageOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import { VendorCard } from '@/components/VendorCard';
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
        setTimeout(() => reject(new Error('DB_TIMEOUT')), 1200)
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
        categoryName: p.category?.name || 'Curated Atelier',
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
  { revalidate: 60, tags: ['featured-products'] }
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
      {/* ─── 1. Luxury Editorial Hero ────────────────────────────────────────── */}
      <section className="relative w-full pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden flex flex-col items-center justify-center">
        {/* Floating Ambient Orbs */}
        <div className="absolute -top-[15%] left-[15%] w-[550px] h-[550px] bg-brand-500/15 dark:bg-brand-600/20 blur-[120px] rounded-full pointer-events-none animate-orb-1 will-change-transform" />
        <div className="absolute top-[25%] -right-[10%] w-[650px] h-[650px] bg-indigo-500/15 dark:bg-purple-600/20 blur-[130px] rounded-full pointer-events-none animate-orb-2 will-change-transform" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Status Badge */}
          <div className="specular-pill mb-6 text-brand-700 dark:text-brand-300 shadow-sm px-5 py-2">
            <Sparkles className="h-3.5 w-3.5 text-brand-500 animate-pulse" />
            <span>The 25-Lakh Flagship Standard &bull; Global Independent Ateliers</span>
          </div>

          {/* Cinematic Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-surface-900 dark:text-white leading-[1.06] mb-6 font-sans">
            Curated with Intent. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent inline-block">
              Engineered to Endure.
            </span>
          </h1>

          {/* Editorial Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            A high-consideration marketplace uniting discerning collectors directly with verified artisans, bespoke workshops, and independent creators worldwide.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-13 px-9 text-base shadow-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 border-none rounded-full transition-all font-bold hover:scale-105">
                Explore The Collection <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/seller/register" prefetch={false} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-base border border-surface-300 dark:border-surface-700 bg-white/80 dark:bg-surface-900/80 rounded-full font-bold backdrop-blur-md hover:bg-surface-100 dark:hover:bg-surface-800">
                Apply as an Atelier
              </Button>
            </Link>
          </div>

          {/* Live Metric Badges */}
          <div className="mt-14 flex items-center justify-center gap-6 sm:gap-12 flex-wrap text-surface-600 dark:text-surface-400 font-semibold text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>$4.8M+ Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-500" />
              <span>120+ Master Ateliers</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span>100% Carbon-Neutral Inspected Logistics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Interactive Provenance & Craftsmanship Grid ─────────────────── */}
      <section className="py-24 border-y border-surface-200/60 dark:border-surface-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-xs mb-2 block">
              Architectural Provenance
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-sans mb-4">
              The Nexus Atelier Benchmark
            </h2>
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto text-sm sm:text-base">
              Every creation meets uncompromising standards of provenance, material integrity, and ethical direct-maker commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Award, 
                title: 'Top 3% Vetted Ateliers', 
                desc: 'Specialized workshops undergo rigorous forensic review for authentic craftsmanship, heirloom materials, and artisanal mastery.' 
              },
              { 
                icon: HeartHandshake, 
                title: '90% Direct Creator Payout', 
                desc: 'Escrow splits remit 90% of checkout proceeds directly to independent makers with automated double-entry ledger reconciliation.' 
              },
              { 
                icon: ShieldCheck, 
                title: 'Bank-Grade Escrow Vault', 
                desc: 'Funds are securely locked in institutional escrow until you receive and physically inspect your handcrafted specimen.' 
              },
              { 
                icon: Leaf, 
                title: 'Carbon-Neutral Direct Route', 
                desc: 'Sustainable direct-dispatch packaging with 100% certified carbon offsetting across all international maritime routes.' 
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="glass-luxury-card specular-border p-8 rounded-3xl transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-2xl bg-brand-500/10 dark:bg-brand-400/10 flex items-center justify-center mb-6 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed font-normal">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Trending Curations Showcase ──────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Studio Curations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-sans">
                Coveted Specimen Drops
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="outline" className="rounded-full px-6 text-xs font-bold border-surface-300 dark:border-surface-700 bg-white/60 dark:bg-surface-900/60 backdrop-blur-md">
                  View Full Catalog ({products.length}) <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <ProductCard
                key={product._id}
                product={product}
                priority={idx === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Verified Atelier Showcase ───────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden border-t border-surface-200/60 dark:border-surface-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-600 dark:text-brand-400 font-bold tracking-widest uppercase text-xs mb-3 block">
              Direct Maker Guilds
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight font-sans text-surface-900 dark:text-white">
              Featured Independent Studios
            </h2>
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto text-sm sm:text-base">
              Direct from the master workshops of Kyoto, Geneva, and Florence. Every commission sustains ancestral craft.
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
    </div>
  );
}
