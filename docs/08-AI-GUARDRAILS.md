# 08 — AI Operating Guardrails & Development Constitution

> **Document ID:** DOC-08-AI-GUARDRAILS  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Principal Software Architect  

---

## 1. Operating Constitution

This document defines the strict behavioral and engineering rules for any AI agent operating on the Nexus codebase. Violations of these rules represent immediate failure of the engineering standard.

---

## 2. Core Directives

### 2.1 Rule of Zero Assumptions ("Do Not Vibe Code")
1. **Never guess requirements:** If an architectural, financial, escrow, or schema requirement is ambiguous, check the numbered `/docs/` repository first. If unstated, ask the human owner before proceeding.
2. **Never claim success without evidence:** Never state "Feature complete," "Tests passing," or "Secure" without providing the actual command output and passing test scorecard.
3. **No fake or placeholder functionality:** Stubs, mock APIs, `// TODO: implement later`, or fake payment confirmations in production paths are strictly banned.

### 2.2 Architectural Non-Interference
- **Stack Lock:** The stack is strictly locked to **Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, PostgreSQL 16, Prisma ORM 7.9.1, Stripe Connect, Zustand 5, BullMQ 5.78**.
- **No rogue migrations:** Agents may not migrate from Prisma to another ORM, switch from Zustand to Redux, or introduce an alternate backend runtime without explicit human authorization.

---

## 3. Code Quality & Engineering Standards

### 3.1 What to Enforce (Preferred Patterns)
- **Separation of Concerns:** Keep API route handlers thin; delegate business logic to domain services (`src/services/`) and repository ports (`src/core/ports/`).
- **Explicit Type Contracts:** Export typed DTOs and Zod schemas for every API input and response.
- **Fail Fast & Explicitly:** Validate inputs at the boundary using Zod before triggering database or third-party service calls.
- **Deterministic Currency Math:** Always execute price, tax, discount, and fee calculations in integer cents ($19.99 = 1999) using integer arithmetic.

### 3.2 What to Avoid (Forbidden Anti-Patterns)
- ❌ **Giant Components:** React components exceeding 250 lines must be decomposed into focused subcomponents.
- ❌ **Magic Values:** Hardcoded URLs, default passwords (e.g. `:123@`), status strings, or platform fee rates (always use `PLATFORM_FEE_PERCENTAGE = 0.10`).
- ❌ **Silent Error Swallowing:** Empty `catch (e) {}` blocks are forbidden; every error must be logged or returned via `withErrorHandler`.
- ❌ **Unchecked Any:** Avoid TypeScript `any`; define explicit interfaces or use `unknown` with runtime type narrowing.

---

## 4. Dependency Governance Protocol

Before running `npm install` for any new package, the AI agent must systematically evaluate:
1. **Existing Stack Capabilities:** Does Node.js native crypto, React 19, Next.js 16, or an already installed package solve the problem?
2. **Bundle Size Impact:** Does the library introduce bloat into client-side JS bundles?
3. **Security & Supply Chain:** Does the package have known vulnerabilities (`npm audit`) or inactive maintenance?
4. **License & Compatibility:** Is the library compatible with commercial e-commerce deployment (MIT, Apache-2.0, BSD)?

*If the package is not strictly necessary, do NOT install it.*

---

## 5. Security & Sensitive Operations Invariants

1. **Secrets:** Never print, log, or hardcode API keys, Stripe secrets, JWT secrets, or connection strings.
2. **Tenant Isolation:** Always verify `storeId === user.store.id` on seller mutations.
3. **Soft-Deletions:** Always use `deletedAt: new Date()` instead of raw `delete()` queries.
4. **Escrow Locks:** Never release payout funds without verifying delivered status and checking `TransferLog` for previous payout execution.
