/**
 * Conditional Layout Shell with Integrated Production UX Utilities
 * 
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 * @agent testing-performance-benchmarker
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TrustStrip } from '@/components/TrustStrip';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { BackToTop } from '@/components/ui/BackToTop';
import { FloatingContactButton } from '@/components/ui/FloatingContactButton';
import { UtmTracker } from '@/components/UtmTracker';

const ProductCompareTray = dynamic(
  () => import('@/components/ProductCompareTray').then((mod) => mod.ProductCompareTray),
  { ssr: false }
);

const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

/**
 * Conditionally renders global shell, navigation, footer, and production UX utilities.
 */
export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = pathname.startsWith('/seller');
  const hasSidebarLayout = isAdminRoute || isSellerRoute;

  if (hasSidebarLayout) {
    // Admin and Seller dashboards
    return (
      <>
        <ScrollProgressBar />
        <UtmTracker />
        <Toaster position="bottom-right" reverseOrder={false} />
        <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col focus:outline-none">
          {children}
        </main>
        <BackToTop />
        <CookieConsent />
      </>
    );
  }

  return (
    <>
      {/* 1. Subtle Reading & Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* 2. UTM Campaign Attribution Listener */}
      <UtmTracker />

      {/* 3. Toast Notifications */}
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* 4. Sticky Header with Search, Theme & Mobile Drawer */}
      <Navbar />

      {/* 5. Trust-First Navigation Strip */}
      <TrustStrip />

      {/* 6. Accessible Main Landmark */}
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col focus:outline-none">
        {children}
      </main>

      {/* 7. Product Comparison Tray */}
      <ProductCompareTray />

      {/* 8. Global Accessible Footer */}
      <Footer />

      {/* 9. Floating Contact / Support Concierge */}
      <FloatingContactButton />

      {/* 10. Smooth Back-to-Top Button */}
      <BackToTop />

      {/* 11. Cookie Transparency & Preferences Banner */}
      <CookieConsent />
    </>
  );
}
