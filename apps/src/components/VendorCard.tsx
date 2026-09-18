/**
 * High-Performance Vendor Card Component (Zero-JS Server Component)
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent design-ux-architect
 * @agent engineering-frontend-developer
 * @agent testing-performance-benchmarker
 * @agent testing-accessibility-auditor
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Store, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

export interface VendorCardProps {
  store: {
    _id: string;
    name: string;
    description: string;
    logoUrl?: string;
    coverUrl?: string;
    rating?: number;
    productCount?: number;
    isVerified?: boolean;
  };
}

export function VendorCard({ store }: VendorCardProps) {
  const initials = store.name ? store.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ST';
  
  return (
    <div
      className="bg-white dark:bg-surface-900 rounded-2xl overflow-hidden flex flex-col group relative h-full border border-surface-200/80 dark:border-surface-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/40 will-change-transform"
    >
      {/* Cover Image */}
      <div className="h-36 w-full relative bg-surface-100 dark:bg-surface-800 flex-shrink-0 overflow-hidden">
        {store.coverUrl ? (
          <Image
            src={store.coverUrl}
            alt={`${store.name} Cover`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-brand-950 to-indigo-950 flex items-center justify-center">
            <span className="text-white/20 font-black tracking-widest uppercase text-xs">Atelier Studio</span>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-0 flex flex-col flex-grow relative z-10">
        {/* Avatar Overlay */}
        <div className="flex justify-between items-end -mt-7 mb-3 min-h-[44px]">
          <div className="relative h-14 w-14 rounded-xl bg-white dark:bg-surface-800 border-2 border-white dark:border-surface-700 shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
            {store.logoUrl ? (
              <Image src={store.logoUrl} alt={store.name} fill className="object-cover" />
            ) : (
              <span className="font-black text-brand-600 dark:text-brand-400 text-sm tracking-wider">
                {initials}
              </span>
            )}
          </div>
          {store.isVerified && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 shadow-sm mb-1">
              <CheckCircle className="h-3 w-3 text-emerald-500" /> VERIFIED MAKER
            </div>
          )}
        </div>

        <div className="flex-grow flex flex-col justify-between">
          <div>
            <Link href={`/store/${store._id}`} prefetch={false}>
              <h3 className="text-base font-bold text-surface-900 dark:text-white mb-1.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                {store.name}
              </h3>
            </Link>
            
            <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2 leading-relaxed mb-4">
              {store.description}
            </p>
          </div>
          
          <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-semibold text-surface-700 dark:text-surface-300">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-surface-900 dark:text-white">{store.rating ? store.rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-surface-300 dark:text-surface-700">&bull;</span>
              <div className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
                <Store className="h-3.5 w-3.5" />
                <span>{store.productCount || 0} Products</span>
              </div>
            </div>
            
            <Link href={`/store/${store._id}`} prefetch={false}>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label={`Visit store ${store.name}`}
                className="h-8 w-8 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-all"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
