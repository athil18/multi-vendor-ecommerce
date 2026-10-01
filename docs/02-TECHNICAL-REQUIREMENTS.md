# 02 — Technical Requirements

> **Document ID:** DOC-02-TECH-REQ  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Lead Software Architect  

---

## 1. Technology Contract Overview

This document serves as the binding technical specification for the Nexus Multi-Vendor Marketplace. No technology, framework, database, or state management library may be introduced, replaced, or deprecated without explicit human architectural review and documented approval.

---

## 2. Frontend Architecture

| Component | Standard Technology | Version | Rationale & Invariants |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.9` | Server Components, Streaming SSR, Edge Middleware, optimized image rendering. |
| **Language** | TypeScript | `5.x` | Strict type checking (`noEmit`), interface contracts, zero unchecked `any`. |
| **UI Library** | React | `19.2.4` | Concurrent rendering, modern hooks, server/client boundary separation. |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | `4.x` | CSS design token architecture (`@theme`), responsive grid, dark mode native. |
| **State Management** | Zustand (Storefront) + LocalStorage | `5.0.x` | Lightweight, decoupled global cart store (`cart-store.ts`) with persist middleware. |
| **Form Management** | React Hook Form + Zod | `7.79.x` / `4.4.x` | Performant un-controlled inputs with runtime schema validation. |
| **Icons** | Lucide React | `1.18.x` | Tree-shakeable SVG icons, accessible labels. |
| **Motion & Polish** | Framer Motion | `12.40.x` | Declarative animations, micro-interactions, layout transitions. |
| **Toast Notifications**| React Hot Toast | `2.6.x` | Non-blocking accessible user feedback. |

---

## 3. Backend & API Architecture

| Component | Standard Technology | Specification Details |
| :--- | :--- | :--- |
| **Runtime** | Node.js | `>=20.17.0 LTS` |
| **API Pattern** | Next.js App Router API Routes | RESTful endpoints under `src/app/api/*`, standardized HTTP verbs (GET, POST, PUT, PATCH, DELETE). |
| **Error Handling** | `withErrorHandler` Wrapper | Centralized error catcher (`src/lib/api-handler.ts`). Produces sanitized production JSON responses; raw stack traces kept in internal logs. |
| **Authentication** | JWT (Stateless) + Bcrypt | 15-minute access token in memory/headers; 7-day refresh token in `HttpOnly`, `Secure`, `SameSite=Strict` cookie. |
| **Credential Storage**| SHA-256 Hashed Refresh Tokens | Raw tokens hashed via `crypto.createHash('sha256')` before database persistence. |
| **Password Security** | BcryptJS (12 Salt Rounds) | Uniform 12 rounds across both registration and password recovery. |
| **Authorization** | Server-Side RBAC | Verified in middleware and route handlers (`getAuthUser`). Roles: `customer`, `seller`, `admin`. |
| **Input Validation** | Zod Schemas | Strict type, length, regex, and bounds checking (`src/lib/schemas/commerce.ts`). |

---

## 4. Database & Persistence Layer

| Component | Standard Technology | Details & Invariants |
| :--- | :--- | :--- |
| **Database Engine** | PostgreSQL | `16.x` relational database with ACID guarantees. |
| **ORM / Query Layer** | Prisma ORM | `7.9.1` (`prisma/schema.prisma`). All queries parameterized; raw SQL queries prohibited. |
| **Migration Strategy** | Prisma Migrate | `npm run db:migrate` with automated schema diffs and rollback migrations. |
| **Multi-Tenancy** | Row-Level Tenant Scoping | All seller records filtered by `sellerId` / `storeId`. |
| **Audit & Soft Deletes**| Soft-Deletion Invariant | Products, reviews, and stores use `deletedAt: new Date()` instead of hard deletes. |
| **Ledger System** | Double-Entry Accounting | `LedgerAccount` and `JournalEntry` models maintain immutable audit logs for escrow balances. |

---

## 5. Asynchronous Queues & Background Workers

| Component | Standard Technology | Purpose |
| :--- | :--- | :--- |
| **Queue Engine** | BullMQ | `5.78.x` Redis-backed queue (`src/lib/queue/worker.ts`). |
| **Redis Cache / State**| Redis / Upstash | Distributed cache, distributed rate limiting, queue storage (`src/lib/queue/redis.ts`). |
| **Job Handlers** | Dedicated Queue Workers | Automated escrow payouts, webhook retries, low-stock notifications. |

---

## 6. Storage & File Asset Management

| Component | Standard Technology | Details & Constraints |
| :--- | :--- | :--- |
| **Cloud Storage** | AWS S3 SDK v3 | Presigned upload URLs (`/api/upload`) directly to S3 buckets. |
| **Local Fallback** | Signed Local Storage | Constant-time HMAC signed endpoint (`/api/upload/local`) with 5MB max payload and extension allowlist. |
| **Path Traversal Guard**| `validateSafeKey` | Canonical `path.relative` check preventing directory traversal (`../../`) and null-byte injection. |

---

## 7. Payments & Billing

| Component | Standard Technology | Details |
| :--- | :--- | :--- |
| **Payment Gateway** | Stripe Connect Express | PaymentIntents + Stripe Express seller onboarding. |
| **Disbursement Model**| Application Fee + Transfer | 10% marketplace application fee; 90% net transfer to vendor. |
| **Webhook Processing**| Cryptographic Signature | Verified via `stripe.webhooks.constructEvent` using `STRIPE_WEBHOOK_SECRET`. |
| **Idempotency** | Database TransferLog | Idempotency keys logged to prevent duplicate payouts or double charging. |

---

## 8. Observability, Monitoring & Testing

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Application Logging**| Winston Structured Logger | PII masking via `sanitizeObject` stripping credentials, tokens, card data. |
| **Error Monitoring** | Sentry SDK | `10.58.x` with distributed OpenTelemetry tracing. |
| **Unit Testing** | TSX / Vitest Level 1 | Pure functions, currency math, Zod schemas, cart mutations. |
| **Component Testing** | TSX / Vitest Level 2 | Accessible UI components, focus indicators, modal ARIA dialogs. |
| **E2E Testing** | Playwright | `1.63.0` end-to-end browser checkout journeys. |
| **Security Suite** | Custom Invariant Suite | `scripts/verify-security-hardening.ts` verifying all security boundaries. |

---

## 9. Technology Change Policy

Any proposed modification to this stack requires an official Architectural Decision Record (ADR) detailing:
1. Proposed technology
2. Justification and technical problem
3. Risks and bundle impact
4. Migration and rollback path
5. Explicit human approval
