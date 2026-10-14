/**
 * Brain Skills Context Builder
 * 
 * Formats the <available_skills> index into system instructions
 * Derived from supermemoryai/company-brain/src/brain/skills/context.ts
 */

import { BrainSkill } from '../types';
import { listVisibleSkills, SkillQueryContext } from './store';
import { SKILL_DESCRIPTION_MAX_CHARS } from './validation';

export const SKILL_INDEX_MAX_CHARS = 12_000;
const INDEX_OVERHEAD_CHARS = 500;

const INDEX_DIRECTIVE =
  'Scan this list before answering. If a skill is even partially relevant to the task, load the closest one or two with load_skill and follow them; prefer loading over guessing. Names are exact.';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function indexDescription(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= SKILL_DESCRIPTION_MAX_CHARS
    ? normalized
    : `${normalized.slice(0, Math.max(0, SKILL_DESCRIPTION_MAX_CHARS - 1)).trimEnd()}…`;
}

function fullLine(skill: BrainSkill): string {
  const description = indexDescription(skill.description);
  if (!description) return escapeXml(skill.name);
  return `${escapeXml(skill.name)} — ${escapeXml(description)}`;
}

export function renderAvailableSkills(skills: BrainSkill[]): string {
  if (!skills.length) return '';

  const budget = SKILL_INDEX_MAX_CHARS - INDEX_OVERHEAD_CHARS;
  const lines: string[] = [];
  let totalChars = 0;

  // Prioritize system skills first, then custom skills by recent usage
  const sorted = [...skills].sort((a, b) => {
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    return (b.lastUsedAt || b.updatedAt) - (a.lastUsedAt || a.updatedAt);
  });

  let nameOnlyCount = 0;
  for (const skill of sorted) {
    const line = fullLine(skill);
    if (totalChars + line.length + 1 <= budget) {
      lines.push(line);
      totalChars += line.length + 1;
    } else if (totalChars + skill.name.length + 1 <= budget) {
      lines.push(escapeXml(skill.name));
      totalChars += skill.name.length + 1;
      nameOnlyCount++;
    } else {
      break;
    }
  }

  const notices: string[] = [];
  if (nameOnlyCount > 0) {
    notices.push(`${nameOnlyCount} skills show a name only; load one to read what it does`);
  }

  return [
    '<available_skills>',
    INDEX_DIRECTIVE,
    ...(notices.length ? [`(${notices.join('; ')})`] : []),
    ...lines,
    '</available_skills>',
  ].join('\n');
}

export function buildAvailableSkillsContext(ctx: SkillQueryContext): { text: string; skillIds: string[] } {
  const visible = listVisibleSkills(ctx);
  return {
    text: renderAvailableSkills(visible),
    skillIds: visible.map((s) => s.id),
  };
}
