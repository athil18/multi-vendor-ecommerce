import { describe, it, expect, beforeEach } from 'vitest';
import { postJournalEntry, ACCOUNTS } from '@/lib/ledger';

describe('Refund & Escrow Integrity Validation (@agent engineering-payments-billing-engineer)', () => {
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

  it('should successfully post a balanced refund reversal entry', async () => {
    const entry = await postJournalEntry(
      {
        idempotencyKey: 're_test_refund_123',
        eventName: 'REFUND_ISSUED',
        currency: 'usd',
        lines: [
          { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 8000, direction: 'DEBIT' as const, entityId: 'seller_123' },
          { accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: 1000, direction: 'DEBIT' as const },
          { accountId: ACCOUNTS.TAX_PAYABLE, amount: 1000, direction: 'DEBIT' as const },
          { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'CREDIT' as const },
        ],
      },
      mockClient
    );

    expect(entry).toBeDefined();
    expect(entry.status).toBe('POSTED');

    const lines = await mockClient.transactionLine.findMany({ where: { journalEntryId: entry.id } });
    expect(lines.length).toBe(4);

    const debits = lines.filter((l) => l.direction === 'DEBIT').reduce((acc, l) => acc + l.amount, 0);
    const credits = lines.filter((l) => l.direction === 'CREDIT').reduce((acc, l) => acc + l.amount, 0);

    expect(debits).toBe(10000);
    expect(credits).toBe(10000);
  });

  it('should throw an error on unbalanced refund payload', async () => {
    await expect(
      postJournalEntry(
        {
          idempotencyKey: 're_test_imbalance_789',
          eventName: 'REFUND_ISSUED',
          currency: 'usd',
          lines: [
            { accountId: ACCOUNTS.VENDOR_ESCROW, amount: 8000, direction: 'DEBIT' as const },
            { accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: 1000, direction: 'DEBIT' as const },
            { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 10000, direction: 'CREDIT' as const },
          ],
        },
        mockClient
      )
    ).rejects.toThrow(/Ledger Imbalance/);
  });
});
