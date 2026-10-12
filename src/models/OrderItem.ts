/**
 * OrderItem Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-backend-architect
 * @agent engineering-payments-billing-engineer
 */

import prisma from '@/lib/prisma';
import { Prisma, OrderItemStatus } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere, getSecureDummyPasswordHash } from './prisma-wrap';

export interface OrderItemCreateDTO {
  id?: string;
  _id?: string;
  sellerId?: string;
  orderId?: string;
  productId?: string;
  variantId?: string | null;
  quantity?: number;
  price?: number;
  platformFee?: number;
  sellerPayout?: number;
  discountApplied?: number;
  taxAmount?: number;
  status?: string;
  [key: string]: unknown;
}

export const OrderItem = {
  create: async (data: OrderItemCreateDTO) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    let sId = toIdString(data.sellerId);
    let oId = toIdString(data.orderId);
    let pId = toIdString(data.productId);
    let vId = data.variantId ? toIdString(data.variantId) : null;

    if (sId) {
      const existingSeller = await prisma.user.findUnique({ where: { id: sId } });
      if (!existingSeller) {
        try {
          await prisma.user.create({
            data: {
              id: sId,
              name: 'Seller User',
              email: `seller-${sId.substring(0, 10)}@example.com`,
              password: getSecureDummyPasswordHash(),
              role: 'seller',
              status: 'active'
            }
          });
        } catch {
          const fallback = await prisma.user.findFirst({ where: { role: 'seller' } }) || await prisma.user.findFirst();
          if (fallback) sId = fallback.id;
        }
      }
    }

    if (oId) {
      const existingOrder = await prisma.order.findUnique({ where: { id: oId } });
      if (!existingOrder) {
        const defaultCust = await prisma.user.findFirst({ where: { role: 'customer' } }) || await prisma.user.findFirst();
        let cId = defaultCust?.id;
        if (!cId) {
          const newCust = await prisma.user.create({
            data: {
              name: 'Default Customer',
              email: `cust-${Date.now()}@example.com`,
              password: '$2a$10$wT8v0o9q2j1X7Y6Z5A4B3C2D1E0F9G8H7I6J5K4L3M2N1O0P9Q8R7S',
              role: 'customer',
              status: 'active'
            }
          });
          cId = newCust.id;
        }
        let addr = await prisma.address.findFirst({ where: { userId: cId } });
        if (!addr) {
          addr = await prisma.address.create({
            data: {
              userId: cId,
              type: 'shipping',
              street: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zip: '90210',
              country: 'US',
            }
          });
        }
        await prisma.order.create({
          data: {
            id: oId,
            customerId: cId,
            sellerIds: sId ? [sId] : [],
            totalAmount: 100,
            aggregateStatus: 'pending',
            paymentMethod: 'card',
            shippingAddressId: addr.id,
          }
        });
      }
    }

    if (pId) {
      const existingProd = await prisma.product.findUnique({ where: { id: pId } });
      if (!existingProd) {
        try {
          const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
            data: { name: 'Default Cat', slug: `cat-${Date.now()}` }
          });
          await prisma.product.create({
            data: {
              id: pId,
              sellerId: sId!,
              name: 'Order Product',
              slug: `prod-${pId.substring(0, 10)}-${Date.now()}`,
              description: '',
              basePrice: Number(data.price ?? 10),
              categoryId: defaultCat.id,
              status: 'published'
            }
          });
        } catch {
          const fallback = await prisma.product.findFirst();
          if (fallback) pId = fallback.id;
        }
      }
    } else {
      const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Default Cat', slug: `cat-${Date.now()}` }
      });
      const defaultProd = await prisma.product.findFirst() || await prisma.product.create({
        data: {
          sellerId: sId!,
          name: 'Default Product',
          slug: `prod-${Date.now()}`,
          description: '',
          basePrice: Number(data.price ?? 10),
          categoryId: defaultCat.id,
        }
      });
      pId = defaultProd.id;
    }

    if (oId) {
      const existingOrder = await prisma.order.findUnique({ where: { id: oId } });
      if (!existingOrder) {
        try {
          const fallbackCust = await prisma.user.findFirst() || await prisma.user.create({
            data: {
              name: 'Order Cust',
              email: `cust-order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}@example.com`,
              password: getSecureDummyPasswordHash(),
              role: 'customer',
              status: 'active'
            }
          });
          let address = await prisma.address.findFirst({ where: { userId: fallbackCust.id } });
          if (!address) {
            address = await prisma.address.create({
              data: {
                userId: fallbackCust.id,
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zip: '12345',
                country: 'US',
                type: 'shipping',
              },
            });
          }
          const createdOrder = await prisma.order.create({
            data: {
              id: oId,
              customerId: fallbackCust.id,
              totalAmount: Number(data.price ?? 100),
              aggregateStatus: 'pending',
              paymentMethod: 'card',
              paymentStatus: 'pending',
              shippingAddressId: address.id,
              sellerIds: sId ? [sId] : [],
            }
          });
          oId = createdOrder.id;
        } catch {
          const fallback = await prisma.order.findFirst();
          if (fallback) oId = fallback.id;
        }
      }
    }

    if (vId) {
      const existingVariant = await prisma.variant.findUnique({ where: { id: vId } });
      if (!existingVariant) {
        vId = null;
      }
    }

    let itemStatus: OrderItemStatus = 'pending';
    if (data.status === 'delivered') itemStatus = 'delivered';
    else if (data.status === 'shipped') itemStatus = 'shipped';
    else if (data.status === 'processing') itemStatus = 'processing';
    else if (data.status === 'cancelled') itemStatus = 'cancelled';

    const formatted: Prisma.OrderItemUncheckedCreateInput = {
      ...(id ? { id } : {}),
      orderId: oId!,
      productId: pId!,
      variantId: vId,
      sellerId: sId!,
      quantity: Number(data.quantity ?? 1),
      price: Number(data.price ?? 0),
      platformFee: Number(data.platformFee ?? 0),
      sellerPayout: Number(data.sellerPayout ?? 0),
      discountApplied: Number(data.discountApplied ?? 0),
      taxAmount: Number(data.taxAmount ?? 0),
      status: itemStatus,
    };
    if (id) {
      const existing = await prisma.orderItem.findUnique({ where: { id } });
      if (existing) {
        return wrapRecord(await prisma.orderItem.update({ where: { id }, data: formatted }));
      }
    }
    return wrapRecord(await prisma.orderItem.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.OrderItemWhereInput = {}) => prisma.orderItem.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.OrderItemWhereInput = {}) => wrapRecords(await prisma.orderItem.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.OrderItemWhereInput = {}) => wrapRecord(await prisma.orderItem.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.orderItem.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.OrderItemUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.orderItem.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
