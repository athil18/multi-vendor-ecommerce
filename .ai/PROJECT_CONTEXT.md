# Multi-Vendor E-Commerce Platform — Project Context

## Architecture Overview
- **Monorepo Structure:** `apps/` (Next.js 16 Storefront + API) + `angular-frontend/` (Angular 22 Admin/Seller Dashboard)
- **Database:** PostgreSQL 16 (Port 5432) + Prisma 7.9.1
- **Cache & Queue:** Redis (Port 6379) + BullMQ 5.78
- **Authentication:** JWT in HTTP-Only Cookies + bcryptjs + Edge middleware
- **Payments:** Stripe Connect + Double-Entry Financial Ledger
- **State:** Zustand (Storefront) + RxJS Signals (Angular)

## Endpoints & Ports
- Next.js Storefront / API: `http://localhost:3000`
- Angular Admin Portal: `http://localhost:4200`
- PostgreSQL DB: `localhost:5432` / DB: `marketplace`
