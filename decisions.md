# ARCHITECTURAL DECISIONS REGISTER: NEXUS MULTI-VENDOR PLATFORM

This document records the foundational architectural, security, database, API, and design decisions for the Nexus Multi-Vendor E-Commerce Platform.

---

## 1. Core Framework & Architecture: Next.js 16 (App Router) + React 19 Monorepo

- **Decision:** Build the entire marketplace storefront, admin portal, vendor dashboard, and REST API routes within a single Next.js 16 (App Router) full-stack TypeScript monorepo.
- **Reason:** Provides unified type safety across UI and API, zero-latency server component streaming, and eliminates the deployment overhead and network hops of running disconnected frontend and backend services. Guarantees 0ms TBT and sub-second LCP.
- **Date/Context:** September 28, 2026 (PRMPT-001) / Re-certified October 7, 2026.
- **Constraints:**
  - Must adhere to Next.js App Router server/client component boundaries.
  - Turbopack build compatibility must be preserved.
  - No Python/FastAPI rewrite for core marketplace routes; Python is reserved exclusively for external AI/ML microservices.
- **What Must Not Be Changed Without Review:**
  - Do not dismantle App Router in favor of legacy Pages Router or disconnected external frameworks.
  - Do not introduce synchronous heavy compute on the main Node.js event loop.

---

## 2. Edge Security Middleware as Primary Gatekeeper

- **Decision:** Enforce pre-routing security checks, rate limiting, URI length constraints, and payload size bounds at the Next.js Edge Middleware layer before request bodies are buffered into Node.js server heap.
- **Reason:** Prevents DoS, memory starvation, and slowloris-style buffer exhaustion attacks by rejecting malformed or oversized requests early in V8 isolates.
- **Date/Context:** October 7, 2026 (Resource Exhaustion & Oversized Request Hardening).
- **Constraints:**
  - Must execute within Next.js Edge runtime (Web Crypto API only; no Node-native modules like `fs` or `crypto`).
  - Standard JSON API payloads are strictly capped at 1MB (`1,048,576 bytes`).
  - File upload endpoints are capped at 10MB at Edge, 5MB at local route handler.
  - URI length is capped at 2,048 characters (`HTTP 414`).
- **What Must Not Be Changed Without Review:**
  - `MAX_URL_LENGTH` (2,048), `MAX_JSON_BODY_BYTES` (1MB), and `MAX_UPLOAD_BODY_BYTES` (10MB) in `src/middleware.ts`.
  - Edge JWT verification algorithms (HS256 using Web Crypto).

---

## 3. Database Architecture & Double-Entry Financial Ledger Invariance

- **Decision:** Utilize PostgreSQL 16 managed via Prisma ORM 7.9 with an ACID-compliant double-entry financial ledger for all order payments, vendor escrow holds, and payout splits.
- **Reason:** Multi-vendor marketplaces handle complex split payments and dispute holds. Double-entry ledger invariance (`debit === credit`) prevents silent fund creation, calculation drift, and race condition anomalies during merchant settlements.
- **Date/Context:** September 30, 2026 (PRMPT-002).
- **Constraints:**
  - Must maintain connection pooling via `@prisma/adapter-pg`.
  - All journal entries must post equal debits and credits within an isolated database transaction.
  - Stripe Connect Escrow holds must map 1:1 to Journal transactions.
- **What Must Not Be Changed Without Review:**
  - Invariance assertion (`debit === credit`) in `src/lib/ledger.ts`.
  - Relation schemas between `Store`, `Order`, `OrderItem`, and `FinancialLedger` in `prisma/schema.prisma`.

---

## 4. Cryptographic Standards & Password Hashing

- **Decision:** Enforce Argon2id as the primary password hashing algorithm, retaining bcrypt solely as an automatic upgrade fallback for legacy accounts.
- **Reason:** Meets modern OWASP and 80/20 Security directives, defending against GPU-accelerated cracking while adhering to strict memory/CPU bounds.
- **Date/Context:** October 2026 (Cryptographic Security Audit).
- **Constraints:**
  - Implementation in `src/lib/password.ts` must use numeric literals (e.g., `algorithm: 2`) to remain compatible with TypeScript `isolatedModules` compilation (`TS2748`).
  - Maximum raw password input capped at 128 characters to prevent bcrypt DoS.
- **What Must Not Be Changed Without Review:**
  - Argon2id parameter bounds (memory cost, iterations, parallelism).
  - Password length boundaries in `src/lib/schemas/auth.ts`.

---

## 5. Background Asynchronous Processing via BullMQ and Redis

