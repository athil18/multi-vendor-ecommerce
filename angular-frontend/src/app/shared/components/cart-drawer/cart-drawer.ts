import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingBag, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-angular';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './cart-drawer.html'
})
export class CartDrawerComponent {
  cartService = inject(CartService);

  // Icons
  ShoppingBagIcon = ShoppingBag;
  XIcon = X;
  TrashIcon = Trash2;
  PlusIcon = Plus;
  MinusIcon = Minus;
  ArrowRightIcon = ArrowRight;
}
