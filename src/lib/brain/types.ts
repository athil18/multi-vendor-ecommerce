/**
 * Nexus Multi-Vendor E-Commerce Brain & Dynamic Skills Architecture
 * 
 * Inspired by supermemoryai/company-brain:
 * - Dynamic, on-demand skill playbooks (<available_skills> + load_skill)
 * - Permissions-scoped multi-tier memory graph (Platform, Store, User)
 * - Real-time domain tool execution loop (catalog, escrow, disputes, analytics)
 * - Autonomous turn orchestration and skill authoring
 * 
 * @module brain/types
 */

export type SkillScope = 'platform' | 'store' | 'personal';

export interface BrainSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  scope: SkillScope;
  authorId?: string;
  storeId?: string;
  body: string; // Markdown playbook
  requiredRole?: 'customer' | 'seller' | 'admin' | 'any';
  tools?: string[];
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  isSystem?: boolean;
}

export interface SkillDraftInput {
  name: string;
  description: string;
  body: string;
  scope?: SkillScope;
}

export type MemoryScope = 'platform' | 'store' | 'user';

export interface MemoryRecord {
  id: string;
  scope: MemoryScope;
  scopeId?: string; // storeId or userId (null for platform)
  category: 'policy' | 'preference' | 'logistics' | 'compliance' | 'artisan' | 'dispute';
  key: string;
  content: string;
  tags: string[];
  confidence: number;
  createdAt: number;
  updatedAt: number;
}

export interface BrainTurnContext {
  userId?: string;
  role: 'customer' | 'seller' | 'admin';
  storeId?: string;
  userName?: string;
  traceId: string;
  loadedSkills?: { id: string; name: string; version: string }[];
}

export interface BrainToolExecution {
  tool: string;
  input: Record<string, any>;
  result: Record<string, any>;
  durationMs?: number;
}

export interface BrainTurnResult {
  message: string;
  intent: string;
  loadedSkills: { id: string; name: string; version: string }[];
  executedTools: BrainToolExecution[];
  memoriesRecalled: { id: string; key: string; scope: MemoryScope; snippet: string }[];
  suggestedActions: {
    label: string;
    href?: string;
    action?: 'PUSH_TO_CART' | 'NAVIGATE' | 'PROMPT';
    payload?: any;
  }[];
  products?: any[];
  itemToCart?: any;
  conversationTone: 'welcoming' | 'informative' | 'transactional' | 'empathic' | 'authoritative';
}
