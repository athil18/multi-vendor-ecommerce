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
      className="w-full bg-[#fcfcfd] dark:bg-[#0a0a0c] border-b border-black/[0.08] dark:border-white/[0.08] py-2.5 px-4 sm:px-6 lg:px-8 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto">
        {/* Desktop & Tablet: 4-Column Balanced Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center font-mono">
          {TRUST_SIGNALS.map((signal, idx) => {
            const Icon = signal.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-1 rounded-lg transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              >
                <div className="h-8 w-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] text-[#111113] dark:text-white flex items-center justify-center flex-shrink-0 border border-black/10 dark:border-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[#111113] dark:text-white tracking-wider uppercase truncate font-mono">
                    {signal.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate leading-tight font-sans">
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
