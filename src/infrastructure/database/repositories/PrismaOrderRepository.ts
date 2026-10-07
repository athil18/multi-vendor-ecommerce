/**
 * Prisma Order Repository Adapter
 * 
 * @agent engineering-backend-architect
 * @agent engineering-payments-billing-engineer
 * @agent 04-sql-query-agent
 */

import { IOrderRepository, OrderData, OrderRepoContext } from '@/core/ports/IOrderRepository';
import prisma from '@/lib/prisma';
import { Prisma, PaymentMethod, OrderAggregateStatus, PaymentStatus } from '@prisma/client';

type TxOrPrisma = Prisma.TransactionClient | typeof prisma;

export class PrismaOrderRepository implements IOrderRepository {
  private getClient(ctx?: OrderRepoContext): TxOrPrisma {
    return (ctx as { tx?: Prisma.TransactionClient })?.tx || prisma;
  }

  async findById(id: string, ctx?: OrderRepoContext) {
    const client = this.getClient(ctx);
    const order = await client.order.findUnique({
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

  async findByPaymentIntentId(intentId: string, ctx?: OrderRepoContext) {
    const client = this.getClient(ctx);
    const order = await client.order.findFirst({
      where: { stripePaymentIntentId: intentId },
      include: {
        shippingAddress: true,
        items: true,
      },
    });
    if (!order) return null;
    return { ...order, _id: order.id };
  }

  async saveOrder(data: OrderData, ctx?: OrderRepoContext) {
    const client = this.getClient(ctx);
    const order = await client.order.create({
      data: {
        customerId: data.customerId,
        sellerIds: data.sellerIds,
        shippingAddressId: data.shippingAddress,
        paymentMethod: (data.paymentMethod as PaymentMethod) || 'card',
        totalAmount: data.totalAmount,
        aggregateStatus: (data.aggregateStatus as OrderAggregateStatus) || 'pending',
        couponId: data.couponId ? String(data.couponId) : null,
      },
    });
    return { ...order, _id: order.id };
  }

  async updateOrder(orderId: string, data: Partial<OrderData>, ctx?: OrderRepoContext) {
    const client = this.getClient(ctx);
    const updateData: Prisma.OrderUpdateInput = {};
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus as PaymentStatus;
    if (data.aggregateStatus) updateData.aggregateStatus = data.aggregateStatus as OrderAggregateStatus;
    if (data.paidAt) updateData.paidAt = data.paidAt;
    if (data.stripePaymentIntentId) updateData.stripePaymentIntentId = data.stripePaymentIntentId;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;

    const order = await client.order.update({
      where: { id: orderId },
      data: updateData,
    });
    return { ...order, _id: order.id };
  }

  async countByCustomer(customerId: string, filters: { status?: string; search?: string }) {
    const where: Prisma.OrderWhereInput = { customerId, deletedAt: null };
    if (filters.status && filters.status !== 'all') {
      where.aggregateStatus = filters.status as OrderAggregateStatus;
    }
    if (filters.search && filters.search.trim()) {
      where.id = { contains: filters.search.trim() };
    }
    return prisma.order.count({ where });
  }

  async findByCustomer(customerId: string, filters: { status?: string; search?: string }, pagination: { skip: number; limit: number }) {
    const where: Prisma.OrderWhereInput = { customerId, deletedAt: null };
    if (filters.status && filters.status !== 'all') {
      where.aggregateStatus = filters.status as OrderAggregateStatus;
    }
    if (filters.search && filters.search.trim()) {
      where.id = { contains: filters.search.trim() };
    }
    const orders = await prisma.order.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                attributes: true,
              },
            },
          },
        },
      },
    });
    return orders.map(o => ({ ...o, _id: o.id }));
  }
}