- **Decision:** Offload all heavy, non-blocking tasks (transactional emails via Resend, Stripe webhook settlement routines, order notifications) to distributed BullMQ workers powered by Upstash Redis.
- **Reason:** Keeps HTTP route response times under 50ms and prevents third-party API latency (e.g., email providers or payment gateways) from blocking customer checkout or browsing.
- **Date/Context:** September 2026 / Hardened October 2026.
- **Constraints:**
  - Redis connection must use resilient singleton pattern (`src/lib/queue/redis.ts`) with retry backoff to survive transient network disconnections.
- **What Must Not Be Changed Without Review:**
  - Queue naming conventions and retry backoff policies.
  - Do not move transactional email sending directly into HTTP request handlers.

---

## 6. External Cloud & Telemetry Architecture (AWS + PostHog)

- **Decision:** Integrate AWS Cognito for managed enterprise authentication and MFA, AWS ECS/ECR for scalable container deployment, and PostHog for privacy-respecting product analytics.
- **Reason:** Reduces maintenance overhead of custom auth primitives, prevents security drift, and gives real-time product instrumentation without locking the codebase into proprietary frontend cloud vendors.
- **Date/Context:** October 7, 2026 (Vibe Coding & Cloud Architecture Alignment).
- **Constraints:**
  - All credentials (AWS Access Keys, Secret Keys, Cognito IDs, PostHog tokens) must reside exclusively in `.env` (gitignored).
  - Client-exposed keys must be strictly prefixed with `NEXT_PUBLIC_`.
- **What Must Not Be Changed Without Review:**
  - `.gitignore` rules shielding `.env` from repository commits.
  - Client-side data masking on PostHog events to ensure zero PII leakage.

---

## 7. Production Design System & Anti-Vibe Coding Standard

- **Decision:** Permanently enforce crisp editorial minimalism, solid high-contrast surfaces (`bg-white dark:bg-surface-900`), and architectural button geometry (`rounded-lg`, `rounded-md`), strictly prohibiting vibe-coding anti-patterns across the storefront.
- **Reason:** Vibe-coding templates (purple→blue gradients, blurry glassmorphism, pill buttons, fake review/ticker counters, badge-above-headline pills) damage consumer trust, introduce GPU compositor lag, and degrade readability. Solid surfaces guarantee WCAG 2.1 AA compliance and 0ms TBT.
- **Date/Context:** October 7, 2026 (Anti-Vibe Coding Directive & 500+ AI Agent Design Directorate).
- **Constraints:**
  - Zero purple→blue/cyan gradients or `bg-clip-text` gradient typography.
  - Zero `backdrop-filter: blur` or `.glass-*` utility classes. All cards must use opaque surfaces (`#FFFFFF` in light mode, `#0F172A` in dark mode) with clean 1px borders.
  - Zero `rounded-full` buttons. Standard buttons must use `rounded-lg` (8px) or `rounded-md` (6px).
  - Zero simulated activity tickers or fake buyer event generators. All events must reflect real database orders.
  - Zero badge-above-headline floating pill layouts. Headings lead directly or use integrated typographic kickers.
  - Retain structured system typography fallbacks with tabular figures (`.font-tabular`).
- **What Must Not Be Changed Without Review:**
  - Design tokens in `src/app/globals.css`.
  - Solid card styling in `src/components/ui/Card.tsx`, `Button.tsx`, and `Badge.tsx`.
  - Deactivated status of `LiveBuyerActivityTicker.tsx`.

---

## 8. Ponytail Lean Senior Engineering Standard

- **Decision:** Permanently enforce Dietrich Gebert's Ponytail Lean Senior Engineering standards across all pull requests, code edits, and refactoring efforts. Take the shortest working diff that fully solves the problem; delete dead code, unused parameters, and speculative abstractions; prefer native Web APIs and house UI components over foreign packages; and never cut Zod validation, PCI-DSS compliance, Argon2id/bcrypt hashing, Stripe HMAC signatures, or WCAG 2.1 AA accessibility.
- **Reason:** Reduces maintenance overhead, prevents dependency supply-chain vulnerabilities, minimizes JavaScript bundle bloat, and preserves high readability for human and AI collaborators.
- **Date/Context:** October 9, 2026 (Ponytail Lean Senior Dev Ingestion & Codebase Refactoring).
- **Constraints:**
  - Shortest working diff: Do not introduce unnecessary code changes.
  - Native over heavy: Prefer standard library (`URLSearchParams`, native `FormData`, React Server Components) and house UI components (`@/components/ui`) over adding new external npm packages.
  - Track pragmatic deferrals via standard ledger comments: `// shortcut: <ceiling>, <upgrade path>`.
  - Zero dead code: Remove orphaned imports, unused icons, and dead component files.
