import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (item) => {
        set((state) => {
          const existing = state.cart.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        });
        toast.success(`${item.name} added to cart!`);
      },
      removeFromCart: (productId, variantId) => {
        set((state) => ({
          cart: state.cart.filter((i) => !(i.productId === productId && i.variantId === variantId)),
        }));
        toast.error('Item removed from cart');
      },
      updateCartQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          set((state) => ({
            cart: state.cart.filter((i) => !(i.productId === productId && i.variantId === variantId)),
          }));
          toast.error('Item removed from cart');
          return;
        }
        set((state) => ({
          cart: state.cart.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.floor(quantity)) }
              : i
          ),
        }));
      },
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
