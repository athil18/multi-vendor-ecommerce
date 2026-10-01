# 07 — Security, Access Control & Hardening Architecture

> **Document ID:** DOC-07-SECURITY-ACCESS  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Principal Application Security Engineer  

---

## 1. Security Architecture & Threat Model

Nexus operates on a **Zero-Trust Backend Architecture**. Client-supplied roles, prices, permissions, or tokens are never implicitly trusted. Every sensitive mutation is validated server-side against session credentials and relational ownership invariants.

---

## 2. Authentication & Credential Governance

### 2.1 Password Security
- **Hashing Algorithm:** `bcryptjs` with **12 salt rounds** enforced across all registration and password-reset workflows.
- **Policies:** Minimum 8 characters; must contain at least one uppercase letter, one lowercase letter, and one number.
- **Plaintext Ban:** Plaintext passwords are never logged, never returned in API payloads, and never stored in memory longer than the hashing function execution.

### 2.2 Token Architecture
- **Access Tokens:** Short-lived (15 minutes), signed using HMAC-SHA256 (`JWT_SECRET`). Carries `{ id, email, role }`.
- **Refresh Tokens:** Long-lived (7 days), stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS exfiltration.
- **Database Hashing:** Refresh tokens are hashed using `crypto.createHash('sha256')` before persistence in `User.refreshTokens`.
- **Session Revocation:** Logout explicitly purges the candidate token's SHA-256 hash from the database, permanently invalidating the session.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Customer | Seller | Admin | Server Enforcement |
| :--- | :---: | :---: | :---: | :--- |
| **Browse / Search Products** | ALLOW | ALLOW | ALLOW | Public endpoint |
| **Create Store** | DENY | ALLOW (own) | ALLOW | Scoped to authenticated `user.id` |
| **Create / Edit Products** | DENY | ALLOW (own store) | ALLOW | Scoped to `product.storeId === user.store.id` |
| **Submit Product for Review** | DENY | ALLOW (draft → review)| ALLOW | Validated in status transition state machine |
| **Approve / Reject Products** | DENY | **DENY (BLOCKED)** | **ALLOW** | Admin-only authorization check |
| **View Customer Orders** | ALLOW (own) | DENY | ALLOW | Scoped to `order.userId === user.id` |
| **Fulfill Order Items** | DENY | ALLOW (own items) | ALLOW | Scoped to `orderItem.sellerId === user.store.id` |
| **Trigger Escrow Payouts** | DENY | DENY | ALLOW (or Cron) | Guarded by `CRON_SECRET` with constant-time verification |
| **User Account Suspension** | DENY | DENY | ALLOW | Admin-only route guard |

---

## 4. API Hardening & Injection Defense

### 4.1 SQL & NoSQL Injection Defense
- **Prisma Parameterized Queries:** 100% of database interactions leverage Prisma ORM. Raw string concatenation in queries is strictly prohibited.
- **Strict ID Schema:** All entity IDs are validated using `idSchema` (`/^(c[a-z0-9]{20,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-f0-9]{24})$/i`), rejecting SQL injection (`' OR 1=1`), command injection (`id; rm -rf`), and directory traversal payloads.

### 4.2 Cross-Site Scripting (XSS) Mitigation
- **React Auto-Escaping:** All JSX bindings are escaped by default.
- **JSON-LD Script Breakout Defense:** Structured data output in `ProductJsonLd.tsx` escapes all `<` characters with `.replace(/</g, '\\u003c')`, preventing script injection via user-supplied product names.
- **Sanitization:** Markdown reviews and rich text are sanitized using DOMPurify before DOM insertion.

### 4.3 Side-Channel & Timing Attack Defense
- **Constant-Time HMAC Checks:** Upload URL signatures and `CRON_SECRET` authorization tokens are evaluated using `crypto.timingSafeEqual` comparing exact-length byte buffers, eliminating byte-by-byte timing inference attacks.

---

## 5. Denial of Service (DoS) & Rate Limiting

| Target Endpoint | Rate Limit | Scope / Key | Failure Response |
| :--- | :--- | :--- | :--- |
| **`/api/auth/login`** | 5 requests / minute | IP + Email | HTTP 429 Too Many Requests |
| **`/api/auth/register`** | 3 requests / minute | Client IP | HTTP 429 Too Many Requests |
| **`/api/ai/assistant`** | 20 requests / minute | User / IP | HTTP 429 (Plus 2,000 char prompt limit) |
| **`/api/coupons/validate`** | 10 requests / minute | Client IP | HTTP 429 Too Many Requests |
| **Global API Default** | 100 requests / minute | Client IP | HTTP 429 Too Many Requests |

- **Bounded Memory Management:** In-memory token bucket store is capped at `MAX_MEMORY_BUCKETS = 10000`. Expired buckets are pruned automatically to prevent memory exhaustion DoS.

---

## 6. HTTP Security Headers & Content Security Policy (CSP)

Configured in `src/lib/security-headers.ts` and enforced at Edge Middleware:
- **`Strict-Transport-Security`:** `max-age=63072000; includeSubDomains; preload`
- **`X-Content-Type-Options`:** `nosniff`
- **`X-Frame-Options`:** `DENY`
- **`Referrer-Policy`:** `strict-origin-when-cross-origin`
- **`Permissions-Policy`:** `camera=(), microphone=(), geolocation=()`
- **`Content-Security-Policy`:** Strict resource allowlists. `'unsafe-eval'` is disabled in production builds.

---

## 7. Error Handling & Privacy Governance

1. **Production Error Masking:** Centralized error wrapper (`withErrorHandler`) intercepts all uncaught exceptions, returning generic, safe JSON responses (`status: 500, error: 'Internal Server Error'`).
2. **Health Check Sanitization:** `/api/health` returns status strings (`"degraded"`, `"unavailable"`) without exposing raw database connection strings or stack traces.
3. **PII Masking:** Winston logger runs all logged objects through `sanitizeObject`, redacting credit cards, passwords, JWTs, and refresh tokens before writing to disk or cloud aggregators.
