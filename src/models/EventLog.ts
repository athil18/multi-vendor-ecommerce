/**
 * EventLog Model Wrapper
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 * @agent engineering-sre
 * @agent engineering-devops-automator
 */

import prisma from '@/lib/prisma';
import { Prisma, EventStatus } from '@prisma/client';
import { wrapRecord, wrapRecords, toIdString, normalizeWhere } from './prisma-wrap';

export interface EventLogCreateDTO {
  id?: string;
  _id?: string;
  eventId?: string;
  eventType?: string;
  payload?: Record<string, unknown>;
  status?: string;
  [key: string]: unknown;
}

export const EventLog = {
  create: async (data: EventLogCreateDTO) => {
    const rawId = data.id || data._id;
    const id = rawId ? toIdString(rawId) : undefined;

    let evStatus: EventStatus = 'processed';
    if (data.status === 'pending') evStatus = 'pending';
    else if (data.status === 'failed') evStatus = 'failed';
    else if (data.status === 'skipped') evStatus = 'skipped';

    const formatted: Prisma.EventLogUncheckedCreateInput = {
      ...(id ? { id } : {}),
      eventId: data.eventId || `evt_${Math.random().toString(36).substring(2, 9)}`,
      eventType: data.eventType || 'generic',
      status: evStatus,
    };
    return wrapRecord(await prisma.eventLog.create({ data: formatted }));
  },
  deleteMany: (where: Prisma.EventLogWhereInput = {}) => prisma.eventLog.deleteMany({ where: normalizeWhere(where) || {} }),
  find: async (where: Prisma.EventLogWhereInput = {}) => wrapRecords(await prisma.eventLog.findMany({ where: normalizeWhere(where) || {} })),
  findOne: async (where: Prisma.EventLogWhereInput = {}) => wrapRecord(await prisma.eventLog.findFirst({ where: normalizeWhere(where) || {} })),
  findById: async (id: unknown) => wrapRecord(await prisma.eventLog.findUnique({ where: { id: toIdString(id) } })),
  findByIdAndUpdate: async (id: unknown, data: Prisma.EventLogUncheckedUpdateInput & Record<string, unknown>) => {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    return wrapRecord(await prisma.eventLog.update({ where: { id: toIdString(id) }, data: cleanData }));
  },
};
