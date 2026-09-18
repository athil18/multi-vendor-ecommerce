import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Shield, Truck, RotateCcw, Heart, ShoppingCart } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const imageUrl = product.images?.[0] || 'https://via.placeholder.com/600?text=No+Image';
  const averageRating = product.averageRating || 5.0;
  const reviewCount = product.reviewCount || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-body-md font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to storefront
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-surface-container-lowest rounded-3xl p-6 lg:p-10 border border-outline-variant/30 shadow-sm">
        {/* Product Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-inner overflow-hidden min-h-[380px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-auto max-h-[420px] object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="default">{product.categoryId?.name || 'General'}</Badge>
              <Badge variant={product.status === 'published' ? 'success' : 'warning'}>
                {product.status === 'published' ? 'In Stock' : product.status}
              </Badge>
            </div>

            <h1 className="text-display-sm font-bold text-on-surface tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'fill-current' : 'text-outline-variant'}`}
                  />
                ))}
              </div>
              <span className="text-body-sm font-semibold text-on-surface">{averageRating.toFixed(1)}</span>
              <span className="text-body-sm text-on-surface-variant">({reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="text-display-md font-extrabold text-primary">
              ${(product.basePrice || 0).toFixed(2)}
            </div>

            <p className="text-body-md text-on-surface-variant leading-relaxed">
              {product.description || 'Premium quality product manufactured with precision for maximum performance and durability.'}
            </p>
          </div>

          <div className="flex flex-col gap-6 pt-4 border-t border-outline-variant/20">
            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <AddToCartButton
                  productId={product._id || product.id}
                  name={product.name}
                  price={product.basePrice}
                  image={imageUrl}
                />
              </div>
            </div>

            {/* Seller Info Card */}
            {product.sellerId && (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <p className="text-body-xs font-semibold uppercase tracking-wider text-on-surface-variant">Sold & Fulfilled By</p>
                  <p className="text-body-md font-bold text-on-surface">{product.sellerId.name || 'Verified Vendor'}</p>
                </div>
                <Badge variant="outline">Verified Seller</Badge>
              </div>
            )}

            {/* Value Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-body-xs text-on-surface-variant">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-5 h-5 text-primary" />
                <span>Buyer Protection</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-primary" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-5 h-5 text-primary" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
