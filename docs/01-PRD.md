# 01 — Product Requirements Document (PRD)

> **Document ID:** DOC-01-PRD  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Principal Software Architect & Product Lead  

---

## 1. Product Vision

**Nexus** is an enterprise-grade multi-vendor marketplace platform built to democratize commerce for independent merchants, artisans, and boutique brands while delivering a unified, high-trust, and frictionless shopping experience for modern consumers. 

Nexus combines the agility of multi-tenant storefronts with the security of automated escrow settlements, Stripe Connect split disbursements, rigorous catalog moderation, and AI-assisted shopping copilots.

---

## 2. Problem Statement

### 2.1 The Merchant Problem
Independent creators and specialty retailers are forced to choose between:
1. **Isolated D2C Stores (e.g. standalone Shopify):** High customer acquisition costs, complex maintenance, and no pooled discovery network.
2. **Monopolistic Marketplaces (e.g. Amazon):** Exorbitant platform take-rates (15–30%), aggressive private-label competition, delayed payouts, and complete detachment from customer relationships.

### 2.2 The Consumer Problem
Consumers seeking unique, high-quality, or artisan goods face fragmented checkout experiences across multiple small sites, untrusted payment methods, inconsistent shipping timelines, and zero purchase dispute protection.

---

## 3. Target Users & User Personas

### 3.1 Primary Personas

#### Persona 1: Artisan / Boutique Merchant ("Merchant Maya")
- **Demographics:** Specialty goods retailer, maker, or brand owner selling 50–500 SKUs.
- **Pain Points:** Cash-flow bottlenecks, delayed vendor disbursements, complex inventory systems, fraudulent chargebacks.
- **Needs:** Fast onboarding, Stripe Express integration, intuitive SKU/variant manager, transparent escrow release schedules, fulfillment dashboards.

#### Persona 2: Discerning Shopper ("Shopper Sam")
- **Demographics:** Consumer aged 22–50 valuing curated quality, speed, and design polish.
- **Pain Points:** Cluttered ad-heavy marketplaces, untrusted vendor gateways, complex multi-vendor shipping fees.
- **Needs:** Unified shopping cart across multiple sellers, instant search/filtering, transparent order tracking, responsive UI.

#### Persona 3: Platform Trust & Operations Admin ("Admin Alex")
- **Demographics:** Internal marketplace operator managing catalog integrity, escrow, and vendor compliance.
- **Pain Points:** Unmonitored counterfeit listings, fraudulent chargebacks, manual payout accounting.
- **Needs:** Strict catalog review/approval queue, multi-vendor ledger visibility, dispute arbitration controls.

---

## 4. Business & Product Goals

| ID | Objective | Success Metric |
| :--- | :--- | :--- |
| **BG-1** | Provide transparent, fair monetization for merchants | Standard 10% platform take-rate with automated Stripe Connect payout splits. |
| **BG-2** | Guarantee buyer trust and dispute protection | 100% of order funds held in automated escrow until confirmed delivery. |
| **BG-3** | Maintain pristine catalog quality | Zero unmoderated products published; mandatory admin approval gate. |
| **PG-1** | Zero overselling under concurrent traffic | Transactional order creation with atomic inventory reservations. |
| **PG-2** | Sub-second storefront browsing & Core Web Vitals | LCP < 1.2s, CLS < 0.01, TBT < 50ms across all device form factors. |
| **PG-3** | Zero-trust security & data privacy | Hashed credentials, strict RBAC, constant-time verification, OWASP Top 10 compliance. |

---

## 5. Core Value Proposition

1. **Unified Multi-Vendor Cart & Single Checkout:** Customers buy items from 5 different sellers in a single payment transaction.
2. **Automated Escrow & Ledger Settlement:** Stripe Connect splits payments at the gateway level, holds funds in escrow, and releases payouts automatically upon delivery.
3. **Curated & Moderated Catalog:** No unverified spam; every product passes through strict admin quality gating.
4. **Context-Aware AI Shopping Copilot:** Shoppers get natural language gift recommendations, product comparisons, and order inquiries.

---

## 6. User Stories & Epics

### Epic 1: Identity & Role Governance
- **US-1.1 (Customer/Seller/Admin Registration):** As a user, I want to create an account with my email, password, and designated role so that I can access personalized features.
- **US-1.2 (Session Security):** As a user, I want short-lived access tokens and secure refresh cookies so my account remains secure across browsing sessions.
- **US-1.3 (Password Reset):** As a user, I want a secure password reset link sent to my email so I can recover my account if credentials are lost.

