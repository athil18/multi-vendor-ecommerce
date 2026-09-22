/**
 * Live Global Buyer Activity Ticker
 * Dispatches subtle, non-intrusive verified acquisitions from collectors worldwide.
 * 
 * @agent design-ui-designer
 * @agent design-whimsy-injector
 * @agent design-ux-architect
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: string;
  buyerLocation: string;
  action: string;
  productName: string;
  productHref: string;
  timeAgo: string;
  badge: string;
}

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    buyerLocation: 'Tokyo, Japan',
    action: 'acquired',
    productName: 'Custom CNC Aluminum Planar Headphones',
    productHref: '/products',
    timeAgo: '2m ago',
    badge: 'Artisan Batch',
  },
  {
    id: 'act-2',
    buyerLocation: 'Copenhagen, Denmark',
    action: 'reserved',
    productName: 'Hand-Stitched Tuscan Leather Weekender',
    productHref: '/products',
    timeAgo: '6m ago',
    badge: 'Limited Run',
  },
  {
    id: 'act-3',
    buyerLocation: 'San Francisco, USA',
    action: 'commissioned',
    productName: 'Aero Carbon Endurance Road Frame',
    productHref: '/products',
    timeAgo: '11m ago',
    badge: '100% Escrow',
  },
  {
    id: 'act-4',
    buyerLocation: 'Milan, Italy',
    action: 'acquired',
    productName: 'Nordic Oak & Matte Brass Luminary Desk Lamp',
    productHref: '/products',
    timeAgo: '18m ago',
    badge: 'Verified Maker',
  },
];

export function LiveBuyerActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length);
    }, 12000);

    return () => clearInterval(timer);
  }, [isVisible, isPaused]);

  if (!isVisible) return null;

  const current = RECENT_ACTIVITIES[currentIndex];

  return (
    <aside
      aria-label="Recent Collector Activity"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-6 left-6 z-40 max-w-sm hidden sm:block animate-in fade-in slide-in-from-bottom-4 duration-500 will-change-transform"
    >
      <div className="glass-luxury-card specular-border p-3.5 rounded-2xl flex items-center gap-3.5 shadow-2xl relative group">
        {/* Pulsing Verified Indicator */}
        <div className="relative flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-brand-500/10 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              {current.buyerLocation}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-semibold">
              {current.timeAgo}
            </span>
          </div>

          <Link
            href={current.productHref}
            className="block text-xs font-bold text-surface-900 dark:text-white truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {current.productName}
          </Link>

          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>Verified Atelier Acquisition</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss activity feed"
          className="absolute top-2 right-2 p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors rounded-full opacity-60 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
