import { describe, it, expect } from 'vitest';
import prisma from '@/lib/prisma';
import { postJournalEntry, ACCOUNTS } from '@/lib/ledger';
import { AppError } from '@/lib/errors';

describe('Double-Entry Ledger Integrity', () => {
  it('should successfully post a balanced journal entry', async () => {
    const seller = await prisma.user.create({
      data: {
        name: 'Ledger Seller',
        email: `seller_${Date.now()}@example.com`,
        password: 'HashPassword123!',
        role: 'seller',
        status: 'active',
      },
    });

    const entry = await postJournalEntry({
      idempotencyKey: 'test_pi_123',
      eventName: 'ORDER_PAID',
      currency: 'usd',
      lines: [
        { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'DEBIT' as const }, // $100.00
        { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 8000, direction: 'CREDIT' as const, entityId: seller.id },
        { accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: 1000, direction: 'CREDIT' as const },
        { accountId: ACCOUNTS.TAX_PAYABLE, amount: 1000, direction: 'CREDIT' as const }
      ]
    });

    expect(entry).toBeDefined();
    expect(entry.status).toBe('POSTED');

    const lines = await prisma.transactionLine.findMany({ where: { journalEntryId: entry.id } });
    expect(lines.length).toBe(4);
  });

  it('should reject an unbalanced journal entry (money creation test)', async () => {
    await expect(postJournalEntry({
      idempotencyKey: 'test_pi_456',
      eventName: 'ORDER_PAID',
      currency: 'usd',
      lines: [
        { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'DEBIT' as const }, 
        { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 9000, direction: 'CREDIT' as const },
        // Missing $10 credit to balance the $100 debit
      ]
    })).rejects.toThrow(AppError);
  });

  it('should reject negative line amounts', async () => {
    await expect(postJournalEntry({
      idempotencyKey: 'test_pi_789',
      eventName: 'ORDER_PAID',
      currency: 'usd',
      lines: [
        { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: -1000, direction: 'DEBIT' as const }, 
        { accountId: ACCOUNTS.VENDOR_ESCROW, amount: -1000, direction: 'CREDIT' as const },
      ]
    })).rejects.toThrow(/strictly positive/);
  });

  it('should prevent duplicate postings (Idempotency)', async () => {
    const params = {
      idempotencyKey: 'test_pi_duplicate',
      eventName: 'ORDER_PAID' as const,
      currency: 'usd',
      lines: [
        { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 5000, direction: 'DEBIT' as const },
        { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 5000, direction: 'CREDIT' as const }
      ]
    };

    const first = await postJournalEntry(params);
    const second = await postJournalEntry(params);

    expect(first.id).toEqual(second.id);
    
    const count = await prisma.journalEntry.count();
    expect(count).toBe(1);
  });
});

