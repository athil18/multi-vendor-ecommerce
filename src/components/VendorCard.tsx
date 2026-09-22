/**
 * 25-Lakh Tier Luxury Vendor Atelier Card
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent design-ux-architect
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Store, Star, CheckCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
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
    location?: string;
  };
}

export function VendorCard({ store }: VendorCardProps) {
  const initials = store.name ? store.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ST';
  const location = store.location || 'European Guild Atelier';
  
  return (
    <div
      className="glass-luxury-card specular-border rounded-3xl overflow-hidden flex flex-col group relative h-full will-change-transform"
    >
      {/* Cover Image with Ambient Vignette */}
      <div className="h-40 w-full relative bg-surface-100 dark:bg-surface-800 flex-shrink-0 overflow-hidden">
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
            <span className="text-white/20 font-black tracking-widest uppercase text-xs">Master Atelier Studio</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="px-6 pb-6 pt-0 flex flex-col flex-grow relative z-10">
        {/* Avatar Overlay */}
        <div className="flex justify-between items-end -mt-8 mb-3.5 min-h-[48px]">
          <div className="relative h-16 w-16 rounded-2xl bg-white dark:bg-surface-800 border-2 border-white dark:border-surface-700 shadow-xl overflow-hidden flex items-center justify-center flex-shrink-0">
            {store.logoUrl ? (
              <Image src={store.logoUrl} alt={store.name} fill sizes="64px" className="object-cover" />
            ) : (
              <span className="font-black text-brand-600 dark:text-brand-400 text-base tracking-wider">
                {initials}
              </span>
            )}
          </div>
          {store.isVerified && (
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/20 shadow-sm mb-1 backdrop-blur-md">
              <CheckCircle className="h-3 w-3 text-emerald-500" /> VERIFIED ATELIER
            </div>
          )}
        </div>

        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-surface-400 font-medium mb-1">
              <MapPin className="h-3 w-3 text-brand-500" />
              <span>{location}</span>
            </div>

            <Link href={`/store/${store._id}`} prefetch={false}>
              <h3 className="text-base font-bold text-surface-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1 font-sans">
                {store.name}
              </h3>
            </Link>
            
            <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2 leading-relaxed mb-5 font-normal">
              {store.description}
            </p>
          </div>
          
          <div className="pt-4 border-t border-surface-200/50 dark:border-surface-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-semibold text-surface-700 dark:text-surface-300">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-surface-900 dark:text-white">{store.rating ? store.rating.toFixed(1) : '4.9'}</span>
              </div>
              <span className="text-surface-300 dark:text-surface-700">&bull;</span>
              <div className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
                <Store className="h-3.5 w-3.5" />
                <span>{store.productCount || 18} Masterpieces</span>
              </div>
            </div>
            
            <Link href={`/store/${store._id}`} prefetch={false}>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label={`Visit atelier ${store.name}`}
                className="h-9 w-9 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-all shadow-sm"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
