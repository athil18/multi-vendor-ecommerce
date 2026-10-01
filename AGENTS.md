# AGENTS.md

Guidance for AI coding agents working on the **Nexus Multi-Vendor E-Commerce Platform**.

This repository is configured with **[Addy Osmani's Agent Skills](https://github.com/addyosmani/agent-skills)** combined with the native **Nexus E-Commerce Skill (`ecommerce`)**.

---

## 🏛️ Repository & Tech Stack Overview

- **Platform:** Nexus Multi-Vendor Marketplace
- **Framework:** Next.js 16.2.9 (App Router, Server Components, Streaming SSR)
- **Frontend:** React 19.2.4, Tailwind CSS v4, Framer Motion 12, Zustand 5 (cart state)
- **Database & ORM:** PostgreSQL 16 + Prisma ORM 7.9.1 (`prisma/schema.prisma`)
- **Payments & Escrow:** Stripe Connect Custom Accounts + Payment Intents with automated platform application fees and escrow transfers
- **Asynchronous Queue:** BullMQ 5.78 + Redis / Upstash (`src/lib/queue/`)
- **File Storage:** AWS S3 SDK v3 presigned URLs (`/api/upload`)
- **Monitoring & Observability:** Sentry 10.58 + Distributed OpenTelemetry tracing
- **Testing:** Vitest 4 (Unit & Component), Playwright 1.61 (E2E), Testing Pyramid Orchestrator

---

## 🎯 Skill-Driven Execution Model

Always work with the appropriate engineering skills located under `.agents/skills/`.

### 1. Development Lifecycle Mapping

Follow the 6-phase engineering lifecycle for every task:

```
  DEFINE             PLAN              BUILD             VERIFY            REVIEW            SHIP
 ┌────────┐        ┌────────┐        ┌────────┐        ┌────────┐        ┌────────┐        ┌────────┐
 │  Spec  │ ────▶  │  Plan  │ ────▶  │ Code & │ ────▶  │ Pyram. │ ────▶  │  Five  │ ────▶  │ Deploy │
 │  Reqs  │        │ Tasks  │        │  TDD   │        │ Tests  │        │  Axes  │        │ Gate   │
 └────────┘        └────────┘        └────────┘        └────────┘        └────────┘        └────────┘
   /spec             /plan             /build            /test            /review           /ship
```

- **DEFINE:** `spec-driven-development` + `ecommerce`
  - Write or verify the specification before code.
  - Define user roles (`customer`, `seller`, `admin`), escrow states, and data models.
- **PLAN:** `planning-and-task-breakdown`
  - Break work into small, atomic tasks with clear acceptance criteria.
  - Sequence database migrations, API endpoints, background jobs, and UI components.
- **BUILD:** `incremental-implementation` + `test-driven-development`
  - Implement one slice at a time.
  - Write tests first (red-green-refactor) for calculations, cart logic, and escrow states.
- **VERIFY:** `debugging-and-error-recovery` + `browser-testing-with-devtools`
  - Run tests across the test pyramid.
  - Verify UI behavior in the browser without regressions.
- **REVIEW:** `code-review-and-quality` (Senior Code Reviewer persona)
  - Perform five-axis review: Correctness, Readability, Architecture, Security, Performance.
  - Enforce the Definition of Done (`.agents/references/definition-of-done.md`).
- **SHIP:** `shipping-and-launch`
  - Run database migration checks, queue worker checks, and the pre-launch checklist.

---

## 🧭 Intent → Skill Mapping for Nexus E-Commerce

| Task Intent | Primary Skills to Activate | Project-Specific Context |
| :--- | :--- | :--- |
| **Storefront UI & Pages** | `frontend-ui-engineering`<br>`performance-optimization` | Server Components, responsive design, Tailwind v4, zero CLS, Framer Motion |
| **API & Escrow Endpoints** | `api-and-interface-design`<br>`security-and-hardening`<br>`ecommerce` | Stripe Connect API, webhook signature validation, Zod request schemas, JWT auth |
| **Database & Schema Updates** | `deprecation-and-migration`<br>`ecommerce` | Prisma schema (`prisma/schema.prisma`), `npm run db:generate`, `npm run db:migrate` |
| **Testing & Verification** | `test-driven-development`<br>`ecommerce` | Vitest, React Testing Library, Playwright (Unit, Component, Backend, E2E) |
| **Code Review & Quality** | `code-review-and-quality` | Review against `.agents/references/definition-of-done.md` and escrow invariants |
| **Security Auditing** | `security-and-hardening` | Review against `.agents/references/security-checklist.md` and `.agents/references/ecommerce-checklist.md` |
| **Performance & SEO** | `performance-optimization`<br>`browser-testing-with-devtools` | Core Web Vitals (LCP < 1.0s, TBT = 0ms, CLS < 0.01), Lighthouse 98+, SEO audit |
| **Background Jobs & Queues**| `observability-and-instrumentation`<br>`ecommerce` | BullMQ workers (`src/lib/queue/worker.ts`), Redis connection handling |
| **Launch & Showcase Video**| `brag`<br>`brag-slim` | Short, high-polish project launch videos, motion graphics, and share copy (`latent-spaces/brag`) |

---

## 🛡️ Critical E-Commerce Invariants & Rules

1. **Payment & Escrow Safety:**
   - Never finalize an order or release funds without cryptographic verification of the Stripe webhook signature (`STRIPE_WEBHOOK_SECRET`).
   - Platform take-rate and vendor net earnings must use integer cents (or exact decimal math) to prevent floating-point rounding errors.
   - Escrow funds must remain locked (`ESCROW_LOCKED`) until explicit delivery confirmation or payout timeout.

2. **Data & Multi-Tenant Isolation:**
   - Store owners (`seller`) can only read and mutate records matching their `storeId`.
   - Never hard-delete products or stores; use soft-delete (`deletedAt: new Date()`).
   - Sensitive columns (password hashes, Stripe tokens, refresh tokens) must never be returned in API responses.

3. **Authentication & Token Governance:**
   - Access tokens are short-lived (15 minutes).
   - Refresh tokens are long-lived (7 days) and stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
   - RBAC roles (`customer`, `seller`, `admin`) are strictly enforced via Next.js middleware and route guards.

---

## 🧪 Testing Pyramid Commands

Execute tests using the repository's established test scripts:

```bash
npm run test:unit        # Level 1: Pure functions, currency math, Zod schemas, cart logic
npm run test:component   # Level 2: Storefront components, modals, cart drawer
npm run test:backend     # Integration: API route handlers, Prisma queries, auth endpoints
npm run test:e2e         # Level 3: Full Playwright browser checkout journey & admin flows
npm run test:pyramid     # Complete Pyramid: Runs all test levels with coverage validation
```

---

## 📦 Database & Worker Commands

```bash
npm run db:generate      # Re-generate Prisma Client
npm run db:migrate       # Apply database migrations
npm run db:backup        # Create automated database snapshot
npm run db:restore       # Restore database snapshot
npm run seed:run         # Populate mock database seed data
npm run worker           # Launch BullMQ background queue worker
npm run seo:audit        # Run SEO & metadata compliance audit
```

---

## 👥 Personas & Reference Checklists

The following assets are installed and active in `.agents/`:

- **Specialist Personas:**
  - `.agents/agents/code-reviewer.md` — Five-axis senior code reviewer
  - `.agents/agents/security-auditor.md` — AppSec specialist (auth, data protection, OWASP)
  - `.agents/agents/test-engineer.md` — Test pyramid and test coverage specialist
  - `.agents/agents/web-performance-auditor.md` — Web Vitals and Core Web Vitals auditor
- **Engineering Checklists:**
  - `.agents/references/ecommerce-checklist.md` — Nexus multi-vendor domain verification checklist
  - `.agents/references/definition-of-done.md` — Project-wide quality gate
  - `.agents/references/security-checklist.md` — OWASP Top 10 & API security checklist
  - `.agents/references/performance-checklist.md` — Web performance and caching checklist
  - `.agents/references/accessibility-checklist.md` — WCAG 2.1 AA checklist
  - `.agents/references/observability-checklist.md` — Logging, metrics, and tracing checklist
  - `.agents/references/testing-patterns.md` — JS/TS testing patterns & best practices
