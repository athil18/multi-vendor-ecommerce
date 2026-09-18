# Product Requirements Document — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14 | Status: Active

---

## Problem Statement

Independent creators and small sellers lack access to affordable, low-friction e-commerce infrastructure that enables them to list, sell, and receive payouts for products without managing their own storefronts, payment processing, or order logistics. Buyers, in turn, have no centralized platform to discover, evaluate, and purchase from curated independent sellers with the trust and convenience of a major retailer.

## Vision

**Nexus** is a production-grade multi-vendor marketplace that empowers independent sellers to operate storefronts under one platform while providing customers with a unified, premium shopping experience — complete with Stripe-powered payments, automated seller payouts, and admin-moderated catalog quality.

## Goals

| # | Goal | Success Indicator |
|---|------|-------------------|
| G1 | Enable sellers to onboard, create stores, list products with variants, and manage order fulfillment | Seller can go from registration → store setup → published product → fulfilled order |
| G2 | Provide customers with a polished browsing, filtering, cart, and checkout experience | Customer can discover → filter → add to cart → checkout → pay → track order |
| G3 | Implement secure, split-payment processing using Stripe Connect | Payments are collected, platform fee deducted, and seller payouts transferred automatically |
| G4 | Provide admin moderation capabilities to maintain catalog quality | Admin can review, approve, or reject submitted products |
| G5 | Build a responsive, dark-mode-enabled, glassmorphism UI that feels premium | First-time visitors describe the UI as "modern" and "polished" |
| G6 | Ensure data integrity through transactional order processing with atomic inventory locking | Zero overselling under concurrent purchase conditions |

## Non-Goals

- **Mobile native apps** — Web-responsive only for v1.0.
- **Real-time chat or messaging** between buyers and sellers.
- **Shipping rate calculators or carrier integrations** — Shipping is marked "Free" in v1.0.
- **Product recommendation engine** (ML-driven) — Out of scope.
- **Multi-currency or i18n** — USD only for v1.0.
- **Image upload to cloud storage** — Images referenced by URL in v1.0.
- **Email notifications** — No transactional email in v1.0 (toast-only feedback).
- **Search engine (Elasticsearch/Algolia)** — MongoDB text index only for v1.0.

## Target Users

### Primary Personas

#### 1. Independent Seller ("Creator Casey")
- **Profile**: Small business owner, artisan, or drop-shipper who wants to sell products online without building a full e-commerce store.
- **Pain Points**: High platform fees, complex onboarding, slow payouts, no visibility.
- **Needs**: Simple store setup, product listing with variants, Stripe payout integration, order management dashboard, revenue analytics.

#### 2. Online Shopper ("Buyer Bailey")
- **Profile**: Tech-savvy consumer aged 22–45 who values curation, premium UX, and independent brands over mass-market retailers.
- **Pain Points**: Cluttered marketplaces, hard to find quality independent sellers, trust concerns.
- **Needs**: Clean browsing experience, filters/sorting, cart management, secure checkout, order tracking.

#### 3. Platform Administrator ("Admin Alex")
- **Profile**: Internal team member responsible for catalog quality, fraud prevention, and seller compliance.
- **Pain Points**: Manual review processes, no centralized moderation tool.
- **Needs**: Product moderation queue, approve/reject workflow, platform-wide visibility.

## Core Features

### Authentication & Authorization
- JWT-based access/refresh token auth with bcrypt password hashing
- Role-based access control (customer, seller, admin)
- Forgot/reset password flow
- Suspended user detection and denial
- Secure httpOnly cookie-based refresh tokens

### Customer Experience
- Hero landing page with curated product catalog
- Category, price, stock, and sort filtering
- Add-to-cart with persistent localStorage state
- Secure checkout page with shipping address and payment form
- Order history tracking with status visibility

### Seller Experience
- Store profile creation (name, description, logo)
- Product listing with variants (SKU, attributes, price, stock)
- Product status lifecycle management (draft → pending_review → approved → published)
- Order fulfillment dashboard (status updates: pending → processing → shipped → delivered)
- Revenue and payout analytics (total revenue, monthly revenue, top products)
- Stripe Connect Express onboarding for receiving payouts

### Admin Experience
- Moderation queue for products awaiting review
- Approve (publish) or reject products
- Platform-wide catalog visibility with status filtering and search

### Payments (Stripe Connect)
- Stripe Payment Intent creation for checkout
- Webhook processing for `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`
- Automatic multi-seller payout splits using Stripe Transfers
- 10% platform fee calculation per order item
- Inventory restocking on payment failure

### Coupon System
- Global and seller-scoped discount coupons
- Percentage and fixed discount types
- Minimum order value enforcement
- Usage limit tracking
- Pro-rated discount distribution across eligible line items

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Seller onboarding-to-first-product time | < 5 minutes | Time from store creation to first product saved |
| Checkout conversion rate | ≥ 60% of cart-to-payment attempts | Successful payment / checkout page visits |
| Admin moderation queue clear rate | 100% of pending items reviewed within 24 hours | Zero stale pending_review items |
| Build stability | Zero TypeScript compilation errors | `npm run build` exits with code 0 |
| Payment split accuracy | 100% of seller payouts match ledger calculations | Platform fee + seller payout + discount = order total |

## Acceptance Criteria

### AC-1: End-to-End Buyer Journey
- [ ] Customer can browse published products on the home page
- [ ] Customer can filter by category, price, stock, and sort order
- [ ] Customer can add items to cart and see cart count in navbar
- [ ] Customer can proceed to checkout, enter shipping and payment details, and place an order
- [ ] Order appears in customer's order history

### AC-2: End-to-End Seller Journey
- [ ] Seller can register, login, and create a store profile
- [ ] Seller can create products with variants (SKU, price, stock, attributes)
- [ ] Seller can submit products for review (draft → pending_review)
- [ ] Seller can view order items assigned to them and update fulfillment status
- [ ] Seller can view revenue analytics and payout status

### AC-3: Admin Moderation
- [ ] Admin can view all products in pending_review status
- [ ] Admin can approve (publish) or reject products
- [ ] Admin can filter the moderation queue by status and search term

### AC-4: Payment Processing
- [ ] Stripe Payment Intent is created on checkout
- [ ] Webhook correctly processes payment success and failure events
- [ ] Seller payouts are calculated with 10% platform fee deduction
- [ ] Inventory is restored on payment failure

### AC-5: Data Integrity
- [ ] Order creation uses MongoDB transactions to prevent partial state
- [ ] Variant stock is decremented atomically to prevent overselling
- [ ] Coupon usage count increments within the same transaction

---

> **Cross-references**: [techspec.md](techspec.md) (HOW), [appflow.md](appflow.md) (user journeys), [schema.md](schema.md) (data model)
