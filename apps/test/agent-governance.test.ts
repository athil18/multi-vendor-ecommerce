/**
 * Automated Test Suite for 500+ AI Agent Governance Engine
 * 
 * @agent 15-unit-test-generator
 * @agent testing-test-automation-engineer
 * @agent 02-code-review-agent
 */

import { describe, it, expect } from 'vitest';
import { runGovernanceAudit } from '../scripts/agent-governance';

describe('500+ AI Agent Governance Audit Suite', () => {
  it('should scan codebase and find valid source files', () => {
    const summary = runGovernanceAudit();
    expect(summary.totalFiles).toBeGreaterThan(10);
    expect(summary.results.length).toBe(summary.totalFiles);
  });

  it('should have governing agents assigned to core services and libraries', () => {
    const summary = runGovernanceAudit();
    const coreFiles = summary.results.filter(
      (r) =>
        r.file.includes('services/') ||
        r.file.includes('lib/ledger') ||
        r.file.includes('lib/prisma') ||
        r.file.includes('lib/logger') ||
        r.file.includes('lib/pii') ||
        r.file.includes('middleware')
    );

    for (const fileResult of coreFiles) {
      expect(
        fileResult.governingAgents.length,
        `Expected file ${fileResult.file} to have @agent attribution`
      ).toBeGreaterThan(0);
    }
  });

  it('should have zero fatal governance errors', () => {
    const summary = runGovernanceAudit();
    const errors = summary.results.flatMap((r) => r.errors);
    expect(errors).toHaveLength(0);
  });
});
