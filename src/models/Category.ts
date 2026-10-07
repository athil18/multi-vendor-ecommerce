/**
 * Category Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const Category = {
  create: async (data: Prisma.CategoryCreateInput) => wrapRecord(await prisma.category.create({ data })),
  deleteMany: (where: Prisma.CategoryWhereInput = {}) => prisma.category.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.CategoryWhereInput = {}) => wrapRecords(await prisma.category.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.CategoryWhereInput = {}) => wrapRecord(await prisma.category.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.category.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.CategoryUpdateInput) => wrapRecord(await prisma.category.update({ where: { id: toIdString(id) }, data })),
};
