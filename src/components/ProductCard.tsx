/**
 * 25-Lakh Tier Luxury Product Card Component
 * Apple-grade dark glassmorphism, multi-image hover scrub, and instant comparison integration.
 * 
 * @agent design-ui-designer
 * @agent design-ui-finish-gate-reviewer
 * @agent design-brand-guardian
 * @agent design-whimsy-injector
 * @agent testing-accessibility-auditor
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, PackageOpen, Scale, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useCompareStore } from '@/store/useCompareStore';

export interface ProductCardProps {
  product: {
    _id: string;
    id?: string;
    name: string;
    description: string;
    basePrice: number;
    images?: string[];
    categoryName?: string;
    category?: { name: string } | string;
    rating?: number;
    numReviews?: number;
    storeId?: string;
    storeName?: string;
    materials?: string;
  };
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const productId = product._id || product.id || '';
  
  const { addToCompare, isInCompare } = useCompareStore();
  const isCompared = isInCompare(productId);

  const categoryTitle = typeof product.category === 'object' && product.category !== null
    ? product.category.name
    : typeof product.category === 'string'
    ? product.category
    : product.categoryName || 'Curated Atelier';

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
  const secondaryImage = product.images?.[1] || primaryImage;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full min-h-[550px] glass-luxury-card specular-border rounded-3xl overflow-hidden will-change-transform transition-all duration-300"
    >
      {/* Visual Image Container with Dual-Angle Scrub */}
      <div className="block relative h-[280px] w-full overflow-hidden bg-surface-100 dark:bg-surface-950">
        <Link href={`/products/${productId}`} prefetch={false} className="absolute inset-0 z-0">
          <Image
            src={isHovered && product.images && product.images.length > 1 ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-all duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Top Badges: Category & Compare Action */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
          <span className="specular-pill shadow-sm pointer-events-auto text-[10px] font-bold text-surface-900 dark:text-white">
            {categoryTitle}
          </span>

          {/* Quick Compare Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCompare({
                id: productId,
                name: product.name,
                price: product.basePrice,
                image: primaryImage,
                category: categoryTitle,
                storeName: product.storeName,
                rating: product.rating,
                numReviews: product.numReviews,
              });
            }}
            aria-label={isCompared ? "Remove from comparison" : "Add to side-by-side comparison"}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-xl transition-all duration-200 ${
              isCompared
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                : 'bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/20'
            }`}
          >
            {isCompared ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Subtle Bottom Ambient Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Content Details */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          {/* Metadata Row: Rating & Verified Maker */}
          <div className="flex items-center justify-between mb-2.5 min-h-[24px]">
            <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                {(product.rating || 4.9).toFixed(1)}
              </span>
              <span className="text-surface-400 text-[10px]">({product.numReviews || 24})</span>
            </div>

            {product.storeName && (
              <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 truncate max-w-[130px]">
                {product.storeName}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/products/${productId}`} prefetch={false}>
            <h3 className="text-base font-bold text-surface-900 dark:text-white mb-2 line-clamp-2 min-h-[44px] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors font-sans tracking-tight leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Editorial Description */}
          <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2 leading-relaxed mb-4 font-normal">
            {product.description}
          </p>
        </div>

        {/* Price & Primary Action */}
        <div className="pt-4 border-t border-surface-200/50 dark:border-surface-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-surface-400">
              Direct Atelier Payout
            </span>
            <span className="text-2xl font-black text-surface-900 dark:text-white font-geist tracking-tight">
              ${(product.basePrice ?? 0).toFixed(2)}
            </span>
          </div>

          <AddToCartButton
            productId={productId}
            name={product.name}
            price={product.basePrice ?? 0}
            image={primaryImage}
            size="icon"
            showLabel={false}
            className="rounded-full shadow-lg h-11 w-11 bg-brand-600 hover:bg-brand-500 text-white border-0 transition-all flex items-center justify-center hover:scale-105"
          />
        </div>
      </div>
    </article>
  );
}
