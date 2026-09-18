# Implementation Plan — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14

---

## Phase Overview

| Phase | Name | Status | Milestone |
|-------|------|--------|-----------|
| **Phase 1** | Foundation & Auth | ✅ Complete | Users can register, login, and authenticate |
| **Phase 2** | Catalog & Products | ✅ Complete | Products, categories, brands, variants in DB; storefront displays products |
| **Phase 3** | Seller Experience | ✅ Complete | Store creation, product listing, status lifecycle, order fulfillment dashboard |
| **Phase 4** | Order & Payment Pipeline | ✅ Complete | Cart → checkout → Stripe payment intent → webhook → multi-seller payouts |
| **Phase 5** | Admin Moderation | ✅ Complete | Admin moderation queue with approve/reject workflow |
| **Phase 6** | Polish & Hardening | 🔄 In Progress | Build verification, component extraction, test coverage, error handling |
| **Phase 7** | Reviews, Wishlist & Customer Dashboard | ⬜ Not Started | Customer order history, reviews, wishlists |
| **Phase 8** | Production Readiness | ⬜ Not Started | Rate limiting, image upload, email notifications, deployment |

---

## Phase 1: Foundation & Auth ✅

### Deliverables
- [x] Next.js 16 project scaffolding with TypeScript, Tailwind 4
- [x] MongoDB connection with singleton caching (`lib/db.ts`)
- [x] User model with role-based access (admin, seller, customer)
- [x] JWT access/refresh token auth system (`lib/jwt.ts`)
- [x] Auth middleware with suspended user detection (`lib/auth.ts`)
- [x] Zod validation schemas for auth (`lib/schemas/auth.ts`)
- [x] API routes: register, login, logout, refresh, forgot-password, reset-password, me
- [x] Login/register pages with dark mode

### Completion Criteria
- ✅ User can register with email/password
- ✅ User can login and receive JWT tokens
- ✅ Refresh token rotates correctly
- ✅ Suspended users are denied access

---

## Phase 2: Catalog & Products ✅

### Deliverables
- [x] Product model with options, tags, status lifecycle
- [x] Variant model with SKU, attributes, stock, pricing
- [x] Category model with hierarchical parent support
- [x] Brand model with slugs
- [x] Product CRUD API routes (public GET, seller POST)
- [x] Product by ID and slug endpoints
- [x] Pagination utility (`lib/pagination.ts`)
- [x] Home page with hero banner, product grid, filter sidebar, category tabs

### Completion Criteria
- ✅ Published products display on storefront
- ✅ Filtering by category, price, stock, and sort works
- ✅ Seller can create products via API

---

## Phase 3: Seller Experience ✅

### Deliverables
- [x] Store model with Stripe Connect fields
- [x] Store CRUD API routes (GET/POST)
- [x] Seller product listing API with variant stats aggregation
- [x] Seller product status management API
- [x] Seller dashboard page with metrics (revenue, orders, top products)
- [x] Seller order listing and status update API
- [x] Order aggregate status recalculation logic
- [x] Stripe Connect onboarding API route
- [x] Payout status API route

### Completion Criteria
- ✅ Seller can create store, list products, submit for review
- ✅ Seller can view and fulfill orders
- ✅ Seller can connect Stripe for payouts
- ✅ Dashboard shows revenue analytics

---

## Phase 4: Order & Payment Pipeline ✅

### Deliverables
- [x] Order model with multi-seller support
- [x] OrderItem model with financial ledger (platform fee, seller payout, discount)
- [x] Coupon model with global/seller scope
- [x] Transactional order creation with atomic inventory locking
- [x] Prorated coupon discount distribution
- [x] Checkout page with shipping and payment forms
- [x] Stripe Payment Intent creation API
- [x] Stripe webhook handler (payment success, failure, account update)
- [x] Multi-seller payout transfer logic
- [x] Inventory restoration on payment failure

### Completion Criteria
- ✅ Customer can add to cart and checkout
- ✅ Order is created atomically with stock decremented
- ✅ Stripe payment intent is generated
- ✅ Webhook processes payment success/failure correctly
- ✅ Seller payouts are calculated and transferred

---

## Phase 5: Admin Moderation ✅

### Deliverables
- [x] Admin product listing API with status/keyword filtering
- [x] Admin product status update API (approve/reject)
- [x] Admin dashboard page with moderation queue
- [x] Platform-wide catalog stats

### Completion Criteria
- ✅ Admin can view pending products
- ✅ Admin can approve (publish) or reject products
- ✅ Status transitions are enforced correctly

---

## Phase 6: Polish & Hardening 🔄

### Deliverables
- [ ] Extract reusable UI components (Button, Input, Card, Badge, Modal, Table)
- [ ] Product detail page (`/products/[slug]`)
- [ ] Customer order detail page (`/orders/[id]`)
- [ ] Address management API and UI
- [ ] Input validation on all API routes (Zod schemas)
- [ ] Error boundary components
- [ ] API error response standardization
- [ ] Loading skeletons instead of spinner
- [x] Build verification (TypeScript compiles with zero errors)

### Risks
- Large pages (page.tsx = 447 lines) need component extraction
- No automated tests exist yet
- Error messages are inconsistent across endpoints

---

## Phase 7: Reviews, Wishlist & Customer Dashboard ⬜

### Deliverables
- [ ] Review CRUD API routes
- [ ] Review UI on product detail page
- [ ] Product rating recalculation
- [ ] Wishlist API routes (add/remove/get)
- [ ] Wishlist UI on customer dashboard
- [ ] Customer order history page with status tracking
- [ ] Customer order detail with per-item breakdown

### Dependencies
- Phase 6 (product detail page exists)

---

## Phase 8: Production Readiness ⬜

### Deliverables
- [ ] Rate limiting middleware (auth endpoints)
- [ ] Image upload to cloud storage (S3/Cloudinary)
- [ ] Email notifications (order confirmation, password reset)
- [ ] Deployment configuration (Vercel/Docker)
- [ ] Environment variable validation
- [ ] Health check endpoint
- [ ] Logging and monitoring setup
- [ ] CI/CD pipeline
- [ ] Security audit (OWASP Top 10)

### Dependencies
- All previous phases complete

---

## Definition of Done (per phase)

A phase is complete when:
1. All deliverables are implemented and committed
2. Acceptance criteria from PRD are satisfied
3. `npm run build` passes with zero TypeScript errors
4. Technical debt is documented in `tracker.md`
5. Documentation is updated (relevant .md files)
6. No blocking regressions introduced

---

> **Cross-references**: [prd.md](prd.md) (requirements), [tracker.md](tracker.md) (current state), [techspec.md](techspec.md) (architecture)
