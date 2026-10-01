/**
 * Level 1 — Core Promotional Banner Component
 * 
 * Communicates: What is offered → Why it matters → Real dispatch/event timing
 * Ethical CRO: Real countdown based on daily courier dispatch cutoff (no fake scarcity)
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent testing-accessibility-auditor
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, X, ArrowRight, ShieldCheck } from 'lucide-react';

export function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('nexus_promo_dismissed') !== 'true';
      } catch {
        return true;
      }
    }
    return true;
  });
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 4,
    minutes: 28,
    seconds: 45,
  });

  // Legitimate real-time countdown to daily 4:00 PM EST dispatch cutoff
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Calculate target: Today at 16:00:00 EST / 21:00:00 UTC
      const target = new Date();
      target.setUTCHours(21, 0, 0, 0);

      // If already past today's cutoff, target next day's cutoff
      if (now.getTime() > target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('nexus_promo_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Promotional Announcement"
      className="relative z-50 bg-gradient-to-r from-surface-950 via-brand-950 to-surface-950 text-white border-b border-brand-500/20 shadow-inner px-4 py-2.5 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-medium">
        
        {/* Left: What is offered & Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold text-[10px] tracking-wider uppercase border border-brand-500/30">
            <Sparkles className="w-3 h-3 text-brand-400 animate-pulse" />
            Atelier Season
          </span>
          <p className="truncate text-surface-200">
            <strong className="text-white font-semibold">Complimentary Inspected Shipping</strong> on orders over $150 + Free Artisan Leather Pouch ($35 Value).
          </p>
        </div>

        {/* Center / Right: Legitimate Timing & Action Link */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Dispatch Cutoff Countdown */}
          <div 
            className="hidden md:flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/10 text-[11px] text-surface-300"
            title="Orders confirmed before cutoff receive same-day insured direct-workshop dispatch"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-surface-400">Dispatch cutoff in:</span>
            <span className="font-mono font-bold text-amber-300">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Quick Action Link */}
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-300 hover:text-white transition-colors underline decoration-brand-500/40 underline-offset-4 hover:decoration-white"
          >
            <span>Explore Curated Offerings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss promotional banner"
            className="p-1 rounded-full text-surface-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
