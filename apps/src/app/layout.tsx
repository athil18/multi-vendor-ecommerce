/**
 * Root Application Layout & Global Storefront Shell
 * Optimized for Zero-Blocking Main Thread & Minimal Hydration CPU
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 * @agent testing-performance-benchmarker
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalShell } from '@/components/ConditionalShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://nexus-ecommerce.com'),
  title: {
    default: 'Nexus | Enterprise Multi-Vendor E-Commerce Platform',
    template: '%s | Nexus Marketplace',
  },
  description: 'The premier marketplace for independent creators with Stripe Connect split escrow payments and PostgreSQL ACID transaction reliability.',
  keywords: ['multi-vendor marketplace', 'independent creators', 'e-commerce platform', 'stripe connect', 'buyer protection', 'direct payouts'],
  authors: [{ name: 'Nexus Engineering Team' }],
  creator: 'Nexus E-Commerce Inc.',
  publisher: 'Nexus Platform',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Nexus - Multi-Vendor Marketplace',
    description: 'Empowering independent creators and smart shoppers with enterprise multi-vendor commerce infrastructure.',
    url: 'https://nexus-ecommerce.com',
    siteName: 'Nexus',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus Multi-Vendor Marketplace',
    description: 'Empowering independent creators with bank-grade multi-vendor commerce.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: true,
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme-storage');if(t&&JSON.parse(t).state&&JSON.parse(t).state.theme==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans antialiased selection:bg-primary/30 transition-colors duration-200 overflow-x-hidden">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white font-bold text-sm"
        >
          Skip to main content
        </a>
        <ConditionalShell>
          {children}
        </ConditionalShell>
      </body>
    </html>
  );
}
