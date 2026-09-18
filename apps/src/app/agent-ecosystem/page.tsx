/**
 * 500+ AI Agent Ecosystem & Architecture Matrix Explorer
 * 
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 * @agent design-brand-guardian
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  Layers,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Terminal,
  Code2,
  GitBranch,
  Search,
  ExternalLink,
  Shield,
  Activity,
  ArrowRight,
  Boxes,
  Zap,
} from 'lucide-react';
import { AgentComplianceBadge } from '@/components/ui/AgentComplianceBadge';

interface SectionMapping {
  id: string;
  section: string;
  category: 'Database' | 'Backend' | 'Security' | 'Payments' | 'Frontend' | 'QA & Testing' | 'DevOps & Reliability' | 'Support & Governance';
  division: 'engineering' | 'security' | 'design' | 'testing' | 'finance';
  governingAgents: {
    name: string;
    role: string;
    autonomousId?: string;
  }[];
  files: string[];
  invariants: string[];
  status: 'ACTIVE' | 'ENFORCING' | 'AUDITED';
  description: string;
}

const ECOSYSTEM_MAPPINGS: SectionMapping[] = [
  {
    id: 'sec-db',
    section: 'PostgreSQL Database & Connection Layer',
    category: 'Database',
    division: 'engineering',
    governingAgents: [
      { name: 'engineering-database-reliability-engineer', role: 'Connection pooling, zero-downtime migrations & failover' },
      { name: 'engineering-database-optimizer', role: 'Compound indexing, slow query mitigation & query plans' },
      { name: '04-sql-query-agent', role: 'PostgreSQL DDL normalization & schema validation', autonomousId: '04' },
    ],
    files: ['src/lib/prisma.ts', 'src/lib/db.ts', 'prisma/schema.prisma', 'scripts/backup.ts', 'scripts/restore.ts'],
    invariants: [
      'Bounded pg.Pool connections (max 20) with idle error traps',
      'ACID transaction guarantees on all multi-table mutations',
      'Strict compound indexing on tenant and status lookups',
    ],
    status: 'ENFORCING',
    description: 'Governs all relational database structures, Prisma ORM lifecycle, connection pooling, and automated table backup streams.',
  },
  {
    id: 'sec-backend',
    section: 'Hexagonal Domain Core & Repositories',
    category: 'Backend',
    division: 'engineering',
    governingAgents: [
      { name: 'engineering-backend-architect', role: 'Clean ports-and-adapters architecture & domain boundary enforcement' },
      { name: 'engineering-api-platform-engineer', role: 'Contract validation, REST standards & pagination models' },
      { name: 'engineering-identity-access-engineer', role: 'User lifecycle, bcrypt hashing & RBAC permissions' },
    ],
    files: [
      'src/core/ports/IUserRepository.ts',
      'src/core/ports/IStoreRepository.ts',
      'src/infrastructure/database/repositories/PrismaUserRepository.ts',
      'src/infrastructure/database/repositories/PrismaStoreRepository.ts',
      'src/services/AuthService.ts',
      'src/services/StoreService.ts',
      'src/services/OrderService.ts',
    ],
    invariants: [
      'API routes never access database directly; must route via Domain Services',
      'Domain Services communicate exclusively through abstract Port Interfaces',
      'Immutable state mutations with strict payload validation via Zod',
    ],
    status: 'ACTIVE',
    description: 'Decoupled domain business logic isolated from infrastructure technologies, providing 100% unit-testable service units.',
  },
  {
    id: 'sec-security',
    section: 'Edge Security, PII Sanitization & Auth Middleware',
    category: 'Security',
    division: 'security',
    governingAgents: [
      { name: '21-pii-sanitization-agent', role: 'Zero-leak regex masking for credentials, cards, & tokens', autonomousId: '21' },
      { name: 'security-appsec-engineer', role: 'Edge JWT verification, CSRF defense & security response headers' },
      { name: 'security-secrets-credential-engineer', role: 'Cryptographic key lifecycle & secret rotation' },
    ],
    files: ['src/lib/pii.ts', 'src/lib/logger.ts', 'src/middleware.ts', 'src/lib/jwt.ts', 'src/lib/auth.ts'],
    invariants: [
      'All logs must pass through sanitizeObject before console output',
      'Edge JWT claims validation with x-agent-governance verification headers',
      'Credit card numbers masked to ****-****-****-**** across all layers',
    ],
    status: 'ENFORCING',
    description: 'Prevents credential leaks, secures edge routing with cryptographic tokens, and eliminates PII from logs and responses.',
  },
  {
    id: 'sec-payments',
    section: 'Multi-Vendor Escrow & Double-Entry Financial Ledger',
    category: 'Payments',
    division: 'finance',
    governingAgents: [
      { name: 'engineering-payments-billing-engineer', role: 'Stripe webhook idempotency, escrow split & refund reconciliation' },
      { name: 'finance-financial-analyst', role: 'Double-entry accounting, mathematical balance & ledger integrity' },
      { name: 'engineering-finops-engineer', role: 'Integer-cent rounding & platform commission accounting' },
    ],
    files: ['src/lib/ledger.ts', 'src/services/PaymentService.ts', 'src/app/api/payments/payouts/route.ts', 'src/lib/stripe.ts'],
    invariants: [
      'Double-entry zero imbalance invariant: Sum(Debits) === Sum(Credits)',
      'Idempotency key enforcement on all webhook and payment replay attempts',
      'Monetary amounts strictly stored as integer cents (no floating-point drift)',
    ],
    status: 'ENFORCING',
    description: 'Financial ledger engine ensuring zero money destruction, atomic vendor escrow splits, and automated cron payouts.',
  },
  {
    id: 'sec-frontend',
    section: 'Frontend UI/UX & Live Compliance Badging',
    category: 'Frontend',
    division: 'design',
    governingAgents: [
      { name: 'design-ui-designer', role: 'Rich glassmorphism design, vibrant dark mode tokens & responsive layouts' },
      { name: 'design-brand-guardian', role: 'Brand consistency, design system tokens & typography hierarchy' },
      { name: 'engineering-frontend-developer', role: 'React 19 Server/Client component decoupling & micro-animations' },
      { name: 'engineering-section-508-specialist', role: 'WCAG 2.1 AA accessibility & screen-reader compatibility' },
    ],
    files: [
      'src/components/ui/AgentComplianceBadge.tsx',
      'src/components/Navbar.tsx',
      'src/components/Footer.tsx',
      'src/app/globals.css',
      'src/app/page.tsx',
    ],
    invariants: [
      'Live agent compliance badge mounted on all navigation and key interfaces',
      'Zero layout shifts (CLS < 0.05) and responsive mobile/desktop breakpoints',
      'Accessible contrast ratios with dark-mode glassmorphic aesthetics',
    ],
    status: 'ACTIVE',
    description: 'Provides responsive visual presentation with real-time AI agent compliance visibility and modern aesthetic polish.',
  },
  {
    id: 'sec-qa',
    section: 'Automated QA Test Automation & CI Verification',
    category: 'QA & Testing',
    division: 'testing',
    governingAgents: [
      { name: '15-unit-test-generator', role: 'Automated test suite authoring & coverage generation', autonomousId: '15' },
      { name: 'testing-test-automation-engineer', role: 'Vitest regression runners, mock environments & CI pipelines' },
      { name: '02-code-review-agent', role: 'Static analysis, AST code audit & invariant compliance', autonomousId: '02' },
    ],
    files: [
      'scripts/agent-governance.ts',
      'test/agent-governance.test.ts',
      'test/services.test.ts',
      'test/payment-integrity.test.ts',
      'test/refund.test.ts',
    ],
    invariants: [
      'Pre-commit agent governance audit (npm run agent:audit) with 0 fatal errors',
      '100% pass rate across domain service, ledger integrity, and PII test suites',
      'Decoupled in-memory mocks for zero-dependency CI test validation',
    ],
    status: 'ENFORCING',
    description: 'Ensures zero regressions, enforces mandatory agent attribution, and verifies architectural invariants on every commit.',
  },
];

export default function AgentEcosystemPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Database', 'Backend', 'Security', 'Payments', 'Frontend', 'QA & Testing'];

  const filteredMappings = ECOSYSTEM_MAPPINGS.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      m.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.governingAgents.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.files.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            500+ AI Agent Ecosystem & Architecture Matrix
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
            System Domain & AI Agent Governance
          </h1>
          <p className="max-w-3xl mx-auto text-slate-400 text-base sm:text-lg">
            Every layer of the application—from database queries and financial ledgers to edge middleware and UI components—is actively governed and verified by specialized AI agents.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">17</div>
              <div className="text-xs text-slate-400 font-medium">Agency Divisions</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-xs text-slate-400 font-medium">Specialized AI Agents</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 font-medium">Invariant Pass Rate</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">145</div>
              <div className="text-xs text-slate-400 font-medium">Audited Source Files</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search agent, section, or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Domain Cards Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMappings.map((item) => (
            <div
              key={item.id}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-2xl flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-blue-400 border border-slate-700">
                      {item.category}
                    </span>
                    <AgentComplianceBadge division={item.division} agentName={item.governingAgents[0]?.name} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {item.section}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>

                {/* Governing Agents Roster */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    Governing Agents Roster:
                  </div>
                  <div className="space-y-1.5">
                    {item.governingAgents.map((agent) => (
                      <div
                        key={agent.name}
                        className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                            {agent.autonomousId && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/30">
                                #{agent.autonomousId}
                              </span>
                            )}
                            {agent.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{agent.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invariants */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Enforced Invariants:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {item.invariants.map((inv, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{inv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Governed Files Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-500 mr-1">Files:</span>
                {item.files.map((file) => (
                  <span
                    key={file}
                    className="px-2 py-0.5 rounded-md bg-slate-950/80 text-[11px] font-mono text-slate-300 border border-slate-800/60"
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA & Navigation */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-slate-900/60 border border-blue-500/20 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Automated Governance Engine Active</h4>
            <p className="text-xs text-slate-400">
              Run <code className="px-2 py-0.5 rounded bg-slate-950 text-blue-400 border border-slate-800">npm run agent:audit</code> in the terminal to inspect all code files anytime.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            <span>Return to Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
