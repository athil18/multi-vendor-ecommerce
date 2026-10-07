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
