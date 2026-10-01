import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const agentsDir = path.join(rootDir, '.agents');
const skillsDir = path.join(agentsDir, 'skills');
const refsDir = path.join(agentsDir, 'references');
const personasDir = path.join(agentsDir, 'agents');

console.log('🔍 Validating Agent Skills & Configuration in .agents/...\n');

let hasErrors = false;

// 1. Check directories
if (!fs.existsSync(skillsDir)) {
  console.error('❌ .agents/skills directory missing!');
  process.exit(1);
}

const skills = fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());
console.log(`📦 Discovered ${skills.length} skills in .agents/skills:`);

for (const skill of skills) {
  const skillFile = path.join(skillsDir, skill, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.error(`  ❌ [${skill}] missing SKILL.md`);
    hasErrors = true;
    continue;
  }
  const content = fs.readFileSync(skillFile, 'utf8');
  if (!content.startsWith('---') || !content.includes('name:') || !content.includes('description:')) {
    console.error(`  ❌ [${skill}] invalid or missing YAML frontmatter`);
    hasErrors = true;
    continue;
  }
  console.log(`  ✓ ${skill}`);
}

// 2. Check reference checklists
console.log('\n📋 Validating Reference Checklists in .agents/references:');
const expectedRefs = [
  'ecommerce-checklist.md',
  'definition-of-done.md',
  'security-checklist.md',
  'performance-checklist.md',
  'accessibility-checklist.md',
  'observability-checklist.md',
  'orchestration-patterns.md',
  'testing-patterns.md'
];

for (const ref of expectedRefs) {
  const refPath = path.join(refsDir, ref);
  if (fs.existsSync(refPath)) {
    console.log(`  ✓ references/${ref}`);
  } else {
    console.error(`  ❌ Missing reference checklist: references/${ref}`);
    hasErrors = true;
  }
}

// 3. Check personas
console.log('\n👤 Validating Specialist Personas in .agents/agents:');
const expectedPersonas = [
  'code-reviewer.md',
  'security-auditor.md',
  'test-engineer.md',
  'web-performance-auditor.md'
];

for (const persona of expectedPersonas) {
  const personaPath = path.join(personasDir, persona);
  if (fs.existsSync(personaPath)) {
    console.log(`  ✓ agents/${persona}`);
  } else {
    console.error(`  ❌ Missing persona: agents/${persona}`);
    hasErrors = true;
  }
}

// 4. Validate relative reference links in all skills
console.log('\n🔗 Validating Relative Reference Links in Skills:');
let brokenLinks = 0;
for (const skill of skills) {
  const skillFile = path.join(skillsDir, skill, 'SKILL.md');
  const content = fs.readFileSync(skillFile, 'utf8');
  const matches = content.matchAll(/(\.\.\/\.\.\/references\/[a-zA-Z0-9_\-\.]+\.md)/g);
  for (const m of matches) {
    const relPath = m[1];
    const resolved = path.resolve(path.join(skillsDir, skill), relPath);
    if (!fs.existsSync(resolved)) {
      console.error(`  ❌ Broken link in ${skill}: ${relPath}`);
      brokenLinks++;
      hasErrors = true;
    }
  }
}

if (brokenLinks === 0) {
  console.log('  ✓ All relative reference links in SKILL.md files resolve cleanly!');
}

console.log('\n' + (hasErrors ? '❌ Validation failed with errors.' : '✅ All agent skills and e-commerce configurations are valid and ready!'));
process.exit(hasErrors ? 1 : 0);
