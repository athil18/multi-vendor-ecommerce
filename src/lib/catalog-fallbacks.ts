/**
 * Shared Fallback Product Catalog & Seed Assets
 * Multi-Category Lifestyle Showcase (Tech, Sports, Sustainable, Luxury, Home, Fashion, Beauty)
 * Curated from multiple open-source verified repositories (DummyJSON, EscuelaJS, Algolia)
 * Zero duplicate titles, deduplicated slugs, and verified asset pipelines.
 */

import rawProducts from '@/data/products.json';

export interface FallbackProduct {
  id: string;
  _id: string;
  name: string;
  slug?: string;
  description: string;
  basePrice: number;
  price?: number;
  compareAtPrice?: number;
  stock: number;
  status: string;
  images: string[];
  category: { id: string; name: string; slug: string };
  categoryId?: { id: string; name: string; slug: string };
  categoryName?: string;
  seller: { id: string; name: string; email: string };
  sellerId?: { id: string; name: string };
  storeName?: string;
  store?: { id: string; name: string; slug?: string };
  rating: number;
  averageRating?: number;
  numReviews: number;
  reviewCount?: number;
  variants: any[];
  source?: string;
}

export const FALLBACK_PRODUCTS_LIST: FallbackProduct[] = rawProducts as FallbackProduct[];

export const FALLBACK_CATALOG_MAP: Record<string, FallbackProduct> = Object.fromEntries(
  FALLBACK_PRODUCTS_LIST.map((p) => [p.id, p])
);
