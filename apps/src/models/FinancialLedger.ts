/**
 * FinancialLedger Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-payments-billing-engineer
 * @agent finance-financial-analyst
 * @agent finance-bookkeeper-controller
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const FinancialLedger = {
  create: async (data: any) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    const cleanData = { ...data };
    delete cleanData._id;
    if (id) cleanData.id = id;
    if (cleanData.sellerId) cleanData.sellerId = toIdString(cleanData.sellerId);
    if (cleanData.orderId) cleanData.orderId = toIdString(cleanData.orderId);
    return wrapRecord(await prisma.financialLedger.create({ data: cleanData }));
  },
  deleteMany: (where: any = {}) => prisma.financialLedger.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.financialLedger.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.financialLedger.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.financialLedger.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.financialLedger.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
