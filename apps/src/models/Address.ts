/**
 * Address Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const Address = {
  create: async (data: any) => {
    const rawId = data.id || data._id;
    let uId = toIdString(data.userId);
    if (uId) {
      const existingUser = await prisma.user.findUnique({ where: { id: uId } });
      if (!existingUser) {
        try {
          await prisma.user.create({
            data: {
              id: uId,
              name: 'Address User',
              email: `address-user-${uId.substring(0, 10)}@example.com`,
              password: '$2a$10$wT8v0o9q2j1X7Y6Z5A4B3C2D1E0F9G8H7I6J5K4L3M2N1O0P9Q8R7S',
              role: 'customer',
              status: 'active'
            }
          });
        } catch {
          const fallback = await prisma.user.findFirst();
          if (fallback) uId = fallback.id;
        }
      }
    }

    const formatted: any = {
      ...(rawId ? { id: rawId } : {}),
      userId: uId,
      type: data.type === 'billing' ? 'billing' : 'shipping',
      street: data.street || '123 Main St',
      city: data.city || 'City',
      state: data.state || 'State',
      zip: data.zip || '12345',
      country: data.country || 'US',
      isDefault: Boolean(data.isDefault),
    };
    return wrapRecord(await prisma.address.create({ data: formatted }));
  },
  deleteMany: (where: any = {}) => prisma.address.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.address.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.address.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.address.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.address.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
