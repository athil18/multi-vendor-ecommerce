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

const AIAssistantWidget = dynamic(
  () => import('@/components/AIAssistantWidget').then((mod) => mod.AIAssistantWidget),
  { ssr: false }
);

const JevAssistantWidget = dynamic(
  () => import('@/components/ai/JevAssistantWidget'),
  { ssr: false }
);

const LiveBuyerActivityTicker = dynamic(
  () => import('@/components/LiveBuyerActivityTicker').then((mod) => mod.LiveBuyerActivityTicker),
  { ssr: false }
);

const ProductCompareTray = dynamic(
  () => import('@/components/ProductCompareTray').then((mod) => mod.ProductCompareTray),
  { ssr: false }
);

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
        <JevAssistantWidget />
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
      <JevAssistantWidget />

      {/* Footer */}
      <Footer />
    </>
  );
}

