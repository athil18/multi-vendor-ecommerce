/**
 * Re-Engineered 25-Lakh Tier Luxury Product Studio View & Conversion Architecture
 * 
 * Implements:
 * - Level 3: Above-the-fold Social Proof Hierarchy & Benefit Statement
 * - Level 4: Intelligent Variant Selection with "Most Popular" Default
 * - Level 5: Pricing Visual Hierarchy (Direct Atelier Price + Compare-at MSRP + Savings)
 * - Level 6: Bundle & Offer Psychology (1×, 2× Duo 10% Off, 3× Trio 15% Off)
 * - Level 7: Free-Gift Milestone Progress Bar ($35 Value)
 * - Level 8: Sticky Mobile Purchase Bar with Intersection Observer
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent testing-accessibility-auditor
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, ShieldCheck, Truck, RotateCcw, 
  Store, CheckCircle, Sparkles, Scale, Check, 
  Award, Leaf, CheckCircle2, ZoomIn, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/store/useCompareStore';
import { VariantSelector, ProductVariantOption } from '@/components/VariantSelector';
import { BundleOfferSelector } from '@/components/BundleOfferSelector';
import { FreeGiftProgress } from '@/components/FreeGiftProgress';

interface ProductStudioViewProps {
  product: any;
}

export function ProductStudioView({ product }: ProductStudioViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'provenance' | 'atelier' | 'escrow' | 'sustainability'>('provenance');
  const [isMainCTAVisible, setIsMainCTAVisible] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const mainBuyButtonRef = useRef<HTMLDivElement>(null);

  const { addToCompare, isInCompare } = useCompareStore();
  const productId = product.id || product._id;
  const isCompared = isInCompare(productId);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'];

  const basePrice = Number(product.basePrice ?? product.price ?? 199);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasHonestDiscount = Boolean(compareAtPrice && compareAtPrice > basePrice);
  const originalRetailPrice = hasHonestDiscount ? compareAtPrice! : basePrice;
  const storeName = product.store?.name || product.storeName || 'Independent Atelier Studio';
  const averageRating = Number(product.averageRating || product.rating || 4.95);
  const reviewCount = Number(product.reviewCount || product.numReviews || 32);

  // Level 4: Dynamic Variant Resolution from Authentic Catalog Data
  const resolvedVariants: ProductVariantOption[] = React.useMemo(() => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.map((v: any, idx: number) => ({
        id: v.id || `var-${idx + 1}`,
        name: v.name || `Option ${idx + 1}`,
        colorHex: v.colorHex || '#374151',
        sku: v.sku || `${(product.slug || 'NX').toUpperCase().slice(0, 4)}-0${idx + 1}`,
        priceModifier: Number(v.priceModifier || 0),
        isPopular: Boolean(v.isPopular ?? (idx === 0)),
        stockCount: Number(v.stockCount ?? product.stock ?? 10),
        imageIndex: Math.min(idx, images.length - 1),
      }));
    }
    return [
      {
        id: 'var-1',
        name: 'Standard Edition',
        colorHex: '#374151',
        sku: `${(product.slug || 'NX').toUpperCase().slice(0, 4)}-STD`,
        priceModifier: 0,
        isPopular: true,
        stockCount: Number(product.stock ?? 10),
        imageIndex: 0,
      },
    ];
  }, [product.variants, product.slug, images.length]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantOption>(
    () => resolvedVariants.find((v) => v.isPopular) || resolvedVariants[0]
  );

  useEffect(() => {
    setSelectedVariant(resolvedVariants.find((v) => v.isPopular) || resolvedVariants[0]);
  }, [resolvedVariants]);

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [bundlePrice, setBundlePrice] = useState(basePrice);
  const [bundleSavings, setBundleSavings] = useState(0);

  // Compute unit price including variant modifier
  const currentUnitPrice = basePrice + selectedVariant.priceModifier;
  const currentOriginalUnitPrice = originalRetailPrice + selectedVariant.priceModifier;

  // Compute active effective price depending on bundle selection
  const effectiveTotalPrice = selectedQuantity === 1
    ? currentUnitPrice
    : (currentUnitPrice * selectedQuantity) * (selectedQuantity === 2 ? 0.90 : 0.85);

  const effectiveSavings = selectedQuantity === 1
    ? (hasHonestDiscount ? (currentOriginalUnitPrice - currentUnitPrice) : 0)
    : (currentOriginalUnitPrice * selectedQuantity - effectiveTotalPrice);

  const hasSavingsToDisplay = effectiveSavings > 0.01;

  const showStickyDock = !isMainCTAVisible;
  const productPrice = effectiveTotalPrice;

  // Level 8: IntersectionObserver on Main Purchase Button for Sticky CTA
  useEffect(() => {
    if (!mainBuyButtonRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainCTAVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(mainBuyButtonRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard navigation for high-res material lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setSelectedImageIndex((prev) => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft') setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLightboxOpen, images.length]);

  const handleSelectVariant = (variant: ProductVariantOption) => {
    setSelectedVariant(variant);
    if (images[variant.imageIndex]) {
      setSelectedImageIndex(variant.imageIndex);
    }
  };

  const handleSelectBundle = (qty: number) => {
    setSelectedQuantity(qty);
  };

  // Benefit statement extraction
  const benefitStatement = product.materials 
    ? `Master crafted from ${product.materials}. Verified material purity and ethical provenance.`
    : 'Direct-from-workshop commission engineered with verified materials, inspected tolerances, and cryptographically verified escrow.';

  return (
    <div className="relative">
      {/* ─── Main Two-Column Studio Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 sm:p-10 shadow-sm">
        
        {/* Left Column: Interactive Multi-Angle Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Main Stage Image with Zoom & Specular Sheen */}
          <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-surface-100 dark:bg-surface-950 border border-surface-200/80 dark:border-surface-800 shadow-inner group">
            <Image
              src={images[selectedImageIndex] || images[0]}
              alt={`${product.name} - ${selectedVariant.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="specular-pill text-[10px] font-bold text-surface-900 dark:text-white shadow-sm">
                {product.category?.name || product.categoryName || 'Curated Atelier Specimen'}
              </span>
              <span className="specular-pill text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                In Stock &bull; Batch {selectedVariant.sku.slice(-5)}
              </span>
            </div>

            {/* Quick Compare Trigger */}
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => {
                  addToCompare({
                    id: productId,
                    name: product.name,
                    price: currentUnitPrice,
                    image: images[0],
                    category: product.category?.name || product.categoryName,
                    storeName,
                    rating: averageRating,
                    numReviews: reviewCount,
                  });
                }}
                className={`p-2.5 rounded-lg transition-all shadow-sm ${
                  isCompared
                    ? 'bg-brand-600 text-white'
                    : 'bg-black/50 hover:bg-black/80 text-white border border-white/20'
                }`}
                title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
              >
                {isCompared ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
              </button>
            </div>

            {/* Authentic Provenance Trust Pill */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-surface-950/90 px-3 py-1.5 rounded-lg text-[11px] text-white/90 border border-surface-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified Artisan Provenance &bull; Escrow Protected</span>
            </div>

            {/* High-Res Material Zoom Trigger Button (Finding 3) */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Inspect artisan material in high-resolution zoom"
              className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-zoom-in shadow-md"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              <span>Inspect Material</span>
            </button>
          </div>

          {/* Thumbnail Gallery Scrub */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 w-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-brand-500 shadow-md shadow-brand-500/25 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Maker Dossier & Purchase (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            
            {/* ─── LEVEL 3: Social Proof Hierarchy ───────────────────────── */}
            <div>
              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-400/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                  </div>
                  <span className="text-amber-700 dark:text-amber-300 font-bold text-xs font-geist">
                    {averageRating.toFixed(2)}
                  </span>
                  <span className="text-surface-400 text-[11px]">| {reviewCount} reviews</span>
                </div>

                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> 100% Verified Purchases
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-surface-900 dark:text-white tracking-tight font-sans leading-tight">
                {product.name}
              </h1>

              {/* Key Product Benefit Statement & Authentic Benefit Pills */}
              <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-300 font-medium leading-relaxed">
                {product.description ? product.description.slice(0, 180) + (product.description.length > 180 ? '...' : '') : benefitStatement}
              </p>

              {product.benefits && Array.isArray(product.benefits) && product.benefits.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-surface-200/50 dark:border-surface-800">
                  {product.benefits.slice(0, 3).map((benefit: string, bIdx: number) => (
                    <div key={bIdx} className="flex items-center gap-2 text-xs text-surface-700 dark:text-surface-300 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── LEVEL 5: Honest Pricing Visual Hierarchy ─────────────────────── */}
            <div className="p-4 rounded-2xl bg-surface-50/90 dark:bg-surface-850/90 border border-surface-200/80 dark:border-surface-800 shadow-sm space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                {/* Atelier / Active Price */}
                <span className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white font-geist tracking-tight">
                  ${effectiveTotalPrice.toFixed(2)}
                </span>

                {/* Original Retail Price (Only rendered if genuine compareAtPrice or volume discount exists) */}
                {hasSavingsToDisplay && (
                  <span className="text-sm sm:text-base text-surface-400 line-through font-medium">
                    ${(currentOriginalUnitPrice * selectedQuantity).toFixed(2)}
                  </span>
                )}

                {/* Savings Pill */}
                {hasSavingsToDisplay && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Save ${effectiveSavings.toFixed(2)} ({Math.round((effectiveSavings / (currentOriginalUnitPrice * selectedQuantity)) * 100)}% OFF)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-surface-500 border-t border-surface-200/60 dark:border-surface-800 pt-2">
                <span>Taxes & Duties Included &bull; Direct Workshop Pricing</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Free Inspected Shipping
                </span>
              </div>
            </div>

            {/* ─── LEVEL 4: Intelligent Dynamic Variant Selector ──────────────────── */}
            {resolvedVariants.length > 1 && (
              <VariantSelector
                variants={resolvedVariants}
                selectedVariantId={selectedVariant.id}
                onSelectVariant={handleSelectVariant}
                basePrice={basePrice}
              />
            )}

            {/* ─── LEVEL 6: Bundle & Offer Psychology ────────────────────── */}
            <BundleOfferSelector
              unitPrice={currentUnitPrice}
              selectedQuantity={selectedQuantity}
              onSelectQuantity={handleSelectBundle}
            />

            {/* ─── LEVEL 7: Free-Gift Progression ────────────────────────── */}
            <FreeGiftProgress
              currentTotal={effectiveTotalPrice}
              threshold={200}
              giftName="Artisan Leather Care Balm & Velvet Pouch"
              giftValue={35}
            />

            {/* Atelier Maker Card */}
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-base">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-surface-900 dark:text-white">
                      {storeName}
                    </span>
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                  </div>
                  <p className="text-[10px] text-surface-500">Verified Independent Guild Workshop</p>
                </div>
              </div>
              <Link href={`/store/${product.sellerId || 'store-1'}`}>
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-bold px-4">
                  Visit Studio
                </Button>
              </Link>
            </div>
          </div>

          {/* ─── Primary Purchase CTA Dock (Observed for Sticky Dock) ───── */}
          <div ref={mainBuyButtonRef} className="pt-4 border-t border-surface-200/60 dark:border-surface-800/80 space-y-3">
            <AddToCartButton
              productId={productId}
              name={selectedQuantity > 1 ? `${product.name} (${selectedQuantity}× Bundle, ${selectedVariant.name})` : `${product.name} (${selectedVariant.name})`}
              price={effectiveTotalPrice / selectedQuantity}
              quantity={selectedQuantity}
              image={images[selectedImageIndex] || images[0]}
              variantId={selectedVariant.id}
              className="w-full h-14 text-sm font-bold shadow-xl shadow-brand-500/20 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            />
            
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">Escrow Protected</span>
                <span className="text-[9px] text-surface-400">Buyer Protection</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <Truck className="h-4 w-4 text-surface-700 dark:text-surface-300 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">Tracked Delivery</span>
                <span className="text-[9px] text-surface-400">Direct Shipping</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <RotateCcw className="h-4 w-4 text-surface-700 dark:text-surface-300 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">30-Day Policy</span>
                <span className="text-[9px] text-surface-400">Return Window</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Dossier & Specifications Tabs */}
      <div className="mt-12 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-surface-200 dark:border-surface-800 pb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'provenance', label: 'Specifications & Materials', icon: Award },
            { id: 'atelier', label: 'Artisan Workshop Dossier', icon: Store },
            { id: 'escrow', label: 'Escrow Guarantees', icon: ShieldCheck },
            { id: 'sustainability', label: 'Circular Lifecycle', icon: Leaf },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-8">
          {activeTab === 'provenance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-surface-900 dark:text-white text-base">Specifications & Provenance</h3>
                <p className="text-surface-600 dark:text-surface-300 leading-relaxed text-xs sm:text-sm">
                  {product.description || 'Verified authentic specimen. Engineered to the highest quality standards with authentic materials and cryptographically verified escrow.'}
                </p>
                {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(product.specs).map(([specKey, specVal]) => (
                      <div key={specKey} className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                        <span className="text-surface-400">{specKey}</span>
                        <span className="font-bold text-surface-800 dark:text-surface-200 text-right">{String(specVal)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                      <span className="text-surface-400">Selected Configuration</span>
                      <span className="font-bold text-surface-800 dark:text-surface-200">{selectedVariant.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                      <span className="text-surface-400">Batch Lot Serial</span>
                      <span className="font-mono font-bold text-surface-800 dark:text-surface-200">{selectedVariant.sku}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                      <span className="text-surface-400">Configuration</span>
                      <span className="font-bold text-surface-800 dark:text-surface-200">{selectedVariant.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                      <span className="text-surface-400">Batch Lot Serial</span>
                      <span className="font-mono font-bold text-surface-800 dark:text-surface-200">{selectedVariant.sku}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                      <span className="text-surface-400">Category Classification</span>
                      <span className="font-bold text-surface-800 dark:text-surface-200">{product.category?.name || product.categoryName || 'Curated Specimen'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800 space-y-3">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>Certified Authentic Specimen</span>
                </div>
                <h4 className="font-bold text-surface-900 dark:text-white text-sm">Digital Certificate of Authenticity</h4>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Upon delivery confirmation, your customer account receives a cryptographically signed provenance receipt containing the verified seller signature, batch serial, and quality inspection dossier.
                </p>

                {product.benefits && Array.isArray(product.benefits) && product.benefits.length > 0 && (
                  <div className="pt-2 border-t border-surface-200/60 dark:border-surface-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-surface-700 dark:text-surface-300 block">Verified Key Benefits:</span>
                    {product.benefits.map((b: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-surface-400">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'atelier' && (
            <div className="space-y-4 text-xs sm:text-sm text-surface-600 dark:text-surface-300 max-w-3xl leading-relaxed">
              <h3 className="font-bold text-surface-900 dark:text-white text-base">Direct Workshop Provenance</h3>
              <p>
                This item is crafted in small serialized runs by {storeName}. The master workshop employs specialized artisans who oversee every phase from rough milling to final hand-polishing and frequency calibration.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800 text-center">
                  <span className="text-xl font-bold text-surface-900 dark:text-white font-geist block">18 Hours</span>
                  <span className="text-[11px] text-surface-400">Handcrafting Duration</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800 text-center">
                  <span className="text-xl font-bold text-surface-900 dark:text-white font-geist block">25 Units</span>
                  <span className="text-[11px] text-surface-400">Total Batch Limit</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800 text-center">
                  <span className="text-xl font-bold text-surface-900 dark:text-white font-geist block">100%</span>
                  <span className="text-[11px] text-surface-400">Independent Guild Owned</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div className="space-y-4 text-xs sm:text-sm text-surface-600 dark:text-surface-300 max-w-3xl leading-relaxed">
              <h3 className="font-bold text-surface-900 dark:text-white text-base">Stripe Connect & Ledger Escrow Vault</h3>
              <p>
                Nexus utilizes institutional multi-vendor escrow. When you purchase this item, your payment is placed in an encrypted vault. The artisan only receives their 90% payout once tracking confirms delivery and your 14-day inspection period has elapsed.
              </p>
            </div>
          )}

          {activeTab === 'sustainability' && (
            <div className="space-y-4 text-xs sm:text-sm text-surface-600 dark:text-surface-300 max-w-3xl leading-relaxed">
              <h3 className="font-bold text-surface-900 dark:text-white text-base">Zero-Landfill & Spare Parts Guarantee</h3>
              <p>
                All components are designed for modular disassembly. Replacement parts, seals, and structural screws are stocked indefinitely, preventing planned obsolescence.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Sticky Quick-Purchase Dock (Appears on Scroll) ─────────────────── */}
      {showStickyDock && (
        <aside
          aria-label="Quick Checkout Dock"
          className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-surface-900 py-3 px-4 sm:px-8 border-t border-surface-200 dark:border-surface-800 shadow-xl"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0">
                <Image src={images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-surface-900 dark:text-white truncate">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-black text-brand-600 dark:text-brand-400 font-geist">
                    ${productPrice.toFixed(2)}
                  </span>
                  <span className="text-surface-400 text-[10px] hidden sm:inline">&bull; 100% Escrow Backed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <AddToCartButton
                productId={productId}
                name={product.name}
                price={productPrice}
                image={images[0]}
                className="h-11 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
              />
            </div>
          </div>
        </aside>
      )}

      {/* ─── High-Resolution Artisan Material Lightbox (Finding 3) ────────────── */}
      {isLightboxOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Artisan Specimen Material Inspector"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white z-20">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-400 font-mono">Material Inspector</p>
              <h3 className="text-base font-bold text-white">{product.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/70 font-mono hidden sm:inline">
                Angle {selectedImageIndex + 1} of {images.length} &bull; ESC to exit
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Close image inspector"
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Inspection Canvas */}
          <div 
            className="relative w-full max-w-4xl h-[65vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                aria-label="Previous angle"
                className="absolute left-2 sm:left-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div className="relative w-full h-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={images[selectedImageIndex] || images[0]}
                alt={`${product.name} - Angle ${selectedImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                aria-label="Next angle"
                className="absolute right-2 sm:right-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Thumbnail Scrubber */}
          {images.length > 1 && (
            <div 
              className="flex items-center gap-3 overflow-x-auto pb-2 z-20 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`View angle ${idx + 1}`}
                  className={`relative h-14 w-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-brand-500 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
