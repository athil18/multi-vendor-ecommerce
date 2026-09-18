/**
 * Prisma Record Normalizer & Compatibility Layer
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

/**
 * Safe string conversion for IDs (handling strings, numbers, cuid/uuid, MockObjectId, nested objects)
 */
export function toIdString(val: any): string | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val._id !== undefined) return toIdString(val._id);
    if (val.id !== undefined) return toIdString(val.id);
    if (typeof val.toString === 'function' && val.toString !== Object.prototype.toString) {
      return val.toString();
    }
  }
  return String(val);
}

/**
 * Recursively normalizes query objects so legacy `_id` fields are rewritten to Prisma `id`
 */
export function normalizeWhere(where: any): any {
  if (!where || typeof where !== 'object') return where;
  if (Array.isArray(where)) return where.map(normalizeWhere);

  const clean: any = {};
  for (const [key, val] of Object.entries(where)) {
    if (key === '_id') {
      if (val && typeof val === 'object' && !Array.isArray(val) && (val as any).in) {
        clean.id = { in: (val as any).in.map(toIdString).filter(Boolean) };
      } else {
        clean.id = toIdString(val);
      }
    } else if (key === 'OR' || key === 'AND' || key === 'NOT') {
      clean[key] = Array.isArray(val) ? val.map(normalizeWhere) : normalizeWhere(val);
    } else if (val && typeof val === 'object' && !Array.isArray(val) && (val as any).in) {
      clean[key] = { in: (val as any).in.map(toIdString).filter(Boolean) };
    } else if (val && typeof val === 'object' && !(val instanceof Date)) {
      clean[key] = normalizeWhere(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

export function wrapRecord<T extends Record<string, any>>(record: T | null): any {
  if (!record) return record;
  if (record && typeof record === 'object') {
    if (record.id && !record._id) {
      Object.defineProperty(record, '_id', {
        value: record.id,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }
  return record;
}

export function wrapRecords<T extends Record<string, any>>(records: T[]): any[] {
  if (!Array.isArray(records)) return records;
  return records.map(wrapRecord);
}
