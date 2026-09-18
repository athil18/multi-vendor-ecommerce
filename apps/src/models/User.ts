/**
 * User Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-identity-access-engineer
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const User = {
  create: async (data: any) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    const formatted: any = {
      ...(id ? { id } : {}),
      name: data.name || 'User',
      email: data.email,
      password: data.password || '$2a$10$wT8v0o9q2j1X7Y6Z5A4B3C2D1E0F9G8H7I6J5K4L3M2N1O0P9Q8R7S', // Bcrypt dummy for test mocks
      role: data.role || 'customer',
      status: data.status || 'active',
    };
    if (data.avatar !== undefined) formatted.avatar = data.avatar;
    if (data.stripeCustomerId !== undefined) formatted.stripeCustomerId = data.stripeCustomerId;
    return wrapRecord(await prisma.user.create({ data: formatted }));
  },
  deleteMany: (where: any = {}) => prisma.user.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.user.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.user.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.user.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.user.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
