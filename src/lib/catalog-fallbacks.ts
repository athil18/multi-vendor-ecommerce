/**
 * Shared Fallback Product Catalog & Seed Assets
 * Multi-Category Lifestyle Showcase (Tech, Sports, Sustainable, Luxury, Home, Fashion)
 * Curated from multiple open-source verified repositories (DummyJSON, EscuelaJS, Algolia)
 * 
 * STRICT MODE: Tech & Electronics products are strictly prioritized at the top of the catalog.
 * Beauty items are demoted or excluded from the starting product showcase.
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

export const isTechProduct = (p: { category?: { name?: string; slug?: string }; categoryName?: string; name?: string; slug?: string }): boolean => {
  const cat = (p.category?.name || p.categoryName || '').toLowerCase();
  const slug = (p.category?.slug || p.slug || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  return (
    cat.includes('tech') ||
    cat.includes('electronic') ||
    cat.includes('audio') ||
    slug.includes('tech') ||
    slug.includes('laptop') ||
    slug.includes('headphone') ||
    name.includes('macbook') ||
    name.includes('laptop') ||
    name.includes('keyboard') ||
    name.includes('headphone') ||
    name.includes('monitor')
  );
};

export const isBeautyProduct = (p: { category?: { name?: string; slug?: string }; categoryName?: string; name?: string; slug?: string }): boolean => {
  const cat = (p.category?.name || p.categoryName || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const slug = (p.slug || '').toLowerCase();
  return (
    cat.includes('beauty') ||
    cat.includes('cosmetic') ||
    name.includes('mascara') ||
    name.includes('lipstick') ||
    name.includes('eyeshadow') ||
    name.includes('nail polish') ||
    name.includes('powder canister') ||
    slug.includes('beauty')
  );
};

const allRaw = rawProducts as FallbackProduct[];

// Strict Mode: Re-order so Tech products are always at the start and beauty products are at the very back
const techList = allRaw.filter(isTechProduct);
const otherList = allRaw.filter((p) => !isTechProduct(p) && !isBeautyProduct(p));
const beautyList = allRaw.filter(isBeautyProduct);

export const FALLBACK_PRODUCTS_LIST: FallbackProduct[] = [
  ...techList,
  ...otherList,
  ...beautyList,
];

export const FALLBACK_CATALOG_MAP: Record<string, FallbackProduct> = Object.fromEntries(
  FALLBACK_PRODUCTS_LIST.map((p) => [p.id, p])
);
