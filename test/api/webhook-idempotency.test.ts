// @ts-nocheck
// Set environment variables before any imports to prevent Stripe constructor crashes
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as webhookRoute } from '@/app/api/payments/webhook/route';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { Variant } from '@/models/Variant';
import { Order } from '@/models/Order';
import { OrderItem } from '@/models/OrderItem';
import { EventLog } from '@/models/EventLog';
import { FinancialLedger } from '@/models/FinancialLedger';
import { NextRequest } from 'next/server';
import mongoose from '../mock-id';
import { stripe } from '@/lib/stripe';

// Mock Stripe webhook constructEvent to parse JSON body directly
vi.spyOn(stripe.webhooks, 'constructEvent').mockImplementation((body: any) => {
  return JSON.parse(body.toString());
});

describe('Stripe Idempotency & Duplicate Event Stress Tests', () => {
  let customerId: mongoose.Types.ObjectId;
  let sellerId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;
  let variantId: mongoose.Types.ObjectId;
  let orderId: mongoose.Types.ObjectId;

  const createWebhookRequest = (body: any) => {
    return new NextRequest(new URL('http://localhost/api/payments/webhook'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=123,v1=mock_sig',
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(async () => {
    customerId = new mongoose.Types.ObjectId();
    sellerId = new mongoose.Types.ObjectId();
    productId = new mongoose.Types.ObjectId();
    variantId = new mongoose.Types.ObjectId();
    orderId = new mongoose.Types.ObjectId();

    await User.deleteMany({});
    await Product.deleteMany({});
    await Variant.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await EventLog.deleteMany({});
    await FinancialLedger.deleteMany({});

    await User.create({
      _id: customerId,
      name: 'Stress Test Customer',
      email: 'stress@example.com',
      password: 'Hash123!',
      role: 'customer',
      status: 'active',
    });

    await Variant.create({
      _id: variantId,
      productId,
      sellerId,
      sku: 'STRESS-01',
      price: 50,
      stock: 20,
    });
  });

  it('should execute payment_intent.succeeded exactly once when replayed 10 times sequentially', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 150,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    await OrderItem.create({
      orderId,
      productId,
      variantId,
      sellerId,
      quantity: 3,
      price: 50,
      status: 'pending',
    });

    const mockEvent = {
      id: 'evt_stress_success_10x',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'pi_stress_10x',
          metadata: { orderId: orderId.toString() },
        },
      },
    };

    // Replay 10 times sequentially
    for (let i = 0; i < 10; i++) {
      const req = createWebhookRequest(mockEvent);
      const res = await webhookRoute(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    }

    // Verify: exactly 1 EventLog entry
    const eventLogs = await EventLog.find({ eventId: 'evt_stress_success_10x' });
    expect(eventLogs.length).toBe(1);
    expect(eventLogs[0].status).toBe('processed');

    // Verify: order updated exactly once
    const order = await Order.findById(orderId);
    expect(order?.paymentStatus).toBe('completed');
    expect(order?.aggregateStatus).toBe('processing');

    // Verify: items updated exactly once
    const items = await OrderItem.find({ orderId });
    expect(items.every(i => i.status === 'processing')).toBe(true);
  });

  it('should execute payment_intent.payment_failed exactly once with correct stock restock when replayed 10 times', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 150,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    await OrderItem.create({
      orderId,
      productId,
      variantId,
      sellerId,
      quantity: 5,
      price: 50,
      status: 'pending',
    });

    const mockEvent = {
      id: 'evt_stress_failed_10x',
      type: 'payment_intent.payment_failed',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'pi_stress_failed_10x',
          metadata: { orderId: orderId.toString() },
        },
      },
    };

    for (let i = 0; i < 10; i++) {
      const req = createWebhookRequest(mockEvent);
      const res = await webhookRoute(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    }

    // Verify: stock restored exactly once (20 + 5 = 25, NOT 20 + 50)
    const variant = await Variant.findById(variantId);
    expect(variant?.stock).toBe(25);

    // Verify: exactly 1 EventLog entry
    const eventLogs = await EventLog.find({ eventId: 'evt_stress_failed_10x' });
    expect(eventLogs.length).toBe(1);
  });

  it('should execute charge.refunded exactly once when replayed 10 times', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 100,
      aggregateStatus: 'processing',
      paymentMethod: 'card',
      paymentStatus: 'completed',
      stripePaymentIntentId: 'pi_stress_refund',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    await OrderItem.create({
      orderId,
      productId,
      variantId,
      sellerId,
      quantity: 4,
      price: 50,
      status: 'processing',
    });

    const mockEvent = {
      id: 'evt_stress_refund_10x',
      type: 'charge.refunded',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'ch_stress_refund',
          payment_intent: 'pi_stress_refund',
          metadata: { orderId: orderId.toString() },
        },
      },
    };

    for (let i = 0; i < 10; i++) {
      const req = createWebhookRequest(mockEvent);
      const res = await webhookRoute(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    }

    // Verify: stock not restored on charge.refunded as per new requirements
    const variant = await Variant.findById(variantId);
    expect(variant?.stock).toBe(20);

    const order = await Order.findById(orderId);
    expect(order?.paymentStatus).toBe('refunded');

    const eventLogs = await EventLog.find({ eventId: 'evt_stress_refund_10x' });
    expect(eventLogs.length).toBe(1);
  });

  it('should handle parallel duplicate events safely via unique index concurrency gate', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 200,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    await OrderItem.create({
      orderId,
      productId,
      variantId,
      sellerId,
      quantity: 2,
      price: 50,
      status: 'pending',
    });

    const mockEvent = {
      id: 'evt_stress_parallel',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'pi_stress_parallel',
          metadata: { orderId: orderId.toString() },
        },
      },
    };

    // Fire 5 concurrent requests simultaneously
    const promises = Array.from({ length: 5 }, () => {
      const req = createWebhookRequest(mockEvent);
      return webhookRoute(req, { params: Promise.resolve({}) });
    });

    const results = await Promise.all(promises);

    // Allow 200 (duplicate handled) or 409 (WriteConflict)
    results.forEach(res => expect([200, 409]).toContain(res.status));

    // Exactly 1 EventLog
    const eventLogs = await EventLog.find({ eventId: 'evt_stress_parallel' });
    expect(eventLogs.length).toBe(1);

    // Order updated exactly once
    const order = await Order.findById(orderId);
    expect(order?.paymentStatus).toBe('completed');
    expect(order?.aggregateStatus).toBe('processing');
  });

  it('should verify EventLog forensic fields are populated correctly', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 100,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const stripeCreatedTimestamp = Math.floor(Date.now() / 1000) - 60;

    const mockEvent = {
      id: 'evt_forensic_test',
      type: 'payment_intent.succeeded',
      created: stripeCreatedTimestamp,
      data: {
        object: {
          id: 'pi_forensic',
          metadata: { orderId: orderId.toString() },
        },
      },
    };

    const req = createWebhookRequest(mockEvent);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const log = await EventLog.findOne({ eventId: 'evt_forensic_test' });
    expect(log).toBeDefined();
    expect(log?.eventType).toBe('payment_intent.succeeded');
    expect(log?.status).toBe('processed');
    expect(log?.stripeCreatedAt).toBeInstanceOf(Date);
    expect(log?.requestId).toBeDefined();
    expect(log?.processingNode).toBeDefined();
    expect(log?.processingDurationMs).toBeGreaterThanOrEqual(0);
  });
});
