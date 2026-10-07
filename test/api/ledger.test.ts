/**
 * Double-Entry Financial Accounting & Escrow Ledger Test Suite
 * 
 * Verifies mathematical invariants, idempotency, and balanced debits/credits.
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-finops-engineer
 * @agent 15-unit-test-generator
 * @agent doubt-driven-development
 */

import { describe, it, expect, vi } from 'vitest';
import { postJournalEntry, ACCOUNTS, LineItemInput } from '@/lib/ledger';

describe('Double-Entry Ledger & Financial Invariants', () => {
  it('should have standard chart of accounts defined', () => {
    expect(ACCOUNTS.STRIPE_CASH_IN_TRANSIT).toBe('1000');
    expect(ACCOUNTS.STRIPE_CASH_SETTLED).toBe('1100');
    expect(ACCOUNTS.VENDOR_ESCROW).toBe('2000');
    expect(ACCOUNTS.TAX_PAYABLE).toBe('2100');
    expect(ACCOUNTS.PLATFORM_COMMISSION).toBe('4000');
    expect(ACCOUNTS.STRIPE_FEES).toBe('5000');
  });

  it('should reject journal entries where debits do not equal credits', async () => {
    const imbalancedLines: LineItemInput[] = [
      { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'DEBIT' }, // $100.00
      { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 8000, direction: 'CREDIT' },          // $80.00
      // Missing $20.00 platform commission
    ];

    await expect(
      postJournalEntry({
        idempotencyKey: 'test-imbalance-key-1',
        eventName: 'ORDER_PAID',
        currency: 'USD',
        lines: imbalancedLines,
      })
    ).rejects.toThrow(/Ledger Imbalance/);
  });

  it('should reject journal entries with negative line amounts', async () => {
    const negativeLines: LineItemInput[] = [
      { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: -5000, direction: 'DEBIT' },
      { accountId: ACCOUNTS.VENDOR_ESCROW, amount: -5000, direction: 'CREDIT' },
    ];

    await expect(
      postJournalEntry({
        idempotencyKey: 'test-negative-key-1',
        eventName: 'ORDER_PAID',
        currency: 'USD',
        lines: negativeLines,
      })
    ).rejects.toThrow(/must be strictly positive/);
  });

  it('should accept mathematically balanced transaction lines', async () => {
    // 90% Vendor Escrow, 10% Platform Commission
    const balancedLines: LineItemInput[] = [
      { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'DEBIT' },  // $100.00
      { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 9000, direction: 'CREDIT' },           // $90.00
      { accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: 1000, direction: 'CREDIT' },      // $10.00
    ];

    // Mock client to test logic without requiring active database connection
    const mockCreatedEntry = { id: 'je-1', idempotencyKey: 'test-balanced-key-1', lines: balancedLines };
    const mockTx = {
      journalEntry: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(mockCreatedEntry),
      },
    };

    const result = await postJournalEntry(
      {
        idempotencyKey: 'test-balanced-key-1',
        eventName: 'ORDER_PAID',
        currency: 'USD',
        orderId: 'order-123',
        lines: balancedLines,
      },
      mockTx
    );

    expect(result).toBeDefined();
    expect(mockTx.journalEntry.create).toHaveBeenCalled();
  });

  it('should return existing entry if idempotency key was previously processed', async () => {
    const lines: LineItemInput[] = [
      { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 5000, direction: 'DEBIT' },
      { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 5000, direction: 'CREDIT' },
    ];

    const existingEntry = { id: 'je-existing-1', idempotencyKey: 'idemp-duplicate-test', lines };
    const mockTx = {
      journalEntry: {
        findUnique: vi.fn().mockResolvedValue(existingEntry),
        create: vi.fn(),
      },
    };

    const result = await postJournalEntry(
      {
        idempotencyKey: 'idemp-duplicate-test',
        eventName: 'ORDER_PAID',
        currency: 'USD',
        lines,
      },
      mockTx
    );

    expect(result).toEqual(existingEntry);
    expect(mockTx.journalEntry.create).not.toHaveBeenCalled();
  });
});
