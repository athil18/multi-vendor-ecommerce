/**
 * Super Admin — Creator Store & Seller Governance Console
 * 
 * Inspect seller trust scores, KYC verification status, Stripe Connect onboarding,
 * and enforce administrative probation or suspensions.
 * 
 * @agent engineering-frontend-developer
 * @agent security-appsec-engineer
 */

'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Shield, Store, CheckCircle2, AlertTriangle, 
  Ban, RefreshCw, Search, ExternalLink, Award 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

export default function AdminGovernancePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stores = [] as any[], isLoading, refetch } = useQuery({
    queryKey: ['adminGovernanceSellers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/governance/sellers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch stores');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const handleEnforceSeller = async (storeId: string, action: 'probation' | 'suspend' | 'reinstate') => {
    try {
      const res = await fetch(`/api/admin/governance/sellers/${storeId}/enforce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, reason: `Administrative ${action} enforced via Super Admin Console` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Enforcement action failed');
      toast.success(`Action '${action}' applied to store`);
      queryClient.invalidateQueries({ queryKey: ['adminGovernanceSellers'] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredStores = stores.filter((s: any) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sellerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgTrustScore = stores.length > 0
    ? Math.round(stores.reduce((acc: number, s: any) => acc + (s.trustScore || 100), 0) / stores.length)
    : 100;

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Seller & Store Governance
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Super Admin oversight: Monitor merchant KYC, Stripe Connect onboarding, and platform trust metrics.
          </p>
        </div>
        <Button variant="primary" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Registry
        </Button>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-label-md text-on-surface-variant mb-1">Active Merchant Stores</p>
          <p className="text-headline-lg text-on-surface font-geist font-bold">{stores.length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-label-md text-on-surface-variant mb-1">Average Trust Score</p>
          <p className="text-headline-lg text-emerald-400 font-geist font-bold">{avgTrustScore}%</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-label-md text-on-surface-variant mb-1">Stripe Onboarding Rate</p>
          <p className="text-headline-lg text-primary font-geist font-bold">
            {stores.length > 0
              ? `${Math.round((stores.filter((s: any) => s.stripeOnboardingComplete).length / stores.length) * 100)}%`
              : '100%'}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Search stores by name or creator email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {/* Stores Registry Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant">
          <Store className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-lg text-on-surface">No Creator Stores Found</h3>
          <p className="text-xs">No stores match the current search query.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Store & Creator</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Trust Score</th>
                  <th className="py-3.5 px-4">Stripe Onboarding</th>
                  <th className="py-3.5 px-4">Payouts</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStores.map((store: any) => (
                  <tr key={store.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-on-surface text-sm">{store.name}</div>
                      <div className="text-surface-400 text-[11px]">{store.sellerEmail}</div>
                    </td>
                    <td className="py-4 px-4 font-geist font-semibold">
                      {store.productCount} items
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        store.trustScore >= 90
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : store.trustScore >= 70
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {store.trustScore || 100}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {store.stripeOnboardingComplete ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Incomplete
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {store.payoutsEnabled ? (
                        <Badge variant="success">Enabled</Badge>
                      ) : (
                        <Badge variant="outline">On Hold</Badge>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize font-semibold text-on-surface-variant">
                        {store.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <Link href={`/store/${store.sellerId}`} target="_blank">
                        <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7 px-2">
                          <ExternalLink className="w-3 h-3 mr-1" /> View Store
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnforceSeller(store.id, store.status === 'suspended' ? 'reinstate' : 'suspend')}
                        className={`rounded-lg text-[10px] h-7 px-2 ${
                          store.status === 'suspended'
                            ? 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                            : 'text-red-400 border-red-500/30 hover:bg-red-500/10'
                        }`}
                      >
                        {store.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                      </Button>
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
