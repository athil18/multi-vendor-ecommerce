/**
 * Main Application Navigation Bar with Real-Time Agent Governance Indicator
 * Hardware-Accelerated CSS Transitions (Zero Global framer-motion Runtime)
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent design-whimsy-injector
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 * @agent testing-performance-benchmarker
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useThemeStore } from '@/store/useThemeStore';
import { LogOut, Shield, X, Trash2, Plus, Minus, ChevronDown, Flame, ArrowRight, PackageOpen, Scale } from 'lucide-react';
import { 
  SearchIcon, 
  ShoppingCartIcon, 
  ShoppingBagIcon, 
  StoreIcon, 
  MenuDrawerIcon, 
  SecureLockIcon 
} from './ui/icons';
import { Button } from './ui/Button';
import { NexusLogo } from './NexusLogo';
import { SiteSearchModal } from './ui/SiteSearchModal';
import { ThemeToggle } from './ui/ThemeToggle';
import { ConfirmationModal } from './ui/ConfirmationModal';

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const setRole = useAuthStore((state) => state.setRole);
  const logoutUser = useAuthStore((state) => state.logout);

  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateCartQuantity = useCartStore((state) => state.updateCartQuantity);

  const theme = useThemeStore((state) => state.theme);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const cartDrawerRef = useRef<HTMLDivElement>(null);

  // Global search hotkey (Cmd+K / Ctrl+K) and Escape handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isCartOpen) setIsCartOpen(false);
        if (isMegaMenuOpen) setIsMegaMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isCartOpen, isMegaMenuOpen]);

  // Accessibility focus trap & keyboard return for Cart Drawer (WCAG 2.4.3 & 2.1.2)
  useEffect(() => {
    if (!isCartOpen) return;

    const drawer = cartDrawerRef.current;
    if (!drawer) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = drawer.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusableElements.length > 0) {
      // Focus close button initially
      focusableElements[0].focus();
    }

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const elements = drawer?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!elements || elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      cartTriggerRef.current?.focus();
    };
  }, [isCartOpen]);

  const compareItems = useCompareStore((state) => state.items);
  const setIsCompareOpen = useCompareStore((state) => state.setIsOpen);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* ── Top Announcement Protocol Bar per Stitch Design System ───── */}
      <aside className="w-full bg-[#111113] text-white/90 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-white/10 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-wider uppercase border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Verified Protocol
          </span>
          <span className="hidden sm:inline text-white/70 text-[11px]">Nexus Escrow secures funds until delivery verification.</span>
        </div>
        <div className="flex items-center gap-4 text-white/70 text-[11px] font-mono">
          <span>Direct Atelier Sourcing</span>
          <span className="text-white/30">•</span>
          <span>Zero Secondary Counterfeits</span>
        </div>
      </aside>

      {/* High-Fashion Editorial Header (SSENSE / Balenciaga Art Direction) */}
      <header className="sticky top-0 z-40 w-full border-b border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left Zone: Architectural Brand Monogram & High-Fashion Category Nav */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/" aria-label="Nexus Homepage" className="group flex items-center gap-2 select-none">
              <span className="font-black text-base tracking-[0.25em] uppercase text-[#000000] dark:text-[#ffffff] group-hover:opacity-75 transition-opacity">
                NEXUS
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 dark:text-neutral-500 border-l border-neutral-300 dark:border-neutral-700 pl-2">
                ARCHIVE
              </span>
            </Link>

            {/* High-Fashion Category Links matching Stitch Taxonomy */}
            <nav className="hidden lg:flex items-center gap-7 text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400">
              <button
                type="button"
                aria-label="Shop categories menu"
                aria-expanded={isMegaMenuOpen}
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsMegaMenuOpen((prev) => !prev);
                  }
                }}
                className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>COLLECTIONS</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <Link
                href="/stores"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                ATELIERS
              </Link>
              <Link
                href="/products"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                OBJECTS
              </Link>
              <Link
                href="/products?category=Apparel"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                APPAREL
              </Link>
              <Link
                href="/products?category=Living"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                LIVING
              </Link>
              <Link
                href="/products?category=Luxury"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                CURATIONS
              </Link>
              <Link
                href="/stores"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                MAKERS
              </Link>
              <Link
                href="/brain"
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                BRAIN
              </Link>

              {role === 'seller' && (
                <Link href="/seller" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors text-neutral-400">
                  SELLER
                </Link>
              )}
              {role === 'admin' && (
                <Link href="/admin" prefetch={false} className="hover:text-black dark:hover:text-white transition-colors text-neutral-400">
                  ADMIN
                </Link>
              )}
            </nav>
          </div>

          {/* Center Zone: Search Trigger Pill */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search objects, ateliers, and specimens (Press Cmd+K to open)"
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-white/25 bg-black/[0.02] dark:bg-white/[0.03] text-[11px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 transition-all cursor-pointer group"
            >
              <SearchIcon size={12} className="text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span className="text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">SEARCH ARCHIVE & MAKERS</span>
              <kbd className="text-[10px] text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded px-1 font-sans">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Zone: Compare, Theme, Bag & Account */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search dialog"
              className="md:hidden h-9 w-9 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            >
              <SearchIcon size={16} />
            </button>

            {/* Quick Compare Trigger */}
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              aria-label={`Compare specimens (${compareItems.length} selected)`}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-white/25 text-[11px] font-mono tracking-wider uppercase text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>COMPARE</span>
              {compareItems.length > 0 && (
                <span className="font-bold text-black dark:text-white tabular-nums">[{compareItems.length}]</span>
              )}
            </button>

            <ThemeToggle />

            {/* Bag Button (Stark High-Fashion Pill) */}
            <button
              ref={cartTriggerRef}
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping bag with ${cartCount} items`}
              aria-expanded={isCartOpen}
              className="flex items-center gap-2 h-9 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-white/25 text-[11px] font-mono tracking-widest uppercase text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
            >
              <ShoppingBagIcon size={14} />
              <span>BAG</span>
              <span className="font-bold tabular-nums">[{cartCount}]</span>
            </button>

            {/* Auth / Account */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-2 pl-3 border-l border-black/[0.08] dark:border-white/[0.08]">
                  <Link
                    href="/customer"
                    prefetch={false}
                    className="h-8 w-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs uppercase"
                  >
                    {user.name.charAt(0)}
                  </Link>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    aria-label="Sign out"
                    className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  prefetch={false}
                >
                  <button className="h-9 px-4 rounded-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-[11px] font-semibold tracking-widest uppercase transition-all">
                    LOGIN
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden h-9 w-9 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MenuDrawerIcon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hardware-Accelerated CSS Cart Drawer (Zero framer-motion Runtime) */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ease-out opacity-100 pointer-events-auto"
        >
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity" 
          onClick={() => setIsCartOpen(false)} 
        />
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div 
            ref={cartDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart Drawer"
            className={`pointer-events-auto w-screen max-w-md bg-white dark:bg-surface-900 shadow-2xl flex flex-col h-full border-l border-surface-200 dark:border-surface-800 relative z-10 transition-transform duration-300 ease-out transform will-change-transform ${
              isCartOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <ShoppingBagIcon size={20} className="text-brand-600 dark:text-brand-400" />
                Shopping Bag ({cartCount})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close shopping cart"
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Free Shipping & Free Gift Milestone Progress */}
            {cart.length > 0 && (
              <div className="px-6 py-3.5 bg-gradient-to-r from-brand-50/80 via-white to-amber-50/60 dark:from-brand-950/40 dark:via-surface-900 dark:to-amber-950/20 border-b border-surface-200/80 dark:border-surface-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-surface-800 dark:text-surface-200">
                  <span className="flex items-center gap-1.5 truncate">
                    {cartTotal >= 200 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Free Shipping & $35 Care Gift Unlocked!</span>
                    ) : cartTotal >= 150 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Free Shipping! Add ${(200 - cartTotal).toFixed(2)} for Free $35 Gift</span>
                    ) : (
                      <span>Add ${(150 - cartTotal).toFixed(2)} for Free Shipping</span>
                    )}
                  </span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 font-mono text-[11px] flex-shrink-0">
                    ${cartTotal.toFixed(2)} / $200
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-amber-500 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(100, Math.round((cartTotal / 200) * 100))}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-surface-400 font-medium">
                  <span className={cartTotal >= 150 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>$150: Free Ship</span>
                  <span className={cartTotal >= 200 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>$200: Free $35 Gift</span>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-surface-100 dark:divide-surface-800">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                  <div className="rounded-full bg-surface-100 dark:bg-surface-800 p-8">
                    <ShoppingBagIcon size={48} className="text-surface-300 dark:text-surface-600" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">Your bag is empty</h3>
                  <p className="text-xs text-surface-500 max-w-xs leading-relaxed">Discover handcrafted items and artisan creations across our catalog.</p>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 rounded-lg px-8 text-xs font-bold"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div 
                    key={`${item.productId}-${item.variantId || 'default'}-${idx}`} 
                    className="flex py-5 gap-4 transition-all duration-200"
                  >
                    <div className="h-20 w-20 flex-shrink-0 relative overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <PackageOpen className="w-8 h-8 text-surface-400" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start text-sm font-bold text-surface-900 dark:text-white mb-1">
                          <h3 className="line-clamp-1 pr-2">{item.name}</h3>
                          <p className="text-brand-600 dark:text-brand-400 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        {item.variantId && (
                          <p className="text-[10px] text-surface-500 font-medium bg-surface-100 dark:bg-surface-800 inline-block px-2 py-0.5 rounded">Variant: {item.variantId.substring(0, 8)}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-lg bg-surface-50 dark:bg-surface-800 shadow-sm">
                          <button
                            onClick={() => item.quantity > 1 ? updateCartQuantity(item.productId, item.quantity - 1, item.variantId) : removeFromCart(item.productId, item.variantId)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="h-7 w-7 flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-surface-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.variantId)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="h-7 w-7 flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="font-medium text-red-500 hover:text-red-600 flex items-center justify-center h-7 w-7 bg-red-50 dark:bg-red-950/20 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Checkout Info */}
            {cart.length > 0 && (
              <div className="border-t border-surface-200 dark:border-surface-800 px-6 py-6 bg-surface-50 dark:bg-surface-900">
                <div className="flex justify-between text-base font-bold text-surface-900 dark:text-white mb-1">
                  <p>Subtotal</p>
                  <p className="text-brand-600 dark:text-brand-400 text-xl font-black font-geist">${cartTotal.toFixed(2)}</p>
                </div>
                <p className="text-xs text-surface-500 mb-5 font-medium flex items-center gap-1.5">
                  <SecureLockIcon size={14} className="text-emerald-500 inline" /> Escrow protected &bull; Calculated at checkout
                </p>
                
                <Link
                  href="/checkout"
                  prefetch={false}
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full"
                >
                  <Button size="lg" className="w-full text-sm font-bold h-13 shadow-lg shadow-brand-500/20 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2">
                    <SecureLockIcon size={16} /> Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="pointer-events-auto absolute inset-y-0 left-0 w-4/5 max-w-xs bg-white dark:bg-surface-900 shadow-2xl flex flex-col h-full border-r border-surface-200 dark:border-surface-800 p-6 z-10 transition-transform duration-300 ease-out"
          >
            <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800">
              <NexusLogo href="/" size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="mt-4 w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-brand-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SearchIcon size={14} className="text-surface-400" />
                <span>Search catalog...</span>
              </div>
              <kbd className="text-[10px] font-mono font-bold bg-surface-200 dark:bg-surface-700 px-1.5 py-0.5 rounded text-surface-500">⌘K</kbd>
            </button>

            <nav className="flex flex-col gap-3 py-6 font-bold text-surface-800 dark:text-surface-200">
              <Link 
                href="/products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-base hover:text-brand-600 transition-colors"
              >
                All Products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/stores" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-base hover:text-brand-600 transition-colors"
              >
                Creator Stores <ArrowRight className="h-4 w-4" />
              </Link>
              
              <div className="pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-widest text-surface-400">
                Categories
              </div>
              <Link 
                href="/products?category=Tech+Gear" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-brand-600 transition-colors pl-2"
              >
                • Tech Gear & Audio
              </Link>
              <Link 
                href="/products?category=Fitness" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-brand-600 transition-colors pl-2"
              >
                • Sports & Outdoors
              </Link>
              <Link 
                href="/products?category=Sustainable" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-brand-600 transition-colors pl-2"
              >
                • Sustainable Living
              </Link>
              <Link 
                href="/products?category=Luxury" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-1.5 text-sm text-surface-600 dark:text-surface-400 hover:text-brand-600 transition-colors pl-2"
              >
                • Luxury Goods
              </Link>
              <Link 
                href="/brain" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm text-brand-600 dark:text-brand-400 font-bold hover:text-brand-700 transition-colors pl-2"
              >
                🧠 Commerce Brain & Skills
              </Link>

              {role === 'seller' && (
                <Link 
                  href="/seller" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  prefetch={false}
                  className="flex items-center gap-2 py-2 mt-2 text-brand-600 dark:text-brand-400 font-bold"
                >
                  <StoreIcon size={16} /> Seller Dashboard
                </Link>
              )}
              {role === 'admin' && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  prefetch={false}
                  className="flex items-center gap-2 py-2 mt-2 text-surface-900 dark:text-white font-medium"
                >
                  <Shield className="h-4 w-4" /> Admin Console
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-surface-200 dark:border-surface-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-surface-500">Theme</span>
                <ThemeToggle variant="dropdown" />
              </div>

              {user ? (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-surface-800 dark:text-surface-200">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <SiteSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          logoutUser();
          setIsLogoutModalOpen(false);
        }}
        title="Sign out of Nexus?"
        message="Are you sure you want to sign out? Your session will end, but your cart items will be preserved on this device."
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        variant="danger"
      />
    </>
  );
}
