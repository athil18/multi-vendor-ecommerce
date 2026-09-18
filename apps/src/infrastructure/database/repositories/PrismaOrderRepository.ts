/**
 * Prisma Order Repository Adapter
 * 
 * @agent engineering-backend-architect
 * @agent engineering-payments-billing-engineer
 * @agent 04-sql-query-agent
 */

import { IOrderRepository, OrderData } from '@/core/ports/IOrderRepository';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

type TxOrPrisma = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0] | typeof prisma;

export class PrismaOrderRepository implements IOrderRepository {
  private getClient(ctx?: any): TxOrPrisma {
    return ctx?.tx || prisma;
  }

  async findById(id: string, ctx?: any) {
    const client = this.getClient(ctx);
    const order = await (client as any).order.findUnique({
      where: { id },
      include: {
        shippingAddress: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    if (!order) return null;
    return { ...order, _id: order.id };
  }

  async findByPaymentIntentId(intentId: string, ctx?: any) {
    const client = this.getClient(ctx);
    const order = await (client as any).order.findFirst({
      where: { stripePaymentIntentId: intentId },
      include: {
        shippingAddress: true,
        items: true,
      },
    });
    if (!order) return null;
    return { ...order, _id: order.id };
  }

  async saveOrder(data: OrderData, ctx?: any) {
    const client = this.getClient(ctx);
    const order = await (client as any).order.create({
      data: {
        customerId: data.customerId,
        sellerIds: data.sellerIds,
        shippingAddressId: data.shippingAddress,
        paymentMethod: data.paymentMethod as any,
        totalAmount: data.totalAmount,
        aggregateStatus: (data.aggregateStatus || 'pending') as any,
        couponId: data.couponId ? data.couponId.toString() : null,
      },
    });
    return { ...order, _id: order.id };
  }

  async updateOrder(orderId: string, data: Partial<OrderData>, ctx?: any) {
    const client = this.getClient(ctx);
    const updateData: any = {};
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
    if (data.aggregateStatus) updateData.aggregateStatus = data.aggregateStatus;
    if (data.paidAt) updateData.paidAt = data.paidAt;
    if (data.stripePaymentIntentId) updateData.stripePaymentIntentId = data.stripePaymentIntentId;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;

    const order = await (client as any).order.update({
      where: { id: orderId },
      data: updateData,
    });
    return { ...order, _id: order.id };
  }

  async countByCustomer(customerId: string, filters: { status?: string; search?: string }) {
    const where: any = { customerId, deletedAt: null };
    if (filters.status && filters.status !== 'all') {
      where.aggregateStatus = filters.status;
    }
    if (filters.search && filters.search.trim()) {
      where.id = { contains: filters.search.trim() };
    }
    return prisma.order.count({ where });
  }

  async findByCustomer(customerId: string, filters: { status?: string; search?: string }, pagination: { skip: number; limit: number }) {
    const where: any = { customerId, deletedAt: null };
    if (filters.status && filters.status !== 'all') {
      where.aggregateStatus = filters.status;
    }
    if (filters.search && filters.search.trim()) {
      where.id = { contains: filters.search.trim() };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        shippingAddress: true,
      },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o: any) => ({ ...o, _id: o.id }));
  }
}
