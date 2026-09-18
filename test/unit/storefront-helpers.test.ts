/**
 * Level 1: Unit Test Suite for Storefront Utilities, Schemas, & Reducers
 * 
 * @agent 15-unit-test-generator
 * @agent testing-test-automation-engineer
 * @agent 02-code-review-agent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { loginSchema } from '@/lib/schemas/auth';
import { useCartStore } from '@/store/useCartStore';

describe('Level 1: Storefront Unit Tests', () => {

  describe('Authentication Zod Schema Validation', () => {
    it('should validate valid email and password format', () => {
      const validData = {
        email: 'shopper@example.com',
        password: 'SecurePassword123!',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'validpassword',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject empty passwords in login', () => {
      const invalidData = {
        email: 'user@nexus.com',
        password: '',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Zustand Cart State Reducer Logic', () => {
    beforeEach(() => {
      useCartStore.getState().clearCart();
    });

    it('should start with an empty cart', () => {
      const state = useCartStore.getState();
      expect(state.cart).toEqual([]);
    });

    it('should add item and update quantity if already present', () => {
      const item = {
        productId: 'prod-101',
        name: 'Artisan Keyboard',
        price: 199.99,
        quantity: 1,
      };

      useCartStore.getState().addToCart(item);
      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].quantity).toBe(1);

      // Add same item again
      useCartStore.getState().addToCart(item);
      expect(useCartStore.getState().cart).toHaveLength(1);
      expect(useCartStore.getState().cart[0].quantity).toBe(2);
    });

    it('should update cart quantity correctly', () => {
      useCartStore.getState().addToCart({
        productId: 'prod-102',
        name: 'Desk Mat',
        price: 49.00,
        quantity: 1,
      });

      useCartStore.getState().updateCartQuantity('prod-102', 4);
      expect(useCartStore.getState().cart[0].quantity).toBe(4);
    });

    it('should remove item when quantity is reduced to zero or below', () => {
      useCartStore.getState().addToCart({
        productId: 'prod-103',
        name: 'Keycap Set',
        price: 35.00,
        quantity: 1,
      });

      useCartStore.getState().updateCartQuantity('prod-103', 0);
      expect(useCartStore.getState().cart).toHaveLength(0);
    });

    it('should remove item by ID', () => {
      useCartStore.getState().addToCart({
        productId: 'prod-104',
        name: 'Ceramic Mug',
        price: 28.00,
        quantity: 2,
      });

      useCartStore.getState().removeFromCart('prod-104');
      expect(useCartStore.getState().cart).toHaveLength(0);
    });
  });

  describe('Formatting and Data Invariants', () => {
    it('should accurately compute monetary sums without floating-point drift', () => {
      const items = [
        { price: 19.99, qty: 3 },
        { price: 4.95, qty: 2 },
        { price: 100.00, qty: 1 },
      ];
      const totalCents = items.reduce((acc, i) => acc + Math.round(i.price * 100) * i.qty, 0);
      const total = totalCents / 100;
      expect(total).toBe(169.87);
    });

    it('should format currency consistently', () => {
      const price = 249.5;
      const formatted = `$${price.toFixed(2)}`;
      expect(formatted).toBe('$249.50');
    });
  });
});
