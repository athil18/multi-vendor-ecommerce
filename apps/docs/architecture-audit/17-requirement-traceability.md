# Requirement Traceability Matrix (17-requirement-traceability.md)
**Agent Responsibility:** Mapping high-level multi-vendor commerce requirements across Frontend, API, Database, Tests, and Implementation Status.

---

## 1. Traceability Matrix

| ID | Business Requirement | Frontend Route / Component | Backend API Route | Domain Service / Model | Database Table | Automated Test | Verification Status |
|---|---|---|---|---|---|---|---|
| **REQ-01** | User Authentication (Customer, Seller, Admin) | `/auth/login`, `/auth/register` | `/api/auth/login`, `/api/auth/register` | `AuthService.ts` | `users` | `e2e/auth.spec.ts`, `api/auth.test.ts` | **IMPLEMENTED** |
| **REQ-02** | Product Catalog Browsing & Search | `/products`, `ProductCard.tsx` | `/api/products` | `Product.ts`, `Variant.ts` | `products`, `variants` | `e2e/catalog-search.spec.ts`, `api/inventory.test.ts` | **IMPLEMENTED** |
| **REQ-03** | Product Details with SEO Metadata | `/products/[id]`, `ProductJsonLd.tsx` | `/api/products/[id]` | `Product.ts` | `products` | `e2e/catalog-search.spec.ts` | **IMPLEMENTED** |
| **REQ-04** | Multi-Vendor Cart Management | `useCartStore.ts`, `AddToCartButton.tsx` | Client Store | Client Zustand Store | LocalStorage | `e2e/checkout-cart.spec.ts`, `useAuthStore.test.ts` | **IMPLEMENTED** |
| **REQ-05** | Multi-Step Checkout Flow | `/checkout` | `/api/orders` | `OrderService.ts` | `orders`, `order_items` | `e2e/checkout-cart.spec.ts` | **IMPLEMENTED** |
| **REQ-06** | Stripe Payment Processing | `/checkout` (Stripe Elements) | `/api/payments/create-intent` | `PaymentService.ts` | `orders` | `payment-integrity.test.ts` | **IMPLEMENTED** |
| **REQ-07** | Webhook Idempotency & Order Capture | N/A (Webhook) | `/api/payments/webhook` | `EventLog.ts` | `event_logs` | `api/webhook-idempotency.test.ts` | **IMPLEMENTED** |
| **REQ-08** | Double-Entry Financial Accounting | `/seller` (Revenue views) | Internal Module | `lib/ledger.ts` | `journal_entries`, `transaction_lines` | `ledger.test.ts` | **IMPLEMENTED** |
| **REQ-09** | Vendor Store Dashboard & Management | `/seller`, `SellerLayout.tsx` | `/api/seller/dashboard` | `StoreService.ts` | `stores` | `e2e/seller-dashboard.spec.ts`, `services.test.ts` | **IMPLEMENTED** |
| **REQ-10** | Stripe Connect Vendor Onboarding | `/seller` | `/api/payments/onboarding` | `PaymentService.ts` | `stores` | Handled via API | **PARTIALLY IMPLEMENTED** |
| **REQ-11** | Vendor Payouts & Transfer Logs | `/seller` | `/api/payments/payouts` | `TransferLog.ts` | `transfer_logs` | `api/payout-retry.test.ts` | **PARTIALLY IMPLEMENTED** |
| **REQ-12** | Customer Order History & Tracking | `/customer`, `/customer/orders/[id]`| `/api/orders` | `OrderService.ts` | `orders` | `e2e/customer-portal.spec.ts` | **IMPLEMENTED** |
| **REQ-13** | Customer Dispute Filing | `/customer` (Dispute Modal) | `/api/disputes` | `Dispute.ts` | `disputes` | `api/disputes.attribution.test.ts` | **IMPLEMENTED** |
| **REQ-14** | Admin Governance & Moderation | `/admin`, `AdminLayout.tsx` | `/api/admin/governance/*` | `Store.ts`, `Review.ts` | `stores`, `reviews` | `e2e/admin-governance.spec.ts`, `agent-governance.test.ts` | **IMPLEMENTED** |
| **REQ-15** | Background Email Notification | N/A (Async Worker) | Internal Queue | `order.queue.ts`, `worker.ts` | Redis Queue | Mocked in test setup | **IMPLEMENTED** |
| **REQ-16** | Zero-Downtime Disaster Recovery | N/A (CLI Scripts) | `scripts/backup.ts`, `restore.ts` | Database DDL | PostgreSQL Dump | `scripts/disaster-recovery.test.ts` | **IMPLEMENTED** |
