/**
 * Shared Fallback Product Catalog & Seed Assets
 * US Premium-Retail Lifestyle Showcase (Tech, Fragrance, Fashion, Footwear, Horology, Architectural Living)
 * 
 * Curated flagship collection with authentic specifications, realistic variants, and verified imagery.
 */

import rawProducts from '@/data/products.json';

export interface ProductVariantItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  priceModifier: number;
  colorHex?: string;
  stock: number;
  isPopular?: boolean;
  imageIndex: number;
  attributes?: Record<string, string>;
}

export interface FallbackProduct {
  id: string;
  _id: string;
  name: string;
  slug?: string;
  brand?: string;
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
  inStock?: boolean;
  specs?: Record<string, string | undefined>;
  benefits?: string[];
  variants?: ProductVariantItem[];
  tags?: string[];
  materials?: string;
  source?: string;
}

export const FALLBACK_PRODUCTS_LIST: FallbackProduct[] = rawProducts as unknown as FallbackProduct[];

export const FALLBACK_CATALOG_MAP: Record<string, FallbackProduct> = Object.fromEntries(
  FALLBACK_PRODUCTS_LIST.map((p) => [p.id, p])
);
