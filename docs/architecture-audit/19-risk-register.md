# Forensic Risk Register (19-risk-register.md)
**Agent Responsibility:** Enumeration of identified architectural, security, operational, and financial risks.

---

## 1. Risk Register Matrix

| Risk ID | Category | Description | Evidence Location | Severity | Likelihood | Impact | Priority | Recommended Action |
|---|---|---|---|---|---|---|---|---|
| **RSK-01** | DevOps | CI/CD build failure due to non-existent Dockerfiles and missing smoke script | `apps/.github/workflows/ci.yml` | `CRITICAL` | `HIGH` | `HIGH` | **P0** | Remove `docker-verify` and `smoke` command; add real multi-stage Dockerfile |
| **RSK-02** | DevOps | CD deployment pipeline fails attempting to run MongoDB migrations | `apps/.github/workflows/cd.yml` | `CRITICAL` | `HIGH` | `HIGH` | **P0** | Replace `migrate:up` with `npx prisma migrate deploy` and `DATABASE_URL` |
| **RSK-03** | Data | Fallback hardcoded address in Order creation can corrupt real shipping data | `apps/src/models/Order.ts:L24-35` | `HIGH` | `MEDIUM` | `HIGH` | **P1** | Enforce mandatory `shippingAddressId` validation; return HTTP 400 if absent |
| **RSK-04** | Architecture| Dual frontend divergence between Next.js fullstack and Angular client | `apps/src/app` vs `angular-frontend/` | `MEDIUM` | `HIGH` | `MEDIUM` | **P1** | Unify into Next.js or isolate Angular strictly as the external Backoffice port 4200 |
| **RSK-05** | Database | Missing compound index on `Category.parentId` causes slow hierarchy queries | `apps/prisma/schema.prisma:L247` | `MEDIUM` | `HIGH` | `LOW` | **P2** | Add `@@index([parentId])` to Category model in Prisma schema |
| **RSK-06** | Code Hygiene| Type pollution & runtime overhead from MongoDB `prisma-wrap.ts` shims | `apps/src/models/prisma-wrap.ts` | `MEDIUM` | `MEDIUM` | `MEDIUM` | **P2** | Refactor services to query native Prisma client directly without Mongoose wrappers |
| **RSK-07** | Frontend | Hydration mismatch warnings in Zustand `useCartStore` on initial page render | `apps/src/store/useCartStore.ts` | `LOW` | `MEDIUM` | `LOW` | **P3** | Add `isHydrated` mounting guard before displaying dynamic cart totals |
| **RSK-08** | Testing | Vitest test runner hangs on `prisma.$connect()` if local PostgreSQL is stopped | `apps/test/setup.ts:L46` | `MEDIUM` | `MEDIUM` | `MEDIUM` | **P2** | Add connection healthcheck guard with fast fallback for pure unit test suites |
