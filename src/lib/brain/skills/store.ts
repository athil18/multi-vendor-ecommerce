/**
 * Skill Store: In-memory registry with persistent storage and role-based scoping
 * Inspired by supermemoryai/company-brain/src/brain/skills/store.ts
 */

import fs from 'fs';
import path from 'path';
import { BrainSkill, SkillDraftInput } from '../types';
import { BUILT_IN_SKILLS } from './registry';
import { normalizeSkillName, validateSkillInput } from './validation';

const SKILLS_PERSIST_PATH = path.join(process.cwd(), '.data', 'brain', 'custom_skills.json');

// In-memory runtime store initialized with built-in skills
const runtimeSkills: Map<string, BrainSkill> = new Map();

function loadCustomSkillsFromDisk() {
  try {
    if (fs.existsSync(SKILLS_PERSIST_PATH)) {
      const raw = fs.readFileSync(SKILLS_PERSIST_PATH, 'utf-8');
      const list: BrainSkill[] = JSON.parse(raw);
      for (const skill of list) {
        runtimeSkills.set(normalizeSkillName(skill.name), skill);
      }
    }
  } catch (err) {
    console.warn('[brain/skills/store] Could not load custom skills from disk:', err);
  }
}

function persistCustomSkillsToDisk() {
  try {
    const dir = path.dirname(SKILLS_PERSIST_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const customList = Array.from(runtimeSkills.values()).filter(s => !s.isSystem);
    fs.writeFileSync(SKILLS_PERSIST_PATH, JSON.stringify(customList, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[brain/skills/store] Could not persist custom skills to disk:', err);
  }
}

// Initialize registry
for (const skill of BUILT_IN_SKILLS) {
  runtimeSkills.set(normalizeSkillName(skill.name), skill);
}
loadCustomSkillsFromDisk();

export interface SkillQueryContext {
  userId?: string;
  role?: 'customer' | 'seller' | 'admin';
  storeId?: string;
}

export function listVisibleSkills(ctx: SkillQueryContext = {}): BrainSkill[] {
  const all = Array.from(runtimeSkills.values());
  const role = ctx.role || 'customer';

  return all.filter((skill) => {
    // 1. Role requirements
    if (skill.requiredRole && skill.requiredRole !== 'any') {
      if (skill.requiredRole === 'admin' && role !== 'admin') return false;
      if (skill.requiredRole === 'seller' && role !== 'seller' && role !== 'admin') return false;
    }

    // 2. Scope isolation
    if (skill.scope === 'platform') return true;

    if (skill.scope === 'store') {
      // Store skills visible to owner seller or admin
      if (role === 'admin') return true;
      if (role === 'seller' && ctx.storeId && skill.storeId === ctx.storeId) return true;
      return false;
    }

    if (skill.scope === 'personal') {
      // Personal skills visible only to author
      if (ctx.userId && skill.authorId === ctx.userId) return true;
      if (role === 'admin') return true;
      return false;
    }

    return true;
  });
}

export function loadVisibleSkillByName(ctx: SkillQueryContext, rawName: string): BrainSkill | null {
  const norm = normalizeSkillName(rawName);
  const skill = runtimeSkills.get(norm);
  if (!skill) return null;

  // Check visibility for current user
  const visible = listVisibleSkills(ctx);
  const isVisible = visible.some((s) => s.id === skill.id);
  if (!isVisible) return null;

  // Track usage
  skill.lastUsedAt = Date.now();
  return skill;
}

export function nearestSkillNames(query: string, pool: BrainSkill[]): string[] {
  const q = normalizeSkillName(query);
  return pool
    .map((s) => {
      const name = normalizeSkillName(s.name);
      let score = 0;
      if (name.includes(q) || q.includes(name)) score += 10;
      const qWords = q.split('_');
      for (const w of qWords) {
        if (w.length > 2 && name.includes(w)) score += 3;
      }
      return { name: s.name, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.name);
}

export function saveRuntimeSkill(
  ctx: SkillQueryContext,
  rawInput: SkillDraftInput
): { success: boolean; skill?: BrainSkill; error?: string } {
  try {
    const validated = validateSkillInput(rawInput);
    const existing = runtimeSkills.get(validated.name);

    if (existing && existing.isSystem && ctx.role !== 'admin') {
      return { success: false, error: 'Cannot overwrite system skills without admin privileges' };
    }

    const effectiveScope = validated.scope || (ctx.storeId ? 'store' : 'personal');

    const newSkill: BrainSkill = {
      id: existing ? existing.id : `skill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: validated.name,
      description: validated.description,
      version: existing ? incrementVersion(existing.version) : '1.0.0',
      scope: effectiveScope,
      authorId: ctx.userId,
      storeId: effectiveScope === 'store' ? ctx.storeId : undefined,
      body: validated.body,
      requiredRole: effectiveScope === 'store' ? 'seller' : 'any',
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now(),
      isSystem: false,
    };

    runtimeSkills.set(validated.name, newSkill);
    persistCustomSkillsToDisk();

    return { success: true, skill: newSkill };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save skill' };
  }
}

function incrementVersion(ver: string): string {
  const parts = ver.split('.').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
  return '1.0.1';
}
