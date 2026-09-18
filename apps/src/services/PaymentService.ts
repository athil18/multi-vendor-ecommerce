/**
 * Stripe Payment & Webhook Domain Service
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-backend-architect
 * @agent finance-financial-analyst
 */

import { validatePaymentTransition } from '@/lib/order-status';
import { ACCOUNTS } from '@/lib/ledger';
import { logger } from '@/lib/logger';
import { AlertDispatcher } from '@/lib/alerting';
import Stripe from 'stripe';
import { ITransactionManager } from '@/core/ports/ITransactionManager';
import { IOrderRepository } from '@/core/ports/IOrderRepository';
import { ICatalogRepository } from '@/core/ports/ICatalogRepository';
import { ILedgerService, LineItemInput } from '@/core/ports/ILedgerService';

export class PaymentService {
  constructor(
    private readonly txManager: ITransactionManager,
    private readonly orderRepo: IOrderRepository,
    private readonly catalogRepo: ICatalogRepository,
    private readonly ledgerService: ILedgerService
  ) {}

  /**
   * Main webhook event router.
   */
  async handleWebhookEvent(event: Stripe.Event) {
    return this.txManager.executeInTransaction(async (txCtx) => {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, txCtx);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, txCtx);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, txCtx);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge, txCtx);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account, txCtx);
          break;

        default:
          logger.info(`Unhandled event type ${event.type}`);
      }
    });
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, txCtx: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) throw new Error('Missing orderId in metadata');

    const order = await this.orderRepo.findById(orderId, txCtx);
    if (!order) throw new Error(`Order not found: ${orderId}`);

    if (order.paymentStatus === 'completed') {
      logger.info(`Order ${orderId} is already marked as completed. Skipping.`);
      return;
    }

    validatePaymentTransition(order.paymentStatus, 'completed');

    await this.orderRepo.updateOrder(order.id, {
      paymentStatus: 'completed',
      aggregateStatus: 'processing',
      paidAt: new Date() as any,
      stripePaymentIntentId: paymentIntent.id
    }, txCtx);

    await this.catalogRepo.updateOrderItemsBulkStatus(order.id, 'processing', txCtx);

    await this.postPaymentLedgerEntry(order.id, `pi_${paymentIntent.id}_succeeded`, paymentIntent.currency || 'usd', txCtx);
    logger.info(`Payment successful for Order ${order.id}. Status set to completed.`);
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, txCtx: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) throw new Error('Missing orderId in metadata');

    AlertDispatcher.dispatch('high', 'Stripe Payment Failed', { orderId, paymentIntentId: paymentIntent.id });

    const order = await this.orderRepo.findById(orderId, txCtx);
    if (!order) throw new Error(`Order not found: ${orderId}`);

    if (order.paymentStatus === 'failed') return;

    validatePaymentTransition(order.paymentStatus, 'failed');

    await this.orderRepo.updateOrder(order.id, {
      paymentStatus: 'failed',
      aggregateStatus: 'cancelled'
    }, txCtx);

    await this.catalogRepo.updateOrderItemsBulkStatus(order.id, 'cancelled', txCtx);

    const items = await this.catalogRepo.findOrderItemsByOrderId(order.id, txCtx);
    for (const item of items) {
      if (item.variantId) {
        await this.catalogRepo.restockVariant(item.variantId, item.quantity, txCtx);
        logger.info(`Restocked variant ${item.variantId} with quantity ${item.quantity}`);
      }
    }
  }

  private async handleCheckoutSessionCompleted(checkoutSession: Stripe.Checkout.Session, txCtx: any) {
    const orderId = checkoutSession.metadata?.orderId;
    if (!orderId) throw new Error('Missing orderId in metadata');

    const order = await this.orderRepo.findById(orderId, txCtx);
    if (!order) throw new Error(`Order not found: ${orderId}`);

    if (order.paymentStatus === 'completed') return;

    validatePaymentTransition(order.paymentStatus, 'completed');

    const paymentIntentId = checkoutSession.payment_intent as string || checkoutSession.id;

    await this.orderRepo.updateOrder(order.id, {
      paymentStatus: 'completed',
      aggregateStatus: 'processing',
      paidAt: new Date() as any,
      stripePaymentIntentId: paymentIntentId
    }, txCtx);

    await this.catalogRepo.updateOrderItemsBulkStatus(order.id, 'processing', txCtx);

    await this.postPaymentLedgerEntry(order.id, `pi_${paymentIntentId}_succeeded`, checkoutSession.currency || 'usd', txCtx);
    logger.info(`Checkout session completed for Order ${orderId}`);
  }

  private async handleChargeRefunded(charge: Stripe.Charge, txCtx: any) {
    const orderId = charge.metadata?.orderId;
    let order;
    
    if (orderId) {
      order = await this.orderRepo.findById(orderId, txCtx);
    } else if (charge.payment_intent) {
      order = await this.orderRepo.findByPaymentIntentId(charge.payment_intent as string, txCtx);
    }

    if (!order) throw new Error('Order not found for charge.refunded event');
    if (order.paymentStatus === 'refunded') return;

    validatePaymentTransition(order.paymentStatus, 'refunded');

    await this.orderRepo.updateOrder(order.id, {
      paymentStatus: 'refunded',
      aggregateStatus: 'cancelled'
    }, txCtx);

    const items = await this.catalogRepo.findOrderItemsByOrderId(order.id, txCtx);
    let totalPayoutReversal = 0; let totalFeeReversal = 0; let totalTaxReversal = 0;
    const lines: LineItemInput[] = [];

    for (const item of items) {
      if (item.status !== 'cancelled') {
        await this.catalogRepo.updateSingleOrderItemStatus(item.id, 'cancelled', txCtx);
      }
      const payoutCents = Math.round(item.sellerPayout * 100);
      const feeCents = Math.round(item.platformFee * 100);
      const taxCents = Math.round(item.taxAmount * 100);
      
      totalPayoutReversal += payoutCents; totalFeeReversal += feeCents; totalTaxReversal += taxCents;
      if (payoutCents > 0) lines.push({ accountId: ACCOUNTS.VENDOR_ESCROW, amount: payoutCents, direction: 'DEBIT', entityId: item.sellerId });
    }

    if (totalFeeReversal > 0) lines.push({ accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: totalFeeReversal, direction: 'DEBIT' });
    if (totalTaxReversal > 0) lines.push({ accountId: ACCOUNTS.TAX_PAYABLE, amount: totalTaxReversal, direction: 'DEBIT' });

    const totalDebit = totalPayoutReversal + totalFeeReversal + totalTaxReversal;
    lines.push({ accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: totalDebit, direction: 'CREDIT' });

    await this.ledgerService.postJournalEntry({
      idempotencyKey: `re_${charge.id}_refunded`,
      eventName: 'REFUND_ISSUED',
      currency: charge.currency || 'usd',
      orderId: order.id,
      lines
    }, txCtx);
  }

  private async handleAccountUpdated(account: Stripe.Account, txCtx: any) {
    await this.catalogRepo.updateStoreStripeStatus(
      account.id,
      account.payouts_enabled || false,
      account.details_submitted || false,
      txCtx
    );
  }

  private async postPaymentLedgerEntry(orderId: string, idempotencyKey: string, currency: string, txCtx: any) {
    const items = await this.catalogRepo.findOrderItemsByOrderId(orderId, txCtx);
    let totalPayout = 0; let totalFee = 0; let totalTax = 0;
    const lines: LineItemInput[] = [];

    for (const item of items) {
      const payoutCents = Math.round(item.sellerPayout * 100);
      const feeCents = Math.round(item.platformFee * 100);
      const taxCents = Math.round(item.taxAmount * 100);
      totalPayout += payoutCents; totalFee += feeCents; totalTax += taxCents;

      if (payoutCents > 0) lines.push({ accountId: ACCOUNTS.VENDOR_ESCROW, amount: payoutCents, direction: 'CREDIT', entityId: item.sellerId });
    }
    
    if (totalFee > 0) lines.push({ accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: totalFee, direction: 'CREDIT' });
    if (totalTax > 0) lines.push({ accountId: ACCOUNTS.TAX_PAYABLE, amount: totalTax, direction: 'CREDIT' });
    
    const totalCredit = totalPayout + totalFee + totalTax;
    if (totalCredit > 0) lines.push({ accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: totalCredit, direction: 'DEBIT' });

    await this.ledgerService.postJournalEntry({
      idempotencyKey,
      eventName: 'ORDER_PAID',
      currency,
      orderId,
      lines
    }, txCtx);
  }
}
