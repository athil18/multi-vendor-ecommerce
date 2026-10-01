---
name: ecommerce
description: >-
  Specialized domain knowledge and procedural runbooks for the Nexus Multi-Vendor Marketplace platform.
  Use this skill whenever developing, debugging, testing, or deploying e-commerce features, including
  vendor management, Stripe Connect escrow splits, catalog and cart workflows, Prisma schema migrations,
  BullMQ queue workers, and Lighthouse/WCAG optimization.
---

# 🛒 Nexus Multi-Vendor E-Commerce Platform Skill

This skill embeds the complete operational procedures, architectural patterns, domain rules, and security guidelines synthesized from the comprehensive documentation suite of the Nexus Multi-Vendor Marketplace.

---

## 🏛️ 1. Architecture & Technology Stack

The platform is designed as a **high-concurrency monolithic Next.js application** utilizing clean architectural boundaries:

* **Framework:** Next.js 16.2.9 (App Router, Server Components, Streaming SSR)
* **Frontend:** React 19.2.4, Tailwind CSS v4, Framer Motion 12, Zustand 5 (cart state)
* **Database & ORM:** PostgreSQL 16 + Prisma ORM 7.9 (`prisma/schema.prisma`)
* **Payments & Escrow:** Stripe Connect Custom Accounts + Payment Intents with automated application fees and escrow transfers
* **Asynchronous Queue:** BullMQ 5.78 + Redis 7 (`src/lib/queue/`)
* **File Storage:** AWS S3 SDK v3 presigned URLs (`/api/upload`)
* **Monitoring & Observability:** Sentry 10.58 + Distributed OpenTelemetry tracing

---

## 💳 2. Multi-Vendor Escrow Payment Pipeline

Nexus uses an automated split-payment escrow architecture ensuring buyer protection and merchant trust:

1. **Checkout Initiation:** Customer places an order containing items across multiple vendors.
2. **Intent Creation:** API creates a Stripe `PaymentIntent` with escrow hold status (`status: PENDING_ESCROW`).
3. **Webhook Verification:** Upon `payment_intent.succeeded` webhook reception, cryptographic signature is verified (`STRIPE_WEBHOOK_SECRET`).
4. **Escrow Vaulting:** Funds are secured in escrow; order state moves to `ESCROW_LOCKED`.
5. **Split Settlement & Delivery:**
   * Platform calculates commission cut (default 10% platform take-rate).
   * Vendor earnings are calculated per order item.
   * On delivery confirmation or fulfillment expiry, BullMQ triggers Stripe Transfers to each vendor's connected account (`stripeAccountId`).
   * Order state moves to `SETTLED`.

---

## 🔐 3. Authentication & RBAC Governance

* **Dual-Tier Token Architecture:**
  * **Access Token:** Short-lived (15 minutes) JWT transmitted via `Authorization: Bearer <token>`.
  * **Refresh Token:** Long-lived (7 days) rotating token stored in a secure cookie (`HttpOnly`, `Secure`, `SameSite=Strict`).
* **Roles:**
  * `customer`: Standard consumer (order history, reviews, cart, addresses).
  * `seller`: Merchant tenant (store dashboard, catalog management, escrow payouts).
  * `admin`: Platform governance (vendor KYC approval, dispute arbitration, global analytics).
* **Guards:** Next.js edge middleware (`src/middleware.ts`) and API route wrappers enforce role permissions.

---

## 🗄️ 4. Database Operations & Schema Integrity

