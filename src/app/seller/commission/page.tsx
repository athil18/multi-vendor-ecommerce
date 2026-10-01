/**
 * Seller Commission & Payout Economics Page
 * 
 * @agent engineering-payments-billing-engineer
 */

'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { DollarSign, Percent, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/Toast';

export default function SellerCommissionPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['sellerMetricsCommission'],
    queryFn: async () => {
      const res = await fetch('/api/seller/dashboard', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load metrics');
      return await res.json();
    },
    enabled: !!user,
  });

  const { data: payoutStatus } = useQuery({
    queryKey: ['sellerPayoutStatusCommission'],
    queryFn: async () => {
      const res = await fetch('/api/payments/payout-status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load payout status');
      return await res.json();
    },
    enabled: !!user,
  });

  const handleStripeOnboarding = async () => {
    try {
      const res = await fetch('/api/payments/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.success('Stripe Connect onboarding simulated or complete');
      }
    } catch {
      toast.error('Failed to initiate Stripe onboarding');
    }
  };

  const totalRevenue = metrics?.totalRevenue || 0;
  const netEarnings = totalRevenue * 0.90;
  const platformFee = totalRevenue * 0.10;

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full max-w-5xl">
      <div>
        <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          Commission & Payout Economics
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          Transparent multi-vendor split: 90% net creator payout, automated Stripe Connect transfers.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl">
              <p className="text-label-md text-on-surface-variant mb-1">Gross Merchant Volume</p>
              <p className="text-headline-lg text-on-surface font-geist font-bold">${totalRevenue.toFixed(2)}</p>
              <span className="text-[10px] text-surface-400">100% of customer orders</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20">
              <p className="text-label-md text-emerald-400 mb-1">Your Net Earnings (90%)</p>
              <p className="text-headline-lg text-emerald-300 font-geist font-bold">${netEarnings.toFixed(2)}</p>
              <span className="text-[10px] text-emerald-500/80">Direct to your bank account</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-purple-500/20">
              <p className="text-label-md text-purple-400 mb-1">Platform Take-Rate (10%)</p>
              <p className="text-headline-lg text-purple-300 font-geist font-bold">${platformFee.toFixed(2)}</p>
              <span className="text-[10px] text-purple-400/80">Payment processing & escrow guarantee</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Stripe Connect Payout Gateway
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Nexus uses Stripe Connect custom accounts. Once tracking confirms delivery of your specimens and the customer&apos;s 14-day inspection elapses, funds are automatically remitted to your bank account.
            </p>

            <div className="pt-2">
              {payoutStatus?.detailsSubmitted ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 w-fit">
                  <CheckCircle2 className="w-4 h-4" /> Your Stripe Payout Account is Active and Verified
                </div>
              ) : (
                <Button variant="primary" onClick={handleStripeOnboarding}>
                  Connect Stripe Bank Account <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
