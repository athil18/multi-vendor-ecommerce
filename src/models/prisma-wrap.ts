/**
 * Prisma Record Normalizer & Compatibility Layer
 * 
 * @agent engineering-database-reliability-engineer
 * @agent 04-sql-query-agent
 */

/**
 * Safe string conversion for IDs (handling strings, numbers, cuid/uuid, MockObjectId, nested objects)
 */
export function toIdString(val: unknown): string | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (obj._id !== undefined) return toIdString(obj._id);
    if (obj.id !== undefined) return toIdString(obj.id);
    if (typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString) {
      return obj.toString();
    }
  }
  return String(val);
}

/**
 * Recursively normalizes query objects so legacy `_id` fields are rewritten to Prisma `id`
 */
export function normalizeWhere<T = Record<string, unknown>>(where: unknown): T {
  if (!where || typeof where !== 'object') return where as T;
  if (Array.isArray(where)) return where.map(normalizeWhere) as unknown as T;

  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(where as Record<string, unknown>)) {
    if (key === '_id') {
      if (val && typeof val === 'object' && !Array.isArray(val) && 'in' in val && Array.isArray((val as { in: unknown[] }).in)) {
        clean.id = { in: (val as { in: unknown[] }).in.map(toIdString).filter((id): id is string => Boolean(id)) };
      } else {
        clean.id = toIdString(val);
      }
    } else if (key.endsWith('Id') || key === 'sellerId' || key === 'productId' || key === 'orderId' || key === 'userId' || key === 'categoryId' || key === 'shippingAddressId' || key === 'variantId') {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if ('in' in val && Array.isArray((val as { in: unknown[] }).in)) {
          clean[key] = { in: (val as { in: unknown[] }).in.map(toIdString).filter((id): id is string => Boolean(id)) };
        } else {
          clean[key] = toIdString(val);
        }
      } else {
        clean[key] = toIdString(val);
      }
    } else if (key === 'OR' || key === 'AND' || key === 'NOT') {
      clean[key] = Array.isArray(val) ? val.map(normalizeWhere) : normalizeWhere(val);
    } else if (val && typeof val === 'object' && !Array.isArray(val) && 'in' in val && Array.isArray((val as { in: unknown[] }).in)) {
      clean[key] = { in: (val as { in: unknown[] }).in.map(toIdString).filter((id): id is string => Boolean(id)) };
    } else if (val && typeof val === 'object' && !(val instanceof Date)) {
      clean[key] = normalizeWhere(val);
    } else {
      clean[key] = val;
    }
  }
  return clean as T;
}

export type WithLegacyId<T> = T & { _id?: string };

export function wrapRecord<T extends Record<string, unknown>>(record: T | null): WithLegacyId<T> | null {
  if (!record) return record;
  if (record && typeof record === 'object') {
    if ('id' in record && !('_id' in record)) {
      Object.defineProperty(record, '_id', {
        value: (record as Record<string, unknown>).id,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }
  return record as WithLegacyId<T>;
}

export function wrapRecords<T extends Record<string, unknown>>(records: T[]): WithLegacyId<T>[] {
  if (!Array.isArray(records)) return [];
  return records.map(wrapRecord).filter((r): r is WithLegacyId<T> => r !== null);
}

/**
 * Generates a cryptographically random, locked password placeholder token
 * for automated relational fallbacks, preventing hardcoded credential reuse.
 */
export function getSecureDummyPasswordHash(): string {
  const rand = Math.random().toString(36).substring(2) + Date.now().toString(36);
  // Uses Node crypto if available in runtime
  try {
    const crypto = require('crypto');
    return `$locked$argon2id$${crypto.randomBytes(24).toString('hex')}`;
  } catch {
    return `$locked$argon2id$${rand}`;
  }
}

