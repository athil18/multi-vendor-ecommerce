# E-Commerce Architecture & Invariants Rule

When modifying or adding backend services, database models, payment endpoints, or queue jobs in this repository, you must enforce the following architectural rules:

## 1. Multi-Vendor Escrow & Payments
- Never disburse funds or advance order status without verifying the cryptographic Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`.
- Order states must strictly follow:
  `PENDING_PAYMENT` -> `PENDING_ESCROW` -> `ESCROW_LOCKED` -> `SHIPPED` -> `DELIVERED` -> `SETTLED`.
- Platform commission (10%) and vendor payouts must be calculated using integer cents (or exact integer arithmetic). Floating-point arithmetic on currency is strictly forbidden.
- Always include idempotency keys for Stripe transfers.

## 2. Multi-Tenant Scoping & RBAC
- Seller operations must be scoped by `storeId` extracted from the authenticated seller's verified session.
- Never allow cross-store mutations or reads.
- Always strip private fields (`passwordHash`, `stripeAccountId`, tokens) before sending API responses.

## 3. Database Integrity & Prisma
- Always use soft-delete (`deletedAt`) for catalog and user records to preserve relational history.
- Run `npm run db:generate` whenever `prisma/schema.prisma` is modified.
- Schema migrations must be applied using `npm run db:migrate`.
- For risky migrations, create a backup first using `npm run db:backup`.

## 4. Background Queues (BullMQ)
- Long-running or async tasks (order processing, email notifications, Stripe payouts) must run via BullMQ workers (`src/lib/queue/worker.ts`).
- Never perform heavy external API calls directly in the Next.js request/response cycle when they can be queued.
