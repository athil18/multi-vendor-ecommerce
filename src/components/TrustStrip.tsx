/**
 * Level 2 — Trust-First Navigation Experience Component
 * 
 * Clean, compact, scannable trust strip positioned immediately below the navigation.
 * Authentic guarantees: Stripe Escrow Vault, Carbon-Neutral Shipping, Verified Workshops, 14-Day Returns.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent testing-accessibility-auditor
 */

'use client';

import React from 'react';
import { ShieldCheck, Truck, Award, RotateCcw } from 'lucide-react';

interface TrustSignal {
  icon: React.ElementType;
  title: string;
  description: string;
}

const TRUST_SIGNALS: TrustSignal[] = [
  {
    icon: ShieldCheck,
    title: 'Stripe Escrow Protected',
    description: 'Funds vaulted until you approve delivery',
  },
  {
    icon: Truck,
    title: 'Complimentary Shipping',
    description: 'On all orders over $150 worldwide',
  },
  {
    icon: Award,
    title: 'Verified Independent Guilds',
    description: 'Direct-from-workshop, zero middlemen',
  },
  {
    icon: RotateCcw,
    title: '14-Day Inspection Window',
    description: 'Full refund guarantee & 24/7 concierge',
  },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Nexus Buyer Trust & Guarantees"
      className="w-full bg-surface-50/90 dark:bg-surface-900/90 border-b border-surface-200/80 dark:border-surface-800/80 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Desktop & Tablet: 4-Column Balanced Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          {TRUST_SIGNALS.map((signal, idx) => {
            const Icon = signal.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-1 rounded-xl transition-colors hover:bg-surface-100/50 dark:hover:bg-surface-800/50"
              >
                <div className="h-9 w-9 rounded-xl bg-brand-500/10 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-surface-900 dark:text-white tracking-tight truncate font-sans">
                    {signal.title}
                  </h3>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 truncate leading-tight">
                    {signal.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
