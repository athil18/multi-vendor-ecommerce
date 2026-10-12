/**
 * Curated Categories Discovery Page
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, Cpu, Dumbbell, Leaf, Watch, Armchair, Coffee, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Featured Categories | Nexus Catalog Taxonomy',
  description: 'Explore hand-curated collections of tech gear, endurance athletic equipment, sustainable botanicals, luxury timepieces, and workspace essentials.',
};

const CATEGORIES_LIST = [
  { name: 'Tech Gear', slug: 'Tech Gear', icon: Cpu, count: 48, desc: 'Bespoke mechanical keyboards, DAC amplifiers, and audio monitors.' },
  { name: 'Sports & Fitness', slug: 'Fitness', icon: Dumbbell, count: 26, desc: 'Aerodynamic road frames, Olympic weights, and recovery tools.' },
  { name: 'Sustainable Living', slug: 'Sustainable', icon: Leaf, count: 34, desc: 'Hydroponic cultivation, organic botanicals, and zero-waste goods.' },
  { name: 'Luxury Goods', slug: 'Luxury', icon: Watch, count: 19, desc: 'Hand-stitched leather luggage, automatic chronographs, and jewelry.' },
  { name: 'Workspace Essentials', slug: 'Workspace', icon: Armchair, count: 52, desc: 'Ergonomic chairs, solid walnut desk shelves, and wool desk pads.' },
  { name: 'Home & Ceramics', slug: 'Home & Living', icon: Coffee, count: 22, desc: 'Wood-fired ceramic vessels, linen tableware, and brass ambient lighting.' },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ambient-gradient-mesh relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 swiss-grid-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <Link 
            href="/" 
            aria-label="Back to store homepage"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="specular-pill mb-4 text-surface-700 dark:text-surface-300">
            <Layers className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>Catalog Directory &bull; 6 Primary Taxonomies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-4 font-sans">
            Curated Atelier Categories
          </h1>
          <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 max-w-2xl mx-auto leading-relaxed">
            Directly commission specialized goods cataloged across six verified maker disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_LIST.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={cat.slug} 
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                aria-label={`Explore ${cat.name} category with ${cat.count} curated items`}
                className="group block h-full focus-visible:outline-none"
              >
                <div className="h-full tactile-card rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm hover:border-brand-500/40">
                  <div>
                    <div className="h-12 w-12 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 group-hover:scale-105 transition-transform duration-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors font-sans">
                      {cat.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-6 font-normal">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-800 text-xs font-semibold text-surface-500 dark:text-surface-400">
                    <span className="font-tabular">{cat.count} Curated Products</span>
                    <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform font-bold">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
