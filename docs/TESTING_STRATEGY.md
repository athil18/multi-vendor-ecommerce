# Testing Strategy — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14 | Status: Not Yet Implemented

---

## Current State

⚠️ **No automated tests exist in the codebase.** This document defines the testing strategy to be implemented in Phase 6–8.

## Testing Pyramid

```
         ┌─────────┐
         │   E2E   │  ← Playwright / Cypress (Phase 8)
         │  Tests  │     Full user journeys
        ┌┴─────────┴┐
        │Integration │ ← Supertest + MongoDB Memory Server (Phase 7)
        │   Tests    │    API route testing with real DB
       ┌┴────────────┴┐
       │  Unit Tests   │ ← Jest / Vitest (Phase 6)
       │               │    Pure functions, utilities, validators
       └───────────────┘
```

## Unit Tests (Phase 6)

### Targets
| Module | File | Tests |
|--------|------|-------|
| Pagination | `lib/pagination.ts` | Default values, edge cases (page=0, limit=999), type coercion |
| JWT | `lib/jwt.ts` | Token generation, verification, expiry, invalid token handling |
| Auth middleware | `lib/auth.ts` | Missing header, invalid token, suspended user, role authorization |
| Zod schemas | `lib/schemas/auth.ts` | Valid inputs, validation errors, edge cases |
| Product transitions | `models/Product.ts` | All valid/invalid status transitions against the transition map |

### Framework
- **Vitest** (compatible with Next.js, faster than Jest)
- `@testing-library/react` for component tests

## Integration Tests (Phase 7)

### Targets
| Endpoint Group | Priority | Tests |
|---------------|----------|-------|
| Auth routes | Critical | Register, login, refresh, logout, suspended user, duplicate email |
| Order creation | Critical | Successful order, insufficient stock, expired coupon, multi-seller |
| Product CRUD | High | Create, read, filter, pagination, text search |
| Seller routes | High | Store creation, product listing, order fulfillment |
| Admin routes | Medium | Product moderation, status transitions |
| Payment routes | Medium | Intent creation, webhook processing |

### Setup
- **mongodb-memory-server** for isolated test database
- **Supertest** for HTTP assertions
- Test fixtures for users, products, variants, orders

## E2E Tests (Phase 8)

### Critical User Journeys
1. Customer: Register → Browse → Add to Cart → Checkout → Order Confirmation
2. Seller: Register → Create Store → List Product → Submit for Review
3. Admin: Login → View Queue → Approve Product → Verify on Storefront

### Framework
- **Playwright** (cross-browser, headless)
- Page Object Model pattern

## Manual Testing Checklist

### Before Each Release
- [ ] Register new customer, seller, admin accounts
- [ ] Login/logout flow works
- [ ] Theme toggle works (light/dark)
- [ ] Product filtering and sorting works
- [ ] Add to cart and cart persistence works
- [ ] Checkout flow completes
- [ ] Seller store creation works
- [ ] Seller can create and submit products
- [ ] Admin can approve/reject products
- [ ] Responsive design on mobile viewport
- [ ] `npm run build` passes

---

> **Cross-references**: [rules.md](rules.md) (quality gates), [implementationplan.md](implementationplan.md) (phase schedule)
