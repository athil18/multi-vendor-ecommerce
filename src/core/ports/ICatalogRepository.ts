/**
 * Catalog Repository Port Interface
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

import { Product, Variant, Coupon, OrderItem, Prisma } from '@prisma/client';

export type RepoContext = { tx?: Prisma.TransactionClient } | unknown;

export interface ICatalogRepository {
  findProductsByIds(ids: string[], ctx?: RepoContext): Promise<(Product & { _id?: string })[]>;
  decrementVariantStock(variantId: string, productId: string, quantity: number, ctx?: RepoContext): Promise<(Variant & { _id?: string }) | null>;
  findCouponByCode(code: string, ctx?: RepoContext): Promise<(Coupon & { _id?: string }) | null>;
  incrementCouponUsage(coupon: { id?: string; _id?: string }, ctx?: RepoContext): Promise<void>;
  saveOrderItems(items: Array<Record<string, unknown>>, ctx?: RepoContext): Promise<void>;
  aggregateOrderItemCounts(orderIds: string[]): Promise<Map<string, number>>;
  
  // Payment Webhook Methods
  findOrderItemsByOrderId(orderId: string, ctx?: RepoContext): Promise<(OrderItem & { _id?: string })[]>;
  updateOrderItemsBulkStatus(orderId: string, status: string, ctx?: RepoContext): Promise<void>;
  updateSingleOrderItemStatus(itemId: string, status: string, ctx?: RepoContext): Promise<void>;
  restockVariant(variantId: string, quantity: number, ctx?: RepoContext): Promise<void>;
  updateStoreStripeStatus(stripeAccountId: string, payoutsEnabled: boolean, detailsSubmitted: boolean, ctx?: RepoContext): Promise<void>;
}