- **What Must Not Be Changed Without Review:**
  - Ponytail governance rules in `GEMINI.md` and `.agents/AGENTS.md`.
  - Pruned state of zombie files (`ThemeInit.tsx`, `LiveBuyerActivityTicker.tsx`, `JevAssistantWidget.tsx`).

---

## 9. Andrej Karpathy First-Principles AI Engineering Standard

- **Decision:** Permanently enforce Andrej Karpathy's First-Principles AI Engineering methodology across all autonomous coding tasks: 1) Think Before Coding (state assumptions explicitly, present trade-offs, halt when confused), 2) Simplicity First (write the minimum code that solves the problem, ban speculative abstractions for single-use code), 3) Surgical Changes (touch only what you must, zero drive-by refactoring), and 4) Goal-Driven Execution (transform tasks into verifiable goals, reproduce bugs in tests before fixing, verify invariants with automated test loops).
- **Reason:** Prevents common LLM coding pitfalls such as hallucinated solutions, sprawling unstructured diffs, unverified claims, and premature complexity.
- **Date/Context:** October 9, 2026 (Karpathy First-Principles Ingestion & Rule Codification).
- **Constraints:**
  - All tasks must be grounded in explicit assumptions and goal-driven verification.
  - Zero drive-by formatting, comment editing, or whitespace changes on untouched lines.
  - Every bug fix or security patch must have automated test validation.
- **What Must Not Be Changed Without Review:**
  - Karpathy rule definitions in `.cursor/rules/karpathy-guidelines.mdc`, `CLAUDE.md`, and `.agents/rules/karpathy_first_principles.md`.

---

## 10. Zero Skill Neglect, Repository Governance & Dual-Sync Protocol

- **Decision:** Mandate that for every injected repository, skill, and engineering workflow, there shall be zero silent omissions. Every single session must maintain dual synchronization: updating both canonical executive documentation (`.ai/*.md`, `.ai/*.pdf`) AND persistent engineering tracking registers (`handoff.md`, `decisions.md`, `skill-inventory.md`).
- **Reason:** Prevents prompt-context displacement where agents focus exclusively on reporting deliverables while allowing core repository registers (`handoff.md`, `decisions.md`) to freeze and drift out of sync.
- **Date/Context:** October 9, 2026 (Zero Skill Neglect Directive & Master Forensic Audit).
- **Constraints:**
  - Every session must conclude with verified updates to `handoff.md`, `decisions.md`, and `skill-inventory.md`.
  - Every introduced skill must be classified as `ACTIVE`, `PARTIALLY INTEGRATED`, `BLOCKED (MAPPED)`, or `NOT APPLICABLE` with explicit technical justification.
  - All claims of verification must be backed by exit code 0 test executions.
- **What Must Not Be Changed Without Review:**
  - Persistent tracking invariant in `CONSTRAINTS.md`, `GEMINI.md`, and `handoff.md`.

---

## 11. Reverse Engineering Anything (REA) & Anti-Vibe-Coding Frontend Re-Engineering

- **Decision:** Mandate the formal integration and execution of the Reverse Engineering Anything (REA) framework (`E:\500+_AI_Agent\rea`, `scripts/rea-ecommerce-inspector.ts`) prior to any frontend modifications, and enforce strict Anti-Vibe-Coding principles (zero ad-hoc classes, centralized Swiss grid tokens, WCAG 2.2 AA touch targets, tabular numerics) with an absolute read-only boundary around backend and API layers.
- **Reason:** Guarantees empirical evidence-based discovery of active API endpoints, client security boundaries, and ARIA tokens before changing code. Prevents visual fragmentation and accidental regressions in protected layers.
- **Date/Context:** October 10, 2026 (Master Prompt V2 REA & Anti-Vibe-Coding Re-Engineering).
- **Constraints:**
  - Absolute frontend-only change boundary: Zero modifications to backend controllers, API contracts, Prisma schemas, database migrations, authentication implementations, Stripe Connect escrow split logic, or infrastructure.
  - REA repository (`E:\500+_AI_Agent\rea`) is treated as a protected development tool; no source code or package dependencies in REA are altered.
  - All new/modified UI components must satisfy the 7-dimension acceptance criteria (Visual quality, Functional correctness, Architectural quality, Accessibility, Responsive behavior, Performance, Maintainability).
  - Every run must be verified by `tsc --noEmit`, component tests, unit tests, and `npm run rea:audit`.
- **What Must Not Be Changed Without Review:**
  - Protected status of REA repository and `scripts/rea-ecommerce-inspector.ts`.
  - Frontend-only change boundary policy in `CONSTRAINTS.md` and `GEMINI.md`.



