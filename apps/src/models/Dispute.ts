/**
 * Dispute Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent 13-customer-support-agent
 * @agent support-legal-compliance-checker
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const Dispute = {
  create: async (data: any) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;

    let reason: any = 'other';
    if (data.reason === 'item_not_received') reason = 'item_not_received';
    else if (data.reason === 'item_damaged') reason = 'item_damaged';
    else if (data.reason === 'wrong_item') reason = 'wrong_item';

    let status: any = 'open';
    if (data.status === 'under_review') status = 'under_review';
    else if (data.status === 'resolved') status = 'resolved';
    else if (data.status === 'rejected') status = 'rejected';

    const formatted: any = {
      ...(id ? { id } : {}),
      orderId: toIdString(data.orderId?._id || data.orderId?.id || data.orderId),
      orderItemId: toIdString(data.orderItemId?._id || data.orderItemId?.id || data.orderItemId),
      buyerId: toIdString(data.buyerId?._id || data.buyerId?.id || data.customerId?._id || data.customerId?.id || data.buyerId || data.customerId),
      sellerId: toIdString(data.sellerId?._id || data.sellerId?.id || data.sellerId),
      reason,
      description: data.description || '',
      status,
      evidenceUrls: Array.isArray(data.evidenceUrls) ? data.evidenceUrls : [],
    };
    return wrapRecord(await prisma.dispute.create({ data: formatted }));
  },
  deleteMany: (where: any = {}) => prisma.dispute.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.dispute.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.dispute.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.dispute.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.dispute.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
