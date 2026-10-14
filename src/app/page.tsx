/**
 * Curated Multi-Vendor Marketplace Flagship Storefront
 * High-Fashion Editorial Art Direction (SSENSE / Balenciaga aesthetic)
 * Stark architectural typography, high-contrast monochrome depth, raw luxury photography.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { VendorCard } from '@/components/VendorCard';
import { StorefrontUXShowcase } from '@/components/storefront/StorefrontUXShowcase';
import prisma from '@/lib/prisma';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';
import { unstable_cache } from 'next/cache';

const getCachedProducts = unstable_cache(
  async () => {
    try {
      const isPlaceholderDb = !process.env.DATABASE_URL || 
        process.env.DATABASE_URL.includes('sample-pooler') || 
        process.env.DATABASE_URL.includes('user:password');

      if (isPlaceholderDb) {
        return FALLBACK_PRODUCTS_LIST.slice(0, 18);
      }

      const queryPromise = prisma.product.findMany({
        where: {
          status: 'published',
          deletedAt: null,
        },
        take: 18,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          seller: { select: { name: true, store: { select: { name: true } } } },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB_TIMEOUT')), 3000)
      );

      const dbProducts = await Promise.race([queryPromise, timeoutPromise]);

      if (!dbProducts || dbProducts.length === 0) {
        return FALLBACK_PRODUCTS_LIST.slice(0, 18);
      }

      const mapped = dbProducts.map((p: any, idx: number) => ({
        _id: p.id,
        id: p.id,
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice,
        images: (p.images && p.images.length > 0) ? p.images : [FALLBACK_PRODUCTS_LIST[idx % FALLBACK_PRODUCTS_LIST.length]?.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        categoryName: p.category?.name || 'Tech & Electronics',
        storeName: p.seller?.store?.name || p.seller?.name || 'Independent Atelier Studio',
        rating: p.rating || 4.95,
        numReviews: p.numReviews || 32,
        benefits: p.benefits,
        specs: p.specs,
        variants: p.variants,
      }));

      if (mapped.length < 12) {
        return [...mapped, ...FALLBACK_PRODUCTS_LIST.slice(0, 18 - mapped.length)];
      }
      return mapped.slice(0, 18);
    } catch {
      return FALLBACK_PRODUCTS_LIST.slice(0, 18);
    }
  },
  ['featured-storefront-products-v5'],
  { revalidate: 300, tags: ['featured-products'] }
);

export default async function Home() {
  const products = await getCachedProducts();

  const editorialDisciplines = [
    {
      num: '01',
      title: 'Tech & Precision Audio',
      subtitle: 'Acoustic sculptures & machined drivers',
      ateliers: '48 Verified Ateliers',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=900',
      href: '/products?category=Tech+Gear',
    },
    {
      num: '02',
      title: 'Fine Botanical Fragrance',
      subtitle: 'Single-origin extracts & bespoke distillations',
      ateliers: '32 Verified Ateliers',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=900',
      href: '/products?category=Luxury',
    },
    {
      num: '03',
      title: 'Tailored Fashion & Garments',
      subtitle: 'Shuttle-loom textiles & sculpted silhouettes',
      ateliers: '85 Verified Ateliers',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900',
      href: '/products?category=Apparel',
    },
    {
      num: '04',
      title: 'Iconic Footwear',
      subtitle: 'Hand-welted cordovan and cordwainer craftsmanship',
      ateliers: '41 Verified Ateliers',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=900',
      href: '/products?category=Footwear',
    },
    {
      num: '05',
      title: 'Horology & Living',
      subtitle: 'Bespoke timepieces, lost-wax bronze & monolithic objects',
      ateliers: '64 Verified Ateliers',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900',
      href: '/products?category=Living',
    },
  ];

  const featuredStores = [
    {
      _id: 'store-vespera',
      name: 'Atelier Vespera',
      description: 'Acoustic architecture, CNC-milled titanium audio instruments, and hand-finished vegetable-tanned leather desk monoliths.',
      isVerified: true,
      location: 'Florence, Italy',
      rating: 4.98,
      productCount: 34,
      thumbnails: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400',
      ],
    },
    {
      _id: 'store-oriel',
      name: 'Maison Oriel',
      description: 'Small-batch botanical extracts, cold-press essential distillations, and rare amber flacons crafted in historical Grasse workshops.',
      isVerified: true,
      location: 'Grasse, France',
      rating: 4.96,
      productCount: 26,
      thumbnails: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400',
      ],
    },
    {
      _id: 'store-kurogane',
      name: 'Kurogane Studio',
      description: 'Shuttle-loom selvedge denim overshirts, looped-wheel organic heavyweights, and hand-dyed indigo jackets from Kojima artisans.',
      isVerified: true,
      location: 'Kojima, Japan',
      rating: 4.95,
      productCount: 19,
      thumbnails: [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400',
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] dark:bg-[#0a0a0c] text-[#111113] dark:text-[#f5f5f7] transition-colors duration-200">
      
      {/* ─── 1. Stitch Flagship Hero (7/5 Asymmetric Grid) ───────────────── */}
      <section className="py-16 md:py-24 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Zone: Copy, Headline & CTAs (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium tracking-wide text-neutral-700 dark:text-neutral-300">
                  Nexus Curated &bull; Season 2025
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-[#111113] dark:text-white font-sans">
                Discover exceptional products.<br />
                <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                  Meet the makers behind them.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed max-w-xl mb-8">
                Shop thoughtfully curated collections directly from independent ateliers, rare craft studios, and precision designers—verified and escrow-protected.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  href="#flagship-products"
                  className="px-6 py-3.5 rounded-full bg-[#111113] dark:bg-white text-white dark:text-[#111113] text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  Explore Collections
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="#ateliers-in-focus"
                  className="px-6 py-3.5 rounded-full border border-black/20 dark:border-white/20 text-[#111113] dark:text-white text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Meet the Makers
                </Link>
              </div>

              {/* Value Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black/10 dark:border-white/10 text-xs w-full">
                <div>
                  <p className="font-bold text-base sm:text-lg text-[#111113] dark:text-white">1,200+</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Verified Ateliers</p>
                </div>
                <div>
                  <p className="font-bold text-base sm:text-lg text-[#111113] dark:text-white">100%</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Escrow Guaranteed</p>
                </div>
                <div>
                  <p className="font-bold text-base sm:text-lg text-[#111113] dark:text-white">Zero</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Mass Production</p>
                </div>
              </div>
            </div>

            {/* Right Zone: Hero Artwork Specimen (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 shadow-xl group">
                <Image
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200"
                  alt="Calibre N-01 Exhibition Horology Specimen"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Top-Right Verification Pill */}
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5 shadow-sm border border-black/5 dark:border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verified &bull; Authenticity Inspected
                </div>

                {/* Bottom Atelier Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-300">
                      Featured Atelier Spotlight
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">Atelier Vespera</h3>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1 mb-3">
                    Florence, Italy &bull; Handcrafted horology, acoustic sculptures &amp; monolithic desktop objects.
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/20">
                    <span className="text-xs font-mono text-white/90">34 Active Specimens</span>
                    <Link href="/stores" className="text-xs font-semibold text-white underline hover:text-emerald-300 transition-colors">
                      View Atelier &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. Explore by Craft & Discipline Bento Grid (Stitch Spec) ────── */}
      <section className="py-16 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Curated Taxonomies
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#111113] dark:text-white">
                Explore by Craft &amp; Discipline
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
                Hand-selected categories curated from independent workshops across 24 countries worldwide.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-[#111113] dark:text-white hover:text-[#6366f1] inline-flex items-center gap-1 mt-4 md:mt-0 transition-colors group"
            >
              Browse All Categories <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 5 Bento Tiles (3 top + 2 wide bottom) without artificial number badges */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {editorialDisciplines.map((cat, idx) => {
              const isLarge = idx >= 3;
              const spanClass = isLarge ? 'md:col-span-3' : 'md:col-span-2';
              const aspectClass = isLarge ? 'aspect-[16/10]' : 'aspect-[3/4]';

              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className={`group relative flex flex-col border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 hover:border-black/30 dark:hover:border-white/30 transition-all ${spanClass}`}
                >
                  <div className={`relative ${aspectClass} w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800`}>
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="text-xs font-medium text-neutral-300 mb-1">
                        {cat.ateliers}
                      </p>
                      <h3 className="text-lg font-bold tracking-tight leading-tight">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-neutral-300 font-sans mt-1 line-clamp-1 opacity-90">
                        {cat.subtitle}
                      </p>
                      <div className="mt-3 text-xs font-semibold text-white/95 group-hover:text-[#6366f1] inline-flex items-center gap-1 transition-colors">
                        Browse Category &rarr;
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. Curated Flagship Product Showcase (Stitch Spec) ───────────── */}
      <section id="flagship-products" className="py-20 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StorefrontUXShowcase products={products} />
        </div>
      </section>

      {/* ─── 4. Independent Ateliers in Focus (Stitch Spec #f6f6f8) ───────── */}
      <section id="ateliers-in-focus" className="py-20 bg-[#f6f6f8] dark:bg-[#121216] border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Provenance &amp; Craftsmanship
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#111113] dark:text-white">
                Independent Ateliers in Focus
              </h2>
            </div>
            <Link
              href="/stores"
              className="text-xs font-semibold text-[#111113] dark:text-white hover:text-[#6366f1] inline-flex items-center gap-1 mt-4 md:mt-0 transition-colors group"
            >
              Meet All 1,200+ Ateliers <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Stitch 3-Thumbnail Atelier Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredStores.map((store) => (
              <div
                key={store._id}
                className="bg-white dark:bg-[#18181c] rounded-xl border border-black/10 dark:border-white/10 p-6 flex flex-col justify-between hover:border-black/30 dark:hover:border-white/30 transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {store.location}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Verified Studio
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2 group-hover:text-[#6366f1] transition-colors">
                    {store.name}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 font-sans">
                    {store.description}
                  </p>

                  {/* 3-Specimen Preview Thumbnail Gallery */}
                  <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {store.thumbnails.map((thumb, tIdx) => (
                      <div
                        key={tIdx}
                        className="aspect-square rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative"
                      >
                        <Image
                          src={thumb}
                          alt={`${store.name} Specimen ${tIdx + 1}`}
                          fill
                          sizes="(max-width: 768px) 30vw, 150px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                    {store.productCount} Active Objects
                  </span>
                  <Link
                    href={`/store/${store._id}`}
                    className="font-semibold text-neutral-900 dark:text-white hover:text-[#6366f1] inline-flex items-center gap-1 transition-colors"
                  >
                    Visit Storefront &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. The Nexus Authenticity & Escrow Guarantee (Stitch Spec) ──── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-8 sm:p-12 bg-white dark:bg-[#121216] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  100% Escrow Protected
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111113] dark:text-white mb-3">
                The Nexus Authenticity &amp; Escrow Guarantee
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Every purchase is held in an encrypted Stripe Connect escrow vault. Funds are only transferred to the atelier after you receive and inspect your items within our 14-day examination window.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/buyer-protection"
                className="px-6 py-3 rounded-full bg-[#111113] dark:bg-white text-white dark:text-[#111113] text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm"
              >
                Read Escrow Terms
              </Link>
              <Link
                href="/auth/register?role=seller"
                className="px-6 py-3 rounded-full border border-black/20 dark:border-white/20 text-[#111113] dark:text-white text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Apply as Maker
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
