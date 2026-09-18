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
import { NextRequest } from 'next/server';
import mongoose from '../mock-id';
import { stripe } from '@/lib/stripe';

// Mock Stripe webhook constructEvent to parse JSON body directly
vi.spyOn(stripe.webhooks, 'constructEvent').mockImplementation((body) => {
  return JSON.parse(body);
});

describe('Stripe Webhook API Hardening & Idempotency', () => {
  let customerId: mongoose.Types.ObjectId;
  let sellerId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;
  let variantId: mongoose.Types.ObjectId;
  let orderId: mongoose.Types.ObjectId;

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

    // Create user
    await User.create({
      _id: customerId,
      name: 'Test Customer',
      email: 'customer@example.com',
      password: 'Hash123!',
      role: 'customer',
      status: 'active',
    });

    // Create variant with stock 5
    await Variant.create({
      _id: variantId,
      productId: productId,
      sellerId: sellerId,
      sku: 'L-01',
      price: 100,
      stock: 5,
    });
  });

  const createWebhookRequest = (body: any, signature: string | null = 't=123,v1=mock_sig') => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (signature) {
      headers['stripe-signature'] = signature;
    }
    return new NextRequest(new URL('http://localhost/api/payments/webhook'), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  };

  it('should process payment_intent.succeeded and update order status', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 300,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const mockEvent = {
      id: 'evt_test_succeeded',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: {
            orderId: orderId.toString(),
          },
        },
      },
    };

    const req = createWebhookRequest(mockEvent);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe('completed');
    expect(updatedOrder?.aggregateStatus).toBe('processing');
    expect(updatedOrder?.stripePaymentIntentId).toBe('pi_test_123');
    expect(updatedOrder?.paidAt).toBeDefined();

    // Verify EventLog entry created
    const log = await EventLog.findOne({ eventId: 'evt_test_succeeded' });
    expect(log).toBeDefined();
  });

  it('should ignore duplicate webhook delivery and return 200', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 300,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const mockEvent = {
      id: 'evt_test_dup',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: {
            orderId: orderId.toString(),
          },
        },
      },
    };

    // First call
    const req1 = createWebhookRequest(mockEvent);
    const res1 = await webhookRoute(req1, { params: Promise.resolve({}) });
    expect(res1.status).toBe(200);

    // Verify state updated
    let updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe('completed');

    // Second call
    const req2 = createWebhookRequest(mockEvent);
    const res2 = await webhookRoute(req2, { params: Promise.resolve({}) });
    expect(res2.status).toBe(200);

    const data2 = await res2.json();
    expect(data2.duplicate).toBe(true);

    // Verify order state unchanged
    updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe('completed');
  });

  it('should process payment_intent.payment_failed and restock inventory exactly once', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 300,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    // Create order item corresponding to variant
    await OrderItem.create({
      orderId,
      productId,
      variantId,
      sellerId,
      quantity: 3,
      price: 100,
      status: 'pending',
    });

    const mockEvent = {
      id: 'evt_test_failed',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_456',
          metadata: {
            orderId: orderId.toString(),
          },
        },
      },
    };

    // First call
    const req = createWebhookRequest(mockEvent);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe('failed');

    // Variant stock should be updated from 5 to 8
    let updatedVariant = await Variant.findById(variantId);
    expect(updatedVariant?.stock).toBe(8);

    // Second call (same event - duplicate webhook)
    const req2 = createWebhookRequest(mockEvent);
    const res2 = await webhookRoute(req2, { params: Promise.resolve({}) });
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.duplicate).toBe(true);

    // Stock should still be 8 (no double-restocking)
    updatedVariant = await Variant.findById(variantId);
    expect(updatedVariant?.stock).toBe(8);
  });

  it('should handle payment_failed on already failed order idempotently without double restock', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 300,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'failed', // already failed
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    await OrderItem.create({
      orderId,
      productId,
      variantId,
      sellerId,
      quantity: 3,
      price: 100,
      status: 'pending',
    });

    // Send a new failed webhook event
    const mockEvent = {
      id: 'evt_new_failed',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_failed_again',
          metadata: {
            orderId: orderId.toString(),
          },
        },
      },
    };

    const req = createWebhookRequest(mockEvent);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200); // Idempotent success

    // Stock remains unchanged at 5 (already processed / not restocked again)
    const updatedVariant = await Variant.findById(variantId);
    expect(updatedVariant?.stock).toBe(5);
  });

  it('should process charge.refunded and transition completed order to refunded', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 300,
      aggregateStatus: 'processing',
      paymentMethod: 'card',
      paymentStatus: 'completed', // completed order
      stripePaymentIntentId: 'pi_refund_test',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const item = await OrderItem.create({
      orderId,
      productId,
      variantId,
      sellerId,
      quantity: 2,
      price: 100,
      status: 'processing',
    });

    const mockEvent = {
      id: 'evt_refund',
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_refund_123',
          payment_intent: 'pi_refund_test',
          metadata: {
            orderId: orderId.toString(),
          },
        },
      },
    };

    const req = createWebhookRequest(mockEvent);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe('refunded');
    expect(updatedOrder?.aggregateStatus).toBe('cancelled');

    const updatedItem = await OrderItem.findById(item._id);
    expect(updatedItem?.status).toBe('cancelled');

    // Variant stock should remain 5 (restocking moved to returns flow)
    const updatedVariant = await Variant.findById(variantId);
    expect(updatedVariant?.stock).toBe(5);
  });

  it('should process checkout.session.completed and transition pending order to completed', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 300,
      aggregateStatus: 'pending',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    const mockEvent = {
      id: 'evt_checkout_session',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_999',
          payment_intent: 'pi_checkout_session',
          metadata: {
            orderId: orderId.toString(),
          },
        },
      },
    };

    const req = createWebhookRequest(mockEvent);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe('completed');
    expect(updatedOrder?.aggregateStatus).toBe('processing');
    expect(updatedOrder?.stripePaymentIntentId).toBe('pi_checkout_session');
  });

  it('should reject invalid transition states with 400', async () => {
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 300,
      aggregateStatus: 'cancelled',
      paymentMethod: 'card',
      paymentStatus: 'refunded', // already refunded
      shippingAddress: new mongoose.Types.ObjectId(),
    });

    // Attempting to transition from refunded to completed
    const mockEvent = {
      id: 'evt_invalid_transition',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_invalid',
          metadata: {
            orderId: orderId.toString(),
          },
        },
      },
    };

    const req = createWebhookRequest(mockEvent);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.message).toMatch(/Illegal paymentStatus transition/);
  });

  it('should reject requests with missing signature', async () => {
    const mockEvent = {
      id: 'evt_no_sig',
      type: 'payment_intent.succeeded',
    };
    const req = createWebhookRequest(mockEvent, null);
    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toMatch(/signature or secret missing/);
  });
});
