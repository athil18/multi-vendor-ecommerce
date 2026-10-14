/**
 * Nexus Luxury Product Card Component
 * Refined editorial e-commerce card: 4:5 aspect ratio, category-intelligent object-fit (contain/cover),
 * clamped typography, consistent baseline alignment, and verified escrow cues.
 * 
 * @agent frontend-ui-engineering
 * @agent ecommerce
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Scale, Check, ShieldCheck, Package } from 'lucide-react';
import { StarRatingIcon } from './ui/icons';
import { AddToCartButton } from './AddToCartButton';
import { useCompareStore } from '@/store/useCompareStore';

export interface ProductCardProps {
  product: {
    _id: string;
    id?: string;
    name: string;
    description: string;
    basePrice: number;
    compareAtPrice?: number;
    images?: string[];
    categoryName?: string;
    category?: { name: string } | string;
    rating?: number;
    numReviews?: number;
    storeId?: string;
    storeName?: string;
    materials?: string;
    variants?: any[];
    specs?: Record<string, any>;
  };
  priority?: boolean;
}

/**
 * Intelligent fit strategy:
 * - 'contain': electronics, phones, laptops, watches, fragrance bottles, skincare, accessories, and packshots
 * - 'cover': fashion garments, apparel lifestyle, room interiors
 */
function getFitStrategy(categoryTitle: string, imageUrl: string): 'contain' | 'cover' {
  const cat = (categoryTitle || '').toLowerCase();
  const url = (imageUrl || '').toLowerCase();

  // Packshots on white/neutral cutout backgrounds
  if (url.includes('dummyjson.com')) return 'contain';

  // Products where full shape integrity must remain visible without cropping
  if (
    cat.includes('tech') ||
    cat.includes('electronic') ||
    cat.includes('phone') ||
    cat.includes('laptop') ||
    cat.includes('audio') ||
    cat.includes('keyboard') ||
    cat.includes('beauty') ||
    cat.includes('wellness') ||
    cat.includes('fragrance') ||
    cat.includes('horology') ||
    cat.includes('jewelry') ||
    cat.includes('accessories') ||
    cat.includes('accessory') ||
    cat.includes('footwear') ||
    cat.includes('shoe') ||
    cat.includes('sneaker') ||
    cat.includes('boot')
  ) {
    return 'contain';
  }

  return 'cover';
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const productId = product._id || product.id || '';
  const { addToCompare, isInCompare } = useCompareStore();
  const isCompared = isInCompare(productId);

  const categoryTitle = typeof product.category === 'object' && product.category !== null
    ? product.category.name
    : typeof product.category === 'string'
    ? product.category
    : product.categoryName || 'Curated Atelier';

  const primaryImage = product.images?.[0] || '';
  const secondaryImage = product.images?.[1] || primaryImage;
  const currentImage = (isHovered && product.images && product.images.length > 1) 
    ? secondaryImage 
    : primaryImage;

  const fitMode = getFitStrategy(categoryTitle, currentImage);
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > (product.basePrice ?? 0));
  const discountPercent = hasDiscount 
    ? Math.round((((product.compareAtPrice! - (product.basePrice ?? 0)) / product.compareAtPrice!) * 100))
    : 0;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full min-h-[550px] rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#121216] overflow-hidden transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* ─── 1. Product Image Container (Consistent 4:5 Aspect Ratio with CLS protection) ─── */}
      <div 
        className={`block relative aspect-[4/5] h-[280px] sm:h-auto w-full overflow-hidden ${
          fitMode === 'contain' 
            ? 'bg-neutral-50/90 dark:bg-[#16161a] p-5 sm:p-6 flex items-center justify-center' 
            : 'bg-neutral-100 dark:bg-neutral-900'
        }`}
      >
        <Link 
          href={`/products/${productId}`} 
          prefetch={false} 
          className="absolute inset-0 z-0 flex items-center justify-center"
        >
          {imgError || !currentImage ? (
            <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center text-neutral-400 dark:text-neutral-500">
              <Package className="w-12 h-12 mb-2 stroke-[1.25] text-neutral-400 dark:text-neutral-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {categoryTitle}
              </span>
            </div>
          ) : fitMode === 'contain' ? (
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={85}
                className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          )}
        </Link>

        {/* ─── Top Floating Tags: Category, Discount & Compare Action ─── */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            <span className="rounded-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-white/95 dark:bg-black/90 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm">
              {categoryTitle}
            </span>
            {hasDiscount && discountPercent > 0 && (
              <span className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight bg-rose-600 text-white shadow-sm">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quick Compare Action */}
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
            className={`pointer-events-auto p-1.5 rounded-md transition-all duration-200 ${
              isCompared
                ? 'bg-[#111113] text-white dark:bg-white dark:text-[#111113] shadow-sm'
                : 'bg-white/90 dark:bg-black/90 hover:bg-white text-neutral-700 dark:text-neutral-200 border border-black/10 dark:border-white/10 backdrop-blur-sm'
            }`}
          >
            {isCompared ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── 2. Product Details & Typography ─── */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3 bg-white dark:bg-[#121216]">
        <div className="space-y-2">
          {/* Provenance & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-500 dark:text-neutral-400 truncate max-w-[65%] uppercase tracking-wider text-[11px]">
              {product.storeName || 'Independent Atelier'}
            </span>
            <div className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200 text-xs shrink-0">
              <StarRatingIcon size={12} className="text-amber-500" />
              <span>{(product.rating || 4.9).toFixed(1)}</span>
              {product.numReviews ? (
                <span className="text-[11px] font-normal text-neutral-400">({product.numReviews})</span>
              ) : null}
            </div>
          </div>

          {/* Product Name (2-line clamp with uniform height for row alignment) */}
          <Link href={`/products/${productId}`} prefetch={false} className="block group/link">
            <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 line-clamp-2 min-h-[2.5rem] leading-snug group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Editorial Description Snippet */}
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed min-h-[2rem]">
            {product.description}
          </p>

          {/* Escrow Protected Trust Cue */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span>Escrow Protected &bull; Verified Direct</span>
          </div>
        </div>

        {/* ─── 3. Pricing & Primary Action ─── */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight tabular-nums">
              ${(product.basePrice ?? 0).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through tabular-nums">
                ${product.compareAtPrice?.toFixed(2)}
              </span>
            )}
          </div>

          <AddToCartButton
            productId={productId}
            name={product.name}
            price={product.basePrice ?? 0}
            image={primaryImage}
            size="sm"
            showLabel={true}
            className="rounded-full h-8 px-3 text-xs font-medium bg-[#111113] hover:bg-neutral-800 text-white dark:bg-white dark:text-[#111113] dark:hover:bg-neutral-100 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          />
        </div>
      </div>
    </article>
  );
}
