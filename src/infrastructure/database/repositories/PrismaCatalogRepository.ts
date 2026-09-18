/**
 * Prisma Catalog Repository Adapter
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 * @agent 04-sql-query-agent
 */

import { ICatalogRepository } from '@/core/ports/ICatalogRepository';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

type TxOrPrisma = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0] | typeof prisma;

export class PrismaCatalogRepository implements ICatalogRepository {
  private getClient(ctx?: any): TxOrPrisma {
    return ctx?.tx || prisma;
  }

  async findProductsByIds(ids: string[], ctx?: any) {
    const client = this.getClient(ctx);
    const products = await (client as any).product.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    return products.map((p: any) => ({ ...p, _id: p.id }));
  }

  async decrementVariantStock(variantId: string, productId: string, quantity: number, ctx?: any) {
    const client = this.getClient(ctx);
    const variant = await (client as any).variant.findFirst({
      where: { id: variantId, productId, stock: { gte: quantity }, isActive: true },
    });
    if (!variant) return null;

    const updated = await (client as any).variant.update({
      where: { id: variantId },
      data: { stock: { decrement: quantity } },
    });
    return { ...updated, _id: updated.id };
  }

  async findCouponByCode(code: string, ctx?: any) {
    const client = this.getClient(ctx);
    const coupon = await (client as any).coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) return null;
    return { ...coupon, _id: coupon.id };
  }

  async incrementCouponUsage(coupon: any, ctx?: any) {
    const client = this.getClient(ctx);
    const id = coupon._id || coupon.id;
    await (client as any).coupon.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }

  async saveOrderItems(items: any[], ctx?: any) {
    const client = this.getClient(ctx);
    await (client as any).orderItem.createMany({
      data: items.map(item => ({
        orderId: item.orderId.toString(),
        productId: item.productId.toString(),
        variantId: item.variantId ? item.variantId.toString() : null,
        sellerId: item.sellerId.toString(),
        quantity: item.quantity,
        price: item.price,
        status: item.status || 'pending',
        platformFee: item.platformFee || 0,
        sellerPayout: item.sellerPayout || 0,
        discountApplied: item.discountApplied || 0,
        taxAmount: item.taxAmount || 0,
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

    items.forEach((item: any) => {
      countMap.set(item.orderId, item._sum.quantity || 0);
    });

    return countMap;
  }

  async findOrderItemsByOrderId(orderId: string, ctx?: any) {
    const client = this.getClient(ctx);
    const items = await (client as any).orderItem.findMany({
      where: { orderId },
    });
    return items.map((i: any) => ({ ...i, _id: i.id }));
  }

  async updateOrderItemsBulkStatus(orderId: string, status: string, ctx?: any) {
    const client = this.getClient(ctx);
    await (client as any).orderItem.updateMany({
      where: { orderId },
      data: { status: status as any },
    });
  }

  async updateSingleOrderItemStatus(itemId: string, status: string, ctx?: any) {
    const client = this.getClient(ctx);
    await (client as any).orderItem.update({
      where: { id: itemId },
      data: { status: status as any },
    });
  }

  async restockVariant(variantId: string, quantity: number, ctx?: any) {
    const client = this.getClient(ctx);
    await (client as any).variant.update({
      where: { id: variantId },
      data: { stock: { increment: quantity } },
    });
  }

  async updateStoreStripeStatus(stripeAccountId: string, payoutsEnabled: boolean, detailsSubmitted: boolean, ctx?: any) {
    const client = this.getClient(ctx);
    await (client as any).store.updateMany({
      where: { stripeConnectedAccountId: stripeAccountId },
      data: {
        payoutsEnabled,
        stripeOnboardingComplete: detailsSubmitted,
      },
    });
  }
}
