'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Store, DollarSign, Package, TrendingUp, Plus, RefreshCw, ShoppingBag, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import Image from 'next/image';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function SellerPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [creatingStore, setCreatingStore] = useState(false);

  // Form states for Store creation
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');

  const { data: store, isLoading: loading, refetch: loadSellerData } = useQuery({
    queryKey: ['sellerStore'],
    queryFn: async () => {
      const res = await fetch('/api/seller/store', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    },
    enabled: !!user,
  });

  const { data: metrics } = useQuery({
    queryKey: ['sellerMetrics'],
    queryFn: async () => {
      const res = await fetch('/api/seller/dashboard', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to load metrics');
      return await res.json();
    },
    enabled: !!store && !!user,
  });

  const { data: orders = [] as any[] } = useQuery({
    queryKey: ['sellerOrders'],
    queryFn: async () => {
      const res = await fetch('/api/seller/orders', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!store && !!user,
  });

  const { data: payoutStatus } = useQuery({
    queryKey: ['sellerPayoutStatus'],
    queryFn: async () => {
      const res = await fetch('/api/payments/payout-status', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to load payout status');
      return await res.json();
    },
    enabled: !!store && !!user,
  });

  // Create store handler
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingStore(true);
      const res = await fetch('/api/seller/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeName, description, logo }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create store');

      toast.success('Store setup successfully!');
      queryClient.invalidateQueries({ queryKey: ['sellerStore'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create store');
    } finally {
      setCreatingStore(false);
    }
  };

  // Update order item status handler
  const handleUpdateOrderStatus = async (itemId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/seller/orders/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to update order status');
      }

      toast.success(`Order item status updated to ${newStatus}`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sellerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['sellerMetrics'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  // Connect Stripe handler
  const handleStripeOnboarding = async () => {
    try {
      toast.info('Redirecting to Stripe Express onboarding...');
      const res = await fetch('/api/payments/onboarding', {
        method: 'POST',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Onboarding failed');

      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Stripe onboarding setup failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // If seller doesn't have a store setup yet
  if (!store) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-primary-container/20 p-4 border border-primary/20 text-primary">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-display-lg text-on-surface">Set Up Your Store</h1>
          <p className="text-body-sm text-on-surface-variant max-w-md">
            Open your custom nexus storefront, publish products, and start receiving orders from buyers worldwide.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleCreateStore} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <Label>Store Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. AeroTech Store"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Store Description</Label>
                <Textarea
                  placeholder="Write a brief pitch about what you create..."
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Store Logo URL (Optional)</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                />
              </div>

              <Button type="submit" loading={creatingStore} className="w-full">
                {creatingStore ? 'Initializing Store...' : 'Launch My Store'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Store Dashboard
  return (
    <div className="px-6 md:px-10 pt-8 pb-10 flex flex-col gap-8 bg-background min-h-full">
      
      {/* Store Header & Payout Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-outline-variant/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-primary-container/20 text-primary rounded-xl flex items-center justify-center font-bold text-xl border border-primary/20 relative overflow-hidden">
            {store.logo ? <Image src={store.logo} alt="logo" fill sizes="56px" className="object-cover rounded-xl" /> : store.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-headline-lg text-on-surface">{store.name}</h1>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5">Seller ID: {store._id}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {(!payoutStatus || !payoutStatus.detailsSubmitted) ? (
             <Button variant="outline" onClick={handleStripeOnboarding}>
               <DollarSign className="h-4 w-4 mr-1.5" />
               Setup Stripe Payouts
             </Button>
          ) : (
            <Badge variant="success" className="h-10 py-0 flex items-center shadow-none text-sm px-4">
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Stripe Active
            </Badge>
          )}
          
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-1.5" />
            New Product
          </Button>
        </div>
      </div>

      {/* Metrics Grid — Glass Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/10 rounded-full blur-xl group-hover:bg-tertiary-container/20 transition-all" />
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Gross Revenue</p>
            <p className="text-headline-lg text-on-surface">${(metrics?.totalRevenue || 0).toFixed(2)}</p>
            <p className="text-xs font-medium text-tertiary mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +14.5% vs last month
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-all" />
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Pending Payout</p>
            <p className="text-headline-lg text-on-surface">${(metrics?.pendingPayout || 0).toFixed(2)}</p>
            <p className="text-xs text-on-surface-variant mt-1">Available for withdrawal</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Total Orders</p>
            <p className="text-headline-lg text-on-surface">{metrics?.totalOrders || 0}</p>
            <p className="text-xs text-on-surface-variant mt-1">All-time units moved</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Active Products</p>
            <p className="text-headline-lg text-on-surface">{metrics?.activeProducts || 0}</p>
            <p className="text-xs text-on-surface-variant mt-1">Live on marketplace</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
            <Package className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="glass-panel rounded-xl border border-white/5 flex flex-col overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        <div className="border-b border-white/10 p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-title-md text-on-surface">Recent Fulfillment Queue</h2>
          <Button variant="outline" size="sm" onClick={() => loadSellerData()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No items to fulfill"
              description="When customers purchase your items, they will appear here for you to fulfill and ship."
              className="py-12"
            />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur-md z-10 text-label-md text-on-surface-variant border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-medium">Order ID / Date</th>
                  <th className="py-3 px-4 font-medium">Item Details</th>
                  <th className="py-3 px-4 font-medium text-right">Revenue</th>
                  <th className="py-3 px-4 font-medium text-center">Fulfillment Status</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-white/5 bg-surface-container-lowest/30">
                {orders.map((orderItem: any) => (
                  <tr key={orderItem._id} className="table-row-hover transition-colors group">
                    <td className="py-2.5 px-4">
                      <div className="font-mono text-xs text-on-surface font-bold">{orderItem.orderId.substring(0,8)}...</div>
                      <div className="text-xs text-on-surface-variant mt-1">{new Date(orderItem.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-on-surface line-clamp-1">{orderItem.productName}</div>
                      <div className="text-xs text-on-surface-variant mt-1">Qty: {orderItem.quantity} &bull; <span className="font-mono">{orderItem._id.substring(0,6)}</span></div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-on-surface">
                      ${(orderItem.price * orderItem.quantity).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={orderItem.status === 'delivered' ? 'success' : orderItem.status === 'shipped' ? 'default' : 'warning'}>
                        {orderItem.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {orderItem.status === 'pending' || orderItem.status === 'processing' ? (
                         <Select
                          value=""
                          onChange={(e) => handleUpdateOrderStatus(orderItem._id, e.target.value)}
                          className="text-xs py-1.5 pr-8 pl-3 w-32 ml-auto"
                        >
                          <option value="" disabled>Update...</option>
                          <option value="shipped">Mark Shipped</option>
                        </Select>
                      ) : (
                        <span className="text-xs text-on-surface-variant/50 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
}
