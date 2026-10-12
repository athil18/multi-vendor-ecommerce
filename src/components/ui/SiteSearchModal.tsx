'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight, CornerDownLeft, Tag, Store, AlertCircle } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  slug?: string;
  basePrice: number;
  images: string[];
  category?: { name: string };
  seller?: { store?: { name: string } };
}

interface SiteSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SiteSearchModal({ isOpen, onClose }: SiteSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setDebouncedQuery('');
      setResults([]);
      setIsError(false);
    }
  }, [isOpen]);

  // Debounce user keystrokes by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const controller = new AbortController();

    async function fetchSearch() {
      try {
        const res = await fetch(`/api/products?keyword=${encodeURIComponent(debouncedQuery)}&limit=8`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to fetch search results');
        const json = await res.json();
        if (isMounted) {
          const list: SearchResult[] = (json.data || []).map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            slug: p.slug,
            basePrice: p.basePrice || p.price || 0,
            images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'],
            category: p.category,
            seller: p.seller,
          }));
          setResults(list);
          setTotalCount(json.pagination?.totalCount || list.length);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    }

    fetchSearch();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedQuery]);

  // Keyboard navigation within results
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          const target = results[selectedIndex];
          router.push(`/products/${target.id}`);
          onClose();
        } else if (query.trim()) {
          e.preventDefault();
          router.push(`/products?search=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      }
    },
    [results, selectedIndex, query, router, onClose]
  );

  // Keep highlighted item in view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150 print:hidden"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site-wide product and creator search"
        className="w-full max-w-2xl bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/30">
          <Search className="h-5 w-5 text-surface-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verified artisan creations, materials, stores..."
            aria-label="Search verified creations"
            aria-autocomplete="list"
            className="w-full bg-transparent text-sm sm:text-base font-medium text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none"
          />

          <div className="flex items-center gap-2 ml-2">
            {isLoading && <Loader2 className="h-4 w-4 text-brand-600 animate-spin" />}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
                className="h-6 w-6 rounded-md flex items-center justify-center text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-surface-400 bg-surface-200/60 dark:bg-surface-800 rounded border border-surface-300/40 dark:border-surface-700">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Initial / Suggested searches when query is empty */}
          {!query && (
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                Popular Categories & Materials
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Mechanical Keyboards', href: '/products?category=Tech+Gear' },
                  { label: 'Tuscan Leather', href: '/products?category=Luxury' },
                  { label: 'Precision Audio', href: '/products?category=Tech+Gear' },
                  { label: 'Sustainable Living', href: '/products?category=Sustainable' },
                  { label: 'Carbon Fiber', href: '/products?category=Fitness' },
                ].map((tag) => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 dark:hover:text-brand-400 transition-colors border border-surface-200 dark:border-surface-700"
                  >
                    <Tag className="h-3 w-3" />
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>We encountered an issue looking up catalog results. Please try again or browse the full collection.</p>
            </div>
          )}

          {/* Results list */}
          {debouncedQuery && !isLoading && !isError && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-3 text-xs font-semibold text-surface-500">
                <span>Found {totalCount} matching creation{totalCount === 1 ? '' : 's'}</span>
                <Link
                  href={`/products?search=${encodeURIComponent(debouncedQuery)}`}
                  onClick={onClose}
                  className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-bold"
                >
                  View all in catalog <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <ul ref={listRef} role="listbox" aria-label="Search results" className="space-y-2">
                {results.map((product, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <li key={product.id} role="option" aria-selected={isSelected}>
                      <Link
                        href={`/products/${product.id}`}
                        onClick={onClose}
                        className={`flex items-center gap-3.5 p-2.5 rounded-xl transition-all border ${
                          isSelected
                            ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-300 dark:border-brand-700'
                            : 'hover:bg-surface-50 dark:hover:bg-surface-800/60 border-transparent hover:border-surface-200 dark:hover:border-surface-800'
                        }`}
                      >
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0 border border-surface-200 dark:border-surface-700">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-surface-500">
                            {product.seller?.store?.name && (
                              <span className="flex items-center gap-1 truncate text-surface-400">
                                <Store className="h-3 w-3" />
                                {product.seller.store.name}
                              </span>
                            )}
                            {product.category?.name && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                                {product.category.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                            ${product.basePrice.toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* No results state */}
          {debouncedQuery && !isLoading && !isError && results.length === 0 && (
            <div className="text-center py-8 px-4">
              <div className="h-12 w-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3 text-surface-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-surface-900 dark:text-white mb-1">
                No matching creations found
              </h3>
              <p className="text-xs text-surface-500 max-w-sm mx-auto mb-5 leading-relaxed">
                We couldn&apos;t find any products matching &ldquo;{debouncedQuery}&rdquo;. Try another term or explore our curated stores.
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-colors"
              >
                Browse Full Catalog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 sm:px-6 py-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/60 flex items-center justify-between text-[11px] text-surface-400 font-medium">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-800 font-mono text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-800 font-mono text-[10px]">↵</kbd> Select
            </span>
          </div>
          <span>Nexus Global Catalog</span>
        </div>
      </div>
    </div>
  );
}
