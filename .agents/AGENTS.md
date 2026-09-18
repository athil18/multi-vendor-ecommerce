# Project Agent Guidelines — Nexus Multi-Vendor E-Commerce Platform

**Document ID:** `NEXUS-AGENTS-GOV-2026`  
**Directorate Governance:** `500+ AI Agent & Agency Ecosystem`  
**Workspace Root:** `e:/500+_AI_Agent/multi-vendor-ecommerce`  
**Design Directorate Skill:** `ecommerce-design-directorate`  

---

## 1. Core Architecture Principles

1. **Dual-Frontend Monorepo Architecture**:
   - **Storefront & Public Catalog:** Next.js 16.2.9 (Turbopack, App Router, React Server Components, Edge Route Caching).
   - **Customer & Admin Portals:** Angular 22 Single Page Application (`angular-frontend/`) with signal-based stores.
   - Strict TypeScript type safety across all components and models.

2. **Database & Transaction Integrity**:
   - **PostgreSQL 16** with Prisma ORM 7.9.1 and `@prisma/adapter-pg` connection pooling.
   - Double-entry financial ledger (`debit === credit`) with idempotency guards and vendor escrow splits.
   - Atomic inventory decrements inside ACID transactions.

3. **Security & Identity Governance**:
   - JWT token authentication with bcrypt password hashing.
   - Role-Based Access Control (`customer`, `seller`, `admin`) enforced at middleware and route handlers.

---

## 2. Storefront UI/UX & Design Directorate Governance

In accordance with the **500+ AI Agent Ecosystem**, all frontend components and user experiences are strictly governed by the **Design Directorate**:

| AI Specialist Agent | Domain Responsibility | Implementation Mandate |
|---|---|---|
| `🎨 design-ui-designer` | Design Tokens & System | Enforces Tailwind v4 `--color-brand-*` palette (50-950), `.glass-panel-luxury`, and typography scales. Zero hardcoded colors allowed. |
| `🗺️ design-ux-architect` | Information Architecture | Governs multi-vendor checkout funnels, catalog filtering taxonomies, mobile navigation drawers, and zero-layout-shift layouts. |
| `🛡️ design-brand-guardian` | Brand Identity & Vector Assets | Enforces brand typography (`Inter` & `Geist`), local SVG vector graphics, and WCAG 2.1 SC 2.5.3 (Label in Name) accessible name alignment. |
| `✨ design-whimsy-injector` | Micro-Interactions & Motion | Replaces bloated JS libraries with zero-JS GPU-accelerated CSS keyframes (`will-change: transform`), subtle ambient orbs, and hover lifts. |
| `🧱 design-ui-finish-gate-reviewer` | Quality Gate & Anti-Generic Enforcement | Prohibits internal developer jargon on customer-facing screens; enforces Consumer Trust Pillars (Artisan Quality, Direct Support, Buyer Protection). |
| `♿ testing-accessibility-auditor` | Compliance & Inclusivity | Enforces WCAG 2.1 AA compliance, focus-visible rings, ARIA landmark dialogs, and contrast ratios > 4.5:1 across light and dark themes. |
| `⚡ testing-performance-benchmarker` | Performance Benchmarking | Enforces Google Core Web Vitals guardrails: **TBT = 0 ms**, **CLS ≤ 0.05**, and **LCP ≤ 1,800 ms** under 4x CPU slowdown emulation. |

---

## 3. Mandatory Component `@agent` Annotations

Every frontend screen, layout, and interactive component MUST declare its governing agents in its file header:

```typescript
/**
 * Component Name
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-brand-guardian
 * @agent design-whimsy-injector
 * @agent design-ui-finish-gate-reviewer
 * @agent testing-accessibility-auditor
 * @agent testing-performance-benchmarker
 */
```
