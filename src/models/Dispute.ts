/**
 * Dispute Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent 13-customer-support-agent
 * @agent support-legal-compliance-checker
 */

import prisma from '@/lib/prisma';
import { Prisma, DisputeReason, DisputeStatus } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export interface DisputeCreateDTO {
  id?: string;
  _id?: string;
  orderId?: unknown;
  orderItemId?: unknown;
  buyerId?: unknown;
  customerId?: unknown;
  sellerId?: unknown;
  reason?: string;
  description?: string;
  status?: string;
  evidenceUrls?: string[];
  [key: string]: unknown;
}

export const Dispute = {
  create: async (data: DisputeCreateDTO) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;

    let reason: DisputeReason = 'other';
    if (data.reason === 'item_not_received') reason = 'item_not_received';
    else if (data.reason === 'item_damaged') reason = 'item_damaged';
    else if (data.reason === 'wrong_item') reason = 'wrong_item';

    let status: DisputeStatus = 'open';
    if (data.status === 'under_review') status = 'under_review';
    else if (data.status === 'resolved') status = 'resolved';
    else if (data.status === 'rejected') status = 'rejected';

    const orderIdObj = data.orderId as { _id?: unknown; id?: unknown } | undefined;
    const orderItemIdObj = data.orderItemId as { _id?: unknown; id?: unknown } | undefined;
    const buyerIdObj = data.buyerId as { _id?: unknown; id?: unknown } | undefined;
    const custIdObj = data.customerId as { _id?: unknown; id?: unknown } | undefined;
    const sellerIdObj = data.sellerId as { _id?: unknown; id?: unknown } | undefined;

    const formatted: Prisma.DisputeUncheckedCreateInput = {
      ...(id ? { id } : {}),
      orderId: toIdString(orderIdObj?._id || orderIdObj?.id || data.orderId) || '',
      orderItemId: toIdString(orderItemIdObj?._id || orderItemIdObj?.id || data.orderItemId) || '',
      buyerId: toIdString(buyerIdObj?._id || buyerIdObj?.id || custIdObj?._id || custIdObj?.id || data.buyerId || data.customerId) || '',
      sellerId: toIdString(sellerIdObj?._id || sellerIdObj?.id || data.sellerId) || '',
      reason,
      description: data.description || '',
      status,
      evidenceUrls: Array.isArray(data.evidenceUrls) ? data.evidenceUrls : [],
    };
    return wrapRecord(await prisma.dispute.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.DisputeWhereInput = {}) => prisma.dispute.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.DisputeWhereInput = {}) => wrapRecords(await prisma.dispute.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.DisputeWhereInput = {}) => wrapRecord(await prisma.dispute.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.dispute.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.DisputeUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.dispute.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
