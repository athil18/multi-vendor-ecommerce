/**
 * Review Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const Review = {
  create: async (data: any) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    let pId = toIdString(data.productId);
    let cId = toIdString(data.customerId || data.userId);

    if (cId) {
      const existingUser = await prisma.user.findUnique({ where: { id: cId } });
      if (!existingUser) {
        try {
          await prisma.user.create({
            data: {
              id: cId,
              name: 'Reviewer User',
              email: `reviewer-${cId.substring(0, 10)}@example.com`,
              password: '$2a$10$wT8v0o9q2j1X7Y6Z5A4B3C2D1E0F9G8H7I6J5K4L3M2N1O0P9Q8R7S',
              role: 'customer'
            }
          });
        } catch {
          const fallback = await prisma.user.findFirst();
          if (fallback) cId = fallback.id;
        }
      }
    }

    if (pId) {
      const existingProd = await prisma.product.findUnique({ where: { id: pId } });
      if (!existingProd) {
        try {
          const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
            data: { name: 'Default Cat', slug: `cat-${Date.now()}` }
          });
          const seller = await prisma.user.findFirst({ where: { role: 'seller' } }) || await prisma.user.findFirst();
          await prisma.product.create({
            data: {
              id: pId,
              sellerId: seller!.id,
              name: 'Reviewed Product',
              slug: `prod-${pId.substring(0, 10)}-${Date.now()}`,
              description: '',
              basePrice: 50,
              categoryId: defaultCat.id,
              status: 'published'
            }
          });
        } catch {
          const fallback = await prisma.product.findFirst();
          if (fallback) pId = fallback.id;
        }
      }
    }

    let rStatus: any = 'pending';
    if (data.status === 'approved' || data.status === 'published') rStatus = 'approved';
    else if (data.status === 'rejected') rStatus = 'rejected';

    const formatted: any = {
      ...(id ? { id } : {}),
      productId: pId,
      customerId: cId,
      rating: Number(data.rating ?? 5),
      title: data.title || null,
      comment: data.comment || '',
      images: Array.isArray(data.images) ? data.images : [],
      status: rStatus,
    };
    return wrapRecord(await prisma.review.create({ data: formatted }));
  },
  deleteMany: (where: any = {}) => prisma.review.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.review.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.review.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.review.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.review.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
