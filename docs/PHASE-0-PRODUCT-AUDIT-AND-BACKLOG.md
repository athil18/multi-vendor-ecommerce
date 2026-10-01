# Nexus Multi-Vendor E-Commerce Platform: Phase 0 Re-Engineering Audit & Master Plan

## 1. Executive Summary
This document establishes the architectural audit, UX evaluation, design system specifications, and prioritized backlog for re-engineering the Nexus Multi-Vendor E-Commerce platform into a commercially credible, high-trust, production-grade product.

---

## 2. Product & Architecture Audit

### A. Product & Business Model
- **Platform Model:** Multi-vendor curated marketplace connecting independent ateliers and master workshops directly with discerning buyers.
- **Revenue Model:** Automated split payments with a 10% platform take-rate and escrow holds until delivery confirmation.
- **Target Audience:** Connoisseurs seeking high-craftsmanship goods (mechanical keyboards, audio hardware, aerodynamic cycling gear, full-grain leather, sustainable home goods).

### B. User Experience & Friction Analysis
1. **Search Disconnect (Critical UX Defect):**
   - The global header navbar has a search input posting to `/products?search=...`.
   - The catalog page (`/products`) initialized `searchTerm` to empty string and never parsed or synced with `searchParams`, causing search from the header to fail silently.
2. **Checkout & Payment Integrity (Critical Trust & Security Defect):**
   - The checkout form previously displayed raw card number, expiry, and CVC inputs in un-tokenized React state without Stripe Elements or proper client payment confirmation.
   - Order creation must be paired with genuine payment processing options, server-validated totals, and clear escrow status.
3. **Artificial Vanity Metrics (Credibility Defect):**
   - Marketing buzzwords ("The 25-Lakh Flagship Standard", "$4.8M+ Escrow Protected", "4 collectors currently viewing right now", "120+ Master Ateliers") violated strict commercial integrity rules.
   - These must be replaced with legitimate trust indicators: verified vendor badge criteria, explicit 14-day inspection window, automated escrow protection, and carbon-neutral logistics.
4. **Catalog Navigation & Filter Persistence:**
   - Filters on `/products` were not synchronized with URL query params, breaking shareable URLs, browser back/forward navigation, and deep linking from category menus.

### C. Design System & Aesthetic Foundation
- **Current State:** Overly decorative with conflicting glassmorphism classes (`.glass-panel-dribbble`, `.glass-luxury-card`, `.ambient-glow-purple`) and ad-hoc color tokens.
- **Target State:** Grounded, high-end commercial design system:
  - Neutral palette: Slate / Zinc foundations for crisp contrast and readability.
  - Brand palette: Deep indigo / violet (`#4f46e5`, `#6366f1`) for focused accents.
  - Surfaces: Clean 1px borders (`border-surface-200 dark:border-surface-800`), subtle shadows, 0.75rem to 1rem radii.
  - WCAG 2.1 AA compliant text contrast and universal `:focus-visible` ring.

---

## 3. Prioritized Re-Engineering Backlog

| Priority | ID | Domain | Issue Description | Planned Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | DEF-01 | A11y & Tests | Test pyramid failures (NexusLogo aria-label & ProductsPage sort label) | Standardize `aria-label="Nexus Homepage"` and `aria-label="Sort products by"` |
| **P0** | DEF-02 | Discovery | Global navbar search does not populate `/products` filter state | Wire `useSearchParams` in `/products` with bidirectional URL sync |
| **P0** | DEF-03 | Payments & Security | Raw un-tokenized card inputs in checkout without Stripe confirmation | Implement authentic Stripe payment intent integration + Escrow payment selection with server-side validation |
| **P1** | DES-01 | Design System | Ad-hoc CSS classes and excessive glassmorphism in `globals.css` | Streamline into coherent design tokens: surfaces, borders, elevations, typography |
| **P1** | UX-01 | Trust & Copy | Vanity metrics and fake urgency counters across Homepage & PDP | Replace with authentic escrow guarantees, artisan workshop vetting criteria, and real review structures |
| **P1** | UX-02 | Catalog (PLP) | Lack of URL persistence for filters and category navigation | Implement full query parameter persistence, active filter chips, mobile filter drawer, responsive layout |
| **P1** | UX-03 | Product Page (PDP) | Missing structured specifications, returns policy, and sticky mobile purchase dock | Build clean above-the-fold hierarchy, authentic maker dossier, specs table, and sticky buy drawer |
| **P2** | UX-04 | Cart & Drawer | Free shipping threshold indicator and quantity controls polish | Refine bag drawer with smooth animations, clear item removal, and instant checkout transition |
| **P2** | UI-01 | Navigation & Header | Navbar mega-menu and search bar polish | Streamline category navigation, search bar autofocus, and mobile drawer accessibility |
| **P2** | UI-02 | Footer | Footer information architecture | Enrich with genuine buyer protection policy links, security disclosures, and newsletter subscription |
| **P3** | QA-01 | Responsive & Perf | Final multi-viewport regression and Core Web Vitals audit | Execute full testing pyramid (`test:unit`, `test:component`, `test:pyramid`) and build verification |
