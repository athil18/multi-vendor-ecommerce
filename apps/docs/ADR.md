# Architectural Decision Records — Nexus Marketplace

> Format: [ADR-NNN] Title | Date | Status

---

## ADR-001: Monolithic Next.js Architecture

**Date**: 2026-06-14 | **Status**: Accepted

### Context
We need to choose between a monolithic full-stack framework or a microservices architecture for the marketplace platform.

### Decision
Use a single Next.js 16 application with App Router for both frontend pages and backend API routes.

### Rationale
- Single deployment unit simplifies ops
- Shared TypeScript types between frontend and backend
- API routes are co-located with the pages that consume them
- Faster iteration for a team of 1–3 developers
- Next.js handles SSG, SSR, and API routing in one framework

### Consequences
- **Positive**: Faster development, simpler deployment, shared types
- **Negative**: Cannot scale API and frontend independently; all-or-nothing deployments
- **Migration path**: Extract API routes to standalone serverless functions when needed

---

## ADR-002: MongoDB over PostgreSQL

**Date**: 2026-06-14 | **Status**: Accepted

### Context
Product data has flexible schemas (options, variants, attributes as key-value pairs). Need transactions for order processing.

### Decision
Use MongoDB Atlas with Mongoose ODM.

### Rationale
- Document model naturally fits product catalogs with variable attributes
- Mongoose provides schema enforcement without rigid migrations
- MongoDB transactions satisfy our ACID requirements for orders
- Atlas provides managed scaling, backups, and SRV connection

### Consequences
- **Positive**: Flexible schemas, fast iteration, no migration files
- **Negative**: No foreign key constraints (enforced at application level), limited join capabilities
- **Trade-off**: Use `populate()` for references; aggregate pipelines for complex queries

---

## ADR-003: JWT Authentication over Server Sessions

**Date**: 2026-06-14 | **Status**: Accepted

### Context
API routes are stateless Next.js edge/serverless functions. Need authentication without server-side session stores.

### Decision
Use JWT access tokens (15min TTL) with refresh tokens (7-day, httpOnly cookie).

### Rationale
- Stateless: no Redis/Memcached session store needed
- Works well with CSR (React) frontend
- Short-lived access tokens limit exposure window
- Refresh tokens enable persistent sessions without long-lived JWTs

### Consequences
- **Positive**: Scalable, no session store dependency
- **Negative**: Cannot invalidate individual access tokens (must wait for expiry)
- **Mitigation**: Suspended user check on every request; refresh tokens are hashed and revocable

---

## ADR-004: React Context over Redux for State Management

**Date**: 2026-06-14 | **Status**: Accepted

### Context
Application state consists of: user session, JWT token, shopping cart, and theme preference. Redux is installed as a dependency.

### Decision
Use React Context API with `localStorage` persistence instead of Redux.

### Rationale
- State surface is small (user, token, cart[], theme)
- Context avoids Redux boilerplate (actions, reducers, store config)
- No middleware or time-travel debugging needed at this stage
- localStorage provides persistence across page refreshes

### Consequences
- **Positive**: Simpler code, fewer abstractions
- **Negative**: No Redux DevTools; Context re-renders entire tree on state change
- **Note**: Redux, react-redux, and redux-persist remain installed as technical debt

---

## ADR-005: Stripe Connect Transfer Model for Multi-Seller Payouts

**Date**: 2026-06-14 | **Status**: Accepted

### Context
Orders span multiple sellers. Each seller needs to receive their portion of the payment minus the platform fee.

### Decision
Use Stripe Connect with the "Transfer" model: single payment intent collected from customer, then split into Stripe Transfers per seller.

### Rationale
- Platform collects full payment, then distributes
- 10% platform fee retained; remainder transferred to seller's connected account
- `transfer_group` links all transfers to original order for reconciliation
- Stripe handles compliance, tax reporting, and payout timing

### Consequences
- **Positive**: Clean separation of platform and seller funds; Stripe handles compliance
- **Negative**: Requires each seller to complete Stripe Express onboarding; transfers fail silently if account is incomplete
- **Mitigation**: Console warnings logged; seller dashboard shows onboarding status

---

## ADR-006: Client-Side Rendering for All Pages

**Date**: 2026-06-14 | **Status**: Accepted

### Context
All page components use `'use client'` directive. Need to decide between SSR, SSG, and CSR strategies.

### Decision
All user-facing pages are client-side rendered. API routes handle all server-side logic.

### Rationale
- Simplifies data fetching (useEffect + fetch)
- Auth state is client-side (Context); SSR would need additional hydration logic
- Products are fetched from API, not pre-rendered (catalog changes frequently)
- Static pages (auth, checkout) are pre-rendered as empty shells

### Consequences
- **Positive**: Simpler architecture, no hydration mismatches
- **Negative**: Poor SEO for product pages (search engines see empty shells)
- **Future**: Consider SSR for product detail pages in Phase 6+

---

## ADR-007: Atomic Stock Decrement for Inventory

**Date**: 2026-06-14 | **Status**: Accepted

### Context
Concurrent purchases could result in overselling if stock is checked-then-decremented in separate operations.

### Decision
Use `Variant.findOneAndUpdate()` with `{ stock: { $gte: quantity } }` guard and `{ $inc: { stock: -quantity } }` in a single atomic operation within a transaction.

### Rationale
- MongoDB's `findOneAndUpdate` is atomic at the document level
- The `$gte` guard ensures stock is sufficient before decrementing
- Combined with MongoDB transactions, this prevents overselling even under concurrent load

### Consequences
- **Positive**: Zero overselling under concurrency
- **Negative**: Additional complexity in error handling (must restore stock on payment failure)
- **Implementation**: Stock restoration implemented in `payment_intent.payment_failed` webhook handler

---

## ADR-008: MongoDB Transactions for Order Creation

**Date**: 2026-06-14 | **Status**: Accepted

### Context
Order creation involves multiple collections: Order, OrderItem (multiple), Variant (stock), Coupon (usage). Partial writes would leave the system in an inconsistent state.

### Decision
Use MongoDB multi-document transactions (`startSession()` + `startTransaction()`) for the entire order creation flow.

### Rationale
- Ensures atomicity: all-or-nothing for order + items + inventory + coupon
- `abortTransaction()` rolls back all changes on any failure
- MongoDB Atlas supports transactions on replica sets (our deployment model)

### Consequences
- **Positive**: Data consistency guaranteed; no partial orders
- **Negative**: Slightly higher latency per order (transaction overhead); requires replica set

---

## ADR-009: Product Status Lifecycle with Explicit Transition Map

**Date**: 2026-06-14 | **Status**: Accepted

### Context
Products go through multiple states (draft, pending_review, approved, published, rejected, archived). Invalid transitions could bypass admin review.

### Decision
Define a `PRODUCT_STATUS_TRANSITIONS` map in the Product model that explicitly lists allowed transitions for each status.

### Rationale
- Prevents sellers from publishing without admin approval
- Prevents rejected products from going directly to published
- Map is co-located with the model, making it the single source of truth
- Easy to extend with new statuses

### Consequences
- **Positive**: Type-safe, auditable state machine
- **Negative**: Must update map when adding new statuses

---

> **Operating Rule**: New architectural decisions must be added here before implementation begins.
