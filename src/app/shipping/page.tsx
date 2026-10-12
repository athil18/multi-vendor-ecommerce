/**
 * Shipping & Delivery Policy Page
 * Production legal and logistics disclosure for multi-vendor direct dispatch.
 */

import React from 'react';
import Link from 'next/link';
import { Truck, ArrowLeft, CheckCircle2, ShieldCheck, Clock, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Nexus Marketplace',
  description: 'Learn how multi-vendor dispatch, carrier tracking, and international shipping operate on Nexus Marketplace.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 dark:bg-brand-950/60 rounded-xl mb-4 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="mt-3 text-base text-surface-600 dark:text-surface-400">
            Direct Maker Dispatch &bull; Carrier Tracking on All Orders
          </p>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <Clock className="h-6 w-6 text-brand-600 dark:text-brand-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">48-Hour Dispatch Target</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                In-stock items are dispatched by sellers within 2 business days. Custom and made-to-order pieces specify individual production windows.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Carrier-Verified Tracking</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Every shipment requires a scannable tracking ID from authorized national and international couriers (UPS, FedEx, DHL, USPS).
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 rounded-xl">
            <CardContent className="p-6">
              <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-bold text-surface-900 dark:text-white mb-1">Multi-Vendor Shipments</h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Orders with products from different sellers are dispatched separately from each respective workshop studio.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Details */}
        <div className="space-y-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-8 sm:p-10 shadow-sm text-surface-700 dark:text-surface-300 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              1. Fulfillment Model
            </h2>
            <p>
              Nexus operates as a curated direct-maker marketplace. All items are dispatched directly from the verified creator or workshop, eliminating intermediary warehousing delays and third-party dropshipping markups.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              2. Estimated Transit Timelines
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-surface-600 dark:text-surface-400">
              <li><strong>Domestic Shipments:</strong> 2 to 5 business days after carrier handover.</li>
              <li><strong>International Shipments:</strong> 5 to 14 business days depending on customs inspection and destination country.</li>
              <li><strong>Bespoke / Made-to-Order:</strong> Production lead time is indicated on the individual product page prior to order confirmation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              3. Customs, Duties and Taxes
            </h2>
            <p>
              For international shipments, customs duties and import taxes may be assessed by local customs authorities upon arrival. These charges are the responsibility of the recipient unless explicitly stated otherwise during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              4. Damaged or Lost Shipments
            </h2>
            <p>
              All shipments dispatched through Nexus include carrier insurance. If an item arrives damaged or is lost in transit, contact our support team within 48 hours of delivery notice to open an arbitration claim for a full refund or replacement.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
