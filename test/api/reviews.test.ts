// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createReviewRoute, PUT as updateReviewRoute } from '@/app/api/products/[id]/reviews/route';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import { OrderItem } from '@/models/OrderItem';
import { Review } from '@/models/Review';
import { Store } from '@/models/Store';
import { NextRequest } from 'next/server';
import mongoose from '../mock-id';
import { generateAccessToken } from '@/lib/jwt';

describe('Review Submission API', () => {
  let customerId: mongoose.Types.ObjectId;
  let otherCustomerId: mongoose.Types.ObjectId;
  let sellerId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;
  let orderId: mongoose.Types.ObjectId;

  let customerToken: string;
  let otherCustomerToken: string;

  beforeEach(async () => {
    customerId = new mongoose.Types.ObjectId();
    otherCustomerId = new mongoose.Types.ObjectId();
    sellerId = new mongoose.Types.ObjectId();
    productId = new mongoose.Types.ObjectId();
    orderId = new mongoose.Types.ObjectId();

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Review.deleteMany({});
    await Store.deleteMany({});

    // Create users
    await User.create({ _id: customerId, name: 'Reviewer', email: 'rev@example.com', role: 'customer', status: 'active' });
    await User.create({ _id: otherCustomerId, name: 'Other', email: 'other@example.com', role: 'customer', status: 'active' });
    await User.create({ _id: sellerId, name: 'Seller', email: 'sel@example.com', role: 'seller', status: 'active' });

    // Create product
    await Product.create({ _id: productId, sellerId, name: 'Review Product', slug: 'rev-prod', description: 'Test', categoryId: new mongoose.Types.ObjectId(), basePrice: 50, status: 'published', inStock: true });

    // Create completed order for customerId
    const addressId = new mongoose.Types.ObjectId();
    await Order.create({
      _id: orderId,
      customerId,
      sellerIds: [sellerId],
      totalAmount: 50,
      aggregateStatus: 'delivered',
      paymentMethod: 'card',
      paymentStatus: 'completed',
      shippingAddress: addressId,
    });

    await OrderItem.create({
      orderId,
      productId,
      sellerId,
      quantity: 1,
      price: 50,
      status: 'delivered',
    });

    customerToken = generateAccessToken(customerId, 'customer');
    otherCustomerToken = generateAccessToken(otherCustomerId, 'customer');
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

  it('should successfully create a verified customer review', async () => {
    const payload = { rating: 5, title: 'Great', comment: 'Loved it' };
    const req = createRequest(`/api/products/${productId}/reviews`, 'POST', customerToken, payload);
    const res = await createReviewRoute(req, { params: Promise.resolve({ id: productId.toString() }) });
    
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.review.rating).toBe(5);
    expect(body.data.review.comment).toBe('Loved it');
    expect(body.data.review.status).toBe('pending');
    
    const product = await Product.findById(productId);
    expect(product?.numReviews).toBe(1);
    expect(product?.rating).toBe(5);
  });

  it('should reject review from non-purchased customer', async () => {
    const payload = { rating: 4, comment: 'Nice' };
    const req = createRequest(`/api/products/${productId}/reviews`, 'POST', otherCustomerToken, payload);
    const res = await createReviewRoute(req, { params: Promise.resolve({ id: productId.toString() }) });
    
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.message).toMatch(/purchase/i);
  });

  it('should block duplicate review attempts', async () => {
    await Review.create({
      productId,
      customerId,
      rating: 5,
      comment: 'First review'
    });

    const payload = { rating: 4, comment: 'Second review' };
    const req = createRequest(`/api/products/${productId}/reviews`, 'POST', customerToken, payload);
    const res = await createReviewRoute(req, { params: Promise.resolve({ id: productId.toString() }) });
    
    expect(res.status).toBe(409); // Conflict
  });

  it('should reject invalid rating', async () => {
    const payload = { rating: 6, comment: 'Too good' };
    const req = createRequest(`/api/products/${productId}/reviews`, 'POST', customerToken, payload);
    const res = await createReviewRoute(req, { params: Promise.resolve({ id: productId.toString() }) });
    
    expect(res.status).toBe(400);
  });

  it('should reject missing comment', async () => {
    const payload = { rating: 4 };
    const req = createRequest(`/api/products/${productId}/reviews`, 'POST', customerToken, payload);
    const res = await createReviewRoute(req, { params: Promise.resolve({ id: productId.toString() }) });
    
    expect(res.status).toBe(400);
  });

  it('should sanitize XSS from comment', async () => {
    const payload = { rating: 4, comment: '<script>alert("xss")</script>Hello' };
    const req = createRequest(`/api/products/${productId}/reviews`, 'POST', customerToken, payload);
    const res = await createReviewRoute(req, { params: Promise.resolve({ id: productId.toString() }) });
    
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.review.comment).not.toContain('<script>');
    expect(body.data.review.comment).toContain('Hello');
  });

  it('should update review and product metrics', async () => {
    await Review.create({
      productId,
      customerId,
      rating: 4,
      comment: 'First review',
      status: 'approved'
    });
    
    await Product.findByIdAndUpdate(productId, { rating: 4, numReviews: 1 });

    const payload = { rating: 2, comment: 'Changed my mind' };
    const req = createRequest(`/api/products/${productId}/reviews`, 'PUT', customerToken, payload);
    const res = await updateReviewRoute(req, { params: Promise.resolve({ id: productId.toString() }) });
    
    expect(res.status).toBe(200);
    const product = await Product.findById(productId);
    expect(product?.rating).toBe(2);
  });
});
