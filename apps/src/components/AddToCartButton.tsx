/**
 * @agent engineering-frontend-developer
 * @agent testing-accessibility-auditor
 * @agent 21-pii-sanitization-agent
 * @description Reactive Add-to-Cart Button synchronized with Zustand cart-storage and WCAG 2.1 AA compliant.
 */

'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { logger } from '@/lib/logger';

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image?: string;
  variantId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function AddToCartButton({ 
  productId, 
  name, 
  price, 
  image, 
  variantId, 
  className = '',
  size = 'md',
  showLabel = true,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart({
        productId,
        variantId,
        name,
        price,
        image,
        quantity: 1,
      });

      const { toast } = await import('@/components/ui/Toast');
      toast.success(`Added ${name} to cart!`);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (err) {
      logger.error('Failed to add item to cart', { error: err, productId });
    }
  };

  return (
    <Button
      variant="primary"
      size={size}
      aria-label={added ? `Added ${name} to cart` : `Add ${name} to cart`}
      onClick={handleAddToCart}
      className={className}
    >
      {added ? (
        <>
          <Check className={size === 'icon' ? 'w-5 h-5 text-emerald-400' : 'w-4 h-4 text-emerald-400'} />
          {showLabel && <span>Added to Cart</span>}
        </>
      ) : (
        <>
          <ShoppingCart className={size === 'icon' ? 'w-5 h-5' : 'w-4 h-4'} />
          {showLabel && <span>Add to Cart</span>}
        </>
      )}
    </Button>
  );
}
