# 10 — Deployment, Testing & Operations Runbook

> **Document ID:** DOC-10-RUNBOOK  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Lead DevOps & Site Reliability Engineer  

---

## 1. Local Development Setup

### 1.1 Prerequisites
- **Node.js:** `>=20.17.0 LTS`
- **npm:** `>=10.x` or `11.x`
- **PostgreSQL:** `>=16.x`
- **Redis (Optional for local):** `>=7.x` (In-memory fallback operates if offline)

### 1.2 Installation & Initialization
```bash
# 1. Clone & install dependencies
git clone <repo-url> nexus-marketplace
cd nexus-marketplace
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and supply valid DATABASE_URL, JWT_SECRET, STRIPE keys

# 3. Initialize PostgreSQL & Prisma ORM
npm run db:generate    # Generates Prisma client
npm run db:migrate     # Applies relational schema migrations
npm run seed:run       # Seeds mock categories, ateliers, and products

# 4. Start local development server
npm run dev            # Starts Next.js with Turbopack on http://localhost:3000
```

---

## 2. Testing Pyramid & Verification Runbook

Nexus enforces a 4-tier testing pyramid to guarantee regression prevention across all engineering changes:

```
                  ▲
                 / \
                /   \     Level 3: Full Playwright E2E Browser Journeys
               / E2E \    (npm run test:e2e)
              /───────\
             / Backend \  Integration & API Route Handlers
            /  Integ.   \ (npm run test:backend)
           /─────────────\
          /   Component   \ Level 2: Component & Accessibility Tests
         /     Testing     \ (npm run test:component)
        /───────────────────\
       /      Unit Tests     \ Level 1: Pure Functions, Math, Cart, Schemas
      /   & Security Invariant\ (npm run test:unit & verify-security-hardening)
     /─────────────────────────\
```

### 2.1 Verification Commands

```bash
# Tier 1: Unit & Cart State Tests (Level 1)
npm run test:unit
# Command: tsx scripts/run-level-1-unit.ts
# Scorecard: 11 / 11 tests passing (100%)

# Tier 2: Component & WCAG Accessibility Tests (Level 2)
npm run test:component
# Command: tsx scripts/run-level-2-component.ts
# Scorecard: 9 / 9 tests passing (100%)

# Tier 3: Master Security Invariant Suite
npx tsx scripts/verify-security-hardening.ts
# Scorecard: 36 / 36 tests passing (100%)

# Tier 4: Static Type Check & Build Verification
npx tsc --noEmit
npm run build
```

---

## 3. Environment Lifecycle

| Environment | Purpose | URL / Host | Invariants |
| :--- | :--- | :--- | :--- |
| **Local** | Developer workstation | `http://localhost:3000` | Mock data, optional local storage fallback. |
| **Staging** | Pre-production QA | `https://staging.nexus-ecommerce.com` | Dedicated staging DB, Stripe Test mode, BullMQ worker active. |
| **Production** | Live marketplace | `https://nexus-ecommerce.com` | Managed RDS PostgreSQL, S3 asset bucket, Stripe Live mode, Sentry active. |

---

## 4. Production Deployment Pipeline

### 4.1 Automated Pre-Flight Checklist
Before triggering any production deployment, verify:
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm run test:unit` passes 100%.
- [ ] `npm run test:component` passes 100%.
- [ ] `npx tsx scripts/verify-security-hardening.ts` passes 100%.
- [ ] Database migration is non-destructive (`npm run db:migrate --dry-run`).
- [ ] No server-side secrets are prefixed with `NEXT_PUBLIC_`.

### 4.2 Production Deployment Procedure (Docker / CapRover / VPS)
```bash
# 1. Pull latest production commit
git checkout main
git pull origin main

# 2. Apply database migrations
npm run db:migrate

# 3. Build optimized production container
docker build -t nexus-marketplace:latest .

# 4. Launch multi-service stack
docker compose -f docker-compose.prod.yml up -d

# 5. Verify deployment health
curl -f https://nexus-ecommerce.com/api/health
```

---

## 5. Health Monitoring & Incident Response

### 5.1 Automated Health Checks
- **Primary Endpoint:** `GET /api/health`
- **Expected Status:** `HTTP 200 OK` with `{ status: "healthy", services: { database: "healthy" } }`.
- **Degraded Status:** Returns `HTTP 503 Service Unavailable` with `{ status: "degraded", services: { database: "unavailable" } }` if PostgreSQL connection fails (without leaking internal credentials).

### 5.2 Emergency Rollback Procedure
If a critical regression or vulnerability is detected post-deployment:
1. **Trigger Container Rollback:**
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker tag nexus-marketplace:previous nexus-marketplace:latest
   docker compose -f docker-compose.prod.yml up -d
   ```
2. **Database Rollback:** If migration caused schema breakage, execute down-migration script:
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```
3. **Escrow Lock Emergency Freeze:**
   Set `PAYMENT_EMERGENCY_FREEZE=true` in environment to halt automated payouts while investigating disputes.
