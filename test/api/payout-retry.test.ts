process.env.CRON_SECRET = 'cron_test_secret';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as payoutsRoute } from '@/app/api/payments/payouts/route';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';

const mockTransferCreate = vi.spyOn(stripe.transfers, 'create');

describe('Marketplace Payout Retry Engine & Hardening Suite', () => {
  beforeEach(async () => {
    try {
      await prisma.transferLog.deleteMany({});
      await prisma.financialLedger.deleteMany({});
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.variant.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.store.deleteMany({});
      await prisma.user.deleteMany({});
    } catch {}
  });

  const createCronRequest = (secret = 'cron_test_secret') => {
    return new NextRequest(new URL('/api/payments/payouts', 'http://localhost'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
    });
  };

  it('should reject unauthorized cron execution without valid bearer secret', async () => {
    const req = createCronRequest('wrong_secret');
    const res = await payoutsRoute(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
  });

  it('should respond with empty payout results when no eligible orders exist', async () => {
    const req = createCronRequest('cron_test_secret');
    const res = await payoutsRoute(req, { params: Promise.resolve({}) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.processed).toBe(0);
  });
});
