/**
 * User Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-identity-access-engineer
 */

import prisma from '@/lib/prisma';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere, getSecureDummyPasswordHash } from './prisma-wrap';

export interface UserCreateDTO {
  id?: string;
  _id?: string;
  name?: string;
  email: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
  avatar?: string | null;
  [key: string]: unknown;
}

export const User = {
  create: async (data: UserCreateDTO) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    const formatted: Prisma.UserCreateInput = {
      ...(id ? { id } : {}),
      name: data.name || 'User',
      email: data.email,
      password: data.password || getSecureDummyPasswordHash(),
      role: data.role || 'customer',
      status: data.status || 'active',
    };
    if (data.avatar !== undefined) formatted.avatar = data.avatar;
    if (id) {
      const existing = await prisma.user.findUnique({ where: { id } });
      if (existing) {
        return wrapRecord(await prisma.user.update({ where: { id }, data: formatted }));
      }
      if (formatted.email) {
        await prisma.user.deleteMany({ where: { email: formatted.email } });
      }
      return wrapRecord(await prisma.user.create({ data: formatted }));
    }
    if (formatted.email) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: formatted.email } });
      if (existingByEmail) {
        return wrapRecord(await prisma.user.update({ where: { email: formatted.email }, data: formatted }));
      }
    }
    return wrapRecord(await prisma.user.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.UserWhereInput = {}) => prisma.user.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.UserWhereInput = {}) => wrapRecords(await prisma.user.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.UserWhereInput = {}) => wrapRecord(await prisma.user.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.user.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.UserUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.user.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
