import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingBag, Star, Plus, Check } from 'lucide-angular';
import { Product } from '../../../core/models/commerce.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './product-card.html'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private cartService = inject(CartService);

  ShoppingBagIcon = ShoppingBag;
  StarIcon = Star;
  PlusIcon = Plus;

  added = false;

  get imageUrl(): string {
    return this.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
  }

  get categoryName(): string {
    if (typeof this.product.categoryId === 'object' && this.product.categoryId?.name) {
      return this.product.categoryId.name;
    }
    return 'Electronics';
  }

  addToCart(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.cartService.addToCart(this.product, 1);
    this.added = true;
    setTimeout(() => {
      this.added = false;
    }, 1500);
  }
}
