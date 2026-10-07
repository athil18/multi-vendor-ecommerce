/**
 * Store Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-backend-architect
 */

import prisma from '@/lib/prisma';
import { Prisma, GovernanceStatus } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere, getSecureDummyPasswordHash } from './prisma-wrap';

export interface StoreCreateDTO {
  id?: string;
  _id?: string;
  sellerId?: string;
  name?: string;
  storeName?: string;
  slug?: string;
  status?: string;
  governanceStatus?: string;
  description?: string | null;
  logo?: string | null;
  logoUrl?: string | null;
  banner?: string | null;
  bannerUrl?: string | null;
  trustScore?: number;
  payoutsEnabled?: boolean;
  stripeOnboardingComplete?: boolean;
  stripeConnectedAccountId?: string | null;
  [key: string]: unknown;
}

export const Store = {
  create: async (data: StoreCreateDTO) => {
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

    let govStatus: GovernanceStatus = 'good_standing';
    if (data.status === 'suspended' || data.governanceStatus === 'suspended') {
      govStatus = 'suspended';
    } else if (data.status === 'probation' || data.governanceStatus === 'probation') {
      govStatus = 'probation';
    } else if (data.status === 'banned' || data.governanceStatus === 'banned') {
      govStatus = 'banned';
    }

    const formatted: Prisma.StoreUncheckedCreateInput = {
      ...(id ? { id } : {}),
      name: data.name || data.storeName || 'Store',
      slug: data.slug || `store-${Math.random().toString(36).substring(2, 9)}`,
      sellerId: sId!,
      governanceStatus: govStatus,
      description: data.description || null,
      logo: data.logo || data.logoUrl || null,
      banner: data.banner || data.bannerUrl || null,
      trustScore: data.trustScore !== undefined ? Number(data.trustScore) : 100.0,
      payoutsEnabled: data.payoutsEnabled !== undefined ? Boolean(data.payoutsEnabled) : false,
      stripeOnboardingComplete: data.stripeOnboardingComplete !== undefined ? Boolean(data.stripeOnboardingComplete) : false,
      stripeConnectedAccountId: data.stripeConnectedAccountId || null,
    };
    return wrapRecord(await prisma.store.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.StoreWhereInput = {}) => prisma.store.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.StoreWhereInput = {}) => wrapRecords(await prisma.store.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.StoreWhereInput = {}) => wrapRecord(await prisma.store.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.store.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.StoreUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.store.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
