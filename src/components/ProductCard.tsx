/**
 * High-Performance Product Card Component (Zero-JS Server Component)
 * 
 * @agent design-ui-designer
 * @agent design-ui-finish-gate-reviewer
 * @agent design-brand-guardian
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 * @agent testing-performance-benchmarker
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, PackageOpen } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    images?: string[];
    categoryName?: string;
    category?: { name: string };
    rating?: number;
    numReviews?: number;
    storeId?: string;
    storeName?: string;
  };
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <div
      className="group relative flex flex-col h-full bg-white dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200/80 dark:border-surface-800 shadow-sm hover:border-brand-500/40 hover:shadow-xl transition-all duration-300 will-change-transform"
    >
      <Link href={`/products/${product._id}`} prefetch={false} className="block relative aspect-[4/3] w-full overflow-hidden bg-surface-100 dark:bg-surface-950">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-100 dark:bg-surface-900">
            <PackageOpen className="w-12 h-12 text-surface-300 dark:text-surface-700" />
          </div>
        )}
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10 shadow-sm">
            {product.category?.name || product.categoryName || 'General'}
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between mb-2 min-h-[24px]">
            {product.rating ? (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="text-amber-700 dark:text-amber-300 font-bold text-xs">{product.rating.toFixed(1)}</span>
                <span className="text-surface-400 text-[10px]">({product.numReviews})</span>
              </div>
            ) : (
              <span className="text-brand-600 dark:text-brand-400 font-bold text-xs">Handcrafted</span>
            )}
            
            {product.storeName && (
              <Link href={`/store/${product.storeId || ''}`} prefetch={false} className="text-xs font-medium text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate max-w-[130px]">
                {product.storeName}
              </Link>
            )}
          </div>

          <Link href={`/products/${product._id}`} prefetch={false}>
            <h3 className="text-base font-bold text-surface-900 dark:text-white mb-1.5 line-clamp-2 min-h-[44px] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors font-sans tracking-tight leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>
        
        <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-surface-400">Price</span>
            <span className="text-xl font-black text-surface-900 dark:text-white font-geist tracking-tight">
              ${(product.basePrice ?? 0).toFixed(2)}
            </span>
          </div>
          <AddToCartButton
            productId={product._id}
            name={product.name}
            price={product.basePrice ?? 0}
            image={product.images?.[0]}
            size="icon"
            showLabel={false}
            className="rounded-full shadow-md h-10 w-10 bg-brand-600 hover:bg-brand-500 text-white border-0 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
