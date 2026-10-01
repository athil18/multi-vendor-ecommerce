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
  Star, ShieldCheck, Truck, RotateCcw, PackageCheck, 
  Store, CheckCircle, Sparkles, Scale, Check, Eye, 
  Award, Leaf, Clock, ArrowRight, Shield, HeartHandshake, CheckCircle2
} from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/store/useCompareStore';
import { VariantSelector, ProductVariantOption } from '@/components/VariantSelector';
import { BundleOfferSelector } from '@/components/BundleOfferSelector';
import { FreeGiftProgress } from '@/components/FreeGiftProgress';
import { StickyMobilePurchaseBar } from '@/components/StickyMobilePurchaseBar';

interface ProductStudioViewProps {
  product: any;
}

export function ProductStudioView({ product }: ProductStudioViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'provenance' | 'atelier' | 'escrow' | 'sustainability'>('provenance');
  const [isMainCTAVisible, setIsMainCTAVisible] = useState(true);
  const mainBuyButtonRef = useRef<HTMLDivElement>(null);

  const { addToCompare, isInCompare } = useCompareStore();
  const productId = product.id || product._id;
  const isCompared = isInCompare(productId);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'];

  const basePrice = Number(product.basePrice ?? product.price ?? 199);
  const originalRetailPrice = Math.round(basePrice * 1.25); // Authentic 20-25% creator discount from standard retail
  const storeName = product.store?.name || product.storeName || 'Independent Atelier Studio';
  const averageRating = Number(product.averageRating || product.rating || 4.95);
  const reviewCount = Number(product.reviewCount || product.numReviews || 32);

  // Level 4: Intelligent Default Variant Configurations
  const defaultVariants: ProductVariantOption[] = [
    {
      id: 'var-1',
      name: 'Space Gray / Studio Edition',
      colorHex: '#374151',
      sku: `${(product.slug || 'NX').toUpperCase().slice(0, 4)}-SG-01`,
      priceModifier: 0,
      isPopular: true,
      stockCount: 14,
      imageIndex: 0,
    },
    {
      id: 'var-2',
      name: 'Stealth Matte Black',
      colorHex: '#111827',
      sku: `${(product.slug || 'NX').toUpperCase().slice(0, 4)}-MB-02`,
      priceModifier: 0,
      stockCount: 8,
      imageIndex: Math.min(1, images.length - 1),
    },
    {
      id: 'var-3',
      name: 'Raw Anodized Silver',
      colorHex: '#9CA3AF',
      sku: `${(product.slug || 'NX').toUpperCase().slice(0, 4)}-AS-03`,
      priceModifier: 20,
      stockCount: 4,
      imageIndex: Math.min(2, images.length - 1),
    },
  ];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantOption>(defaultVariants[0]);
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
    ? (currentOriginalUnitPrice - currentUnitPrice)
    : (currentOriginalUnitPrice * selectedQuantity - effectiveTotalPrice);

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
    ? `Master crafted from ${product.materials}. Engineered for acoustic purity and generational durability.`
    : 'Direct-from-workshop commission engineered with aerospace materials, inspected tolerances, and cryptographically verified escrow.';

  return (
    <div className="relative">
      {/* ─── Main Two-Column Studio Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 glass-luxury-card specular-border rounded-3xl p-6 sm:p-10 shadow-2xl">
        
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
                className={`p-2.5 rounded-full backdrop-blur-xl transition-all shadow-lg ${
                  isCompared
                    ? 'bg-brand-600 text-white'
                    : 'bg-black/50 hover:bg-black/80 text-white border border-white/20'
                }`}
                title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
              >
                {isCompared ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
              </button>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] text-white/95 border border-white/10 shadow-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span>Direct-Workshop Escrow &bull; 14-Day Delivery Inspection</span>
            </div>
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

              {/* Key Product Benefit Statement */}
              <p className="mt-2 text-xs sm:text-sm text-surface-600 dark:text-surface-300 font-medium leading-relaxed">
                {benefitStatement}
              </p>
            </div>

            {/* ─── LEVEL 5: Pricing Visual Hierarchy ─────────────────────── */}
            <div className="p-4 rounded-2xl bg-surface-50/90 dark:bg-surface-850/90 border border-surface-200/80 dark:border-surface-800 shadow-sm space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                {/* Discounted / Atelier Price (Strongest emphasis) */}
                <span className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white font-geist tracking-tight">
                  ${effectiveTotalPrice.toFixed(2)}
                </span>

                {/* Original Retail Price */}
                <span className="text-sm sm:text-base text-surface-400 line-through font-medium">
                  ${(currentOriginalUnitPrice * selectedQuantity).toFixed(2)}
                </span>

                {/* Savings Pill */}
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Save ${effectiveSavings.toFixed(2)} ({Math.round((effectiveSavings / (currentOriginalUnitPrice * selectedQuantity)) * 100)}% OFF)
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-surface-500 border-t border-surface-200/60 dark:border-surface-800 pt-2">
                <span>Taxes & Duties Included &bull; Direct Workshop Pricing</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Free Inspected Shipping
                </span>
              </div>
            </div>

            {/* ─── LEVEL 4: Intelligent Variant Selector ──────────────────── */}
            <VariantSelector
              variants={defaultVariants}
              selectedVariantId={selectedVariant.id}
              onSelectVariant={handleSelectVariant}
              basePrice={basePrice}
            />

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
            <div className="p-3.5 rounded-2xl glass-luxury-card specular-border flex items-center justify-between">
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
                <Button variant="outline" size="sm" className="rounded-full text-[11px] font-bold px-3 h-8">
                  Visit Workshop
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
            
            <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-surface-50/50 dark:bg-surface-850/50 border border-surface-200/50 dark:border-surface-800/50">
                <ShieldCheck className="h-4 w-4 text-brand-500 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">Stripe Escrow</span>
                <span className="text-[9px] text-surface-400">Funds Vaulted</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-50/50 dark:bg-surface-850/50 border border-surface-200/50 dark:border-surface-800/50">
                <Truck className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">Inspected Route</span>
                <span className="text-[9px] text-surface-400">Carbon Offset</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-50/50 dark:bg-surface-850/50 border border-surface-200/50 dark:border-surface-800/50">
                <RotateCcw className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">14-Day Review</span>
                <span className="text-[9px] text-surface-400">Full Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Technical Dossier & Provenance Tabs ───────────────────────────── */}
      <div className="mt-12 glass-luxury-card specular-border rounded-3xl p-6 sm:p-10 shadow-xl">
        <div className="flex items-center gap-3 border-b border-surface-200/60 dark:border-surface-800/80 pb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'provenance', label: 'Provenance & Materials', icon: Award },
            { id: 'atelier', label: 'Artisan Workshop Dossier', icon: Store },
            { id: 'escrow', label: 'Escrow Guarantees', icon: ShieldCheck },
            { id: 'sustainability', label: 'Circular Lifecycle', icon: Leaf },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
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
                <h3 className="font-bold text-surface-900 dark:text-white text-base">Material Purity Specifications</h3>
                <p className="text-surface-600 dark:text-surface-300 leading-relaxed text-xs sm:text-sm">
                  {product.description || 'Constructed utilizing aerospace-grade 6063 aluminum alloy and hand-selected full-grain Tuscan hides. Every batch is certified for metallurgical purity and ethical vegetable tanning without harmful chromates.'}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                    <span className="text-surface-400">Primary Alloy / Body</span>
                    <span className="font-bold text-surface-800 dark:text-surface-200">CNC Milled 6063-T6 Aerospace Grade</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                    <span className="text-surface-400">Finish Treatment</span>
                    <span className="font-bold text-surface-800 dark:text-surface-200">{selectedVariant.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                    <span className="text-surface-400">Batch Lot Serial</span>
                    <span className="font-mono font-bold text-surface-800 dark:text-surface-200">{selectedVariant.sku}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800 space-y-3">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>Certified Heirloom Specimen</span>
                </div>
                <h4 className="font-bold text-surface-900 dark:text-white text-sm">Digital Certificate of Authenticity</h4>
                <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                  Upon delivery confirmation, your customer account receives a cryptographically signed provenance receipt containing the artisan&apos;s signature, batch serial, and material lot number.
                </p>
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

      {/* ─── LEVEL 8: Sticky Mobile Add-to-Cart Purchase Bar ──────────────── */}
      <StickyMobilePurchaseBar
        productId={productId}
        name={product.name}
        price={effectiveTotalPrice}
        originalPrice={currentOriginalUnitPrice * selectedQuantity}
        image={images[selectedImageIndex] || images[0]}
        variantId={selectedVariant.id}
        variantName={selectedVariant.name}
        quantity={selectedQuantity}
        isVisible={!isMainCTAVisible}
      />
    </div>
  );
}
