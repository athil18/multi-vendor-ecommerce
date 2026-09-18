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

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useThemeStore } from '@/store/useThemeStore';
import { ShoppingCart, Sun, Moon, LogOut, Store, Shield, X, Trash2, Plus, Minus, ChevronDown, Flame, ArrowRight, Menu, Search, PackageOpen, Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { AgentComplianceBadge } from './ui/AgentComplianceBadge';
import { NexusLogo } from './NexusLogo';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const setRole = useAuthStore((state) => state.setRole);
  const logoutUser = useAuthStore((state) => state.logout);

  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateCartQuantity = useCartStore((state) => state.updateCartQuantity);

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-surface-200/50 dark:border-surface-800/50 bg-white/70 dark:bg-surface-950/70 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <div className="flex items-center gap-6 lg:gap-10">
            <NexusLogo href="/" size="md" />

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-bold text-surface-600 dark:text-surface-300">
              <Link
                href="/products"
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase tracking-widest text-[11px] rounded px-1"
              >
                Products
              </Link>

              <Link
                href="/stores"
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase tracking-widest text-[11px] rounded px-1"
              >
                Stores
              </Link>

              <div 
                className="relative group py-8"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <button 
                  aria-label="Shop categories menu"
                  aria-expanded={isMegaMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsMegaMenuOpen((prev) => !prev);
                    }
                  }}
                  className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase tracking-widest text-[11px] rounded px-1"
                >
                  Categories <ChevronDown className="h-3 w-3" />
                </button>
                
                {/* Mega Menu with Zero-JS CSS Transition */}
                <div 
                  className={`absolute top-full left-[-200px] w-[800px] glass-panel-dribbble p-8 grid grid-cols-3 gap-8 rounded-3xl transition-all duration-200 ease-out transform will-change-transform ${
                    isMegaMenuOpen 
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                      : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="col-span-1 border-r border-surface-200 dark:border-surface-800 pr-8">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-4 font-bold text-lg">
                      <Flame className="h-5 w-5" /> Trending
                    </div>
                    <ul className="space-y-4">
                      <li><Link href="/products?category=Tech+Gear" className="text-surface-600 dark:text-surface-400 hover:text-brand-600 text-sm block">Mechanical Keyboards & Audio</Link></li>
                      <li><Link href="/products?category=Fitness" className="text-surface-600 dark:text-surface-400 hover:text-brand-600 text-sm block">Sports & Fitness</Link></li>
                      <li><Link href="/products?category=Sustainable" className="text-surface-600 dark:text-surface-400 hover:text-brand-600 text-sm block">Sustainable Living</Link></li>
                      <li><Link href="/products?category=Luxury" className="text-surface-600 dark:text-surface-400 hover:text-brand-600 text-sm block">Luxury Artisan Goods</Link></li>
                    </ul>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-6">
                    <Link href="/products" className="group cursor-pointer">
                      <div className="h-32 w-full rounded-2xl bg-surface-200 dark:bg-surface-800 mb-4 overflow-hidden relative">
                        <Image src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600" alt="New Arrivals" fill sizes="300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h4 className="font-bold text-surface-900 dark:text-white flex items-center gap-1">New Arrivals <ArrowRight className="h-4 w-4" /></h4>
                    </Link>
                    <Link href="/stores" className="group cursor-pointer">
                      <div className="h-32 w-full rounded-2xl bg-surface-200 dark:bg-surface-800 mb-4 overflow-hidden relative">
                        <Image src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80&w=600" alt="Top Creators" fill sizes="300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h4 className="font-bold text-surface-900 dark:text-white flex items-center gap-1">Top Creators <ArrowRight className="h-4 w-4" /></h4>
                    </Link>
                  </div>
                </div>
              </div>

              {role === 'seller' && (
                <Link href="/seller" prefetch={false} className="flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors uppercase tracking-widest text-[11px]">
                  <Store className="h-3 w-3" />
                  Seller Panel
                </Link>
              )}
              {role === 'admin' && (
                <Link href="/admin" prefetch={false} className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 uppercase tracking-widest text-[11px]">
                  <Shield className="h-3 w-3" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <form action="/products" method="GET" className="relative w-full">
              <input
                type="text"
                name="search"
                placeholder="Search catalog or makers..."
                aria-label="Search catalog"
                className="w-full bg-surface-100 dark:bg-surface-900 text-surface-900 dark:text-surface-100 text-xs rounded-full pl-9 pr-4 py-2 border border-surface-200 dark:border-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-surface-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
            </form>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="h-10 w-10 flex items-center justify-center rounded-full text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping cart with ${cartCount} items`}
              aria-expanded={isCartOpen}
              className="relative h-10 w-10 flex items-center justify-center rounded-full text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-black text-white shadow-md ring-2 ring-white dark:ring-surface-950">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="flex items-center justify-end">
              {user ? (
                <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-surface-200 dark:border-surface-800">
                  <Link href="/customer" prefetch={false} className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                  </Link>
                  <button
                    onClick={logoutUser}
                    aria-label="Sign out"
                    className="h-10 w-10 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  prefetch={false}
                  className="ml-1 sm:ml-2"
                >
                  <Button variant="primary" size="sm" className="rounded-full px-3 sm:px-6 text-xs sm:text-sm">Sign In</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-full text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all ml-1"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsCartOpen(false)} 
        />
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div 
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
                <ShoppingCart className="h-5 w-5 text-brand-600" />
                Shopping Bag ({cartCount})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close shopping cart"
                className="h-8 w-8 flex items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {cart.length > 0 && (
              <div className="px-6 py-3 bg-brand-50/60 dark:bg-brand-950/40 border-b border-surface-200/60 dark:border-surface-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-surface-700 dark:text-surface-300">
                  <span>{cartTotal >= 150 ? '✓ Free carbon-neutral shipping unlocked!' : `Add $${(150 - cartTotal).toFixed(2)} more for Free Shipping`}</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{Math.min(100, Math.round((cartTotal / 150) * 100))}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (cartTotal / 150) * 100)}%` }} 
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-surface-100 dark:divide-surface-800">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
                  <div className="rounded-full bg-surface-100 dark:bg-surface-800 p-8">
                    <ShoppingCart className="h-12 w-12 text-surface-300 dark:text-surface-600" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">Your bag is empty</h3>
                  <p className="text-xs text-surface-500 max-w-xs leading-relaxed">Discover handcrafted items and artisan creations across our catalog.</p>
                  <Button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 rounded-full px-8 text-xs font-bold"
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
                        <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-full bg-surface-50 dark:bg-surface-800 shadow-sm">
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
                          className="font-medium text-red-500 hover:text-red-600 flex items-center justify-center h-7 w-7 bg-red-50 dark:bg-red-950/20 rounded-full transition-colors"
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
              <div className="border-t border-surface-200 dark:border-surface-800 px-6 py-6 bg-surface-50/80 dark:bg-surface-900/80 backdrop-blur-md">
                <div className="flex justify-between text-base font-bold text-surface-900 dark:text-white mb-1">
                  <p>Subtotal</p>
                  <p className="text-brand-600 dark:text-brand-400 text-xl font-black font-geist">${cartTotal.toFixed(2)}</p>
                </div>
                <p className="text-xs text-surface-500 mb-5 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500 inline" /> Escrow protected &bull; Calculated at checkout
                </p>
                
                <Link
                  href="/checkout"
                  prefetch={false}
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full"
                >
                  <Button size="lg" className="w-full text-sm font-bold h-13 shadow-lg shadow-brand-500/20 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" /> Proceed to Checkout
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="pointer-events-auto absolute inset-y-0 left-0 w-4/5 max-w-xs bg-white dark:bg-surface-900 shadow-2xl flex flex-col h-full border-r border-surface-200 dark:border-surface-800 p-6 z-10 transition-transform duration-300 ease-out"
          >
            <div className="flex items-center justify-between pb-6 border-b border-surface-200 dark:border-surface-800">
              <NexusLogo href="/" size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="h-8 w-8 flex items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

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

              {role === 'seller' && (
                <Link 
                  href="/seller" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  prefetch={false}
                  className="flex items-center gap-2 py-2 mt-2 text-brand-600 dark:text-brand-400 font-bold"
                >
                  <Store className="h-4 w-4" /> Seller Dashboard
                </Link>
              )}
              {role === 'admin' && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  prefetch={false}
                  className="flex items-center gap-2 py-2 mt-2 text-purple-600 dark:text-purple-400 font-bold"
                >
                  <Shield className="h-4 w-4" /> Admin Console
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-surface-200 dark:border-surface-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-surface-500">Theme</span>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle color theme"
                  className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
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
                    onClick={() => { logoutUser(); setIsMobileMenuOpen(false); }}
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
    </>
  );
}
