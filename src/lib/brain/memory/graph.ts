/**
 * Permissions-Scoped Multi-Tier Memory Graph
 * 
 * Inspired by supermemoryai/company-brain/src/brain/memory:
 * - Shared Platform Memory (policies, escrow invariants, compliance)
 * - Merchant Store Memory (craftsmanship, atelier notes, custom SLA)
 * - Private User Memory (aesthetic taste, sizing, delivery preferences)
 */

import fs from 'fs';
import path from 'path';
import { MemoryRecord, MemoryScope } from '../types';
import { supermemoryClient } from './supermemory-client';

const MEMORY_PERSIST_PATH = path.join(process.cwd(), '.data', 'brain', 'memory_graph.json');

// Core Platform Memories pre-seeded
const INITIAL_PLATFORM_MEMORIES: MemoryRecord[] = [
  {
    id: 'mem-platform-escrow',
    scope: 'platform',
    category: 'policy',
    key: 'escrow_security_protocol',
    content: 'All marketplace payments are held securely in escrow via Stripe Connect. Funds are released to seller Connected Accounts only after buyer delivery confirmation or expiration of the 7-day post-delivery inspection window with no dispute.',
    tags: ['escrow', 'stripe', 'payout', 'protection', 'policy'],
    confidence: 1.0,
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
  },
  {
    id: 'mem-platform-returns',
    scope: 'platform',
    category: 'policy',
    key: 'buyer_satisfaction_guarantee',
    content: 'Buyers enjoy a 14-day hassle-free return window for standard products. Bespoke custom-monogrammed items are non-returnable unless defective or deviating from verified specifications.',
    tags: ['returns', 'refunds', 'buyer-protection', 'policy'],
    confidence: 1.0,
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
  },
  {
    id: 'mem-platform-dpdp',
    scope: 'platform',
    category: 'compliance',
    key: 'dpdp_compliance_mandate',
    content: 'Nexus strictly adheres to DPDP Act 2023 and GDPR: zero dark patterns, no pre-selected marketing consent, and automated right-to-erasure workflows with 8-year tax ledger retention.',
    tags: ['privacy', 'dpdp', 'gdpr', 'compliance', 'cookies'],
    confidence: 1.0,
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
  },
  {
    id: 'mem-platform-commission',
    scope: 'platform',
    category: 'policy',
    key: 'platform_take_rate_tier',
    content: 'Platform standard commission is 10% on gross merchandise value (GMV). Payment processing fee is 2.9% + $0.30 per successful card transaction. All calculations use exact integer cents.',
    tags: ['commission', 'fees', 'seller', 'payout', 'pricing'],
    confidence: 1.0,
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
  },
  {
    id: 'mem-platform-atelier',
    scope: 'platform',
    category: 'artisan',
    key: 'artisan_curation_standards',
    content: 'Every merchant on Nexus is a verified atelier or independent artisan maker. Products undergo quality screening for material authenticity (full-grain leather, solid hardwood, CNC aluminum, organic textiles).',
    tags: ['artisan', 'curation', 'atelier', 'materials', 'quality'],
    confidence: 1.0,
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
  }
];

class MemoryGraphStore {
  private records: Map<string, MemoryRecord> = new Map();

