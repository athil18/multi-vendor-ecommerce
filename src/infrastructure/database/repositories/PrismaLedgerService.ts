/**
 * Prisma Ledger Service Adapter
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-finops-engineer
 * @agent finance-financial-analyst
 */

import { ILedgerService, LineItemInput } from '@/core/ports/ILedgerService';
import { postJournalEntry } from '@/lib/ledger';
import { ITransactionContext } from '@/core/ports/ITransactionManager';

export class PrismaLedgerService implements ILedgerService {
  async postJournalEntry(data: { idempotencyKey: string; eventName: "ORDER_PAID" | "VENDOR_SETTLED" | "REFUND_ISSUED"; currency: string; orderId: any; lines: LineItemInput[] }, ctx?: ITransactionContext) {
    await postJournalEntry(data, ctx?.tx);
  }
}
