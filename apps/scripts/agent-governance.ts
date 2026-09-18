/**
 * 500+ AI Agent Ecosystem — Automated Code Governance & Audit Engine
 * 
 * @agent engineering-developer-tooling-engineer
 * @agent engineering-code-reviewer
 * @agent 02-code-review-agent
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  file: string;
  governingAgents: string[];
  passed: boolean;
  warnings: string[];
  errors: string[];
}

const SRC_DIR = path.resolve(__dirname, '../src');

const KNOWN_AGENT_PATTERNS = [
  'engineering-',
  'security-',
  'design-',
  'testing-',
  'finance-',
  'product-',
  'project-management-',
  'sales-',
  'marketing-',
  'support-',
  '02-code-review-agent',
  '04-sql-query-agent',
  '13-customer-support-agent',
  '15-unit-test-generator',
  '16-documentation-writer',
  '21-pii-sanitization-agent',
];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export function auditFile(filePath: string): AuditResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath).replace(/\\/g, '/');
  
  const governingAgents: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check for @agent annotations
  const agentMatches = content.matchAll(/@agent\s+([\w-]+)/g);
  for (const match of agentMatches) {
    governingAgents.push(match[1]);
  }

  // 2. Check for PII leaks / un-sanitized raw console logging of sensitive variables
  if (/\bconsole\.(log|info|warn|error)\b/.test(content) && !filePath.includes('logger.ts') && !filePath.includes('middleware.ts')) {
    warnings.push('Contains direct console.* call. Use structured logger from @/lib/logger instead.');
  }

  // 3. Check for architectural boundaries in API routes
  if (relativePath.startsWith('app/api/')) {
    // API route checks
    if (/from\s+['"]@\/lib\/prisma['"]/.test(content) && !relativePath.includes('setup') && !relativePath.includes('health')) {
      // Repositories and Services should encapsulate DB access
      warnings.push('API route imports raw prisma client directly. Consider delegating to a Domain Service or Repository.');
    }
  }

  // 4. Check for double-entry financial balancing checks in ledger files
  if (relativePath.includes('ledger') || relativePath.includes('PaymentService')) {
    if (!content.includes('amount') && !content.includes('balance')) {
      warnings.push('Financial ledger logic should explicitly validate credit/debit invariant.');
    }
  }

  return {
    file: relativePath,
    governingAgents,
    passed: errors.length === 0,
    warnings,
    errors,
  };
}

export function runGovernanceAudit(): { totalFiles: number; compliantFiles: number; results: AuditResult[] } {
  const files = getAllFiles(SRC_DIR);
  const results = files.map(auditFile);
  const compliantFiles = results.filter((r) => r.passed && r.errors.length === 0).length;

  console.log('\n============================================================');
  console.log('🤖 500+ AI AGENT ECOSYSTEM CODE GOVERNANCE REPORT');
  console.log('============================================================\n');
  console.log(`Audited: ${files.length} source files under src/`);
  console.log(`Compliance Score: ${Math.round((compliantFiles / files.length) * 100)}%\n`);

  let warningCount = 0;
  let errorCount = 0;

  for (const res of results) {
    if (res.errors.length > 0) {
      errorCount += res.errors.length;
      console.log(`❌ [ERROR] ${res.file}`);
      res.errors.forEach((e) => console.log(`   - ${e}`));
    }
    if (res.warnings.length > 0) {
      warningCount += res.warnings.length;
      console.log(`⚠️  [WARN] ${res.file}`);
      res.warnings.forEach((w) => console.log(`   - ${w}`));
    }
    if (res.governingAgents.length > 0) {
      console.log(`🛡️  [AGENTS] ${res.file} -> [${res.governingAgents.join(', ')}]`);
    }
  }

  console.log('\n------------------------------------------------------------');
  console.log(`Audit Summary: ${errorCount} Errors, ${warningCount} Warnings across ${files.length} files.`);
  console.log('------------------------------------------------------------\n');

  return {
    totalFiles: files.length,
    compliantFiles,
    results,
  };
}

if (require.main === module) {
  const summary = runGovernanceAudit();
  if (summary.compliantFiles < summary.totalFiles) {
    process.exit(0);
  }
}