  constructor() {
    for (const mem of INITIAL_PLATFORM_MEMORIES) {
      this.records.set(mem.id, mem);
    }
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(MEMORY_PERSIST_PATH)) {
        const raw = fs.readFileSync(MEMORY_PERSIST_PATH, 'utf-8');
        const list: MemoryRecord[] = JSON.parse(raw);
        for (const record of list) {
          this.records.set(record.id, record);
        }
      }
    } catch (err) {
      console.warn('[brain/memory/graph] Failed loading memories from disk:', err);
    }
  }

  private saveToDisk() {
    try {
      const dir = path.dirname(MEMORY_PERSIST_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const custom = Array.from(this.records.values()).filter(
        (m) => !INITIAL_PLATFORM_MEMORIES.some((init) => init.id === m.id)
      );
      fs.writeFileSync(MEMORY_PERSIST_PATH, JSON.stringify(custom, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[brain/memory/graph] Failed persisting memories to disk:', err);
    }
  }

  public getAll(): MemoryRecord[] {
    return Array.from(this.records.values());
  }

  public getById(id: string): MemoryRecord | undefined {
    return this.records.get(id);
  }

  /**
   * Scoped Memory Recall:
   * Returns memories authorized for the current user and context.
   */
  public recall(query: string, ctx: {
    userId?: string;
    role: 'customer' | 'seller' | 'admin';
    storeId?: string;
    limit?: number;
  }): MemoryRecord[] {
    const limit = ctx.limit || 5;
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const authorized = Array.from(this.records.values()).filter((mem) => {
      // 1. Platform memory is visible to everyone
      if (mem.scope === 'platform') return true;

      // 2. Store memory is visible to the store owner or platform admin
      if (mem.scope === 'store') {
        if (ctx.role === 'admin') return true;
        if (ctx.role === 'seller' && ctx.storeId && mem.scopeId === ctx.storeId) return true;
        return false;
      }

      // 3. User memory is visible only to that user or platform admin
      if (mem.scope === 'user') {
        if (ctx.role === 'admin') return true;
        if (ctx.userId && mem.scopeId === ctx.userId) return true;
        return false;
      }

      return false;
    });

    // Score memories based on keyword matching
    const scored = authorized.map((mem) => {
      let score = 0;
      const text = `${mem.key} ${mem.content} ${mem.tags.join(' ')}`.toLowerCase();

      for (const token of queryTokens) {
        if (text.includes(token)) score += 3;
        if (mem.tags.some((t) => t.toLowerCase() === token)) score += 5;
        if (mem.key.toLowerCase().includes(token)) score += 4;
      }

      // Higher confidence records get slight boost
      score += mem.confidence * 2;

      return { mem, score };
    });

    return scored
      .filter((item) => item.score > 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.mem);
  }

  /**
   * Records a durable fact into the memory graph with scope validation
   */
  public record(
    ctx: { userId?: string; role: 'customer' | 'seller' | 'admin'; storeId?: string },
    input: {
      scope: MemoryScope;
      category: MemoryRecord['category'];
      key: string;
      content: string;
      tags?: string[];
      confidence?: number;
    }
  ): { success: boolean; memory?: MemoryRecord; error?: string } {
    // Permission checks
    if (input.scope === 'platform' && ctx.role !== 'admin') {
      return { success: false, error: 'Only administrators can record Platform-wide memories' };
    }

    if (input.scope === 'store' && ctx.role !== 'seller' && ctx.role !== 'admin') {
      return { success: false, error: 'Only verified sellers can record Store-scoped memories' };
    }

    let scopeId: string | undefined;
    if (input.scope === 'store') {
      scopeId = ctx.storeId;
      if (!scopeId && ctx.role !== 'admin') {
        return { success: false, error: 'Store ID required for store-scoped memory' };
      }
    } else if (input.scope === 'user') {
      scopeId = ctx.userId;
      if (!scopeId) {
        return { success: false, error: 'User must be authenticated to record personal memory' };
      }
    }

    const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: MemoryRecord = {
      id,
      scope: input.scope,
      scopeId,
      category: input.category,
      key: input.key.trim().toLowerCase().replace(/\s+/g, '_'),
      content: input.content.trim(),
      tags: input.tags || [],
      confidence: input.confidence ?? 0.95,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.records.set(id, newRecord);
    this.saveToDisk();

    // Async sync with Supermemory Cloud if SUPERMEMORY_API_KEY is configured
    if (supermemoryClient.isConfigured()) {
      const containerTags = [
        input.scope === 'platform'
          ? 'shared_team_brain'
          : input.scope === 'store'
          ? `store_${scopeId}`
          : `user_${scopeId}`
      ];
      supermemoryClient.addMemory(input.content, {
        metadata: {
          key: newRecord.key,
          scope: newRecord.scope,
          category: newRecord.category,
          tags: newRecord.tags,
        },
        containerTags,
      }).catch((err) => {
        console.warn('[brain/memory/graph] Background Supermemory Cloud sync failed:', err);
      });
    }

    return { success: true, memory: newRecord };
  }

  public isSupermemoryCloudConfigured(): boolean {
    return supermemoryClient.isConfigured();
  }
}

export const memoryGraph = new MemoryGraphStore();
