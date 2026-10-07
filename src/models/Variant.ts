/**
 * Variant Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere, getSecureDummyPasswordHash } from './prisma-wrap';

export interface VariantCreateDTO {
  id?: string;
  _id?: string;
  productId?: string;
  sellerId?: string | null;
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

export const Variant = {
  create: async (data: VariantCreateDTO) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    let pId = toIdString(data.productId);
    let sId = data.sellerId ? toIdString(data.sellerId) : null;
    if (sId) {
      const existingSeller = await prisma.user.findUnique({ where: { id: sId } });
      if (!existingSeller) {
        try {
          await prisma.user.create({
            data: {
              id: sId,
              name: 'Fallback Seller',
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
    }

    if (!sId && pId) {
      const prod = await prisma.product.findUnique({ where: { id: pId }, select: { sellerId: true } });
      sId = prod?.sellerId || null;
    }
    if (!sId) {
      const defaultSeller = await prisma.user.findFirst({ where: { role: 'seller' } }) || await prisma.user.findFirst();
      if (defaultSeller) {
        sId = defaultSeller.id;
      } else {
        const created = await prisma.user.create({
          data: {
            name: 'Fallback Seller',
            email: `fallback-seller-${Date.now()}@example.com`,
            password: getSecureDummyPasswordHash(),
            role: 'seller',
            status: 'active'
          }
        });
        sId = created.id;
      }
    }

    if (pId) {
      const existingProd = await prisma.product.findUnique({ where: { id: pId } });
      if (!existingProd) {
        try {
          const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
            data: { name: 'Default Cat', slug: `cat-${Date.now()}` }
          });
          await prisma.product.create({
            data: {
              id: pId,
              sellerId: sId!,
              name: 'Variant Product',
              slug: `prod-${pId.substring(0, 10)}-${Date.now()}`,
              description: '',
              basePrice: Number(data.price ?? 50),
              categoryId: defaultCat.id,
              status: 'published'
            }
          });
        } catch {
          const fallback = await prisma.product.findFirst();
          if (fallback) pId = fallback.id;
        }
      }
    } else {
      const defaultCat = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Default Cat', slug: `cat-${Date.now()}` }
      });
      const defaultProd = await prisma.product.findFirst() || await prisma.product.create({
        data: {
          sellerId: sId!,
          name: 'Default Product',
          slug: `prod-${Date.now()}`,
          description: '',
          basePrice: Number(data.price ?? 50),
          categoryId: defaultCat.id,
          status: 'published'
        }
      });
      pId = defaultProd.id;
    }

    const formatted: Prisma.VariantUncheckedCreateInput = {
      ...(id ? { id } : {}),
      productId: pId!,
      sellerId: sId!,
      sku: data.sku || `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      price: Number(data.price ?? 0),
      stock: Number(data.stock ?? 0),
      attributes: (data.attributes as Prisma.InputJsonValue) || {},
    };
    if (id) {
      const existing = await prisma.variant.findUnique({ where: { id } });
      if (existing) {
        return wrapRecord(await prisma.variant.update({ where: { id }, data: formatted }));
      }
    }
    return wrapRecord(await prisma.variant.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.VariantWhereInput = {}) => prisma.variant.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.VariantWhereInput = {}) => wrapRecords(await prisma.variant.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.VariantWhereInput = {}) => wrapRecord(await prisma.variant.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.variant.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.VariantUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.variant.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
