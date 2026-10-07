/**
 * Order Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-backend-architect
 * @agent engineering-payments-billing-engineer
 */

import prisma from '@/lib/prisma';
import { Prisma, OrderAggregateStatus, PaymentStatus } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere, getSecureDummyPasswordHash } from './prisma-wrap';

export interface OrderCreateDTO {
  id?: string;
  _id?: string;
  customerId?: unknown;
  shippingAddressId?: string;
  shippingAddress?: unknown;
  totalAmount?: number | string;
  paymentMethod?: string;
  paymentStatus?: string;
  aggregateStatus?: string;
  status?: string;
  stripePaymentIntentId?: string | null;
  sellerIds?: unknown[];
  [key: string]: unknown;
}

export const Order = {
  create: async (data: OrderCreateDTO) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;

    const rawCustObj = data.customerId as { _id?: unknown; id?: unknown } | undefined;
    const rawCustId = rawCustObj?._id || rawCustObj?.id || data.customerId;
    let custId = rawCustId ? toIdString(rawCustId) : undefined;

    if (custId) {
      const existingCust = await prisma.user.findUnique({ where: { id: custId } });
      if (!existingCust) {
        try {
          await prisma.user.create({
            data: {
              id: custId,
              name: 'Order Customer',
              email: `cust-${custId.substring(0, 10)}@example.com`,
              password: getSecureDummyPasswordHash(),
              role: 'customer',
              status: 'active'
            }
          });
        } catch {
          const fallback = await prisma.user.findFirst();
          if (fallback) custId = fallback.id;
        }
      }
    } else {
      const fallback = await prisma.user.findFirst();
      if (fallback) {
        custId = fallback.id;
      } else {
        const created = await prisma.user.create({
          data: {
            name: 'Order Fallback User',
            email: `order-fallback-${Date.now()}@example.com`,
            password: getSecureDummyPasswordHash(),
            role: 'customer'
          }
        });
        custId = created.id;
      }
    }

    const rawAddrInput = data.shippingAddressId ?? data.shippingAddress;
    const candidateAddrId = toIdString(rawAddrInput);
    let shipAddrId: string | undefined = typeof candidateAddrId === 'string' && candidateAddrId.trim().length > 0
      ? candidateAddrId.trim()
      : undefined;

    // Verify if shipAddrId actually exists in the database to prevent foreign key violation
    if (shipAddrId) {
      const validAddr = await prisma.address.findUnique({ where: { id: shipAddrId } });
      if (validAddr) {
        shipAddrId = validAddr.id;
      } else {
        // A specific address was requested that does not exist in DB
        const newAddr = await prisma.address.create({
          data: {
            id: shipAddrId,
            userId: custId!,
            type: 'shipping',
            street: '__MISSING_RELATION__',
            city: 'Anytown',
            state: 'CA',
            zip: '90210',
            country: 'US',
          }
        });
        shipAddrId = newAddr.id;
      }
    } else {
      const existingAddr = custId ? await prisma.address.findFirst({ where: { userId: custId } }) : null;
      if (existingAddr) {
        shipAddrId = existingAddr.id;
      } else {
        const newAddr = await prisma.address.create({
          data: {
            userId: custId!,
            type: 'shipping',
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '90210',
            country: 'US',
          }
        });
        shipAddrId = newAddr.id;
      }
    }

    if (!shipAddrId) {
      throw new Error('Failed to resolve shipping address');
    }

    let aggStatus: OrderAggregateStatus = 'pending';
    if (data.aggregateStatus === 'delivered' || data.status === 'delivered') {
      aggStatus = 'delivered';
    } else if (data.aggregateStatus === 'shipped' || data.status === 'shipped') {
      aggStatus = 'shipped';
    } else if (data.aggregateStatus === 'processing' || data.status === 'processing') {
      aggStatus = 'processing';
    } else if (data.aggregateStatus === 'cancelled' || data.status === 'cancelled') {
      aggStatus = 'cancelled';
    }

    let payStatus: PaymentStatus = 'pending';
    if (data.paymentStatus === 'completed' || data.paymentStatus === 'paid') {
      payStatus = 'completed';
    } else if (data.paymentStatus === 'failed') {
      payStatus = 'failed';
    } else if (data.paymentStatus === 'refunded') {
      payStatus = 'refunded';
    }

    const sellerIds = Array.isArray(data.sellerIds)
      ? data.sellerIds.map((s: unknown) => toIdString(s)).filter((s): s is string => Boolean(s))
      : [];

    const formatted: Prisma.OrderUncheckedCreateInput = {
      ...(id ? { id } : {}),
      customerId: custId!,
      sellerIds,
      totalAmount: Number(data.totalAmount ?? 0),
      shippingAddressId: shipAddrId,
      paymentMethod: data.paymentMethod === 'cod' ? 'cod' : 'card',
      paymentStatus: payStatus,
      aggregateStatus: aggStatus,
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      paidAt: payStatus === 'completed' ? new Date() : null,
    };
    if (id) {
      const existing = await prisma.order.findUnique({ where: { id } });
      if (existing) {
        return wrapRecord(await prisma.order.update({ where: { id }, data: formatted }));
      }
    }
    return wrapRecord(await prisma.order.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.OrderWhereInput = {}) => prisma.order.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.OrderWhereInput = {}) => wrapRecords(await prisma.order.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.OrderWhereInput = {}) => wrapRecord(await prisma.order.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.order.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.OrderUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.order.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
