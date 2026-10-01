# Nexus E-Commerce Engineering Checklist

Use this checklist during PR preparation, code reviews (`code-review-and-quality`), and pre-launch verification (`shipping-and-launch`) for changes to the Nexus Multi-Vendor Marketplace.

---

## 1. Multi-Vendor Payments & Escrow Pipeline

- [ ] **Stripe Webhook Signatures:** Webhook endpoints verify signatures cryptographically using `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`. Raw request bodies are passed without JSON pre-parsing.
- [ ] **Currency Arithmetic:** All monetary amounts are represented as positive integers in the smallest currency unit (e.g., cents) or using high-precision decimal math. Never use standard floating-point division for monetary splits.
- [ ] **Platform Commission:** The platform fee (default 10% take-rate) is deducted accurately before initiating vendor Stripe Transfers.
- [ ] **Escrow State Machine:** Order transitions strictly follow:
  `PENDING_PAYMENT` ➔ `PENDING_ESCROW` ➔ `ESCROW_LOCKED` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `SETTLED` (or `REFUNDED` / `DISPUTED`).
- [ ] **Transfer Idempotency:** Vendor payouts include idempotency keys (`transfer-orderId-vendorId`) to prevent duplicate disbursements on network retries.

---

## 2. Multi-Tenant Authorization & RBAC

- [ ] **Store Boundary Isolation:** All store management queries (products, orders, payouts) include `where: { storeId: sellerStoreId }` to prevent cross-vendor tenant leakage.
- [ ] **Role Validation:** API endpoints verify the active user role (`customer`, `seller`, `admin`) via JWT claims and database lookup before executing privileged mutations.
- [ ] **Middleware Guardrails:** Next.js Edge Middleware (`src/middleware.ts`) protects sensitive route prefixes (`/seller/*`, `/admin/*`, `/api/seller/*`, `/api/admin/*`).
- [ ] **Sensitive Data Scrubbing:** `passwordHash`, `stripeAccountId`, and session tokens are stripped from all API outputs and serialization payloads.

---

## 3. Catalog & Inventory Concurrency

- [ ] **Stock Decrement Safety:** Stock quantities are decremented using atomic database operations or transaction locks (`prisma.$transaction`) to prevent overselling race conditions.
- [ ] **Soft Deletion:** Products, reviews, and stores use soft-delete (`deletedAt`) to preserve historical order integrity and ledger consistency.
- [ ] **Compound Indexes:** Prisma schema defines compound unique indexes on multi-tenant identifiers (e.g., `@@unique([storeId, slug])`).

---

## 4. Cart & Order Calculations

- [ ] **Server-Side Price Validation:** Cart item prices submitted by the client are never trusted. All totals, taxes, and shipping rates are re-calculated server-side using current database prices.
- [ ] **Zustand Cart State:** Client cart state synchronizes gracefully with local storage without causing hydration mismatches (`useEffect` or `useSyncExternalStore`).
- [ ] **Tax & Shipping Aggregation:** Multi-vendor orders compute shipping rates and delivery dates distinctly per vendor package.

---

## 5. File Upload Safety (AWS S3)

- [ ] **Presigned URL Authorization:** Presigned upload URLs are only granted to authenticated sellers with active, verified stores.
- [ ] **File Type & Size Restrictions:** Upload MIME types are strictly restricted (`image/jpeg`, `image/png`, `image/webp`) and file sizes are capped (e.g., 5MB per product image).
- [ ] **Key Path Sandboxing:** S3 object keys follow partitioned paths (`stores/${storeId}/products/${productId}/${randomId}.${ext}`) preventing path traversal or overwriting other tenants' assets.

---

## 6. Background Queue Workers (BullMQ + Redis)

- [ ] **Worker Isolation:** Asynchronous tasks (order email notifications, PDF invoices, Stripe payout disbursements) are offloaded to BullMQ queues.
- [ ] **Retry Strategy:** Queue jobs specify exponential backoff retry policies (`attempts: 5, backoff: { type: 'exponential', delay: 2000 }`).
- [ ] **Dead-Letter Handling:** Failed jobs are captured in a dead-letter queue and instrumented with Sentry error reporting.

---

## 7. Performance & Core Web Vitals (Storefront)

- [ ] **Image Optimization:** Product images utilize Next.js `<Image />` with explicit `width`, `height`, and appropriate `sizes` attributes to prevent Cumulative Layout Shift (CLS < 0.01).
- [ ] **Streaming SSR:** Catalog and product detail pages utilize React Server Components with Suspense boundaries for instant First Contentful Paint.
- [ ] **Database Query Efficiency:** Avoid N+1 queries by leveraging Prisma `include` or batch `findMany` queries with appropriate `select` projections.
- [ ] **Redis Caching:** High-traffic catalog listings are cached with Upstash/Redis, with invalidation triggers on product updates.
