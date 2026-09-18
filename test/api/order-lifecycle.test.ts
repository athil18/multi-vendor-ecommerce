// @ts-nocheck
// Set environment variables before imports to prevent compiler instantiation errors
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';
process.env.CRON_SECRET = 'cron_test_secret';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as createOrderRoute } from '@/app/api/orders/route';
import { GET as getOrdersRoute } from '@/app/api/orders/route';
import { PUT as updateItemStatusRoute } from '@/app/api/seller/orders/[id]/status/route';
import { POST as webhookRoute } from '@/app/api/payments/webhook/route';
import { POST as payoutsRoute } from '@/app/api/payments/payouts/route';
import { POST as refundsRoute } from '@/app/api/payments/refunds/route';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { Variant } from '@/models/Variant';
import { Order } from '@/models/Order';
import { OrderItem } from '@/models/OrderItem';
import { Store } from '@/models/Store';
import { FinancialLedger } from '@/models/FinancialLedger';
import { NextRequest } from 'next/server';
import mongoose from '../mock-id';
import { generateAccessToken } from '@/lib/jwt';
import { stripe } from '@/lib/stripe';

// Mock Stripe webhook and transfers API
vi.spyOn(stripe.webhooks, 'constructEvent').mockImplementation((body) => {
  return JSON.parse(body);
});

let transferCounter = 0;
const mockTransferCreate = vi.spyOn(stripe.transfers, 'create').mockImplementation(async (args: any) => {
  transferCounter++;
  return {
    id: `tr_mock_${args?.destination || transferCounter}`,
  } as any;
});

const mockRefundCreate = vi.spyOn(stripe.refunds, 'create').mockResolvedValue({
  id: 're_mock_123',
} as any);

