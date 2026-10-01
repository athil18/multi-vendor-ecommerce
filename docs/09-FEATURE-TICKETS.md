# 09 — Feature Tickets & Traceability Matrix

> **Document ID:** DOC-09-FEATURE-TICKETS  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Lead QA & Project Delivery Lead  

---

## 1. Feature Lifecycle & Definition of Done

A ticket is NOT complete simply because the user interface exists. A feature is complete only when:
`UI + Client Logic + API Route + Database + Zod Validation + Security Review + Automated Tests + Documentation`
are verified passing with tangible command evidence.

---

## 2. Core Implementation Tickets

### TICKET: FEAT-001 — Secure Customer & Merchant Authentication
- **User Story:** As a user, I want to register, log in, refresh my session, and log out with complete confidentiality and session revocation.
- **Acceptance Criteria:**
  - [x] Bcrypt password hashing (12 rounds) enforced on registration.
  - [x] Short-lived (15 min) JWT access token returned in JSON response.
  - [x] Long-lived (7 day) refresh token saved in `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
  - [x] Refresh tokens stored as SHA-256 hashes in database (`User.refreshTokens`).
  - [x] Logout purges candidate token from database and clears cookie.
  - [x] Tests pass (`npm run test:unit`, `scripts/verify-security-hardening.ts`).
- **Status:** **COMPLETE**

---

### TICKET: FEAT-002 — Multi-Vendor Store & Product Management
- **User Story:** As a merchant, I want to create a store and list products with variants and images, submitting them for administrative review.
- **Acceptance Criteria:**
  - [x] Store profile creation (`POST /api/seller/store`) restricted to `seller` role.
  - [x] Product creation (`POST /api/products`) defaults to `draft` status.
  - [x] Status transition rules: Sellers can only transition `draft` ↔ `pending_review`.
  - [x] **Security Guardrail:** Sellers CANNOT self-approve to `approved` (preventing privilege escalation).
  - [x] Multi-tenant isolation: Seller can only edit/view products matching their `storeId`.
  - [x] Soft-delete invariant enforced (`deletedAt: new Date()`).
- **Status:** **COMPLETE**

---

### TICKET: FEAT-003 — Admin Moderation Control Plane
- **User Story:** As a marketplace administrator, I want to inspect submitted products and approve or reject them with feedback.
- **Acceptance Criteria:**
  - [x] Admin-only route guard (`user.role === 'admin'`).
  - [x] Moderation queue (`/admin/moderation`) displays all `pending_review` items.
  - [x] Transition `pending_review` → `approved` or `rejected` with rejection feedback.
  - [x] Approved products immediately appear in public catalog queries.
- **Status:** **COMPLETE**

---

### TICKET: FEAT-004 — Storefront Discovery, Search & Filtering
- **User Story:** As a shopper, I want to filter products by category, price, and availability, and search by keywords with persistent URL state.
- **Acceptance Criteria:**
  - [x] Global search bar synchronization with `/products?search=...`.
  - [x] Filter controls for category, price slider, and in-stock toggle.
  - [x] Product Card renders image, title, price, vendor badge, rating, and "Add to Bag".
  - [x] Structured JSON-LD metadata rendered with `<` escaped as `\u003c` to prevent stored XSS.
  - [x] Accessibility: Keyboard navigable, distinct focus rings, image alt attributes.
- **Status:** **COMPLETE**

---

### TICKET: FEAT-005 — Cart, Checkout & Multi-Vendor Stripe Escrow
- **User Story:** As a customer, I want to purchase items from multiple sellers in one order with automated split payments and escrow protection.
- **Acceptance Criteria:**
  - [x] Zustand cart store persisted in localStorage with integer cents arithmetic.
  - [x] Single checkout form collecting shipping address and Stripe card payment.
  - [x] Atomic inventory decrement to prevent overselling race conditions.
  - [x] Stripe PaymentIntent creation with webhook listener (`payment_intent.succeeded`).
  - [x] Platform take-rate (10%) deducted; 90% net assigned to seller in escrow.
  - [x] TransferLog and JournalEntry records created for double-entry bookkeeping.
- **Status:** **COMPLETE**

---

### TICKET: FEAT-006 — Order Fulfillment & Customer Tracking
- **User Story:** As a customer, I want to track my order status; as a seller, I want to fulfill line items assigned to my store.
- **Acceptance Criteria:**
  - [x] Customer order history (`/customer/orders/[id]`) with status stepper.
  - [x] Seller order management (`/seller/orders`) showing only items matching `sellerId`.
  - [x] Status updates: `pending` → `processing` → `shipped` → `delivered`.
  - [x] Payout scheduler (`POST /api/payments/payouts`) triggers Stripe Transfer upon `delivered` confirmation, protected with constant-time `CRON_SECRET` check.
- **Status:** **COMPLETE**

---

### TICKET: FEAT-007 — Context-Aware AI Shopping Copilot
- **User Story:** As a customer, I want natural language assistance to find gift ideas, compare items, and ask about shipping policies.
- **Acceptance Criteria:**
  - [x] Dedicated floating assistant widget with accessible dialog ARIA attributes.
  - [x] Rate limited to 20 requests / minute at edge middleware.
  - [x] Strict input validation: prompt max 2,000 chars, conversation max 20 messages.
  - [x] Grounded responses referencing verified active catalog items.
- **Status:** **COMPLETE**

---

### TICKET: FEAT-008 — Security & Rate Limiting Hardening
- **User Story:** As a platform owner, I want the system protected against brute-force attacks, timing attacks, memory leaks, and SSRF.
- **Acceptance Criteria:**
  - [x] Token-bucket rate limiter capped at `MAX_MEMORY_BUCKETS = 10000`.
  - [x] Constant-time comparison (`crypto.timingSafeEqual`) on upload and payout authorizations.
  - [x] Image optimization SSRF proxy removed (wildcard `**` eliminated).
  - [x] Health check sanitized to prevent database connection string disclosure.
  - [x] 36 dedicated security verification tests passing 100%.
- **Status:** **COMPLETE**

---

## 3. Tickets Summary Status Table

| Ticket ID | Feature Area | Primary Impact | Status | Verification Evidence |
| :--- | :--- | :--- | :---: | :--- |
| **FEAT-001** | Identity & Auth | SHA-256 Refresh Hashing & Revocation | **DONE** | Suite 1 Test Pass (`verify-security-hardening.ts`) |
| **FEAT-002** | Catalog & Products | RBAC & Moderation Gate | **DONE** | Suite 2 Test Pass (Blocked self-approval) |
| **FEAT-003** | Admin Control | Product Review & Governance | **DONE** | Moderation queue & Admin route guards verified |
| **FEAT-004** | Discovery & SEO | URL Sync, Filters & XSS Defense | **DONE** | Level 2 Component Tests + Suite 5 Pass |
| **FEAT-005** | Payments & Escrow | Stripe Connect & Double-Entry Ledger | **DONE** | Level 1 Unit Tests + Ledger tests passing |
| **FEAT-006** | Fulfillment | Tracking Stepper & Payout Scheduler | **DONE** | Suite 4 Timing-Safe Secret Verification |
| **FEAT-007** | AI Copilot | Rate-limited Shopping Copilot | **DONE** | Input bounds + edge rate limiter passing |
| **FEAT-008** | SecOps Hardening | Memory Bounding, CSP, Timing-Safe | **DONE** | 36/36 Invariant Tests Passing (100%) |
