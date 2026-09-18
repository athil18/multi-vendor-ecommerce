import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartItem } from '../models/commerce.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'nexus_cart_items';
  
  // Reactive Signals
  items = signal<CartItem[]>([]);
  appliedCoupon = signal<string | null>(null);
  discount = signal<number>(0);
  isCartDrawerOpen = signal<boolean>(false);

  // Computed Values
  itemCount = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));
  
  subtotal = computed(() => 
    this.items().reduce((total, item) => total + (item.price * item.quantity), 0)
  );

  finalTotal = computed(() => 
    Math.max(0, this.subtotal() - this.discount())
  );

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.items.set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load cart from storage', e);
    }
  }

  private persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
    } catch (e) {
      console.warn('Could not save cart to storage', e);
    }
  }

  toggleCartDrawer(open?: boolean) {
    this.isCartDrawerOpen.set(open !== undefined ? open : !this.isCartDrawerOpen());
  }

  addToCart(product: { id?: string; _id?: string; name: string; price?: number; basePrice?: number; image?: string; images?: string[] }, quantity: number = 1) {
    const prodId = product._id || product.id || '';
    const itemPrice = product.price ?? product.basePrice ?? 0;
    const img = product.image || (product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500');

    this.items.update(currentItems => {
      const existingIdx = currentItems.findIndex(i => i.productId === prodId);
      if (existingIdx > -1) {
        const updated = [...currentItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      } else {
        return [...currentItems, {
          productId: prodId,
          name: product.name,
          price: itemPrice,
          image: img,
          quantity: quantity
        }];
      }
    });

    this.persist();
    this.toggleCartDrawer(true);
  }

  removeFromCart(productId: string) {
    this.items.update(current => current.filter(i => i.productId !== productId));
    this.persist();
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.items.update(current => 
      current.map(item => item.productId === productId ? { ...item, quantity } : item)
    );
    this.persist();
  }

  clearCart() {
    this.items.set([]);
    this.appliedCoupon.set(null);
    this.discount.set(0);
    this.persist();
  }

  applyCoupon(code: string): Observable<any> {
    return this.http.post<any>('/api/coupons/validate', {
      code: code.trim().toUpperCase(),
      subtotal: this.subtotal()
    }).pipe(
      tap(res => {
        if (res?.discount) {
          this.appliedCoupon.set(res.code || code);
          this.discount.set(res.discount);
        }
      })
    );
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.discount.set(0);
  }
}
