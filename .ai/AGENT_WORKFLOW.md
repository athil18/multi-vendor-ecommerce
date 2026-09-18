# AI Agent Orchestration Workflow & Engineering Hierarchy

```text
                 LEAD ORCHESTRATOR
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ARCHITECTURE       SECURITY        QA/TESTING
        │
 ┌──────┼────────┬─────────┬──────────┐
 │      │        │         │          │
WEB   BACKEND  DATABASE  PAYMENTS   DEVOPS
 │      │        │         │          │
Next   API     Prisma    Stripe     Docker
Angular Domain PostgreSQL Ledger     Redis
UI     Services Schema   Escrow     BullMQ
 │      │        │         │          │
 └──────┴────────┴─────────┴──────────┘
                         │
                  FINAL CODE REVIEW
                         │
                  REGRESSION TEST
                         │
                    TASK COMPLETE
```

---

## 🏛️ Domain Specialist Mapping & Invariants

### 1. Executive Leadership & Governance
* **Lead Orchestrator:** Antigravity AI Master Orchestrator (`.agents/AGENTS.md`, `ai-agents-orchestrator`).
* **Architecture Lead:** `engineering-backend-architect` (Hexagonal ports, dependency inversion).
* **Security Lead:** `security-appsec-engineer` + `21-pii-sanitization-agent` (OWASP, JWT, PII masking).
* **QA & Verification Lead:** `02-code-review-agent` + `15-unit-test-generator` (AST reviews, Vitest, Playwright).

---

### 2. Functional Engineering Divisions
| Division | Technology Stack | Governing AI Agent | Core Invariants |
|---|---|---|---|
| **Web & UI** | Next.js 16 + Angular 22 | `engineering-frontend-developer`<br>`design-ui-designer` | Dark glassmorphism, responsive drawers, signal-based reactive state. |
| **Backend & Services** | Next.js Route Handlers + Domain Services | `engineering-backend-architect` | Decoupled domain services, strict input validation with Zod. |
| **Database & ORM** | PostgreSQL 16 + Prisma 7 | `engineering-database-reliability-engineer`<br>`04-sql-query-agent` | Atomic ACID transactions, zero-downtime migrations, indexed lookups. |
| **Payments & Escrow** | Stripe Connect + Double-Entry Ledger | `engineering-payments-billing-engineer`<br>`finance-financial-analyst` | Escrow holds, webhook idempotency, balanced journal postings. |
| **DevOps & Queue** | Docker + Redis + BullMQ | `engineering-devops-automator`<br>`engineering-sre` | Isolated background workers, healthcheck endpoints, error alerting. |

---

### 3. Execution Lifecycle Pipeline
1. **Task Ingestion & Scope Definition**: Determine touched files and affected domain boundaries.
2. **Specialist Selection**: Dispatch appropriate domain agents.
3. **Surgical Implementation**: Apply changes while preserving existing working functionality.
4. **Final Code Review**: Automated AST static analysis via `npm run agent:audit`.
5. **Regression & Unit Testing**: Execute Vitest backend test suites (`npx vitest run`).
6. **Task Finalization**: Update `.ai/TASK_STATE.md` with verification proofs.
