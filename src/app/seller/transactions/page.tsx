/**
 * Seller Transactions & Order Fulfillment History Page
 * 
 * @agent engineering-frontend-developer
 */

'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Receipt, RefreshCw, CheckCircle2, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useQuery } from '@tanstack/react-query';

export default function SellerTransactionsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const { data: orders = [] as any[], isLoading, refetch } = useQuery({
    queryKey: ['sellerTransactions'],
    queryFn: async () => {
      const res = await fetch('/api/seller/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            Order Transactions & Escrow
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Track multi-vendor order items, fulfill parcels, and monitor escrow settlement releases.
          </p>
        </div>
        <Button variant="primary" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Orders
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-lg text-on-surface">No Orders Received Yet</h3>
          <p className="text-xs">When shoppers purchase your specimens, fulfillment records appear here.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Specimen Item</th>
                  <th className="py-3.5 px-4">Net Payout</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4">Escrow Release</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o: any) => (
                  <tr key={o._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-on-surface text-xs">{o.orderId.slice(0, 14)}...</div>
                      <div className="text-surface-400 text-[10px]">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface">
                      {o.productName} &times; {o.quantity}
                    </td>
                    <td className="py-3.5 px-4 font-geist font-bold text-emerald-400 text-sm">
                      ${(o.price * o.quantity * 0.90).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'shipped' ? 'default' : 'outline'}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-surface-400 font-medium">
                      {o.status === 'delivered' ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Released
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Escrow Hold
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
