/**
 * Super Admin — Escrow Financials & Split Payouts Console
 * 
 * Inspect platform GMV, funds held in Stripe Connect escrow vaults,
 * commission take-rates, and release vendor payouts.
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-frontend-developer
 */

'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  DollarSign, ShieldCheck, Lock, RefreshCw, 
  ArrowUpRight, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function AdminFinancialsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [triggeringPayout, setTriggeringPayout] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminFinancials'],
    queryFn: async () => {
      const res = await fetch('/api/admin/financials', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch financial metrics');
      const json = await res.json();
      return json.data || { metrics: {}, orders: [] };
    },
    enabled: !!user,
  });

  const handleTriggerPayouts = async () => {
    try {
      setTriggeringPayout(true);
      const res = await fetch('/api/payments/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Payout cycle failed');
      toast.success(json.message || 'Payout cycle executed successfully');
      queryClient.invalidateQueries({ queryKey: ['adminFinancials'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger payout cycle');
    } finally {
      setTriggeringPayout(false);
    }
  };

  const metrics = data?.metrics || {
    totalGMV: 0,
    escrowLocked: 0,
    settledPayouts: 0,
    platformFees: 0,
    totalOrders: 0,
  };

  const orders = data?.orders || [];

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            Escrow Financials & Split Payouts
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Multi-vendor double-entry ledger: Stripe Connect escrow vaults, automated 10% platform fees, and vendor transfers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Ledger
          </Button>
          <Button variant="primary" loading={triggeringPayout} onClick={handleTriggerPayouts}>
            <ShieldCheck className="h-4 w-4 mr-2" />
            Run Settlement Cycle
          </Button>
        </div>
      </div>

      {/* Financial Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <p className="text-label-md text-on-surface-variant mb-1">Gross Merchandise Value (GMV)</p>
          <p className="text-headline-lg text-on-surface font-geist font-bold">${metrics.totalGMV?.toFixed(2)}</p>
          <span className="text-[10px] text-surface-400 mt-2 block">Total transacted volume</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-amber-500/20">
          <p className="text-label-md text-amber-400 mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Escrow Vault Held
          </p>
          <p className="text-headline-lg text-amber-300 font-geist font-bold">${metrics.escrowLocked?.toFixed(2)}</p>
          <span className="text-[10px] text-amber-500/80 mt-2 block">Awaiting delivery approval</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-emerald-500/20">
          <p className="text-label-md text-emerald-400 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Settled Vendor Payouts
          </p>
          <p className="text-headline-lg text-emerald-300 font-geist font-bold">${metrics.settledPayouts?.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-500/80 mt-2 block">Remitted to Stripe Connect accounts</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-purple-500/20">
          <p className="text-label-md text-purple-400 mb-1 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> Platform Revenue
          </p>
          <p className="text-headline-lg text-purple-300 font-geist font-bold">${metrics.platformFees?.toFixed(2)}</p>
          <span className="text-[10px] text-purple-400/80 mt-2 block">10% Platform commission</span>
        </div>
      </div>

      {/* Orders Escrow Ledger */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-lg text-on-surface">No Orders Recorded</h3>
          <p className="text-xs">Once orders are placed on the marketplace, escrow ledger items appear here.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          <div className="p-4 border-b border-white/5 font-bold text-sm text-on-surface flex items-center justify-between">
            <span>Recent Escrow Transactions & Order Splits</span>
            <span className="text-xs text-on-surface-variant font-normal">Showing {orders.length} orders</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment</th>
                  <th className="py-3.5 px-4">Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o: any) => {
                  const isDelivered = o.aggregateStatus === 'delivered';
                  const isPaid = o.paymentStatus === 'completed';

                  return (
                    <tr key={o.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-on-surface text-xs">{o.id.slice(0, 16)}...</div>
                        <div className="text-surface-400 text-[10px]">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-on-surface">{o.customer?.name || 'Guest'}</div>
                        <div className="text-surface-400 text-[10px]">{o.customer?.email}</div>
                      </td>
                      <td className="py-4 px-4 font-geist font-bold text-on-surface text-sm">
                        ${Number(o.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={isPaid ? 'success' : 'outline'}>
                          {o.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize font-semibold text-on-surface-variant">
                          {o.aggregateStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isPaid && isDelivered ? (
                          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Payout Settled
                          </span>
                        ) : isPaid ? (
                          <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Escrow Vault Locked
                          </span>
                        ) : (
                          <span className="text-surface-400 font-medium text-[11px]">
                            Pending Payment
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
