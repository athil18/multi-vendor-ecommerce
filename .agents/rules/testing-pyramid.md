# Testing Pyramid & Verification Rule

Nexus enforces a structured 3-level testing pyramid. All new features and bug fixes must follow Test-Driven Development (`test-driven-development` skill) and clear the appropriate test level before code is considered complete.

## Testing Layers & Execution Commands

1. **Level 1 — Unit Tests (Pure Functions & Schemas):**
   ```bash
   npm run test:unit
   ```
   - Covers: Currency calculation, tax math, commission splits, cart calculations, Zod validation schemas.
   - Requirement: 100% test coverage on escrow calculation and price arithmetic.

2. **Level 2 — Component Tests (Storefront UI & Modals):**
   ```bash
   npm run test:component
   ```
   - Covers: React components, product cards, cart drawer, checkout forms, modal dialogs.
   - Requirement: Verify interactive states (loading, error, success, empty cart) and accessibility.

3. **Backend Integration Tests:**
   ```bash
   npm run test:backend
   ```
   - Covers: Next.js API route handlers, Prisma database interactions, authentication endpoints.
   - Runner: `vitest.backend.config.ts`.

4. **Level 3 — End-to-End (E2E) Tests:**
   ```bash
   npm run test:e2e
   ```
   - Covers: Full user journey from catalog browsing, adding items from multiple stores, Stripe checkout simulation, vendor dashboard order fulfillment.
   - Runner: Playwright.

5. **Complete Suite Validation:**
   ```bash
   npm run test:pyramid
   ```
   - Must be executed and pass before opening PRs or shipping changes.
