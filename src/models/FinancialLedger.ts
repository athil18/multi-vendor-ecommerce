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
import { Prisma } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export interface FinancialLedgerCreateDTO {
  id?: string;
  _id?: string;
  sellerId?: unknown;
  orderId?: unknown;
  amount?: number;
  type?: string;
  status?: string;
  currency?: string;
  description?: string;
  [key: string]: unknown;
}

export const FinancialLedger = {
  create: async (data: FinancialLedgerCreateDTO) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    const cleanData = { ...data };
    delete cleanData._id;
    if (id) cleanData.id = id;
    if (cleanData.sellerId) cleanData.sellerId = toIdString(cleanData.sellerId);
    if (cleanData.orderId) cleanData.orderId = toIdString(cleanData.orderId);
    return wrapRecord(await prisma.financialLedger.create({ data: cleanData as Prisma.FinancialLedgerUncheckedCreateInput }));
  },
  deleteMany: (where: Prisma.FinancialLedgerWhereInput = {}) => prisma.financialLedger.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.FinancialLedgerWhereInput = {}) => wrapRecords(await prisma.financialLedger.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.FinancialLedgerWhereInput = {}) => wrapRecord(await prisma.financialLedger.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.financialLedger.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.FinancialLedgerUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.financialLedger.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
