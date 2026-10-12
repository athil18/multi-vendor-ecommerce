/**
 * Nexus 200k+ Vector Icon Design System & Live Explorer
 * 
 * Interactive studio for previewing, filtering, sizing, and copying
 * production-ready zero-runtime React SVG icon components.
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent design-whimsy-injector
 * @agent engineering-frontend-developer
 */

'use client';

import React, { useState } from 'react';
import * as Icons from './icons';
import { Button } from './Button';

interface IconMetadata {
  name: string;
  category: 'ecommerce' | 'payments' | 'navigation' | 'storefront';
  description: string;
  tags: string[];
}

const ICON_REGISTRY: IconMetadata[] = [
  // E-Commerce
  { name: 'ShoppingBagIcon', category: 'ecommerce', description: 'Luxury shopping tote with handles', tags: ['bag', 'cart', 'shop', 'retail'] },
  { name: 'ShoppingCartIcon', category: 'ecommerce', description: 'Classic linear checkout trolley', tags: ['cart', 'trolley', 'basket', 'checkout'] },
  { name: 'PriceTagIcon', category: 'ecommerce', description: 'Retail price discount tag', tags: ['tag', 'price', 'offer', 'deal'] },
  { name: 'ShippingTruckIcon', category: 'ecommerce', description: 'Express delivery logistics van', tags: ['truck', 'shipping', 'delivery', 'courier'] },
  { name: 'BuyerProtectionIcon', category: 'ecommerce', description: 'Escrow safety shield with verified checkmark', tags: ['shield', 'protection', 'trust', 'security'] },
  { name: 'ReturnPolicyIcon', category: 'ecommerce', description: '30-day hassle-free circular return arrow', tags: ['return', 'refund', 'policy', 'exchange'] },
  { name: 'OrderPackageIcon', category: 'ecommerce', description: 'Sealed parcel box shipment', tags: ['package', 'parcel', 'box', 'order'] },
  
  // Payments & Trust
  { name: 'VisaCardIcon', category: 'payments', description: 'Official Visa international emblem', tags: ['visa', 'card', 'payment', 'credit'] },
  { name: 'MastercardIcon', category: 'payments', description: 'Mastercard dual-circle brandmark', tags: ['mastercard', 'card', 'debit', 'payment'] },
  { name: 'StripePaymentIcon', category: 'payments', description: 'Stripe Connect multi-vendor escrow bridge', tags: ['stripe', 'escrow', 'payment', 'gateway'] },
  { name: 'ApplePayIcon', category: 'payments', description: 'Apple Pay one-touch checkout badge', tags: ['apple', 'pay', 'wallet', 'nfc'] },
  { name: 'GooglePayIcon', category: 'payments', description: 'Google Pay instant settlement emblem', tags: ['google', 'gpay', 'pay', 'checkout'] },
  { name: 'CreditCardIcon', category: 'payments', description: 'Universal linear magnetic credit card', tags: ['card', 'credit', 'payment', 'pos'] },
  { name: 'SecureLockIcon', category: 'payments', description: '256-bit SSL encrypted padlock', tags: ['lock', 'security', 'ssl', 'auth'] },

  // Navigation & Controls
  { name: 'SearchIcon', category: 'navigation', description: 'Predictive search magnifying glass', tags: ['search', 'find', 'lookup', 'query'] },
  { name: 'NotificationBellIcon', category: 'navigation', description: 'Real-time alert chime bell', tags: ['bell', 'notify', 'alert', 'notice'] },
  { name: 'WishlistHeartIcon', category: 'navigation', description: 'Customer curated wishlist favorite heart', tags: ['heart', 'wishlist', 'favorite', 'save'] },
  { name: 'UserAccountIcon', category: 'navigation', description: 'Artisan and buyer identity profile', tags: ['user', 'account', 'profile', 'member'] },
  { name: 'MenuDrawerIcon', category: 'navigation', description: 'Responsive hamburger mobile navigation', tags: ['menu', 'drawer', 'hamburger', 'nav'] },
  { name: 'CatalogFilterIcon', category: 'navigation', description: 'Multi-attribute facet sorting filter', tags: ['filter', 'sort', 'facet', 'refine'] },
  { name: 'SunModeIcon', category: 'navigation', description: 'Daylight aesthetic theme switch', tags: ['sun', 'light', 'theme', 'mode'] },
  { name: 'MoonModeIcon', category: 'navigation', description: 'Dark-mode glassmorphic theme switch', tags: ['moon', 'dark', 'night', 'theme'] },

  // Storefront & Marketplace
  { name: 'StoreIcon', category: 'storefront', description: 'Artisan boutique canopy storefront', tags: ['store', 'shop', 'vendor', 'seller', 'merchant'] },
  { name: 'FlashSaleIcon', category: 'storefront', description: 'High-voltage limited flash sale bolt', tags: ['zap', 'flash', 'lightning', 'sale', 'deal'] },
  { name: 'TrendingFlameIcon', category: 'storefront', description: 'Hot bestseller duotone trending flame', tags: ['fire', 'flame', 'trending', 'popular', 'hot'] },
  { name: 'AwardMedalIcon', category: 'storefront', description: 'Premier verified merchant distinction medal', tags: ['award', 'medal', 'top', 'winner', 'vetted'] },
  { name: 'StarRatingIcon', category: 'storefront', description: 'Gold customer review rating star', tags: ['star', 'rating', 'review', 'score'] },
  { name: 'HelpCircleIcon', category: 'storefront', description: 'Artisan support knowledgebase question mark', tags: ['help', 'support', 'question', 'faq'] },
  { name: 'GiftBoxIcon', category: 'storefront', description: 'Complimentary gift with luxury purchase', tags: ['gift', 'box', 'bonus', 'reward'] },
  { name: 'PercentDiscountIcon', category: 'storefront', description: 'Promotional percentage promo coupon', tags: ['percent', 'discount', 'coupon', 'promo'] },
  { name: 'CheckCircleBadgeIcon', category: 'storefront', description: 'Official artisan verified badge rosette', tags: ['check', 'verified', 'guaranteed', 'badge'] },
  { name: 'DisputeScaleIcon', category: 'storefront', description: 'Fair marketplace escrow arbitration scales', tags: ['scale', 'law', 'dispute', 'arbitration', 'fair'] },
];

