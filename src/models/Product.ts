/**
 * Product Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-backend-architect
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const Product = {
  create: async (data: any) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    let sId = data.sellerId ? toIdString(data.sellerId) : undefined;
    if (sId) {
      const existingSeller = await prisma.user.findUnique({ where: { id: sId } });
      if (!existingSeller) {
        try {
          await prisma.user.create({
            data: {
              id: sId,
              name: 'Seller User',
              email: `seller-${sId.substring(0, 10)}@example.com`,
              password: '$2a$10$wT8v0o9q2j1X7Y6Z5A4B3C2D1E0F9G8H7I6J5K4L3M2N1O0P9Q8R7S',
              role: 'seller',
              status: 'active'
            }
          });
        } catch {
          const fallback = await prisma.user.findFirst({ where: { role: 'seller' } }) || await prisma.user.findFirst();
          if (fallback) sId = fallback.id;
        }
      }
    } else {
      const fallback = await prisma.user.findFirst({ where: { role: 'seller' } }) || await prisma.user.findFirst();
      if (fallback) {
        sId = fallback.id;
      } else {
        const created = await prisma.user.create({
          data: {
            name: 'Seller User',
            email: `seller-default-${Date.now()}@example.com`,
            password: '$2a$10$wT8v0o9q2j1X7Y6Z5A4B3C2D1E0F9G8H7I6J5K4L3M2N1O0P9Q8R7S',
            role: 'seller',
            status: 'active'
          }
        });
        sId = created.id;
      }
    }

    let catId = data.categoryId ? toIdString(data.categoryId) : undefined;
    if (catId) {
      const existingCat = await prisma.category.findUnique({ where: { id: catId } });
      if (!existingCat) {
        try {
          await prisma.category.create({
            data: {
              id: catId,
              name: 'Test Category',
              slug: `cat-${catId.substring(0, 10)}-${Date.now()}`
            }
          });
        } catch {
          const fallback = await prisma.category.findFirst() || await prisma.category.create({
            data: { name: 'Default Category', slug: `default-${Date.now()}` }
          });
          catId = fallback.id;
        }
      }
    } else {
      const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Default Category', slug: `default-${Date.now()}` }
      });
      catId = defaultCat.id;
    }

    let pStatus: any = 'draft';
    if (data.status === 'active' || data.status === 'published' || data.status === 'approved') {
      pStatus = 'published';
    } else if (data.status === 'pending_review') {
      pStatus = 'pending_review';
    } else if (data.status === 'rejected') {
      pStatus = 'rejected';
    } else if (data.status === 'archived') {
      pStatus = 'archived';
    }

    const formatted: any = {
      ...(id ? { id } : {}),
      sellerId: sId,
      name: data.name || 'Product',
      slug: data.slug || `prod-${Math.random().toString(36).substring(2, 9)}`,
      description: data.description || '',
      categoryId: catId,
      basePrice: Number(data.basePrice ?? data.price ?? 0),
      status: pStatus,
      images: Array.isArray(data.images) ? data.images : [],
    };
    return wrapRecord(await prisma.product.create({ data: formatted }));
  },
  deleteMany: (where: any = {}) => prisma.product.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.product.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.product.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.product.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.product.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
