/**
 * Skill validation and normalization bounds
 * Follows supermemoryai/company-brain specification
 */

import { SkillDraftInput } from '../types';

export const SKILL_NAME_MAX_CHARS = 64;
export const SKILL_DESCRIPTION_MAX_CHARS = 240;
export const SKILL_BODY_MAX_BYTES = 32_000;
export const SKILL_LOADS_PER_TURN = 4;

export function normalizeSkillName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function validateSkillInput(input: SkillDraftInput): SkillDraftInput {
  const normalizedName = normalizeSkillName(input.name);

  if (!normalizedName || normalizedName.length < 3) {
    throw new Error('Skill name must be at least 3 alphanumeric characters');
  }

  if (normalizedName.length > SKILL_NAME_MAX_CHARS) {
    throw new Error(`Skill name exceeds maximum length of ${SKILL_NAME_MAX_CHARS} characters`);
  }

  const description = input.description.trim().replace(/\s+/g, ' ');
  if (!description || description.length < 10) {
    throw new Error('Skill description must be at least 10 characters explaining when to use it');
  }

  if (description.length > SKILL_DESCRIPTION_MAX_CHARS) {
    throw new Error(`Skill description exceeds maximum length of ${SKILL_DESCRIPTION_MAX_CHARS} characters`);
  }

  const body = input.body.trim();
  if (!body || body.length < 20) {
    throw new Error('Skill body playbook must contain actionable markdown instructions');
  }

  const byteLength = new TextEncoder().encode(body).length;
  if (byteLength > SKILL_BODY_MAX_BYTES) {
    throw new Error(`Skill body exceeds maximum size of ${SKILL_BODY_MAX_BYTES} bytes`);
  }

  return {
    name: normalizedName,
    description,
    body,
    scope: input.scope || 'personal',
  };
}