export function IconDesignSystemGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [iconSize, setIconSize] = useState<number>(24);
  const [colorScheme, setColorScheme] = useState<string>('brand');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Icons (32)' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'payments', label: 'Payments & Trust' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'storefront', label: 'Storefront & Deals' },
  ];

  const colorClasses: Record<string, string> = {
    brand: 'text-brand-500 dark:text-brand-400 group-hover:text-brand-300',
    emerald: 'text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-300',
    amber: 'text-amber-500 dark:text-amber-400 group-hover:text-amber-300',
    rose: 'text-rose-500 dark:text-rose-400 group-hover:text-rose-300',
    cyan: 'text-cyan-500 dark:text-cyan-400 group-hover:text-cyan-300',
    mono: 'text-surface-900 dark:text-surface-100 group-hover:text-brand-400',
  };

  const filteredIcons = ICON_REGISTRY.filter((icon) => {
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (iconName: string) => {
    const snippet = `import { ${iconName} } from '@/components/ui/icons';\n\n<${iconName} size={${iconSize}} className="${colorClasses[colorScheme].split(' ')[0]}" />`;
    navigator.clipboard.writeText(snippet);
    setCopiedName(iconName);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="w-full bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 sm:p-8 shadow-xl transition-all">
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-surface-200/60 dark:border-surface-800/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Vector Design System 2.0
            </span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              0 KB Runtime Bloat
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white tracking-tight font-geist">
            Nexus Vector Icon Architecture
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 max-w-xl">
            Live interactive preview of auto-injected React TypeScript vector components. Click any icon card to copy its drop-in TSX code.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-surface-100/80 dark:bg-surface-900/80 p-3 rounded-2xl border border-surface-200/60 dark:border-surface-800/60">
          {/* Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Size:</span>
            <div className="flex items-center gap-1">
              {[16, 20, 24, 32, 40].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setIconSize(sz)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    iconSize === sz
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-surface-200/50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-700'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>

          <div className="h-5 w-px bg-surface-300 dark:bg-surface-700 hidden sm:block" />

          {/* Color Tint Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Accent:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'brand', bg: 'bg-brand-500' },
                { id: 'emerald', bg: 'bg-emerald-500' },
                { id: 'amber', bg: 'bg-amber-500' },
                { id: 'rose', bg: 'bg-rose-500' },
                { id: 'cyan', bg: 'bg-cyan-500' },
                { id: 'mono', bg: 'bg-surface-700 dark:bg-surface-300' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorScheme(c.id)}
                  aria-label={`Select ${c.id} color theme`}
                  className={`h-5 w-5 rounded-full ${c.bg} transition-all transform ${
                    colorScheme === c.id ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface-900 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900 shadow-md scale-105'
                  : 'bg-surface-100 dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Real-time Search Box */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search icons (e.g. cart, card, lock)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-9 rounded-xl bg-surface-100/90 dark:bg-surface-900/90 border border-surface-200/80 dark:border-surface-800/80 text-xs text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="absolute left-3 top-2.5 text-surface-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid of Injected Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredIcons.map((item) => {
          const IconComponent = (Icons as Record<string, React.FC<any>>)[item.name];
          if (!IconComponent) return null;

          const isCopied = copiedName === item.name;

          return (
            <div
              key={item.name}
              onClick={() => handleCopy(item.name)}
              className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-center ${
                isCopied
                  ? 'bg-emerald-500/10 border-emerald-500/50 scale-[1.02]'
                  : 'bg-white/60 dark:bg-surface-900/60 hover:bg-white dark:hover:bg-surface-850 border-surface-200/70 dark:border-surface-800/70 hover:border-brand-500/50 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {/* Copy Toast Overlay */}
              {isCopied && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold uppercase tracking-wider animate-bounce">
                  Copied!
                </div>
              )}

              {/* Icon Visual Frame */}
              <div className="h-16 w-16 rounded-xl bg-surface-50 dark:bg-surface-950/80 border border-surface-200/50 dark:border-surface-800/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className={colorClasses[colorScheme]}>
                  <IconComponent size={iconSize} />
                </div>
              </div>

              {/* Component Name */}
              <span className="text-xs font-bold text-surface-900 dark:text-surface-100 truncate max-w-full group-hover:text-brand-500 transition-colors">
                {item.name}
              </span>

              {/* Category Subtext */}
              <span className="text-[10px] text-surface-500 dark:text-surface-400 capitalize mt-0.5">
                {item.category}
              </span>

              {/* Description */}
              <p className="text-[10px] text-surface-400 dark:text-surface-500 line-clamp-1 mt-1 text-center font-normal">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {filteredIcons.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-surface-500 dark:text-surface-400">
            No icons matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Terminal Auto-Injection Helper Footer */}
      <div className="mt-8 p-4 rounded-2xl bg-surface-900 dark:bg-surface-950 text-surface-300 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-800">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">$</span>
          <span>npm run icon:search &quot;keyword&quot;</span>
          <span className="text-surface-600">|</span>
          <span className="text-brand-400">node scripts/icon-manager.js inject &lt;id&gt;</span>
        </div>
        <span className="text-[11px] text-surface-400">
          Direct access to 200,000+ vector icons across Lucide, Solar, Tabler, Simple Icons
        </span>
      </div>
    </div>
  );
}

export default IconDesignSystemGallery;
