/**
 * Storefront UX Showcase Component
 * Implements the Stitch Reference "Curated Flagships" Section:
 * - Singular Editions eyebrow with accent dot
 * - Curated Flagships heading
 * - All Flagships, Precision Tech, Luxury Fragrance, Haute Fashion, Horology segmented pill tabs
 * - Immediate 4-column balanced product grid
 * - Direct "View All 240+ Flagship Curations ->" discovery link
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

interface StorefrontUXShowcaseProps {
  products: any[];
}

export function StorefrontUXShowcase({ products }: StorefrontUXShowcaseProps) {
  const isTech = (p: any) => {
    const cat = (p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : '') || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    return cat.includes('tech') || cat.includes('electronic') || n.includes('keyboard') || n.includes('headphone') || n.includes('audio') || n.includes('macbook') || n.includes('dac');
  };

  const isFragranceBeauty = (p: any) => {
    const cat = (p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : '') || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    return cat.includes('beauty') || cat.includes('fragrance') || cat.includes('wellness') || n.includes('eau de parfum') || n.includes('vanille') || n.includes('santal') || n.includes('serum') || n.includes('cream');
  };

  const isFashionFootwear = (p: any) => {
    const cat = (p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : '') || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    return cat.includes('fashion') || cat.includes('apparel') || cat.includes('footwear') || cat.includes('shoe') || cat.includes('sneaker') || n.includes('overcoat') || n.includes('boot') || n.includes('loafer') || n.includes('cashmere');
  };

  const isHorologyLiving = (p: any) => {
    const cat = (p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : '') || '').toLowerCase();
    const n = (p.name || '').toLowerCase();
    return cat.includes('jewelry') || cat.includes('accessory') || cat.includes('accessories') || cat.includes('home') || cat.includes('living') || n.includes('watch') || n.includes('chronometer') || n.includes('duffle') || n.includes('chair') || n.includes('lounge');
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => [
    { id: 'all', label: 'All Flagships', count: products.length },
    { id: 'tech', label: 'Precision Tech', count: products.filter(isTech).length },
    { id: 'fragrance', label: 'Luxury Fragrance', count: products.filter(isFragranceBeauty).length },
    { id: 'fashion', label: 'Haute Fashion', count: products.filter(isFashionFootwear).length },
    { id: 'horology', label: 'Horology', count: products.filter(isHorologyLiving).length },
  ], [products]);

  // Filter products instantly (<400ms Doherty Threshold)
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory === 'tech') list = products.filter(isTech);
    else if (selectedCategory === 'fragrance') list = products.filter(isFragranceBeauty);
    else if (selectedCategory === 'fashion') list = products.filter(isFashionFootwear);
    else if (selectedCategory === 'horology') list = products.filter(isHorologyLiving);
    return list.slice(0, 16);
  }, [products, selectedCategory]);

  return (
    <div className="w-full flex flex-col">
      {/* ─── Header & Segmented Filter Tabs ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Singular Editions
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#111113] dark:text-white">
            Curated Flagships
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mt-4 md:mt-0 overflow-x-auto pb-2 md:pb-0" role="tablist" aria-label="Flagship Categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#111113] text-white dark:bg-white dark:text-[#111113] shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#111113] dark:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 4-Column Balanced Product Grid (Stitch Desktop Layout) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        {filteredProducts.map((product, idx) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            priority={idx < 4}
          />
        ))}
      </div>

      {/* ─── Bottom CTA: View All Flagships ─── */}
      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#111113] dark:text-white hover:text-[#6366f1] transition-colors group"
        >
          View All 240+ Flagship Curations
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
