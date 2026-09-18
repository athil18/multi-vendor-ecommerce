/**
 * Ledger Service Port Interface
 * 
 * @agent engineering-payments-billing-engineer
 * @agent finance-financial-analyst
 * @agent finance-bookkeeper-controller
 */

import { ITransactionContext } from '@/core/ports/ITransactionManager';

export interface LineItemInput {
  accountId: string;
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  entityId?: string;
}

export interface ILedgerService {
  postJournalEntry(data: {
    idempotencyKey: string;
    eventName: "ORDER_PAID" | "VENDOR_SETTLED" | "REFUND_ISSUED";
    currency: string;
    orderId: any;
    lines: LineItemInput[];
  }, ctx?: ITransactionContext): Promise<void>;
}
