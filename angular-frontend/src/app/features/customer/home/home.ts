/**
 * Customer Marketplace Home Experience (Angular 22)
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent design-whimsy-injector
 * @agent design-ui-finish-gate-reviewer
 * @agent testing-accessibility-auditor
 * @agent testing-performance-benchmarker
 */

import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Sparkles, ArrowRight, ShieldCheck, Zap, DollarSign, Users, ShoppingBag, Search, Award, HeartHandshake, Leaf } from 'lucide-angular';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/commerce.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { VendorCardComponent } from '../../../shared/components/vendor-card/vendor-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ProductCardComponent, VendorCardComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  
  // Icons influenced by Design Directorate
  SparklesIcon = Sparkles;
  ArrowRightIcon = ArrowRight;
  ShieldCheckIcon = ShieldCheck;
  ZapIcon = Zap;
  DollarSignIcon = DollarSign;
  UsersIcon = Users;
  ShoppingBagIcon = ShoppingBag;
  SearchIcon = Search;
  AwardIcon = Award;
  HeartHandshakeIcon = HeartHandshake;
  LeafIcon = Leaf;
  
  products = signal<Product[]>([]);
  productsLoading = signal(true);
  selectedCategory = signal<string>('All');
  
  // 5 Lifestyle Verticals governed by UX Architect
  categories = [
    { name: 'All', id: 'all' },
    { name: 'Tech & Audio', id: 'tech-audio' },
    { name: 'Sports & Fitness', id: 'sports-fitness' },
    { name: 'Sustainable Living', id: 'sustainable' },
    { name: 'Luxury Goods', id: 'luxury' },
    { name: 'Workspace', id: 'workspace' }
  ];

  // Premier Creator Stores
  featuredStores = [
    {
      _id: 'store-1',
      name: 'TechGear Pro',
      description: 'Custom CNC mechanical keyboards, planar magnetic audio gear, and artisanal desk accessories.',
      isVerified: true,
      rating: 4.95,
      productCount: 48,
    },
    {
      _id: 'store-2',
      name: 'Apex Velocity Lab',
      description: 'Precision carbon-fiber aerodynamic road frames, Olympic fitness systems, and high-performance endurance gear.',
      isVerified: true,
      rating: 4.92,
      productCount: 26,
    },
    {
      _id: 'store-3',
      name: 'Atelier Veloce',
      description: 'Hand-stitched full-grain Tuscan leather weekender bags, bespoke cardholders, and luxury timepieces.',
      isVerified: true,
      rating: 4.96,
      productCount: 19,
    },
  ];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(category?: string) {
    this.productsLoading.set(true);
    const cat = category && category !== 'All' ? category : undefined;
    this.productService.getProducts({ category: cat, limit: 12 }).subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          this.products.set(prods);
        } else {
          // Fallback mock demo items if DB is empty on clean start
          this.products.set(this.getDemoProducts());
        }
        this.productsLoading.set(false);
      },
      error: () => {
        this.products.set(this.getDemoProducts());
        this.productsLoading.set(false);
      }
    });
  }

  selectCategory(catName: string) {
    this.selectedCategory.set(catName);
    this.loadProducts(catName);
  }

  private getDemoProducts(): Product[] {
    return [
      {
        _id: 'demo-1',
        name: 'AeroCraft Titanium Wireless Mechanical Keyboard',
        slug: 'aerocraft-titanium-wireless-keyboard',
        description: 'CNC machined aerospace grade titanium housing with custom hot-swappable tactile switches.',
        basePrice: 289.00,
        inventoryCount: 18,
        brandName: 'AeroCraft',
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'],
        categoryId: { _id: 'c1', name: 'Keyboards & Audio', slug: 'keyboards' },
        status: 'published',
        averageRating: 4.9,
        reviewCount: 38
      },
      {
        _id: 'demo-2',
        name: 'Walnut Artisan Magnetic Monitor Stand',
        slug: 'walnut-artisan-magnetic-monitor-stand',
        description: 'Solid American Walnut with built-in wireless charging pad and modular aluminum drawer.',
        basePrice: 145.00,
        inventoryCount: 25,
        brandName: 'Grovemade Studio',
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'],
        categoryId: { _id: 'c2', name: 'Workspace & Desk', slug: 'workspace' },
        status: 'published',
        averageRating: 4.8,
        reviewCount: 52
      },
      {
        _id: 'demo-3',
        name: 'Studio Master Spatial Active Noise Cancelling Headphones',
        slug: 'studio-master-spatial-anc-headphones',
        description: 'Bespoke custom tuned 50mm dynamic drivers with high resolution lossless Bluetooth 5.4 codec.',
        basePrice: 349.00,
        inventoryCount: 12,
        brandName: 'AudioForge',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
        categoryId: { _id: 'c1', name: 'Keyboards & Audio', slug: 'audio' },
        status: 'published',
        averageRating: 5.0,
        reviewCount: 94
      },
      {
        _id: 'demo-4',
        name: 'Matte Obsidian Desk Mat & Cable Organizer Kit',
        slug: 'matte-obsidian-desk-mat-cable-organizer',
        description: 'Waterproof vegan leather desk pad with magnetic cable channels and anti-slip backing.',
        basePrice: 68.00,
        inventoryCount: 45,
        brandName: 'OrbitDesk',
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'],
        categoryId: { _id: 'c2', name: 'Workspace & Desk', slug: 'desk' },
        status: 'published',
        averageRating: 4.7,
        reviewCount: 21
      }
    ];
  }
}
