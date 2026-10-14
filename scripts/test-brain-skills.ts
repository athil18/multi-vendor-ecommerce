/**
 * Nexus Commerce Brain & Skills Architecture Unit Tests
 * 
 * Verifies:
 * 1. Dynamic skill validation and normalization
 * 2. Visibility and multi-tenant scoping (Platform, Store, Personal)
 * 3. Nearest-match fallback suggestions on typos
 * 4. Bounded skill loading per turn (SKILL_LOADS_PER_TURN = 4)
 * 5. Permissions-scoped memory graph recall
 * 6. Integer-cent currency payout calculation accuracy
 */

import { validateSkillInput, normalizeSkillName, SKILL_LOADS_PER_TURN } from '../src/lib/brain/skills/validation';
import { listVisibleSkills, loadVisibleSkillByName, nearestSkillNames } from '../src/lib/brain/skills/store';
import { memoryGraph } from '../src/lib/brain/memory/graph';
import { brainToolExecutor } from '../src/lib/brain/tools/executor';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, message?: string) {
  results.push({ name, passed: condition, message });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} [${condition ? 'PASS' : 'FAIL'}] ${name}${message ? ` (${message})` : ''}`);
}

async function runBrainTests() {
  console.log('\n===============================================================');
  console.log('🧠 NEXUS COMMERCE BRAIN & DYNAMIC SKILLS VERIFICATION SUITE');
  console.log('===============================================================');

  // Test 1: Normalize skill name
  try {
    const normalized = normalizeSkillName('  Bespoke Crafting Policy! v1  ');
    assert('normalizeSkillName', normalized === 'bespoke_crafting_policy_v1', `Result: "${normalized}"`);
  } catch (err: any) {
    assert('normalizeSkillName', false, err.message);
  }

  // Test 2: Validate skill input validation rules
  try {
    const valid = validateSkillInput({
      name: 'artisan_handbook_skill',
      description: 'Use when customer inquires about hand-stitched leathercraft care guidelines.',
      body: '# Artisan Leathercraft Care\n1. Use beeswax conditioner.\n2. Avoid direct heat.',
      scope: 'store',
    });
    assert('validateSkillInput accepts valid playbook', valid.name === 'artisan_handbook_skill');
  } catch (err: any) {
    assert('validateSkillInput accepts valid playbook', false, err.message);
  }

  // Test 3: Reject invalid skill name
  try {
    let threw = false;
    try {
      validateSkillInput({
        name: 'a',
        description: 'Short name test description long enough',
        body: 'Playbook body with sufficient instructions',
      });
    } catch {
      threw = true;
    }
    assert('validateSkillInput rejects too-short name', threw);
  } catch (err: any) {
    assert('validateSkillInput rejects too-short name', false, err.message);
  }

  // Test 4: List visible skills with customer role
  try {
    const customerSkills = listVisibleSkills({ role: 'customer' });
    const hasAdminOnly = customerSkills.some(s => s.requiredRole === 'admin');
    const hasPlatform = customerSkills.some(s => s.scope === 'platform');
    assert('listVisibleSkills filters by customer role', !hasAdminOnly && hasPlatform);
  } catch (err: any) {
    assert('listVisibleSkills filters by customer role', false, err.message);
  }

  // Test 5: Nearest skill names on typo
  try {
    const visible = listVisibleSkills({ role: 'customer' });
    const nearest = nearestSkillNames('escrow_arbitrat', visible);
    const matched = nearest.includes('escrow_arbitration_skill');
    assert('nearestSkillNames finds closest match on typo', matched, `Matches: ${nearest.join(', ')}`);
  } catch (err: any) {
    assert('nearestSkillNames finds closest match on typo', false, err.message);
  }

  // Test 6: Permissions-scoped memory graph recall
  try {
    const customerMemories = memoryGraph.recall('escrow protection stripe', {
      role: 'customer',
      userId: 'test-user-1',
    });
    const foundPlatform = customerMemories.some(m => m.key === 'escrow_security_protocol');
    assert('memoryGraph recalls platform escrow policy for shopper', foundPlatform);
  } catch (err: any) {
    assert('memoryGraph recalls platform escrow policy for shopper', false, err.message);
  }

  // Test 7: Store memory isolation
  try {
    // Record store memory for Store A
    memoryGraph.record(
      { role: 'seller', storeId: 'store-atelier-alpha', userId: 'seller-1' },
      {
        scope: 'store',
        category: 'artisan',
        key: 'leather_tanning_method',
        content: 'Natural vegetable tanned bridle leather steeped in chestnut tannins for 60 days.',
        tags: ['leather', 'tanning'],
      }
    );

    // Query as Store B
    const storeBRecall = memoryGraph.recall('leather tanning method', {
      role: 'seller',
      storeId: 'store-atelier-beta',
      userId: 'seller-2',
    });

    const leakedToStoreB = storeBRecall.some(m => m.key === 'leather_tanning_method');
    assert('memoryGraph prevents multi-tenant leak across competing stores', !leakedToStoreB);
  } catch (err: any) {
    assert('memoryGraph prevents multi-tenant leak across competing stores', false, err.message);
  }

  // Test 8: Integer-cent currency payout calculation
  try {
    const exec = await brainToolExecutor.executeTool(
      'calculate_payout_disbursement',
      { orderAmount: 249.50, platformFeePercent: 10.0 },
      { role: 'seller', traceId: 'test-trace' }
    );
    const res = exec.result;
    // 249.50 -> 24950 cents
    // Platform fee 10% -> 2495 cents ($24.95)
    // Processing fee 2.9% + 30c -> round(24950 * 0.029) + 30 = 724 + 30 = 754 cents ($7.54)
    // Total deductions = 2495 + 754 = 3249 cents ($32.49)
    // Net seller = 24950 - 3249 = 21701 cents ($217.01)
    const netPayout = parseFloat(res.sellerNetPayoutUsd);
    assert('calculate_payout_disbursement uses exact integer-cent arithmetic', netPayout === 217.01, `Net Payout: $${res.sellerNetPayoutUsd}`);
  } catch (err: any) {
    assert('calculate_payout_disbursement uses exact integer-cent arithmetic', false, err.message);
  }

  // Test 9: Bounded skill loads per turn (SKILL_LOADS_PER_TURN = 4)
  try {
    const turnCtx = {
      role: 'customer' as const,
      traceId: 'test-loads-trace',
      loadedSkills: [
        { id: '1', name: 'skill_1', version: '1.0' },
        { id: '2', name: 'skill_2', version: '1.0' },
        { id: '3', name: 'skill_3', version: '1.0' },
        { id: '4', name: 'skill_4', version: '1.0' },
      ],
    };

    const loadAttempt = await brainToolExecutor.executeTool(
      'load_skill',
      { name: 'artisan_concierge_skill' },
      turnCtx
    );

    const bounded = Boolean(loadAttempt.result.error && loadAttempt.result.error.includes('Already loaded maximum 4 skills'));
    assert('brainToolExecutor enforces SKILL_LOADS_PER_TURN limit', bounded);
  } catch (err: any) {
    assert('brainToolExecutor enforces SKILL_LOADS_PER_TURN limit', false, err.message);
  }

  // Test 10: Supermemory AI Cloud Client Graceful Fallback
  try {
    const { supermemoryClient } = await import('../src/lib/brain/memory/supermemory-client');
    const configured = supermemoryClient.isConfigured();
    const searchRes = await supermemoryClient.search('test query');
    const passed = typeof configured === 'boolean' && Array.isArray(searchRes);
    assert('supermemoryClient provides cloud vector search with graceful offline fallback', passed, `Configured: ${configured}`);
  } catch (err: any) {
    assert('supermemoryClient provides cloud vector search with graceful offline fallback', false, err.message);
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log('\n===============================================================');
  console.log(`📊 BRAIN SUITE RESULTS: ${passed}/${total} PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('===============================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runBrainTests().catch((err) => {
  console.error('Brain test runner failed:', err);
  process.exit(1);
});
