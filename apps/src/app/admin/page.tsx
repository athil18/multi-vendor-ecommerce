'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Shield, Package, Users, AlertCircle, RefreshCw, Eye, MessageSquare, Ban } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [] as any[], isLoading: loading, refetch: loadAdminData } = useQuery({
    queryKey: ['adminProducts', statusFilter, searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products?status=${statusFilter}&keyword=${searchQuery}`);
      if (!res.ok) throw new Error('Failed to fetch admin products');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const { data: stats = { totalProducts: 0, pendingProducts: 0 } } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products?status=all');
      if (!res.ok) throw new Error('Failed to load stats');
      const json = await res.json();
      const allProds = json.data || [];
      return {
        totalProducts: json.meta?.total || allProds.length,
        pendingProducts: allProds.filter((p: any) => p.status === 'pending_review').length,
      };
    },
    enabled: !!user,
  });

  const handleModerateProduct = async (productId: string, action: 'published' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Moderation failed');
      }

      toast.success(`Product status successfully updated to ${action}`);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to moderate product');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-grow items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 pt-8 pb-10 flex flex-col gap-8 bg-background min-h-full">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Product Review
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Review catalog items, verify stores, and secure platform policies.
          </p>
        </div>
        <Button variant="primary" onClick={() => loadAdminData()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Queue
        </Button>
      </div>

      {/* Summary Bento — Glass Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/10 rounded-full blur-xl group-hover:bg-tertiary-container/20 transition-all" />
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Platform Catalog Size</p>
            <p className="text-headline-lg text-on-surface">{stats.totalProducts} items</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
            <Package className="h-5 w-5" />
          </div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/5 rounded-full blur-xl group-hover:bg-error/10 transition-all" />
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Needs Review</p>
            <p className="text-headline-lg text-on-surface">{stats.pendingProducts}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center text-error">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Active Creators</p>
            <p className="text-headline-lg text-on-surface">Verified</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
        <div className="flex items-center gap-2">
          {[
            { value: 'pending_review', label: `Review Queue (${stats.pendingProducts})` },
            { value: 'published', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`text-label-md px-4 py-2 rounded-lg transition-all border ${
                statusFilter === tab.value
                  ? 'bg-primary text-on-primary shadow-sm border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-outline-variant/30 hover:bg-surface-variant/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:max-w-xs relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadAdminData()}
          />
        </div>
      </div>

      {/* Data Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No items in queue"
          description={`There are currently no products with the status of ${statusFilter}.`}
        />
      ) : (
        <div className="glass-panel rounded-xl border border-white/5 flex flex-col overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur-md z-10 text-label-md text-on-surface-variant border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-medium">Product</th>
                  <th className="py-3 px-4 font-medium">Brand</th>
                  <th className="py-3 px-4 font-medium text-right">Price</th>
                  <th className="py-3 px-4 font-medium text-right">Stock</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-white/5 bg-surface-container-lowest/30">
                {products.map((p: any) => (
                  <tr key={p._id} className="table-row-hover transition-colors cursor-pointer group">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 relative rounded-lg overflow-hidden bg-surface-container border border-white/5">
                          <Image 
                            src={p.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-on-surface line-clamp-1">{p.name}</div>
                          <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                            {p._id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-on-surface-variant">{p.brandName || '—'}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-on-surface">${p.basePrice}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-on-surface-variant">{p.inventoryCount}</td>
                    <td className="py-2.5 px-4">
                      <Badge 
                        variant={
                          p.status === 'published' ? 'success' 
                          : p.status === 'rejected' ? 'destructive' 
                          : 'warning'
                        }
                      >
                        {(p.status || statusFilter).toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {statusFilter === 'pending_review' ? (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleModerateProduct(p._id, 'published')}
                            className="p-1.5 rounded hover:bg-tertiary-container/20 text-on-surface-variant hover:text-tertiary transition-colors"
                            title="Approve"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleModerateProduct(p._id, 'published')}
                            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
                            title="Approve"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleModerateProduct(p._id, 'rejected')}
                            className="p-1.5 rounded hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-colors"
                            title="Reject"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant/50 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-white/10 bg-surface-container-high/50 p-3 flex items-center justify-between">
            <button className="text-label-md text-on-surface-variant hover:text-on-surface disabled:opacity-50" disabled>
              Previous
            </button>
            <div className="flex gap-1">
              <button className="w-7 h-7 rounded bg-primary/20 text-primary font-mono text-xs border border-primary/30 flex items-center justify-center">
                1
              </button>
            </div>
            <button className="text-label-md text-on-surface-variant hover:text-on-surface">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
