/**
 * Prisma Catalog Repository Adapter
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 * @agent 04-sql-query-agent
 */

import { ICatalogRepository, RepoContext } from '@/core/ports/ICatalogRepository';
import prisma from '@/lib/prisma';
import { Prisma, OrderItemStatus } from '@prisma/client';

type TxOrPrisma = Prisma.TransactionClient | typeof prisma;

export class PrismaCatalogRepository implements ICatalogRepository {
  private getClient(ctx?: RepoContext): TxOrPrisma {
    return (ctx as { tx?: Prisma.TransactionClient })?.tx || prisma;
  }

  async findProductsByIds(ids: string[], ctx?: RepoContext) {
    const client = this.getClient(ctx);
    const products = await client.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    return products.map(p => ({ ...p, _id: p.id }));
  }

  async decrementVariantStock(variantId: string, productId: string, quantity: number, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    const variant = await client.variant.findFirst({
      where: { id: variantId, productId, stock: { gte: quantity }, isActive: true },
    });
    if (!variant) return null;

    const updated = await client.variant.update({
      where: { id: variantId },
      data: { stock: { decrement: quantity } },
    });
    return { ...updated, _id: updated.id };
  }

  async findCouponByCode(code: string, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    const coupon = await client.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) return null;
    return { ...coupon, _id: coupon.id };
  }

  async incrementCouponUsage(coupon: { id?: string; _id?: string }, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    const id = coupon._id || coupon.id;
    if (!id) return;
    await client.coupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }

  async saveOrderItems(items: Array<Record<string, unknown>>, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    await client.orderItem.createMany({
      data: items.map(item => ({
        orderId: String(item.orderId),
        productId: String(item.productId),
        variantId: item.variantId ? String(item.variantId) : null,
        sellerId: String(item.sellerId),
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
        status: (item.status as OrderItemStatus) || 'pending',
        platformFee: Number(item.platformFee ?? 0),
        sellerPayout: Number(item.sellerPayout ?? 0),
        discountApplied: Number(item.discountApplied ?? 0),
        taxAmount: Number(item.taxAmount ?? 0),
      })),
    });
  }

  async aggregateOrderItemCounts(orderIds: string[]): Promise<Map<string, number>> {
    const countMap = new Map<string, number>();
    if (orderIds.length === 0) return countMap;

    const items = await prisma.orderItem.groupBy({
      by: ['orderId'],
      where: { orderId: { in: orderIds } },
      _sum: { quantity: true },
    });

    items.forEach(item => {
      countMap.set(item.orderId, item._sum.quantity || 0);
    });

    return countMap;
  }

  async findOrderItemsByOrderId(orderId: string, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    const items = await client.orderItem.findMany({
      where: { orderId },
    });
    return items.map(i => ({ ...i, _id: i.id }));
  }

  async updateOrderItemsBulkStatus(orderId: string, status: string, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    await client.orderItem.updateMany({
      where: { orderId },
      data: { status: status as OrderItemStatus },
    });
  }

  async updateSingleOrderItemStatus(itemId: string, status: string, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    await client.orderItem.update({
      where: { id: itemId },
      data: { status: status as OrderItemStatus },
    });
  }

  async restockVariant(variantId: string, quantity: number, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    await client.variant.update({
      where: { id: variantId },
      data: { stock: { increment: quantity } },
    });
  }

  async updateStoreStripeStatus(stripeAccountId: string, payoutsEnabled: boolean, detailsSubmitted: boolean, ctx?: RepoContext) {
    const client = this.getClient(ctx);
    await client.store.updateMany({
      where: { stripeConnectedAccountId: stripeAccountId },
      data: {
        payoutsEnabled,
        stripeOnboardingComplete: detailsSubmitted,
      },
    });
  }
}
