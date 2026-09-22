/**
 * 25-Lakh Tier Luxury Product Studio View
 * Interactive multi-angle studio viewer, zoom loupe, tabbed dossier, and sticky purchase dock.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent design-whimsy-injector
 * @agent testing-accessibility-auditor
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, ShieldCheck, Truck, RotateCcw, PackageCheck, 
  Store, CheckCircle, Sparkles, Scale, Check, Eye, 
  Compass, Award, Leaf, Layers, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/store/useCompareStore';

interface ProductStudioViewProps {
  product: any;
}

export function ProductStudioView({ product }: ProductStudioViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'provenance' | 'atelier' | 'escrow' | 'sustainability'>('provenance');
  const [showStickyDock, setShowStickyDock] = useState(false);
  const mainBuyButtonRef = useRef<HTMLDivElement>(null);

  const { addToCompare, isInCompare } = useCompareStore();
  const productId = product.id || product._id;
  const isCompared = isInCompare(productId);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'];

  // Scroll listener for sticky quick-purchase dock
  useEffect(() => {
    const handleScroll = () => {
      if (!mainBuyButtonRef.current) return;
      const rect = mainBuyButtonRef.current.getBoundingClientRect();
      setShowStickyDock(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const averageRating = product.averageRating || product.rating || 4.9;
  const reviewCount = product.reviewCount || product.numReviews || 28;
  const productPrice = Number(product.basePrice ?? product.price ?? 0);
  const storeName = product.store?.name || product.storeName || 'Independent Atelier Studio';

  return (
    <div className="relative">
      {/* ─── Main Two-Column Studio Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 glass-luxury-card specular-border rounded-3xl p-6 sm:p-10 shadow-2xl">
        
        {/* Left Column: Interactive Multi-Angle Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Main Stage Image with Zoom & Specular Sheen */}
          <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-surface-100 dark:bg-surface-950 border border-surface-200/80 dark:border-surface-800 shadow-inner group">
            <Image
              src={images[selectedImageIndex] || images[0]}
              alt={`${product.name} Angle ${selectedImageIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="specular-pill text-[10px] font-bold text-surface-900 dark:text-white shadow-sm">
                {product.category?.name || product.categoryName || 'Master Specimen'}
              </span>
              <span className="specular-pill text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                Batch 04 &bull; Unit #12
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
                    price: productPrice,
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

            {/* Bottom Live Viewer Urgency Pill */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white/90 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>4 collectors currently inspecting this creation</span>
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
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Title & Ratings */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-amber-700 dark:text-amber-300 font-bold text-xs">
                    {Number(averageRating).toFixed(1)}
                  </span>
                  <span className="text-surface-400 text-[11px]">({reviewCount} reviews)</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Ready for Commission
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white tracking-tight font-sans leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price & Escrow Note */}
            <div className="p-4 rounded-2xl bg-surface-50/80 dark:bg-surface-850/80 border border-surface-200/60 dark:border-surface-800">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white font-geist">
                  ${productPrice.toFixed(2)}
                </span>
                <span className="text-xs text-surface-500 font-medium">USD &bull; Taxes & Duties Included</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Escrow Protected: Funds released only after delivery approval.</span>
              </div>
            </div>

            {/* Atelier Maker Card */}
            <div className="p-4 rounded-2xl glass-luxury-card specular-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-surface-900 dark:text-white">
                      {storeName}
                    </span>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-surface-500">Verified Master Workshop &bull; Kyoto & Florence</p>
                </div>
              </div>
              <Link href={`/store/${product.sellerId || 'store-1'}`}>
                <Button variant="outline" size="sm" className="rounded-full text-xs font-bold px-4">
                  Visit Studio
                </Button>
              </Link>
            </div>

            {/* Editorial Description */}
            <div className="border-t border-surface-200/60 dark:border-surface-800/80 pt-4">
              <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed font-normal">
                {product.description}
              </p>
            </div>
          </div>

          {/* Primary Action Button (Targeted by Scroll Observer) */}
          <div ref={mainBuyButtonRef} className="mt-8 pt-6 border-t border-surface-200/60 dark:border-surface-800/80 space-y-3">
            <AddToCartButton
              productId={productId}
              name={product.name}
              price={productPrice}
              image={images[0]}
              className="w-full h-14 text-sm font-bold shadow-xl shadow-brand-500/20 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            />
            
            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-3 rounded-2xl bg-surface-50/50 dark:bg-surface-850/50 border border-surface-200/50 dark:border-surface-800/50">
                <ShieldCheck className="h-4 w-4 text-brand-500 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">Escrow Vault</span>
                <span className="text-[9px] text-surface-400">Zero Risk</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-50/50 dark:bg-surface-850/50 border border-surface-200/50 dark:border-surface-800/50">
                <Truck className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-surface-900 dark:text-white block">Inspected Route</span>
                <span className="text-[9px] text-surface-400">Carbon Offset</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-50/50 dark:bg-surface-850/50 border border-surface-200/50 dark:border-surface-800/50">
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
                  Constructed utilizing aerospace-grade 6063 aluminum alloy and hand-selected full-grain Tuscan hides. Every batch is certified for metallurgical purity and ethical vegetable tanning without harmful chromates.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                    <span className="text-surface-400">Primary Alloy</span>
                    <span className="font-bold text-surface-800 dark:text-surface-200">CNC Milled 6063-T6 Aluminum</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                    <span className="text-surface-400">Leather Tannery</span>
                    <span className="font-bold text-surface-800 dark:text-surface-200">Consorzio Vera Pelle Italiana</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-surface-200/50 dark:border-surface-800 text-xs">
                    <span className="text-surface-400">Acoustic Drivers</span>
                    <span className="font-bold text-surface-800 dark:text-surface-200">98mm Planar Magnetic Transducers</span>
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
                  Upon delivery confirmation, your customer account receives a cryptographically signed provenance receipt containing the artisan's signature, batch serial, and material lot number.
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
                All components are designed for modular disassembly. Replacement ear pads, cables, and structural screws are stocked indefinitely, preventing planned obsolescence.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Sticky Quick-Purchase Dock (Appears on Scroll) ─────────────────── */}
      {showStickyDock && (
        <aside
          aria-label="Quick Checkout Dock"
          className="fixed bottom-0 inset-x-0 z-50 glass-dock py-3 px-4 sm:px-8 border-t border-white/20 dark:border-surface-700/60 shadow-2xl animate-in slide-in-from-bottom duration-300"
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
    </div>
  );
}
