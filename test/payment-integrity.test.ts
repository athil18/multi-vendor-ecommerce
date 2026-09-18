import { describe, it, expect, beforeEach } from 'vitest';
import { postJournalEntry, ACCOUNTS } from '@/lib/ledger';

describe('Ledger Balance Integrity (@agent engineering-payments-billing-engineer)', () => {
  const inMemoryJournals = new Map<string, any>();
  const inMemoryLines: any[] = [];

  const mockClient = {
    journalEntry: {
      async findUnique({ where }: any) {
        return inMemoryJournals.get(where.idempotencyKey) || null;
      },
      async create({ data }: any) {
        const id = `je_${Date.now()}_${Math.random()}`;
        const lines = (data.lines?.create || []).map((l: any, idx: number) => ({
          id: `line_${id}_${idx}`,
          journalEntryId: id,
          accountId: l.accountId,
          amount: l.amount,
          direction: l.direction,
          entityId: l.entityId || null,
        }));
        const entry = {
          id,
          idempotencyKey: data.idempotencyKey,
          eventName: data.eventName,
          currency: data.currency,
          status: data.status,
          orderId: data.orderId,
          lines,
        };
        inMemoryJournals.set(data.idempotencyKey, entry);
        inMemoryLines.push(...lines);
        return entry;
      },
    },
    transactionLine: {
      async findMany({ where }: any) {
        return inMemoryLines.filter((l) => l.journalEntryId === where.journalEntryId);
      },
    },
  };

  beforeEach(() => {
    inMemoryJournals.clear();
    inMemoryLines.length = 0;
  });

  it('POSITIVE: Balanced ORDER_PAID journal posts successfully', async () => {
    const entry = await postJournalEntry(
      {
        idempotencyKey: 'pi_test_balanced_001',
        eventName: 'ORDER_PAID',
        currency: 'usd',
        lines: [
          { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'DEBIT' },
          { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 8200, direction: 'CREDIT' },
          { accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: 1000, direction: 'CREDIT' },
          { accountId: ACCOUNTS.TAX_PAYABLE, amount: 800, direction: 'CREDIT' },
        ],
      },
      mockClient
    );

    expect(entry.status).toBe('POSTED');
    const lines = await mockClient.transactionLine.findMany({ where: { journalEntryId: entry.id } });
    const totalDR = lines.filter((l) => l.direction === 'DEBIT').reduce((s, l) => s + l.amount, 0);
    const totalCR = lines.filter((l) => l.direction === 'CREDIT').reduce((s, l) => s + l.amount, 0);
    expect(totalDR).toBe(10000);
    expect(totalCR).toBe(10000);
  });

  it('NEGATIVE: Unbalanced journal throws Ledger Imbalance error', async () => {
    await expect(
      postJournalEntry(
        {
          idempotencyKey: 'pi_test_unbalanced_001',
          eventName: 'ORDER_PAID',
          currency: 'usd',
          lines: [
            { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'DEBIT' },
            { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 7000, direction: 'CREDIT' },
          ],
        },
        mockClient
      )
    ).rejects.toThrow(/Ledger Imbalance/);
  });

  it('NEGATIVE: Negative amount injection is rejected', async () => {
    await expect(
      postJournalEntry(
        {
          idempotencyKey: 'pi_test_negative_001',
          eventName: 'ORDER_PAID',
          currency: 'usd',
          lines: [
            { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: -5000, direction: 'DEBIT' },
            { accountId: ACCOUNTS.VENDOR_ESCROW, amount: -5000, direction: 'CREDIT' },
          ],
        },
        mockClient
      )
    ).rejects.toThrow(/strictly positive/);
  });

  it('BOUNDARY: Zero-amount lines are accepted (edge: free coupons)', async () => {
    const entry = await postJournalEntry(
      {
        idempotencyKey: 'pi_test_zero_001',
        eventName: 'ORDER_PAID',
        currency: 'usd',
        lines: [
          { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 5000, direction: 'DEBIT' },
          { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 5000, direction: 'CREDIT' },
          { accountId: ACCOUNTS.TAX_PAYABLE, amount: 0, direction: 'CREDIT' },
        ],
      },
      mockClient
    );
    expect(entry.status).toBe('POSTED');
  });

  it('IDEMPOTENCY: Duplicate journal key returns existing entry', async () => {
    const params = {
      idempotencyKey: 'pi_test_idempotent_001',
      eventName: 'ORDER_PAID' as const,
      currency: 'usd',
      lines: [
        { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 5000, direction: 'DEBIT' as const },
        { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 5000, direction: 'CREDIT' as const },
      ],
    };

    const first = await postJournalEntry(params, mockClient);
    const second = await postJournalEntry(params, mockClient);

    expect(first.id).toBe(second.id);
  });

  it('MULTI-VENDOR: Payment splits across 3 sellers balance correctly', async () => {
    const entry = await postJournalEntry(
      {
        idempotencyKey: 'pi_test_multi_vendor_001',
        eventName: 'ORDER_PAID',
        currency: 'usd',
        lines: [
          { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 30000, direction: 'DEBIT' },
          { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 9000, direction: 'CREDIT' },
          { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 9000, direction: 'CREDIT' },
          { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 9000, direction: 'CREDIT' },
          { accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: 3000, direction: 'CREDIT' },
        ],
      },
      mockClient
    );

    expect(entry.status).toBe('POSTED');
    const lines = await mockClient.transactionLine.findMany({ where: { journalEntryId: entry.id } });
    expect(lines.length).toBe(5);

    const totalDR = lines.filter((l) => l.direction === 'DEBIT').reduce((s, l) => s + l.amount, 0);
    const totalCR = lines.filter((l) => l.direction === 'CREDIT').reduce((s, l) => s + l.amount, 0);
    expect(totalDR).toBe(30000);
    expect(totalCR).toBe(30000);
  });
});