* **Schema Location:** [`prisma/schema.prisma`](file:///c:/Users/Lenovo/Desktop/Aathil/prisma/schema.prisma)
* **Key Commands:**
  * Generate client: `npm run db:generate`
  * Run migrations: `npm run db:migrate`
  * Seed database: `npm run seed:run`
  * Backup database: `npm run db:backup`
  * Restore database: `npm run db:restore`
* **Relational Rules:**
  * Soft-delete for products and stores (`deletedAt` timestamp).
  * Unique compound indexes on multi-tenant identifiers (`storeId`, `slug`, `sku`).
  * Double-entry ledger representation for financial transactions.

---

## ⚡ 5. Background Jobs & Worker Execution

* **Worker File:** [`src/lib/queue/worker.ts`](file:///c:/Users/Lenovo/Desktop/Aathil/src/lib/queue/worker.ts)
* **Queues Managed:**
  * `order-processing`: Inventory decrementing, invoice generation, escrow state transitions.
  * `notifications`: Transactional order confirmations, shipping updates, seller notifications.
  * `payouts`: Scheduled Stripe Connect vendor transfers.
* **Worker Execution:**
  ```bash
  npm run worker
  ```
* **Failure Handling:** Exponential backoff with Redis dead-letter queues.

---

## 🧪 6. Testing Strategy & Pyramid Runbook

Nexus enforces rigorous quality assurance across all layers:

| Layer | Runner / Tool | Command | Scope |
| :--- | :--- | :--- | :--- |
| **Unit (Level 1)** | Vitest | `npm run test:unit` | Pure functions, calculation logic, currency math, Zod schemas |
| **Component (Level 2)** | Vitest + React Testing Library | `npm run test:component` | Storefront UI components, form inputs, modals, cart drawer |
| **Backend Integration** | Vitest (`vitest.backend.config.ts`) | `npm run test:backend` | API route handlers, Prisma queries, auth endpoints |
| **End-to-End (Level 3)** | Playwright | `npm run test:e2e` | Complete shopper checkout journey, vendor dashboard, admin portal |
| **Complete Pyramid** | Orchestrator | `npm run test:pyramid` | Full suite execution and test coverage validation |

---

## 🎯 7. Performance & Accessibility Standards

* **Lighthouse Target:** 98+ Performance, 100 Accessibility, 100 SEO, 96+ Best Practices.
* **Core Web Vitals:**
  * Largest Contentful Paint (LCP) < 1.0s (utilizing streaming server components).
  * Total Blocking Time (TBT) = 0ms.
  * Cumulative Layout Shift (CLS) < 0.01.
* **Accessibility:** WCAG 2.1 AA compliance, 4.5:1 text contrast ratio, keyboard focus traps on modals, ARIA role landmarks.

---

## 📚 8. Documentation Knowledge Map

For deep dives into specific system domains, reference the following repository specification files:

* **Architecture & ADRs:**
  * [`docs/ARCHITECTURE.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/ARCHITECTURE.md) & [`docs/ADR.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/ADR.md)
  * [`docs/architecture-audit/FINAL-ARCHITECTURE-REPORT.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/architecture-audit/FINAL-ARCHITECTURE-REPORT.md)
* **API Specifications:** [`docs/API_DOCUMENTATION.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/API_DOCUMENTATION.md)
* **Database & Entities:** [`docs/schema.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/schema.md) & [`docs/DATABASE_DESIGN.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/DATABASE_DESIGN.md)
* **Security & Auth:** [`docs/SECURITY_GUIDELINES.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/SECURITY_GUIDELINES.md)
* **DevOps & Rollout:** [`DEPLOYMENT.md`](file:///c:/Users/Lenovo/Desktop/Aathil/DEPLOYMENT.md) & [`docs/DEPLOYMENT_GUIDE.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/DEPLOYMENT_GUIDE.md)
* **Testing Guidelines:** [`docs/TESTING_STRATEGY.md`](file:///c:/Users/Lenovo/Desktop/Aathil/docs/TESTING_STRATEGY.md)

---

## 🛠️ 9. Integrated Agent Skills & Checklists

This domain skill operates alongside **Addy Osmani's Agent Skills suite** installed in `.agents/`:

* **Requirement & Task Definition:**
  * Spec-driven workflow: [`spec-driven-development`](../spec-driven-development/SKILL.md)
  * Atomic task breakdown: [`planning-and-task-breakdown`](../planning-and-task-breakdown/SKILL.md)
* **Implementation & Testing:**
  * Incremental implementation: [`incremental-implementation`](../incremental-implementation/SKILL.md)
  * Test-driven development (TDD): [`test-driven-development`](../test-driven-development/SKILL.md)
  * Testing patterns guide: [`../../references/testing-patterns.md`](../../references/testing-patterns.md)
* **Quality & Verification Gates:**
  * Definition of Done: [`../../references/definition-of-done.md`](../../references/definition-of-done.md)
  * E-Commerce domain checklist: [`../../references/ecommerce-checklist.md`](../../references/ecommerce-checklist.md)
  * Security checklist: [`../../references/security-checklist.md`](../../references/security-checklist.md)
  * Performance checklist: [`../../references/performance-checklist.md`](../../references/performance-checklist.md)
  * Five-axis code review: [`code-review-and-quality`](../code-review-and-quality/SKILL.md)
* **Pre-Launch & Deployment:**
  * Launch verification: [`shipping-and-launch`](../shipping-and-launch/SKILL.md)
  * Database migration runbook: [`deprecation-and-migration`](../deprecation-and-migration/SKILL.md)

