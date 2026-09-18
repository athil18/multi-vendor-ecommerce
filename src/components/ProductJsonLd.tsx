import React from 'react';

interface ProductJsonLdProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    basePrice?: number;
    images?: string[];
    category?: { name: string };
    categoryName?: string;
    store?: { name: string };
    rating?: number;
    averageRating?: number;
    numReviews?: number;
    reviewCount?: number;
  };
}

/**
 * Schema.org Product Structured Data JSON-LD Component
 * 
 * @agent marketing-seo-specialist
 * @agent marketing-aeo-foundations
 */
export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-ecommerce.com';
  const price = Number(product.price || product.basePrice || 0).toFixed(2);
  const imageUrl = product.images?.[0] || `${baseUrl}/icon.svg`;
  const ratingValue = Number(product.averageRating || product.rating || 5.0).toFixed(1);
  const reviewCount = product.reviewCount || product.numReviews || 1;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': [imageUrl],
    'description': product.description || product.name,
    'sku': product.id,
    'brand': {
      '@type': 'Brand',
      'name': product.store?.name || 'Nexus Marketplace',
    },
    'offers': {
      '@type': 'Offer',
      'url': `${baseUrl}/products/${product.id}`,
      'priceCurrency': 'USD',
      'price': price,
      'priceValidUntil': '2027-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': product.store?.name || 'Nexus Seller',
      },
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': ratingValue,
      'reviewCount': reviewCount,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
