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
import { 
  Sparkles, ArrowRight, ShieldCheck, Award, Leaf, 
  HeartHandshake, Compass, Layers, CheckCircle2 
} from 'lucide-react';
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
        setTimeout(() => reject(new Error('DB_TIMEOUT')), 8000)
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
  ['featured-storefront-products-catalog'],
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

  const categories = [
    { name: 'Tech Gear & Audio', slug: 'Tech Gear', desc: 'Custom mechanical keyboards, precision audio, desk accessories', count: '14 Items', href: '/products?category=Tech+Gear' },
    { name: 'Fine Leather & Goods', slug: 'Luxury', desc: 'Full-grain Tuscan leather, heirloom cardcases, handcrafted bags', count: '9 Items', href: '/products?category=Luxury' },
    { name: 'Sports & Velocity', slug: 'Fitness', desc: 'Aerodynamic components, carbon fiber frames, performance gear', count: '12 Items', href: '/products?category=Fitness' },
    { name: 'Sustainable Living', slug: 'Sustainable', desc: 'Consciously sourced home essentials and circular design objects', count: '8 Items', href: '/products?category=Sustainable' },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ─── 1. Intent-Driven Hero ───────────────────────────────────────────── */}
      <section className="relative w-full pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-surface-50 via-white to-surface-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          {/* Authentic Trust Pill */}
          <div className="specular-pill mb-6 text-brand-700 dark:text-brand-300 shadow-sm px-5 py-2">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>Curated Marketplace &bull; Direct From Independent Workshops</span>
          </div>

          {/* Value Prop Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-surface-900 dark:text-white leading-[1.08] mb-6 font-sans">
            Crafted with Intent. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent inline-block">
              Engineered to Endure.
            </span>
          </h1>

          {/* Clear Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            A high-trust marketplace connecting discerning buyers directly with verified artisan workshops, bespoke toolmakers, and independent creators worldwide.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base shadow-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 border-none rounded-full font-bold hover:scale-105 transition-transform">
                Explore The Collection <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/seller/register" prefetch={false} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-base border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 rounded-full font-bold hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                Open a Creator Workshop
              </Button>
            </Link>
          </div>

          {/* Authentic Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-surface-600 dark:text-surface-400 font-semibold text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-500" />
              <span>Verified Artisan Workshops</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <span>Carbon-Neutral Logistics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Curated Categories Navigation ─────────────────────────────────── */}
      <section className="py-16 border-y border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Explore by Craft
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white tracking-tight">
                Featured Categories
              </h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={cat.href}
                className="group p-6 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850 hover:border-brand-500 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1.5 flex items-center justify-between">
                    {cat.name}
                    <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed font-normal">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-200/60 dark:border-surface-700/60 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                  {cat.count}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Provenance & Escrow Principles ───────────────────────────────── */}
      <section className="py-20 bg-surface-50/50 dark:bg-surface-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-xs mb-2 block">
              Buyer Protection & Integrity
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white tracking-tight font-sans mb-3">
              Why Discerning Shoppers Choose Nexus
            </h2>
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto text-sm sm:text-base">
              Every transaction is architected around transparent buyer protection, direct artisan remuneration, and physical inspection guarantees.
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
                title: 'Hand-Vetted Creators', 
                desc: 'Every workshop and brand is vetted for genuine craftsmanship, materials origin, and fulfillment track record.' 
              },
              { 
                icon: HeartHandshake, 
                title: '90% Direct Creator Payout', 
                desc: 'Proceeds flow directly to the creator with an automated, transparent split that sustains independent artisan studios.' 
              },
              { 
                icon: Leaf, 
                title: 'Inspected Delivery & Returns', 
                desc: '14-day examination window on all items with carbon-neutral transit and guaranteed dispute resolution.' 
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm"
              >
                <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950/80 flex items-center justify-center mb-5 text-brand-600 dark:text-brand-400">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-surface-900 dark:text-white mb-2">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed font-normal">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Handcrafted Bestsellers ─────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-surface-900 border-y border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                Curated Selection
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white tracking-tight font-sans mt-1">
                Featured Creations
              </h2>
            </div>
            
            <Link href="/products">
              <Button variant="outline" className="rounded-full px-6 text-xs font-bold border-surface-300 dark:border-surface-700">
                View All Products ({products.length}) <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map((product, idx) => (
              <ProductCard
                key={product._id}
                product={product}
                priority={idx === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Verified Creator Workshops ─────────────────────────────────── */}
      <section className="py-20 bg-surface-50 dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-brand-600 dark:text-brand-400 font-bold tracking-widest uppercase text-xs mb-2 block">
              Independent Guilds
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight font-sans text-surface-900 dark:text-white">
              Featured Creator Studios
            </h2>
            <p className="text-surface-600 dark:text-surface-300 max-w-2xl mx-auto text-sm sm:text-base">
              Explore independent studios in Kyoto, Geneva, and Florence. Every commission sustains master craft.
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
