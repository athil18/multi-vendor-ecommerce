/**
 * Multi-Vendor Marketplace Catalog & Product Discovery
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-ui-finish-gate-reviewer
 * @agent engineering-frontend-developer
 * @agent product-product-manager
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowUpDown, Filter, Sparkles, ShoppingBag, ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/products?limit=200');
        if (!res.ok) throw new Error('Failed to load products');
        const json = await res.json();
        const dbItems = json.data || [];
        if (dbItems.length > 0) {
          return dbItems.map((p: any) => ({
            ...p,
            _id: p.id || p._id,
            images: (p.images && p.images.length > 0) ? p.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
            rating: p.rating || 4.8,
            numReviews: p.numReviews || 24,
          }));
        }
        return FALLBACK_PRODUCTS_LIST;
      } catch {
        return FALLBACK_PRODUCTS_LIST;
      }
    },
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      if (p.category?.name) set.add(p.category.name);
      else if (p.category) set.add(typeof p.category === 'string' ? p.category : p.category.name);
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p: any) => {
        const matchesSearch =
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const catName = p.category?.name || (typeof p.category === 'string' ? p.category : '');
        const matchesCat = selectedCategory === 'all' || catName.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCat;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price-low') return (a.basePrice || 0) - (b.basePrice || 0);
        if (sortBy === 'price-high') return (b.basePrice || 0) - (a.basePrice || 0);
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        return 0;
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
              <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
              </Link>
              <span>/</span>
              <span className="text-surface-900 dark:text-white font-medium">Product Catalog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              All Products & Creators
            </h1>
            <p className="text-surface-600 dark:text-surface-400 mt-1">
              Explore authentic handcrafted goods, electronics, and lifestyle items from independent verified vendors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {filteredProducts.length} Items Available
            </span>
          </div>
        </div>

        {/* Filter & Search Bar Toolbar */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 border border-surface-200 dark:border-surface-800 shadow-sm mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search products by name, tag, or maker..."
              aria-label="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white text-sm rounded-xl border border-surface-200 dark:border-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-surface-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort products by"
              className="bg-surface-50 dark:bg-surface-950 text-surface-800 dark:text-surface-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-surface-200 dark:border-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[380px] rounded-3xl bg-surface-200 dark:bg-surface-800 animate-pulse border border-surface-300 dark:border-surface-700"
              />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product: any) => (
              <ProductCard
                key={product.id || product._id}
                product={{
                  ...product,
                  _id: product.id || product._id,
                  storeName: product.storeName || product.seller?.name || 'Independent Creator',
                  rating: product.rating || 4.8,
                  numReviews: product.numReviews || 18,
                }}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white dark:bg-surface-900 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-3xl p-8">
              <ShoppingBag className="h-12 w-12 text-surface-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No matching products found</h3>
              <p className="text-surface-500 max-w-md mx-auto mb-6 text-sm">
                Try searching for something else or reset your filter to browse all products.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