### Epic 2: Multi-Tenant Catalog Management
- **US-2.1 (Store Creation):** As a seller, I want to create and configure a branded store profile (logo, banner, description).
- **US-2.2 (Product & Variant Management):** As a seller, I want to manage product SKUs with price, stock, images, and custom options (color, size).
- **US-2.3 (Moderation Lifecycle):** As a seller, I want to submit drafts for admin review; as an admin, I want to approve or reject submissions with feedback.

### Epic 3: Storefront Discovery & Shopping Cart
- **US-3.1 (Filtering & Search):** As a customer, I want to filter products by category, price range, availability, and keyword search.
- **US-3.2 (Persistent Cart):** As a customer, I want my cart synchronized in localStorage and preserved across page refreshes.
- **US-3.3 (Coupon Application):** As a customer, I want to apply global or seller-specific discount codes with instant validation.

### Epic 4: Checkout, Payments & Escrow Settlement
- **US-4.1 (Single Checkout):** As a customer, I want to provide shipping details and pay for items from multiple sellers using Stripe.
- **US-4.2 (Inventory Reservation):** As a customer, I want my items reserved atomically so that my order cannot be oversold.
- **US-4.3 (Escrow & Payout Schedule):** As a seller, I want my earnings held securely in escrow and automatically transferred to my bank upon verified order delivery.

### Epic 5: Fulfillment & Order Tracking
- **US-5.1 (Seller Fulfillment):** As a seller, I want to update line-item fulfillment statuses (`processing`, `shipped`, `delivered`).
- **US-5.2 (Customer Order Tracking):** As a customer, I want to view active and past order progress with itemized status steppers.
- **US-5.3 (Dispute Handling):** As a customer, I want to open a dispute if an item is damaged or missing, freezing escrow funds until resolved.

---

## 7. Functional & Non-Functional Requirements

### 7.1 Functional Requirements
- **FR-1:** Multi-role RBAC (`customer`, `seller`, `admin`).
- **FR-2:** Multi-vendor cart aggregation and line-item attribution.
- **FR-3:** Stripe PaymentIntent integration with webhook confirmation.
- **FR-4:** Double-entry ledger accounting (`LedgerAccount`, `JournalEntry`).
- **FR-5:** Soft-delete preservation for all catalog and review records.
- **FR-6:** In-memory and distributed token-bucket rate limiting.

### 7.2 Non-Functional Requirements
- **NFR-1 (Security):** SHA-256 hashed refresh tokens, bcrypt (12 rounds) passwords, timing-safe equality checks, no client secrets.
- **NFR-2 (Performance):** Page load < 1.5s on 4G networks; sub-100ms API response time for cached catalog queries.
- **NFR-3 (Availability):** 99.9% uptime target; automated health checks at `/api/health`.
- **NFR-4 (Accessibility):** WCAG 2.1 AA compliance; full keyboard navigation, screen reader ARIA landmarks, zero focus traps.

---

## 8. MVP Scope vs. Excluded Features

### 8.1 In-Scope (MVP Release)
- Full customer storefront, catalog filtering, product detail pages.
- Client cart with Zustand persist middleware.
- Stripe PaymentIntent checkout + webhook settlement.
- Seller store management, SKU listing, fulfillment dashboard.
- Admin moderation queue and product status approval.
- Secure authentication (JWT + HttpOnly refresh cookies).
- Soft deletions and double-entry accounting ledger.

### 8.2 Explicitly Excluded Features (Out of Scope for v1.0)
- Native mobile applications (iOS/Android) — Web responsive only.
- Live real-time buyer-seller chat.
- Third-party carrier rate calculation API (Flat/Free shipping for v1.0).
- Multi-currency conversions (USD canonical for v1.0).
- Cryptocurrency payment integrations.

---

## 9. Business Rules & Financial Invariants

1. **Platform Take-Rate:** Standard 10% platform fee deducted from item gross before seller payout.
2. **Escrow Lock:** Payout funds remain in `ESCROW_LOCKED` until the customer confirms delivery or 14-day auto-completion triggers.
3. **Integer Cents Math:** All currency calculations must be executed in integer cents ($19.99 = 1999 cents) to eliminate floating-point rounding errors.
4. **Soft Deletions:** Products, stores, and reviews must never be hard-deleted; `deletedAt: new Date()` must be populated to preserve historical integrity.
