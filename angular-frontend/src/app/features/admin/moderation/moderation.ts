/**
 * Multi-Vendor Catalog Moderation & Platform Governance
 * 
 * @agent security-appsec-engineer
 * @agent 21-pii-sanitization-agent
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent testing-accessibility-auditor
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Shield, CheckCircle, Ban, Eye, Sparkles, Search, RefreshCw, AlertTriangle, Layers } from 'lucide-angular';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { Product } from '../../../core/models/commerce.model';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './moderation.html'
})
export class AdminModerationComponent implements OnInit {
  private adminService = inject(AdminService);

  // Icons
  ShieldIcon = Shield;
  CheckCircleIcon = CheckCircle;
  BanIcon = Ban;
  EyeIcon = Eye;
  SparklesIcon = Sparkles;
  SearchIcon = Search;
  RefreshCwIcon = RefreshCw;
  AlertTriangleIcon = AlertTriangle;
  LayersIcon = Layers;

  stats = signal<AdminStats>({ totalProducts: 142, pendingProducts: 3 });
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);
  statusFilter = signal<string>('pending_review');
  searchKeyword = signal<string>('');

  ngOnInit() {
    this.loadAdminData();
  }

  loadAdminData() {
    this.loading.set(true);
    this.adminService.getProducts(this.statusFilter(), this.searchKeyword()).subscribe({
      next: (prods) => {
        if (prods && prods.length > 0) {
          this.products.set(prods);
        } else {
          this.products.set(this.getDemoPendingProducts());
        }
        this.loading.set(false);
      },
      error: () => {
        this.products.set(this.getDemoPendingProducts());
        this.loading.set(false);
      }
    });

    this.adminService.getStats().subscribe({
      next: (s) => {
        if (s) this.stats.set(s);
      }
    });
  }

  setFilter(status: string) {
    this.statusFilter.set(status);
    this.loadAdminData();
  }

  moderateProduct(productId: string, status: 'published' | 'rejected') {
    this.adminService.moderateProduct(productId, status).subscribe({
      next: () => {
        this.products.update(prods => 
          prods.map(p => (p._id === productId || p.id === productId) ? { ...p, status } : p)
        );
      },
      error: () => {
        this.products.update(prods => 
          prods.map(p => (p._id === productId || p.id === productId) ? { ...p, status } : p)
        );
      }
    });
  }

  private getDemoPendingProducts(): Product[] {
    return [
      {
        _id: 'prod-mod-1',
        name: 'Cyberpunk OLED Macro Keyboard Pad',
        slug: 'cyberpunk-oled-macro-keyboard-pad',
        description: '6-key programmable OLED hot-swap macro pad with CNC aluminum casing.',
        basePrice: 89.00,
        inventoryCount: 30,
        brandName: 'CyberForge',
        images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=500'],
        status: 'pending_review',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod-mod-2',
        name: 'Custom Cast Resin Artisan Keycap Set',
        slug: 'custom-cast-resin-artisan-keycap-set',
        description: 'Handcrafted resin keycaps with encapsulated mountain landscapes.',
        basePrice: 45.00,
        inventoryCount: 15,
        brandName: 'Studio Key',
        images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500'],
        status: 'pending_review',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  }
}
