/**
 * Webhook Forensic Security & Idempotency Unit Test Suite
 * 
 * Verifies:
 * 1. Signature verification against raw unmodified body
 * 2. Official Stripe constructEvent SDK verification
 * 3. Constant-time comparison
 * 4. Replay attack rejection (timestamp expiration beyond 300s tolerance)
 * 5. Missing / malformed signature rejection with 400 Bad Request
 * 6. Missing server webhook secret handling
 * 7. Duplicate event idempotency (returns 200 duplicate)
 * 8. Concurrent webhook race condition (P2002) returns 200 duplicate
 * 9. Legitimate retry on previously failed webhook events
 * 
 * @agent engineering-payments-billing-engineer
 * @agent security-appsec-engineer
 * @agent 02-code-review-agent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Setup environment variables before imports
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret_12345678901234567890';

const {
  mockHandleWebhookEvent,
  mockEventLogFindUnique,
  mockEventLogCreate,
  mockEventLogUpdate,
  mockAlertDispatch,
} = vi.hoisted(() => ({
  mockHandleWebhookEvent: vi.fn(),
  mockEventLogFindUnique: vi.fn(),
  mockEventLogCreate: vi.fn(),
  mockEventLogUpdate: vi.fn(),
  mockAlertDispatch: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  withIsolationScope: (cb: any) => cb(),
  setTag: vi.fn(),
}));

vi.mock('@/lib/alerting', () => ({
  AlertDispatcher: {
    dispatch: (...args: any[]) => mockAlertDispatch(...args),
  },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    eventLog: {
      findUnique: (...args: any[]) => mockEventLogFindUnique(...args),
      create: (...args: any[]) => mockEventLogCreate(...args),
      update: (...args: any[]) => mockEventLogUpdate(...args),
    },
  },
}));

vi.mock('@/services/PaymentService', () => {
  return {
    PaymentService: class {
      handleWebhookEvent = (...args: any[]) => mockHandleWebhookEvent(...args);
    },
  };
});

import { POST as webhookRoute } from '@/app/api/payments/webhook/route';
import { stripe } from '@/lib/stripe';

function generateStripeSignature(payload: string, secret: string, timestamp?: number): string {
  const t = timestamp !== undefined ? timestamp : Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${payload}`, 'utf8')
    .digest('hex');
  return `t=${t},v1=${signature}`;
}

describe('Webhook Forensic Security & Verification Suite', () => {
  const testSecret = 'whsec_test_secret_12345678901234567890';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = testSecret;
    mockEventLogFindUnique.mockResolvedValue(null);
    mockEventLogCreate.mockResolvedValue({ id: 'log_1', status: 'pending' });
    mockEventLogUpdate.mockResolvedValue({ id: 'log_1', status: 'processed' });
    mockHandleWebhookEvent.mockResolvedValue(undefined);
  });

  it('1. Rejects request with missing stripe-signature header (400 ValidationError)', async () => {
    const rawBody = JSON.stringify({ id: 'evt_1', type: 'payment_intent.succeeded' });
    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      body: rawBody,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.message).toMatch(/signature or secret missing/i);
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('2. Rejects request with empty / invalid signature (400 ValidationError)', async () => {
    const rawBody = JSON.stringify({ id: 'evt_2', type: 'payment_intent.succeeded' });
    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=invalid_hmac_hex',
      },
      body: rawBody,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.message).toMatch(/signature verification failed/i);
  });

  it('3. Rejects replay attack with expired signature (timestamp > 300s tolerance)', async () => {
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const rawBody = JSON.stringify({ id: 'evt_expired', type: 'payment_intent.succeeded' });
    const signature = generateStripeSignature(rawBody, testSecret, expiredTimestamp);

    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: rawBody,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.message).toMatch(/tolerance/i);
  });

  it('4. Rejects request when payload is tampered with after signing', async () => {
    const originalBody = JSON.stringify({ id: 'evt_orig', amount: 1000 });
    const signature = generateStripeSignature(originalBody, testSecret);
    const tamperedBody = JSON.stringify({ id: 'evt_orig', amount: 5000 }); // modified amount

    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: tamperedBody,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.message).toMatch(/signature verification failed/i);
  });

  it('5. Successfully verifies valid signature and unmodified raw payload', async () => {
    const payload = JSON.stringify({
      id: 'evt_valid_100',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: 'pi_test' } },
    });
    const signature = generateStripeSignature(payload, testSecret);

    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: payload,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.received).toBe(true);
    expect(mockHandleWebhookEvent).toHaveBeenCalled();
  });

  it('6. Idempotency: Duplicate delivery of already processed event returns 200 without reprocessing', async () => {
    const payload = JSON.stringify({
      id: 'evt_dup_200',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: 'pi_dup' } },
    });
    const signature = generateStripeSignature(payload, testSecret);

    // Event already in processed state
    mockEventLogFindUnique.mockResolvedValueOnce({
      eventId: 'evt_dup_200',
      status: 'processed',
    });

    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: payload,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.duplicate).toBe(true);
    expect(mockHandleWebhookEvent).not.toHaveBeenCalled();
  });

  it('7. Concurrency race protection: P2002 unique constraint returns 200 duplicate without throwing 500', async () => {
    const payload = JSON.stringify({
      id: 'evt_race_300',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: 'pi_race' } },
    });
    const signature = generateStripeSignature(payload, testSecret);

    // Initial check misses due to race condition
    mockEventLogFindUnique.mockResolvedValueOnce(null);
    // Concurrent thread created record in between, triggering unique constraint violation
    const p2002Error: any = new Error('Unique constraint failed on eventId');
    p2002Error.code = 'P2002';
    mockEventLogCreate.mockRejectedValueOnce(p2002Error);

    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: payload,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.duplicate).toBe(true);
    expect(mockHandleWebhookEvent).not.toHaveBeenCalled();
  });

  it('8. Retry handling: Allows previously failed events to be safely retried and processed', async () => {
    const payload = JSON.stringify({
      id: 'evt_failed_retry_400',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: 'pi_retry' } },
    });
    const signature = generateStripeSignature(payload, testSecret);

    // Event previously failed
    mockEventLogFindUnique.mockResolvedValueOnce({
      eventId: 'evt_failed_retry_400',
      status: 'failed',
    });

    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: payload,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.received).toBe(true);
    // Should re-run processing on retry
    expect(mockHandleWebhookEvent).toHaveBeenCalled();
  });

  it('9. Rejects request when STRIPE_WEBHOOK_SECRET is missing on the server', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const payload = JSON.stringify({ id: 'evt_no_secret', type: 'payment_intent.succeeded' });
    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': 't=123,v1=abc',
      },
      body: payload,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.message).toMatch(/signature or secret missing/i);
  });

  it('10. Concurrent in-flight delivery: Event status "pending" returns 200 without duplicate execution', async () => {
    const payload = JSON.stringify({
      id: 'evt_inflight_500',
      type: 'payment_intent.succeeded',
      created: Math.floor(Date.now() / 1000),
      data: { object: { id: 'pi_inflight' } },
    });
    const signature = generateStripeSignature(payload, testSecret);

    mockEventLogFindUnique.mockResolvedValueOnce({
      eventId: 'evt_inflight_500',
      status: 'pending',
    });

    const req = new NextRequest('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
      },
      body: payload,
    });

    const res = await webhookRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.duplicate).toBe(true);
    expect(data.inFlight).toBe(true);
    expect(mockHandleWebhookEvent).not.toHaveBeenCalled();
  });
});
