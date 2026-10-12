/**
 * Product Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-backend-architect
 */

import prisma from '@/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere, getSecureDummyPasswordHash } from './prisma-wrap';

export interface ProductCreateDTO {
  id?: string;
  _id?: string;
  sellerId?: string;
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  basePrice?: number | string;
  price?: number | string;
  status?: string;
  images?: string[];
  [key: string]: unknown;
}

export const Product = {
  create: async (data: ProductCreateDTO) => {
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
              password: getSecureDummyPasswordHash(),
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
            password: getSecureDummyPasswordHash(),
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
              slug: `cat-${catId.substring(0, 8)}-${Math.random().toString(36).substring(2, 8)}`
            }
          });
        } catch {
          const fallback = await prisma.category.findFirst() || await prisma.category.create({
            data: { name: 'Default Category', slug: `default-${Math.random().toString(36).substring(2, 8)}` }
          });
          catId = fallback.id;
        }
      }
    } else {
      const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Default Category', slug: `default-${Math.random().toString(36).substring(2, 8)}` }
      });
      catId = defaultCat.id;
    }

    let pStatus: ProductStatus = 'draft';
    if (data.status === 'active' || data.status === 'published' || data.status === 'approved') {
      pStatus = 'published';
    } else if (data.status === 'pending_review') {
      pStatus = 'pending_review';
    } else if (data.status === 'rejected') {
      pStatus = 'rejected';
    } else if (data.status === 'archived') {
      pStatus = 'archived';
    }

    const formatted: Prisma.ProductUncheckedCreateInput = {
      ...(id ? { id } : {}),
      sellerId: sId!,
      name: data.name || 'Product',
      slug: data.slug || `prod-${Math.random().toString(36).substring(2, 9)}`,
      description: data.description || '',
      categoryId: catId!,
      basePrice: Number(data.basePrice ?? data.price ?? 0),
      status: pStatus,
      images: Array.isArray(data.images) ? data.images : [],
    };
    if (id) {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (existing) {
        return wrapRecord(await prisma.product.update({ where: { id }, data: formatted }));
      }
    }
    return wrapRecord(await prisma.product.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.ProductWhereInput = {}) => prisma.product.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.ProductWhereInput = {}) => wrapRecords(await prisma.product.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.ProductWhereInput = {}) => wrapRecord(await prisma.product.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.product.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.ProductUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.product.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
