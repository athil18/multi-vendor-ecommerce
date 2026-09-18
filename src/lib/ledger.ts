/**
 * Double-Entry Financial Accounting & Escrow Ledger
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-finops-engineer
 * @agent finance-financial-analyst
 */

import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { JournalEventName, TransactionDirection } from '@prisma/client';

export interface LineItemInput {
  accountId: string;
  amount: number;
  direction: 'DEBIT' | 'CREDIT' | TransactionDirection;
  entityId?: string;
}

export const ACCOUNTS = {
  STRIPE_CASH_IN_TRANSIT: '1000',
  STRIPE_CASH_SETTLED: '1100',
  VENDOR_ESCROW: '2000',
  TAX_PAYABLE: '2100',
  PLATFORM_COMMISSION: '4000',
  STRIPE_FEES: '5000',
};

export async function postJournalEntry(
  params: {
    idempotencyKey: string;
    eventName: 'ORDER_PAID' | 'VENDOR_SETTLED' | 'REFUND_ISSUED' | JournalEventName;
    currency: string;
    orderId?: string;
    lines: LineItemInput[];
  },
  tx?: any
) {
  const client = tx || prisma;

  // Validate invariant: Sum of Debits == Sum of Credits
  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of params.lines) {
    if (line.amount < 0) throw new AppError('Line amounts must be strictly positive', 400);
    if (line.direction === 'DEBIT') totalDebit += line.amount;
    else totalCredit += line.amount;
  }

  // Use Math.round to handle floating point errors in cents
  if (Math.round(totalDebit) !== Math.round(totalCredit)) {
    throw new AppError(`Ledger Imbalance: Debits (${Math.round(totalDebit)}) do not equal Credits (${Math.round(totalCredit)})`, 400);
  }

  // Check Idempotency
  const existing = await client.journalEntry.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
    include: { lines: true },
  });
  if (existing) {
    return { ...existing, _id: existing.id }; // idempotent success
  }

  // Create Journal Entry with nested Lines in atomic transaction
  const je = await client.journalEntry.create({
    data: {
      idempotencyKey: params.idempotencyKey,
      eventName: params.eventName as JournalEventName,
      currency: params.currency || 'usd',
      status: 'POSTED',
      orderId: params.orderId ? params.orderId.toString() : null,
      lines: {
        create: params.lines.map(l => ({
          accountId: l.accountId,
          amount: Math.round(l.amount), // Ensure integer cents
          direction: l.direction as TransactionDirection,
          entityId: l.entityId ? l.entityId.toString() : null,
        })),
      },
    },
    include: { lines: true },
  });

  return { ...je, _id: je.id };
}
