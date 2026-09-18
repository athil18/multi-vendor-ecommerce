/**
 * Category Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords } from './prisma-wrap';

export const Category = {
  create: async (data: any) => wrapRecord(await prisma.category.create({ data })),
  deleteMany: (where: any = {}) => prisma.category.deleteMany({ where: where || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.category.findMany({ where: where || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.category.findFirst({ where: where || {} })),
  findById: async (id: string) => wrapRecord(await prisma.category.findUnique({ where: { id } })),
  findByIdAndUpdate: async (id: string, data: any) => wrapRecord(await prisma.category.update({ where: { id }, data })),
};
