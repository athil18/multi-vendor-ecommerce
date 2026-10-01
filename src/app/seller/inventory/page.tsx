/**
 * Seller Inventory & Product Catalog Management Page
 * 
 * @agent engineering-frontend-developer
 */

'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Package, Plus, Search, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

export default function SellerInventoryPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sellerInventory', search],
    queryFn: async () => {
      const res = await fetch(`/api/seller/products?keyword=${search}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load inventory');
      return await res.json();
    },
    enabled: !!user,
  });

  const products = data?.data || [];

  return (
    <div className="px-6 md:px-10 pt-8 pb-12 flex flex-col gap-8 bg-background min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg text-on-surface mb-1 flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Inventory & Catalog
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Manage your artisan specimens, stock availability, and direct-workshop prices.
          </p>
        </div>
        <Button variant="primary" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Stock
        </Button>
      </div>

      <div className="flex items-center gap-3 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Search products by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h3 className="font-bold text-lg text-on-surface">No Products In Inventory</h3>
          <p className="text-xs">Create your first product in the seller dashboard to begin offering it to collectors.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Publication Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden relative bg-surface-800 flex-shrink-0">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <Package className="w-5 h-5 m-auto text-surface-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-sm line-clamp-1">{p.name}</div>
                          <div className="text-surface-400 text-[10px]">{p.category?.name || 'Curated'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-geist font-bold text-on-surface text-sm">
                      ${Number(p.basePrice).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold text-xs ${p.inStock ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-surface-300 font-geist">
                      ★ {Number(p.rating || 5.0).toFixed(1)} ({p.numReviews || 0})
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'published' ? 'success' : 'outline'}>
                        {p.status}
                      </Badge>
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
