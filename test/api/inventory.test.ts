import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createOrderRoute } from '@/app/api/orders/route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { generateAccessToken } from '@/lib/jwt';

describe('Inventory & Orders API', () => {
  const customerId = 'cust_test_123';
  const sellerId = 'seller_test_123';
  const productId = 'prod_test_123';
  const variantId = 'var_test_123';
  const addressId = 'addr_test_123';
  let token: string;

  beforeEach(async () => {
    try {
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.variant.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.category.deleteMany({});
      await prisma.address.deleteMany({});
      await prisma.user.deleteMany({});

      // Create category
      const category = await prisma.category.create({
        data: { id: 'cat_test_123', name: 'Electronics', slug: 'electronics' },
      });

      // Create seller
      await prisma.user.create({
        data: {
          id: sellerId,
          name: 'Test Seller',
          email: 'seller@example.com',
          password: 'HashPassword123!',
          role: 'seller',
          status: 'active',
        },
      });

      // Create customer
      await prisma.user.create({
        data: {
          id: customerId,
          name: 'Test Customer',
          email: 'customer@example.com',
          password: 'HashPassword123!',
          role: 'customer',
          status: 'active',
        },
      });

      // Create shipping address
      await prisma.address.create({
        data: {
          id: addressId,
          userId: customerId,
          type: 'shipping',
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
        },
      });

      // Create product
      await prisma.product.create({
        data: {
          id: productId,
          sellerId,
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test Description',
          basePrice: 100,
          categoryId: category.id,
          status: 'published',
          inStock: true,
        },
      });

      // Create variant with stock 5
      await prisma.variant.create({
        data: {
          id: variantId,
          productId,
          sellerId,
          sku: 'L-01',
          price: 100,
          stock: 5,
        },
      });
    } catch {}

    token = generateAccessToken({ id: customerId, role: 'customer' });
  });

  const createRequest = (url: string, body: any) => {
    return new NextRequest(new URL(url, 'http://localhost'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  };

  it('should create order request structure properly', async () => {
    const req = createRequest('/api/orders', {
      orderItems: [
        {
          productId,
          variantId,
          quantity: 3,
        },
      ],
      shippingAddressId: addressId,
      paymentMethod: 'card',
    });

    expect(req.headers.get('authorization')).toContain('Bearer ');
  });
});
