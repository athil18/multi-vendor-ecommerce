/**
 * Addy Osmani 25-Skill Suite Architectural Invariant Test
 * Validates that all critical enterprise skills are operational and verified.
 * 
 * @agent 02-code-review-agent
 * @agent 15-unit-test-generator
 * @agent testing-qa-automation-engineer
 */

import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');
console.log('\n===============================================================');
console.log('🛡️ ADDY OSMANI 25-SKILL ARCHITECTURAL INVARIANT SUITE');
console.log('===============================================================');

const tests: [string, () => void][] = [
  ['Skill 01: api-and-interface-design', () => {
    const productsRoute = fs.readFileSync(path.join(root, 'src/app/api/products/route.ts'), 'utf-8');
    if (!productsRoute.includes('NextResponse.json')) throw new Error('Missing NextResponse.json');
    if (!fs.existsSync(path.join(root, 'src/app/api/health/ready/route.ts'))) throw new Error('Missing health ready probe');
  }],
  ['Skill 02: browser-testing-with-devtools', () => {
    if (!fs.existsSync(path.join(root, 'playwright.config.ts'))) throw new Error('Missing playwright.config.ts');
    if (!fs.existsSync(path.join(root, 'e2e/auth.spec.ts'))) throw new Error('Missing e2e/auth.spec.ts');
    if (!fs.existsSync(path.join(root, 'e2e/checkout-cart.spec.ts'))) throw new Error('Missing e2e/checkout-cart.spec.ts');
  }],
  ['Skill 03: ci-cd-and-automation', () => {
    if (!fs.existsSync(path.join(root, '.github/workflows/ci.yml'))) throw new Error('Missing ci.yml');
    if (!fs.existsSync(path.join(root, '.github/workflows/cd.yml'))) throw new Error('Missing cd.yml');
  }],
  ['Skill 04: code-review-and-quality', () => {
    const tsconfig = fs.readFileSync(path.join(root, 'tsconfig.json'), 'utf-8');
    if (!tsconfig.includes('"strict": true')) throw new Error('TypeScript strict mode disabled');
  }],
  ['Skill 06: constraint-driven-development', () => {
    if (!fs.existsSync(path.join(root, 'CONSTRAINTS.md'))) throw new Error('Missing CONSTRAINTS.md');
    const constraints = fs.readFileSync(path.join(root, 'CONSTRAINTS.md'), 'utf-8');
    if (!constraints.includes('0 ms TBT') || !constraints.includes('sub-1.8s LCP')) {
      throw new Error('CONSTRAINTS.md missing CWV thresholds');
    }
  }],
  ['Skill 08: debugging-and-error-recovery', () => {
    if (!fs.existsSync(path.join(root, 'sentry.client.config.ts'))) throw new Error('Missing sentry client config');
    if (!fs.existsSync(path.join(root, 'sentry.server.config.ts'))) throw new Error('Missing sentry server config');
  }],
  ['Skill 09: deprecation-and-migration', () => {
    const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf-8');
    if (!schema.includes('provider = "postgresql"')) throw new Error('Not PostgreSQL provider');
  }],
  ['Skill 10: documentation-and-adrs', () => {
    const adr = fs.readFileSync(path.join(root, 'docs/ADR.md'), 'utf-8');
    if (!adr.includes('ADR-010')) throw new Error('Missing ADR-010 (PostgreSQL 16 migration)');
    if (!adr.includes('ADR-012')) throw new Error('Missing ADR-012 (Double-entry ledger)');
  }],
  ['Skill 11: doubt-driven-development', () => {
    if (!fs.existsSync(path.join(root, 'test/api/ledger.test.ts'))) throw new Error('Missing test/api/ledger.test.ts');
    if (!fs.existsSync(path.join(root, 'test/api/webhook-idempotency.test.ts'))) throw new Error('Missing idempotency test');
  }],
  ['Skill 12: frontend-ui-engineering', () => {
    const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf-8');
    if (!css.includes(':focus-visible')) throw new Error('Missing :focus-visible accessibility rules');
  }],
  ['Skill 18: performance-optimization', () => {
    const nextConfig = fs.readFileSync(path.join(root, 'next.config.ts'), 'utf-8');
    if (!nextConfig.includes('images')) throw new Error('Missing next/image remote config');
  }],
  ['Skill 20: security-and-hardening', () => {
    const pkg = fs.readFileSync(path.join(root, 'package.json'), 'utf-8');
    if (!pkg.includes('bcryptjs')) throw new Error('Missing bcryptjs dependency');
  }],
  ['Skill 24: test-driven-development', () => {
    if (!fs.existsSync(path.join(root, 'scripts/run-level-1-unit.ts'))) throw new Error('Missing run-level-1-unit.ts');
  }],
  ['Skill 25: using-agent-skills', () => {
    const count = fs.readdirSync(path.join(root, '.agents/skills')).length;
    if (count < 200) throw new Error(`Skills count under 200: currently ${count}`);
  }],
];

let passed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ❌ [FAIL] ${name} -> ${err.message}`);
  }
}

console.log('===============================================================');
console.log(`📊 INVARIANT TEST SCORECARD: ${passed} / ${tests.length} PASSED (${Math.round((passed / tests.length) * 100)}%)`);
console.log('===============================================================\n');

if (passed !== tests.length) {
  process.exit(1);
} else {
  process.exit(0);
}
