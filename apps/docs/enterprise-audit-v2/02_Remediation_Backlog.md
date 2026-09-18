# 02. Prioritized Enterprise Remediation Backlog

## P0: Critical Security & Financial Vulnerabilities

### ISSUE-001: Stripe Webhook Race Condition & Broken Idempotency
- **Business Context:** Prevents double-payouts and phantom ledger credits when Stripe sends duplicate webhooks (a known, guaranteed network behavior).
- **Technical Context:** `webhook/route.ts` checks `EventLog.findOne()` before starting a Mongoose transaction. If two duplicate events arrive at exactly the same millisecond, both will pass the check, both will create the event in the transaction, and both will post to the Ledger.
- **Root Cause:** Idempotency guard is outside the ACID transaction boundary.
- **Affected Modules:** `webhook/route.ts`, `ledger.ts`
- **Severity/Priority:** CRITICAL / P0
- **Complexity:** Medium
- **Acceptance Criteria:** `EventLog` must use a unique constraint on `eventId` and rely on a transactional MongoDB upsert or atomic `$setOnInsert`.
- **Deployment Risk / Rollback:** High Risk. Modifies core payment ingestion. Rollback via reverting commit.

### ISSUE-002: Client-Side Routing IDOR via `auth_role` Cookie
- **Business Context:** Administrative and Seller dashboards contain sensitive PII and financial capabilities.
- **Technical Context:** `src/middleware.ts` uses `const role = request.cookies.get('auth_role')?.value` to authorize access to `/admin` routes. A malicious user can simply edit their browser cookie to `admin` to bypass the UI guard.
- **Root Cause:** Trusting unverified, un-signed client-controlled state for routing.
- **Affected Modules:** `middleware.ts`
- **Severity/Priority:** CRITICAL / P0
- **Complexity:** Small
- **Acceptance Criteria:** `middleware.ts` must parse and cryptographically verify the JWT signature to determine the actual role, or fetch it via a secure Redis session.

### ISSUE-003: Double-Entry Ledger Type Definition Failure
- **Business Context:** The financial ledger represents the absolute truth of money movement. If it cannot compile, the CI/CD pipeline is broken, preventing safe deployments.
- **Technical Context:** `test/ledger.test.ts` fails to compile because it passes `{ direction: string }` instead of the strict union type `'DEBIT' | 'CREDIT'`.
- **Root Cause:** Poorly structured test mocks failing strict TypeScript checks.
- **Affected Modules:** `test/ledger.test.ts`, `test/refund.test.ts`
- **Severity/Priority:** HIGH / P0 (Blocks CI)
- **Complexity:** Small
- **Acceptance Criteria:** Tests pass `npx tsc --noEmit` and execute successfully without type coercion (`as any`).

## P1: Architecture & Scalability

### ISSUE-004: In-Memory Rate Limiting Will Fail in Multi-Node
- **Business Context:** Protects the platform from DDoS and brute force attacks on authentication.
- **Technical Context:** `src/lib/rate-limit.ts` uses a `globalThis` Map. If deployed to Vercel (serverless) or Kubernetes (multiple pods), each instance will have a separate, isolated counter, completely breaking the rate limit.
- **Root Cause:** Lack of a centralized distributed cache (Redis) for stateful middleware.
- **Affected Modules:** `rate-limit.ts`
- **Severity/Priority:** HIGH / P1
- **Complexity:** Medium
- **Acceptance Criteria:** Replace `globalThis.Map` with `@upstash/ratelimit` or a standard `ioredis` counter using Lua scripts.

### ISSUE-005: Admin Dashboard Over-fetching (OOM Risk)
- **Business Context:** The Admin Dashboard must load quickly even with millions of SKUs.
- **Technical Context:** Currently fetches `?status=all` fetching the entire product catalog into memory to calculate aggregate statistics. This will cause V8 Out of Memory (OOM) crashes.
- **Root Cause:** Missing backend aggregation pipelines.
- **Affected Modules:** `src/app/api/admin/products/route.ts`, Admin Page Components
- **Severity/Priority:** HIGH / P1
- **Complexity:** Large
- **Acceptance Criteria:** Implement `/api/admin/stats` utilizing MongoDB `$group` and `$facet` pipelines.

## P2: Frontend & Quality of Life

### ISSUE-006: React Error Boundaries Missing
- **Technical Context:** A single `undefined` variable in a map function within a React Component will unmount the entire React Tree (White Screen of Death).
- **Affected Modules:** `src/app/layout.tsx`, `src/app/admin/layout.tsx`
- **Severity/Priority:** MEDIUM / P2
- **Acceptance Criteria:** Implement `error.tsx` in all route groups and a global `<ErrorBoundary>`.

### ISSUE-007: Accessibility (a11y) Violations in Glassmorphic UI
- **Technical Context:** Contrast ratio between `text-on-surface-variant` and the translucent background panels is too low for WCAG AA compliance.
- **Affected Modules:** `src/app/globals.css`, Landing Page, Dashboards
- **Severity/Priority:** LOW / P3
- **Acceptance Criteria:** Run `axe-core` and adjust opacity/text hex values to achieve a 4.5:1 ratio.