describe('Order Lifecycle Status Hardening Suite', () => {
  let customerId: mongoose.Types.ObjectId;
  let seller1Id: mongoose.Types.ObjectId;
  let seller2Id: mongoose.Types.ObjectId;
  let adminId: mongoose.Types.ObjectId;
  let product1Id: mongoose.Types.ObjectId;
  let product2Id: mongoose.Types.ObjectId;
  let variant1Id: mongoose.Types.ObjectId;
  let variant2Id: mongoose.Types.ObjectId;
  let token: string;
  let seller1Token: string;
  let adminToken: string;

  beforeEach(async () => {
    customerId = new mongoose.Types.ObjectId();
    seller1Id = new mongoose.Types.ObjectId();
    seller2Id = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();
    product1Id = new mongoose.Types.ObjectId();
    product2Id = new mongoose.Types.ObjectId();
    variant1Id = new mongoose.Types.ObjectId();
    variant2Id = new mongoose.Types.ObjectId();

    await User.deleteMany({});
    await Product.deleteMany({});
    await Variant.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Store.deleteMany({});
    await FinancialLedger.deleteMany({});
    mockTransferCreate.mockClear();
    mockRefundCreate.mockClear();

    // Create users
    await User.create({ _id: customerId, name: 'Customer', email: 'c@example.com', role: 'customer', status: 'active' });
    await User.create({ _id: seller1Id, name: 'Seller 1', email: 's1@example.com', role: 'seller', status: 'active' });
    await User.create({ _id: seller2Id, name: 'Seller 2', email: 's2@example.com', role: 'seller', status: 'active' });
    await User.create({ _id: adminId, name: 'Admin', email: 'admin@example.com', role: 'admin', status: 'active' });

    // Create stores
    await Store.create({ sellerId: seller1Id, storeName: 'Store 1', status: 'active', stripeConnectedAccountId: 'acct_1', stripeOnboardingComplete: true, payoutsEnabled: true });
    await Store.create({ sellerId: seller2Id, storeName: 'Store 2', status: 'active', stripeConnectedAccountId: 'acct_2', stripeOnboardingComplete: true, payoutsEnabled: true });

    // Create variants with stock 5
    await Variant.create({ _id: variant1Id, productId: product1Id, sellerId: seller1Id, sku: 'SKU-1', price: 100, stock: 5 });
    await Variant.create({ _id: variant2Id, productId: product2Id, sellerId: seller2Id, sku: 'SKU-2', price: 200, stock: 5 });

    // Create products
    await Product.create({ _id: product1Id, sellerId: seller1Id, name: 'P1', slug: 'p1', description: 'Test Description 1', categoryId: new mongoose.Types.ObjectId(), basePrice: 100, status: 'published', inStock: true });
    await Product.create({ _id: product2Id, sellerId: seller2Id, name: 'P2', slug: 'p2', description: 'Test Description 2', categoryId: new mongoose.Types.ObjectId(), basePrice: 200, status: 'published', inStock: true });

    token = generateAccessToken(customerId, 'customer');
    seller1Token = generateAccessToken(seller1Id, 'seller');
    adminToken = generateAccessToken(adminId, 'admin');
  });

  const createRequest = (url: string, method: string, tokenStr: string | null, body: any) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (tokenStr) {
      headers['Authorization'] = `Bearer ${tokenStr}`;
    }
    const init: RequestInit = {
      method,
      headers,
    };
    if (method !== 'GET' && method !== 'HEAD' && body !== undefined && body !== null) {
      init.body = JSON.stringify(body);
    }
    return new NextRequest(new URL(url, 'http://localhost'), init);
  };

  it('should verify correct order creation status and customer fetch compatibility', async () => {
    // 1. Creation
    const req = createRequest('/api/orders', 'POST', token, {
      orderItems: [
        { productId: product1Id.toString(), variantId: variant1Id.toString(), quantity: 1 }
      ],
      shippingAddressId: new mongoose.Types.ObjectId().toString(),
      paymentMethod: 'card'
    });

    const res = await createOrderRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    const orderData = await res.json();
    expect(orderData.aggregateStatus).toBe('pending');
    expect(orderData.paymentStatus).toBe('pending');

    // 2. Fetch via customer route to verify no .toJSON() lean crashes
    const fetchReq = createRequest('/api/orders', 'GET', token, null);
    const fetchRes = await getOrdersRoute(fetchReq, { params: Promise.resolve({}) });
    expect(fetchRes.status).toBe(200);
    const listData = await fetchRes.json();
    expect(listData.data[0].id).toBe(orderData._id);
    expect(listData.data[0].status).toBe('pending');
  });

  it('should handle multi-vendor status transitions: payment, partial shipping, and delivery', async () => {
    // 1. Create order containing two items from different sellers
    const order = await Order.create({
      customerId,
      sellerIds: [seller1Id, seller2Id],
      totalAmount: 300,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const item1 = await OrderItem.create({
      orderId: order._id,
      productId: product1Id,
      variantId: variant1Id,
      sellerId: seller1Id,
      quantity: 1,
      price: 100,
      status: 'pending',
    });

    const item2 = await OrderItem.create({
      orderId: order._id,
      productId: product2Id,
      variantId: variant2Id,
      sellerId: seller2Id,
      quantity: 1,
      price: 200,
      status: 'pending',
    });

    // 2. Confirm Payment Succeeded (Webhook)
    const webhookReq = createRequest('/api/payments/webhook', 'POST', null, {
      id: 'evt_pay_success',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_success',
          metadata: { orderId: order._id.toString() },
        },
      },
    });
    webhookReq.headers.set('stripe-signature', 't=1,v1=mock');

    const webhookRes = await webhookRoute(webhookReq, { params: Promise.resolve({}) });
    expect(webhookRes.status).toBe(200);

    // Verify order and items transitioned to processing
    const orderAfterPay = await Order.findById(order._id);
    expect(orderAfterPay?.paymentStatus).toBe('completed');
    expect(orderAfterPay?.aggregateStatus).toBe('processing');

    const itemsAfterPay = await OrderItem.find({ orderId: order._id });
    expect(itemsAfterPay[0].status).toBe('processing');
    expect(itemsAfterPay[1].status).toBe('processing');

    // 3. Partial Shipping: Seller 1 ships Item 1
    const ship1Req = createRequest(`/api/seller/orders/${item1._id}/status`, 'PUT', seller1Token, {
      status: 'shipped'
    });
    const ship1Res = await updateItemStatusRoute(ship1Req, { params: Promise.resolve({ id: item1._id.toString() }) });
    expect(ship1Res.status).toBe(200);

    // Verify order aggregates to partially_shipped
    let orderAfterShip = await Order.findById(order._id);
    expect(orderAfterShip?.aggregateStatus).toBe('partially_shipped');

    // 4. Seller 2 ships Item 2
    const seller2Token = generateAccessToken(seller2Id, 'seller');
    const ship2Req = createRequest(`/api/seller/orders/${item2._id}/status`, 'PUT', seller2Token, {
      status: 'shipped'
    });
    const ship2Res = await updateItemStatusRoute(ship2Req, { params: Promise.resolve({ id: item2._id.toString() }) });
    expect(ship2Res.status).toBe(200);

    // Verify order aggregates to shipped since all active items are shipped
    orderAfterShip = await Order.findById(order._id);
    expect(orderAfterShip?.aggregateStatus).toBe('shipped');

    // 5. Seller 1 delivers Item 1
    const del1Req = createRequest(`/api/seller/orders/${item1._id}/status`, 'PUT', seller1Token, {
      status: 'delivered'
    });
    const del1Res = await updateItemStatusRoute(del1Req, { params: Promise.resolve({ id: item1._id.toString() }) });
    expect(del1Res.status).toBe(200);

    // Verify order aggregate is partially_shipped/partially delivered (mapped as partially_shipped)
    let orderAfterDel = await Order.findById(order._id);
    expect(orderAfterDel?.aggregateStatus).toBe('partially_shipped');

    // 6. Seller 2 delivers Item 2
    const del2Req = createRequest(`/api/seller/orders/${item2._id}/status`, 'PUT', seller2Token, {
      status: 'delivered'
    });
    const del2Res = await updateItemStatusRoute(del2Req, { params: Promise.resolve({ id: item2._id.toString() }) });
    expect(del2Res.status).toBe(200);

    // Verify aggregateStatus is delivered
    orderAfterDel = await Order.findById(order._id);
    expect(orderAfterDel?.aggregateStatus).toBe('delivered');
  });

  it('should process failed checkout sessions and restrict transitions', async () => {
    const order = await Order.create({
      customerId,
      sellerIds: [seller1Id],
      totalAmount: 100,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const item = await OrderItem.create({
      orderId: order._id,
      productId: product1Id,
      variantId: variant1Id,
      sellerId: seller1Id,
      quantity: 1,
      price: 100,
      status: 'pending',
    });

    // 1. Payment failure webhook
    const webhookReq = createRequest('/api/payments/webhook', 'POST', null, {
      id: 'evt_pay_failed',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_failed',
          metadata: { orderId: order._id.toString() },
        },
      },
    });
    webhookReq.headers.set('stripe-signature', 't=1,v1=mock');

    const webhookRes = await webhookRoute(webhookReq, { params: Promise.resolve({}) });
    expect(webhookRes.status).toBe(200);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder?.paymentStatus).toBe('failed');
    expect(updatedOrder?.aggregateStatus).toBe('cancelled');

    const updatedItem = await OrderItem.findById(item._id);
    expect(updatedItem?.status).toBe('cancelled');

    // Variant stock should be restocked to 6
    const variant = await Variant.findById(variantId1);
    const updatedVariant = await Variant.findById(variant1Id);
    expect(updatedVariant?.stock).toBe(6);

    // 2. Reject transition from failed to completed
    const succReq = createRequest('/api/payments/webhook', 'POST', null, {
      id: 'evt_pay_succ_failed',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_failed',
          metadata: { orderId: order._id.toString() },
        },
      },
    });
    succReq.headers.set('stripe-signature', 't=1,v1=mock');

    const succRes = await webhookRoute(succReq, { params: Promise.resolve({}) });
    expect(succRes.status).toBe(400); // Bad Request due to transition violation
  });

  it('should verify payout triggers and multi-vendor escrow safety', async () => {
    // Create an order that is delivered and completed
    const order = await Order.create({
      customerId,
      sellerIds: [seller1Id, seller2Id],
      totalAmount: 300,
      aggregateStatus: 'delivered', // Delivered!
      paymentMethod: 'card',
      paymentStatus: 'completed', // Paid!
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const item1 = await OrderItem.create({
      orderId: order._id,
      productId: product1Id,
      variantId: variant1Id,
      sellerId: seller1Id,
      quantity: 1,
      price: 100,
      sellerPayout: 90,
      platformFee: 10,
      discountApplied: 0,
      taxAmount: 0,
      status: 'delivered',
    });

    const item2 = await OrderItem.create({
      orderId: order._id,
      productId: product2Id,
      variantId: variant2Id,
      sellerId: seller2Id,
      quantity: 1,
      price: 200,
      sellerPayout: 180,
      platformFee: 20,
      discountApplied: 0,
      taxAmount: 0,
      status: 'delivered',
    });

    // Process payouts with authorization header
    const payoutReq = createRequest('/api/payments/payouts', 'POST', null, null);
    payoutReq.headers.set('Authorization', 'Bearer cron_test_secret');

    const payoutRes = await payoutsRoute(payoutReq, { params: Promise.resolve({}) });
    expect(payoutRes.status).toBe(200);

    const payoutData = await payoutRes.json();
    expect(payoutData.processed).toBe(2); // processed payouts for both sellers

    // Ledger records should exist for both payouts
    const ledgers = await FinancialLedger.find({ orderId: order._id, type: 'payout' });
    expect(ledgers.length).toBe(2);
    expect(ledgers.map(l => l.sellerId.toString())).toContain(seller1Id.toString());
    expect(ledgers.map(l => l.sellerId.toString())).toContain(seller2Id.toString());
  });

  it('should verify admin refund transaction safety, status syncs, and inventory restocking', async () => {
    // Create completed order
    const order = await Order.create({
      customerId,
      sellerIds: [seller1Id],
      totalAmount: 100,
      aggregateStatus: 'processing',
      paymentMethod: 'card',
      paymentStatus: 'completed',
      stripePaymentIntentId: 'pi_refund_111',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const item = await OrderItem.create({
      orderId: order._id,
      productId: product1Id,
      variantId: variant1Id,
      sellerId: seller1Id,
      quantity: 2,
      price: 50,
      status: 'processing',
    });

    // Run refund
    const refundReq = createRequest('/api/payments/refunds', 'POST', adminToken, {
      orderId: order._id.toString(),
      amount: 100,
      reason: 'test refund',
      reverseTransfer: false
    });

    const refundRes = await refundsRoute(refundReq, { params: Promise.resolve({}) });
    expect(refundRes.status).toBe(200);

    // Verify order statuses
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder?.paymentStatus).toBe('refunded');
    expect(updatedOrder?.aggregateStatus).toBe('cancelled');

    // Verify item statuses
    const updatedItem = await OrderItem.findById(item._id);
    expect(updatedItem?.status).toBe('cancelled');

    // Verify stock is restocked from 5 to 7
    const updatedVariant = await Variant.findById(variant1Id);
    expect(updatedVariant?.stock).toBe(7);

    // Verify FinancialLedger entry is recorded
    const ledger = await FinancialLedger.findOne({ orderId: order._id, type: 'refund' });
    expect(ledger).toBeDefined();
    expect(ledger?.amount).toBe(100);
  });
});

// Unique object IDs for scoping
const orderId2 = new mongoose.Types.ObjectId('6a33907c1fa365e09a90b7fb');
const variantId1 = new mongoose.Types.ObjectId('6a33907c1fa365e09a90b7fc');
