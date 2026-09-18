/**
 * EventLog Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-sre
 * @agent engineering-devops-automator
 */

import prisma from '@/lib/prisma';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export const EventLog = {
  create: async (data: any) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;
    const formatted: any = {
      ...(id ? { id } : {}),
      eventId: data.eventId || `evt_${Math.random().toString(36).substring(2, 9)}`,
      eventType: data.eventType || 'generic',
      payload: data.payload || {},
      status: data.status || 'processed',
    };
    return wrapRecord(await prisma.eventLog.create({ data: formatted }));
  },
  deleteMany: (where: any = {}) => prisma.eventLog.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: any = {}) => wrapRecords(await prisma.eventLog.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: any = {}) => wrapRecord(await prisma.eventLog.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: any) => wrapRecord(await prisma.eventLog.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: any, data: any) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.eventLog.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
