# 06 — External API Integrations & Service Contracts

> **Document ID:** DOC-06-API-INTEGRATIONS  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Senior Backend & Integration Architect  

---

## 1. External Integrations Architecture

Nexus orchestrates integrations with three primary third-party infrastructure providers:
1. **Stripe Connect Express:** Checkout payment capture, vendor payouts, and automated escrow split settlement.
2. **AWS S3 / S3-Compatible Cloud Storage:** Immutable product image and store asset hosting via presigned URLs.
3. **Sentry & OpenTelemetry:** Distributed tracing, unhandled exception telemetry, and error alerting.

---

## 2. Stripe Connect (Payments & Escrow Splits)

| Field | Specification |
| :--- | :--- |
| **Provider** | Stripe (API version: `2024-06-20` / SDK `22.2.x`) |
| **Purpose** | Payment Intents, Connect Express Onboarding, Payout Transfers |
| **Base URL** | `https://api.stripe.com/v1` |
| **Auth Type** | Bearer Token (`STRIPE_SECRET_KEY`) |
| **Environment Vars**| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |

### 2.1 Endpoints & Operations
- `POST /v1/payment_intents`: Creates customer payment intent with order metadata.
- `POST /v1/transfers`: Disburses net seller payout (gross minus 10% platform take-rate) to seller's `stripeAccountId`.
- `POST /v1/account_links`: Generates onboarding redirect URLs for merchants to verify bank accounts in Stripe Express.

### 2.2 Webhook Handling & Idempotency
- **Endpoint:** `POST /api/payments/webhook`
- **Verification:** Uses `stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET)`.
- **Supported Events:**
  - `payment_intent.succeeded`: Marks order as `completed`, locks escrow funds, updates inventory ledger.
  - `payment_intent.payment_failed`: Marks order as `failed`, restores reserved inventory stock.
  - `account.updated`: Updates `Store.stripeOnboardingComplete` when vendor verification is finalized.
- **Idempotency Strategy:** Checks `TransferLog` / `EventLog` table in PostgreSQL before executing any database mutations.

---

## 3. AWS S3 (Asset Storage)

| Field | Specification |
| :--- | :--- |
| **Provider** | Amazon Web Services (AWS SDK v3 `@aws-sdk/client-s3`) |
| **Purpose** | Secure direct-to-cloud merchant asset and product photography uploads |
| **Base URL** | `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com` |
| **Auth Type** | AWS IAM Access Key & Secret Key |
| **Environment Vars**| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `STORAGE_PROVIDER` |

### 3.1 Presigned Upload Protocol
1. Client requests upload signature: `POST /api/upload` with `{ filename, contentType, size }`.
2. Server validates MIME type (`image/jpeg`, `image/png`, `image/webp`), size (<= 5MB), and sanitizes filename.
3. Server generates presigned PUT URL with 300-second expiration.
4. Client uploads binary directly to S3.
5. **Local Fallback:** When `STORAGE_PROVIDER=local`, signed URL points to `/api/upload/local` with HMAC signature verified via `crypto.timingSafeEqual`.

---

## 4. BullMQ & Redis (Queue & Cache)

| Field | Specification |
| :--- | :--- |
| **Provider** | Redis / Upstash (`ioredis` + `bullmq`) |
| **Purpose** | Asynchronous escrow payout releases, webhook retries, distributed rate limiting |
| **Environment Vars**| `REDIS_URL` or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` |

### 4.1 Queue Job Types
- `payout.release`: Triggered after order is marked `delivered` to transfer net vendor earnings.
- `inventory.restock`: Triggered on payment cancellation or timeout.
- `audit.journal`: Posts ledger double-entry transactions asynchronously.

---

## 5. Sentry & Observability

| Field | Specification |
| :--- | :--- |
| **Provider** | Functional Sentry SDK (`@sentry/nextjs`) |
| **Purpose** | Error capturing, performance monitoring, edge telemetry |
| **Environment Vars**| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` |
| **Data Masking** | PII stripping enabled; auth tokens, credit cards, and passwords redacted before egress. |

---

## 6. Integration Reliability Matrix

| Service | Timeout | Max Retries | Backoff Strategy | Circuit Breaker / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **Stripe Payments** | 10s | 3 | Exponential (1s, 2s, 4s) | Return payment error toast; prompt customer to retry with another card. |
| **AWS S3 Storage** | 15s | 2 | Linear (1s) | Switch to local signed filesystem endpoint (`STORAGE_PROVIDER=local`). |
| **Redis / BullMQ** | 3s | 5 | Exponential | In-memory token-bucket rate limiting fallback (`src/lib/rate-limit.ts`). |
