/**
 * Product Comparison Store
 * Manages side-by-side spec evaluation for high-consideration luxury items.
 * 
 * @agent design-ux-architect
 * @agent engineering-frontend-developer
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  storeName?: string;
  rating?: number;
  numReviews?: number;
  materials?: string;
  warranty?: string;
  origin?: string;
}

interface CompareState {
  items: CompareProduct[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToCompare: (product: CompareProduct) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addToCompare: (product) => {
        const { items } = get();
        if (items.some((i) => i.id === product.id)) {
          get().removeFromCompare(product.id);
          return false;
        }
        if (items.length >= 4) {
          toast.error('You can compare a maximum of 4 items side-by-side.');
          return false;
        }
        set({ items: [...items, product], isOpen: true });
        toast.success(`Added ${product.name} to comparison!`);
        return true;
      },
      removeFromCompare: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      clearCompare: () => set({ items: [], isOpen: false }),
      isInCompare: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'nexus-compare-storage',
    }
  )
);
