// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getOrdersRoute } from '@/app/api/orders/route';
import { GET as getOrderDetailRoute } from '@/app/api/orders/[id]/route';
import { GET as getSellerOrdersRoute } from '@/app/api/seller/orders/route';
import { GET as getAdminOrdersRoute } from '@/app/api/admin/orders/route';
import { GET as getSellerDashboardRoute } from '@/app/api/seller/dashboard/route';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { Variant } from '@/models/Variant';
import { Order } from '@/models/Order';
import { OrderItem } from '@/models/OrderItem';
import { Store } from '@/models/Store';
import { Address } from '@/models/Address';
import { NextRequest } from 'next/server';
import mongoose from '../mock-id';
import { generateAccessToken } from '@/lib/jwt';

describe('Orders API Hardening & Lean Query Reliability', () => {
  let customerId: mongoose.Types.ObjectId;
  let sellerId: mongoose.Types.ObjectId;
  let adminId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;
  let variantId: mongoose.Types.ObjectId;
  let addressId: mongoose.Types.ObjectId;

  let customerToken: string;
  let sellerToken: string;
  let adminToken: string;

  beforeEach(async () => {
    customerId = new mongoose.Types.ObjectId();
    sellerId = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();
    productId = new mongoose.Types.ObjectId();
    variantId = new mongoose.Types.ObjectId();
    addressId = new mongoose.Types.ObjectId();

    await User.deleteMany({});
    await Product.deleteMany({});
    await Variant.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Store.deleteMany({});
    await Address.deleteMany({});

    // Create users
    await User.create({ _id: customerId, name: 'Customer User', email: 'cust@example.com', role: 'customer', status: 'active' });
    await User.create({ _id: sellerId, name: 'Seller User', email: 'sell@example.com', role: 'seller', status: 'active' });
    await User.create({ _id: adminId, name: 'Admin User', email: 'adm@example.com', role: 'admin', status: 'active' });

    // Create stores
    await Store.create({ sellerId: sellerId, storeName: 'Seller Store', status: 'active', stripeConnectedAccountId: 'acct_mock', stripeOnboardingComplete: true, payoutsEnabled: true });

    // Create shipping address
    await Address.create({ _id: addressId, userId: customerId, type: 'shipping', street: '123 Test St', city: 'Test City', state: 'TS', zip: '12345', country: 'US', isDefault: true });

    // Create product and variant
    await Product.create({ _id: productId, sellerId: sellerId, name: 'Harden Product', slug: 'harden-p', description: 'Test', categoryId: new mongoose.Types.ObjectId(), basePrice: 50, status: 'published', inStock: true });
    await Variant.create({ _id: variantId, productId: productId, sellerId: sellerId, sku: 'SKU-HARD', price: 50, stock: 10 });

    customerToken = generateAccessToken(customerId, 'customer');
    sellerToken = generateAccessToken(sellerId, 'seller');
    adminToken = generateAccessToken(adminId, 'admin');
  });

  const createRequest = (url: string, method: string, tokenStr: string | null, body: any = null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (tokenStr) {
      headers['Authorization'] = `Bearer ${tokenStr}`;
    }
    const init: RequestInit = { method, headers };
    if (method !== 'GET' && method !== 'HEAD' && body !== null) {
      init.body = JSON.stringify(body);
    }
    return new NextRequest(new URL(url, 'http://localhost'), init);
  };

  it('should verify empty order history returning 200 without crashes', async () => {
    const req = createRequest('/api/orders', 'GET', customerToken);
    const res = await getOrdersRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it('should verify single order fetch and populates shippingAddress cleanly', async () => {
    // 1. Create order
    const order = await Order.create({
      customerId,
      sellerIds: [sellerId],
      totalAmount: 100,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: addressId,
    });

    const item = await OrderItem.create({
      orderId: order._id,
      productId,
      variantId,
      sellerId,
      quantity: 2,
      price: 50,
      status: 'pending',
    });

    // 2. Query Detail
    const req = createRequest(`/api/orders/${order._id}`, 'GET', customerToken);
    const res = await getOrderDetailRoute(req, { params: Promise.resolve({ id: order._id.toString() }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.order.id).toBe(order._id.toString());
    expect(body.order.status).toBe('pending');
    expect(body.order.shippingAddress.street).toBe('123 Test St');
    expect(body.items[0].id).toBe(item._id.toString());
    expect(body.items[0].productId.name).toBe('Harden Product');

    // Verify lean query paths (no mongoose internal states leaked)
    expect(body.order.save).toBeUndefined();
    expect(body.order.$__).toBeUndefined();
  });

  it('should handle missing relations in detail view gracefully without throwing exceptions', async () => {
    const missingAddressId = new mongoose.Types.ObjectId();
    const order = await Order.create({
      customerId,
      sellerIds: [sellerId],
      totalAmount: 50,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: missingAddressId, // Non-existent shipping address reference
    });

    const req = createRequest(`/api/orders/${order._id}`, 'GET', customerToken);
    const res = await getOrderDetailRoute(req, { params: Promise.resolve({ id: order._id.toString() }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.order.id).toBe(order._id.toString());
    expect(body.order.shippingAddress).toBeNull(); // Graceful resolution of missing relation
  });

  it('should verify pagination parameters limits and boundary safety', async () => {
    // Create 3 orders
    for (let i = 0; i < 3; i++) {
      await Order.create({
        customerId,
        sellerIds: [sellerId],
        totalAmount: 50 + i,
        aggregateStatus: 'pending',
        paymentMethod: 'card',
        paymentStatus: 'pending',
        shippingAddress: addressId,
      });
    }

    // Test negative, float, excessive limit filters
    const req1 = createRequest('/api/orders?page=-2&limit=invalid', 'GET', customerToken);
    const res1 = await getOrdersRoute(req1, { params: Promise.resolve({}) });
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    expect(body1.meta.page).toBe(1); // Normalizes negative pages to 1
    expect(body1.meta.limit).toBe(20); // Normalizes invalid limit to defaultLimit (20)

    const req2 = createRequest('/api/orders?page=2.5&limit=500', 'GET', customerToken);
    const res2 = await getOrdersRoute(req2, { params: Promise.resolve({}) });
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.meta.page).toBe(2); // parseInt float
    expect(body2.meta.limit).toBe(100); // Caps limit at maxLimit (100)
  });

  it('should reject invalid ObjectID param format with a 400 Bad Request', async () => {
    const req = createRequest('/api/orders/not-a-mongoose-id', 'GET', customerToken);
    const res = await getOrderDetailRoute(req, { params: Promise.resolve({ id: 'not-a-mongoose-id' }) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.message).toMatch(/Invalid order ID format/);
  });

  it('should verify seller orders retrieval and status filtering', async () => {
    const order = await Order.create({
      customerId,
      sellerIds: [sellerId],
      totalAmount: 100,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: addressId,
    });

    const item = await OrderItem.create({
      orderId: order._id,
      productId,
      variantId,
      sellerId,
      quantity: 2,
      price: 50,
      status: 'pending',
    });

    const req = createRequest('/api/seller/orders?status=pending', 'GET', sellerToken);
    const res = await getSellerOrdersRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].id).toBe(item._id.toString());
    expect(body.data[0].status).toBe('pending');
    expect(body.data[0].orderId.status).toBe('pending'); // Populated status mapped
  });

  it('should allow admin to list all orders and reject non-admin users', async () => {
    // 1. Create order
    await Order.create({
      customerId,
      sellerIds: [sellerId],
      totalAmount: 150,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: addressId,
    });

    // 2. Fetch using Customer Token (expected 403 / Forbidden)
    const custReq = createRequest('/api/admin/orders', 'GET', customerToken);
    const custRes = await getAdminOrdersRoute(custReq, { params: Promise.resolve({}) });
    expect(custRes.status).toBe(403);

    // 3. Fetch using Admin Token (expected 200)
    const adminReq = createRequest('/api/admin/orders?status=pending', 'GET', adminToken);
    const adminRes = await getAdminOrdersRoute(adminReq, { params: Promise.resolve({}) });
    expect(adminRes.status).toBe(200);

    const adminBody = await adminRes.json();
    expect(adminBody.data.length).toBe(1);
    expect(adminBody.data[0].customerId.email).toBe('cust@example.com');
  });

  it('should verify seller dashboard statistics and activity retrieval compatibility', async () => {
    // Create order item with status shipped
    const order = await Order.create({
      customerId,
      sellerIds: [sellerId],
      totalAmount: 50,
      aggregateStatus: 'shipped',
      paymentMethod: 'card',
      paymentStatus: 'completed',
      shippingAddress: addressId,
    });

    await OrderItem.create({
      orderId: order._id,
      productId,
      variantId,
      sellerId,
      quantity: 1,
      price: 50,
      platformFee: 5,
      sellerPayout: 45,
      status: 'shipped',
    });

    const req = createRequest('/api/seller/dashboard', 'GET', sellerToken);
    const res = await getSellerDashboardRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.totalRevenue).toBe(45);
    expect(body.recentActivity[0].productId.name).toBe('Harden Product');
    expect(body.recentActivity[0].save).toBeUndefined(); // Lean check
  });
});
