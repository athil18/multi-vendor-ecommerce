/**
 * Global Navigation Component with Multi-Vendor Governance
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent testing-accessibility-auditor
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShoppingBag, Store, Shield, User, Search, LogOut, LayoutDashboard, Sparkles, ChevronDown, Menu, X } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  // Icons
  ShoppingBagIcon = ShoppingBag;
  StoreIcon = Store;
  ShieldIcon = Shield;
  UserIcon = User;
  SearchIcon = Search;
  LogOutIcon = LogOut;
  DashboardIcon = LayoutDashboard;
  SparklesIcon = Sparkles;
  ChevronDownIcon = ChevronDown;
  MenuIcon = Menu;
  XIcon = X;

  searchQuery = signal<string>('');
  isUserMenuOpen = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  handleSearch() {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/'], { queryParams: { q } });
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.closeUserMenu();
      this.router.navigate(['/']);
    });
  }
}
