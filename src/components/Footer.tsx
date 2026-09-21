/**
 * Nexus Storefront Global Footer
 * 
 * Provides accessible navigation, brand guardianship, newsletter subscription,
 * and live 500+ AI Agent Ecosystem compliance visibility.
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent engineering-frontend-developer
 * @agent engineering-section-508-specialist
 * @agent design-whimsy-injector
 */

import React from 'react';
import Link from 'next/link';
import { NexusLogo } from './NexusLogo';
import { NewsletterForm } from './NewsletterForm';
import { AgentComplianceBadge } from './ui/AgentComplianceBadge';
import { 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  Bot,
  Globe,
  Share2,
  Mail
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const marketplaceLinks = [
    { label: 'Explore Products', href: '/products' },
    { label: 'Featured Categories', href: '/categories' },
    { label: 'Top-Rated Vendors', href: '/stores' },
    { label: 'Deals & Discounts', href: '/deals' },
    { label: 'New Arrivals', href: '/new-arrivals' },
  ];

  const vendorLinks = [
    { label: 'Become a Seller', href: '/seller/register' },
    { label: 'Vendor Dashboard', href: '/seller' },
    { label: 'Seller Guidelines', href: '/seller/guidelines' },
    { label: 'Commission & Payouts', href: '/seller/payouts' },
  ];

  const standardsLinks = [
    { label: 'About Nexus', href: '/about' },
    { label: 'Artisan Verification', href: '/standards' },
    { label: 'Escrow Protection Policy', href: '/buyer-protection' },
    { label: 'Carbon-Neutral Logistics', href: '/sustainability' },
    { label: 'Help & Customer Care', href: '/help' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security Disclosures', href: '/security-policy' },
    { label: 'Accessibility (WCAG 2.1 AA)', href: '/accessibility' },
  ];

  return (
    <footer 
      role="contentinfo" 
      aria-label="Site Footer"
      className="w-full border-t border-surface-200/60 dark:border-surface-800/60 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-xl transition-colors duration-300"
    >
      {/* Top Banner: Marketplace Trust Guarantee */}
      <div className="border-b border-surface-200/40 dark:border-surface-800/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-1.5">
                Nexus Buyer Protection
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700">
                  GUARANTEED
                </span>
              </p>
              <p className="text-[11px] text-surface-600 dark:text-surface-300">
                100% money-back escrow protection on every order from verified independent creators
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-surface-600 dark:text-surface-300">
            <span className="font-semibold text-surface-900 dark:text-surface-100">Direct Artisan Payouts</span>
            <span className="text-surface-300 dark:text-surface-700">&bull;</span>
            <span>Carbon-Neutral Logistics</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <NexusLogo href="/" size="md" />
            <p className="text-sm text-surface-600 dark:text-surface-300 max-w-sm leading-relaxed">
              A curated global marketplace connecting discerning buyers with verified independent artisans, specialized workshops, and innovative creators.
            </p>
            
            {/* Newsletter Section */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-2">
                Stay updated with Nexus Drops
              </h4>
              <NewsletterForm />
            </div>

            {/* Social / Network Links */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub Repository"
                className="h-9 w-9 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/40 transition-all"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a 
                href="https://github.com/athil18/multi-vendor-ecommerce" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Nexus Repository"
                className="h-9 w-9 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/40 transition-all"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a 
                href="mailto:support@nexus.market" 
                aria-label="Contact Support"
                className="h-9 w-9 rounded-xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/40 transition-all"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation Column 1: Marketplace */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2.5">
              {marketplaceLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    prefetch={false}
                    className="text-sm text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Column 2: Vendors & Sellers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-4">
              Vendors
            </h3>
            <ul className="space-y-2.5">
              {vendorLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    prefetch={false}
                    className="text-sm text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Column 3: Standards & Trust */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-4">
              Standards & Trust
            </h3>
            <ul className="space-y-2.5">
              {standardsLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    prefetch={false}
                    className="text-sm text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Security & Compliance */}
        <div className="mt-12 pt-8 border-t border-surface-200/60 dark:border-surface-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-600 dark:text-surface-300 font-medium">
          <div className="flex flex-wrap items-center gap-4">
            <span>&copy; {currentYear} Nexus Commerce Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-surface-300 dark:text-surface-700">•</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-500" />
              PCI-DSS Compliant & Double-Entry Secured
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                prefetch={false}
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;