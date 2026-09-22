/**
 * Conditional Layout Shell with Dynamic AIAssistantWidget Loading
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

import { AIAssistantWidget } from '@/components/AIAssistantWidget';

import { LiveBuyerActivityTicker } from '@/components/LiveBuyerActivityTicker';
import { ProductCompareTray } from '@/components/ProductCompareTray';

const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

/**
 * Conditionally renders the global Navbar, Footer, and AI Copilot Widget
 * based on the current route. Admin/Seller routes use their own sidebar layout.
 */
export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = pathname.startsWith('/seller');
  const hasSidebarLayout = isAdminRoute || isSellerRoute;

  if (hasSidebarLayout) {
    // Admin/Seller routes render children directly with the AI Assistant Copilot mounted
    return (
      <>
        <Toaster position="bottom-right" reverseOrder={false} />
        <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col focus:outline-none">
          {children}
        </main>
        <AIAssistantWidget />
      </>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      {/* Header */}
      <Navbar />

      {/* Accessible Main Landmark */}
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col focus:outline-none">
        {children}
      </main>

      {/* Floating 25-Lakh Luxury Utilities */}
      <LiveBuyerActivityTicker />
      <ProductCompareTray />
      <AIAssistantWidget />

      {/* Footer */}
      <Footer />
    </>
  );
}

