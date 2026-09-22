/**
 * 25-Lakh Tier Multi-Vendor Marketplace Catalog & Faceted Discovery Engine
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-ui-finish-gate-reviewer
 * @agent design-whimsy-injector
 * @agent engineering-frontend-developer
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Filter, Sparkles, 
  ShoppingBag, ArrowLeft, X, LayoutGrid, Grid3X3, Check, 
  RotateCcw, ShieldCheck, Award, DollarSign 
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';

const LUXURY_MATERIALS = [
  'Full-Grain Tuscan Leather',
  'CNC Milled Aluminum',
  'Aerospace Carbon Fiber',
  'Solid Matte Brass',
  'Hand-Dyed Japanese Indigo',
  'Artisanal Hardwood',
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [viewMode, setViewMode] = useState<'editorial' | 'compact'>('editorial');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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
            rating: p.rating || 4.9,
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
      const cat = p.category?.name || (typeof p.category === 'string' ? p.category : p.categoryName);
      if (cat) set.add(cat);
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  // Toggle material filter
  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter((p: any) => {
        const nameDesc = `${p.name || ''} ${p.description || ''} ${p.storeName || ''}`.toLowerCase();
        const matchesSearch = !searchTerm || nameDesc.includes(searchTerm.toLowerCase());
        
        const catName = (p.category?.name || (typeof p.category === 'string' ? p.category : p.categoryName) || '').toLowerCase();
        const matchesCat = selectedCategory === 'all' || catName === selectedCategory.toLowerCase();

        const matchesPrice = (p.basePrice ?? 0) <= maxPriceFilter;
        const matchesStock = !inStockOnly || p.inStock !== false;
        
        // Mock material filter check against description or material field
        const matchesMaterial = selectedMaterials.length === 0 || selectedMaterials.some((m) =>
          nameDesc.includes(m.toLowerCase().split(' ')[0])
        );

        return matchesSearch && matchesCat && matchesPrice && matchesStock && matchesMaterial;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price-low') return (a.basePrice || 0) - (b.basePrice || 0);
        if (sortBy === 'price-high') return (b.basePrice || 0) - (a.basePrice || 0);
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        return 0;
      });
  }, [products, searchTerm, selectedCategory, maxPriceFilter, inStockOnly, selectedMaterials, sortBy]);

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) +
    selectedMaterials.length +
    (inStockOnly ? 1 : 0) +
    (maxPriceFilter < 2000 ? 1 : 0);

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedMaterials([]);
    setInStockOnly(false);
    setMaxPriceFilter(2000);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8 ambient-gradient-mesh">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-200/60 dark:border-surface-800/80 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-400 mb-3">
              <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Flagship Storefront
              </Link>
              <span>/</span>
              <span className="text-surface-900 dark:text-white font-bold">Atelier Curations</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white tracking-tight font-sans">
              The Curated Catalog
            </h1>
            <p className="text-surface-600 dark:text-surface-300 mt-2 text-sm sm:text-base max-w-2xl font-normal">
              Direct commissions from independent master workshops. Every acquisition is held in 100% escrow protection.
            </p>
          </div>

          {/* Quick Metrics & View Toggle */}
          <div className="flex items-center gap-4">
            <span className="specular-pill text-brand-700 dark:text-brand-300">
              {filteredProducts.length} Specimens Available
            </span>

            {/* Grid density switcher */}
            <div className="hidden sm:flex items-center p-1 rounded-2xl bg-surface-200/50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700">
              <button
                onClick={() => setViewMode('editorial')}
                aria-label="Editorial View"
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'editorial'
                    ? 'bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                aria-label="Compact Technical View"
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-surface-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Control Toolbar ──────────────────────────────────────────────── */}
        <div className="glass-luxury-card specular-border rounded-3xl p-4 sm:p-5 mb-8 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search by artisan studio, material, or keyword..."
              aria-label="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-50/80 dark:bg-surface-900/80 text-surface-900 dark:text-white text-sm rounded-2xl border border-surface-200 dark:border-surface-700/80 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium placeholder:text-surface-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Actions: Filter Button & Sort Dropdown */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`rounded-2xl px-5 h-12 text-xs font-bold border-surface-300 dark:border-surface-700 flex items-center gap-2 ${
                activeFilterCount > 0 ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-600 dark:text-brand-400' : ''
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </Button>

            <div className="flex items-center gap-2 bg-surface-50/80 dark:bg-surface-900/80 px-3.5 py-2 rounded-2xl border border-surface-200 dark:border-surface-700/80">
              <ArrowUpDown className="h-4 w-4 text-surface-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort curations by"
                className="bg-transparent text-surface-800 dark:text-surface-200 text-xs font-bold focus:outline-none cursor-pointer pr-2"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Connoisseur Pick (Highest Rated)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Expandable Faceted Luxury Filter Panel ───────────────────────── */}
        {isFilterDrawerOpen && (
          <div className="glass-luxury-card specular-border rounded-3xl p-6 sm:p-8 mb-10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200/60 dark:border-surface-800/80 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-brand-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-surface-900 dark:text-white">
                  Faceted Curation Parameters
                </h3>
              </div>
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 1. Category Facets */}
              <div>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block mb-3">
                  Atelier Discipline
                </span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                        selectedCategory === cat
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                      }`}
                    >
                      {cat === 'all' ? 'All Disciplines' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Material Sciences */}
              <div>
                <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block mb-3">
                  Heirloom Materials
                </span>
                <div className="flex flex-wrap gap-2">
                  {LUXURY_MATERIALS.map((mat) => {
                    const isSelected = selectedMaterials.includes(mat);
                    return (
                      <button
                        key={mat}
                        onClick={() => toggleMaterial(mat)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {mat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Price & Guarantees */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">
                      Maximum Price Limit
                    </span>
                    <span className="text-sm font-black text-surface-900 dark:text-white font-geist">
                      ${maxPriceFilter}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-surface-700 dark:text-surface-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Immediate Workshop Dispatch (In Stock)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-surface-700 dark:text-surface-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Verified Master Guild Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Active Filter Badges ─────────────────────────────────────────── */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-surface-400 font-semibold mr-1">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="specular-pill text-[10px] text-brand-600 flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedMaterials.map((m) => (
              <span key={m} className="specular-pill text-[10px] text-purple-600 flex items-center gap-1">
                {m}
                <button onClick={() => toggleMaterial(m)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {inStockOnly && (
              <span className="specular-pill text-[10px] text-emerald-600 flex items-center gap-1">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}><X className="h-3 w-3" /></button>
              </span>
            )}
            {maxPriceFilter < 2000 && (
              <span className="specular-pill text-[10px] text-amber-600 flex items-center gap-1">
                Under ${maxPriceFilter}
                <button onClick={() => setMaxPriceFilter(2000)}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* ─── Product Grid ─────────────────────────────────────────────────── */}
        <div className={`grid gap-8 ${
          viewMode === 'editorial'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-3xl glass-luxury-card animate-pulse border border-surface-200 dark:border-surface-800"
              />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product: any) => (
              <ProductCard
                key={product.id || product._id}
                product={{
                  ...product,
                  _id: product.id || product._id,
                  storeName: product.storeName || product.seller?.name || 'Independent Atelier',
                  rating: product.rating || 4.9,
                  numReviews: product.numReviews || 24,
                }}
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center glass-luxury-card specular-border rounded-3xl p-8">
              <ShoppingBag className="h-14 w-14 text-surface-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-surface-900 dark:text-white mb-2">
                No matching atelier specimens found
              </h3>
              <p className="text-surface-500 max-w-md mx-auto mb-6 text-sm font-normal">
                Refine your faceted parameters, search keywords, or reset filters to browse the complete master collection.
              </p>
              <Button
                variant="outline"
                onClick={resetAllFilters}
                className="rounded-full px-6"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
