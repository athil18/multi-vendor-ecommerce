// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createDisputeRoute } from '@/app/api/disputes/route';
import { POST as getTrustScoreRoute } from '@/app/api/admin/governance/sellers/[id]/trust/route';
import { User } from '@/models/User';
import { Store } from '@/models/Store';
import { Order } from '@/models/Order';
import { OrderItem } from '@/models/OrderItem';
import { Dispute } from '@/models/Dispute';
import mongoose from '../mock-id';
import { NextRequest } from 'next/server';
import { generateAccessToken } from '@/lib/jwt';

describe('Dispute Attribution API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Store.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Dispute.deleteMany({});
  });

  const createAuthRequest = (url: string, body: any, user: any) => {
    const token = generateAccessToken(user.id, user.role);
    return new NextRequest(new URL(url, 'http://localhost'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
  };

  it('should correctly attribute a dispute in a multi-vendor order and isolate trust score penalties', async () => {
    // 1. Setup Users
    const buyer = await User.create({ name: 'Buyer', email: 'buyer@test.com', password: 'pwd', role: 'customer' });
    const sellerA = await User.create({ name: 'Seller A', email: 'a@test.com', password: 'pwd', role: 'seller' });
    const sellerB = await User.create({ name: 'Seller B', email: 'b@test.com', password: 'pwd', role: 'seller' });
    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'pwd', role: 'admin' });

    await Store.create({ sellerId: sellerA._id, storeName: 'Store A', status: 'active' });
    await Store.create({ sellerId: sellerB._id, storeName: 'Store B', status: 'active' });

    // 2. Setup Multi-Vendor Order
    const order = await Order.create({
      customerId: buyer._id,
      sellerIds: [sellerA._id, sellerB._id],
      totalAmount: 100,
      aggregateStatus: 'delivered',
      shippingAddress: new mongoose.Types.ObjectId(),
      paymentMethod: 'card',
      paymentStatus: 'completed'
    });

    // Seller A Item
    await OrderItem.create({
      orderId: order._id,
      productId: new mongoose.Types.ObjectId(),
      sellerId: sellerA._id,
      quantity: 1,
      price: 50,
      status: 'delivered',
      platformFee: 5,
      sellerPayout: 45,
      discountApplied: 0,
      taxAmount: 0
    });

    // Seller B Item
    const itemB = await OrderItem.create({
      orderId: order._id,
      productId: new mongoose.Types.ObjectId(),
      sellerId: sellerB._id,
      quantity: 1,
      price: 50,
      status: 'delivered',
      platformFee: 5,
      sellerPayout: 45,
      discountApplied: 0,
      taxAmount: 0
    });

    // 3. Buyer disputes Seller B's item
    const disputeReq = createAuthRequest('/api/disputes', {
      orderId: order._id.toString(),
      orderItemId: itemB._id.toString(), // The new required field!
      reason: 'item_damaged',
      description: 'The item arrived broken'
    }, { id: buyer._id.toString(), role: 'customer' });

    const disputeRes = await createDisputeRoute(disputeReq);
    expect(disputeRes.status).toBe(201);
    
    const disputeData = await disputeRes.json();
    
    // Verify correct seller attribution on the dispute
    expect(disputeData.sellerId.toString()).toBe(sellerB._id.toString());
    expect(disputeData.orderItemId.toString()).toBe(itemB._id.toString());

    // 4. Verify Trust Score isolation
    const reqA = createAuthRequest(`/api/admin/governance/sellers/${sellerA._id}/trust`, {}, { id: admin._id.toString(), role: 'admin' });
    const resA = await getTrustScoreRoute(reqA, { params: Promise.resolve({ id: sellerA._id.toString() }) });
    const scoreA = await resA.json();

    const reqB = createAuthRequest(`/api/admin/governance/sellers/${sellerB._id}/trust`, {}, { id: admin._id.toString(), role: 'admin' });
    const resB = await getTrustScoreRoute(reqB, { params: Promise.resolve({ id: sellerB._id.toString() }) });
    const scoreB = await resB.json();

    // Seller A should be unaffected (no disputes, 1 item) => 100 score
    expect(scoreA.metrics.disputeRate).toBe(0);
    expect(scoreA.trustScore).toBe(100);

    // Seller B should have 100% dispute rate (1 item, 1 dispute) => penalty applied
    expect(scoreB.metrics.disputeRate).toBe(1);
    expect(scoreB.trustScore).toBeLessThan(100);
  });
});
