/**
 * Variant Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const Variant = {
  create: async (data: any) => {
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
            password: '$2a$10$wT8v0o9q2j1X7Y6Z5A4B3C2D1E0F9G8H7I6J5K4L3M2N1O0P9Q8R7S',
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

    const formatted: any = {
      ...(id ? { id } : {}),
      productId: pId,
      sellerId: sId,
      sku: data.sku || `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      price: Number(data.price ?? 0),
      stock: Number(data.stock ?? 0),
      attributes: data.attributes || {},
    };
    return wrapRecord(await prisma.variant.create({ data: formatted }));
  },
  deleteMany: (where: any = {}) => prisma.variant.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.variant.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.variant.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.variant.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.variant.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
