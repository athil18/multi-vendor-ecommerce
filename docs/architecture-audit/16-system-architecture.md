# Master Architecture Map: Multi-Vendor Platform (16-system-architecture.md)
**Agent Responsibility:** End-to-end component interaction mapping, service dependencies, and physical-to-logical architecture.

---

## 1. Complete System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        Browser["Desktop & Mobile Web Browsers"]
        NextUI["Next.js 16 App Router (apps/src/app)"]
        AngularUI["Angular 22 Admin Backoffice (Port 4200)"]
    end

    subgraph Security & Edge Runtime
        EdgeMW["Next.js Edge Middleware (apps/src/middleware.ts)"]
        WebCrypto["Web Crypto HMAC-SHA256 JWT Verification"]
        RateLimiter["Sliding Window Rate Limiter"]
    end

    subgraph API & Route Handlers
        APIHandler["withErrorHandler (Error & Sentry Tracer)"]
        AuthAPI["/api/auth/*"]
        CatalogAPI["/api/products/* & /api/categories"]
        OrderAPI["/api/orders/*"]
        PaymentAPI["/api/payments/*"]
        SellerAPI["/api/seller/*"]
        AdminAPI["/api/admin/*"]
    end

    subgraph Domain Services & Core Ports
        AuthService["AuthService"]
        OrderService["OrderService"]
        PaymentService["PaymentService"]
        StoreService["StoreService"]
        LedgerModule["Double-Entry Escrow Ledger (lib/ledger.ts)"]
    end

    subgraph Infrastructure Adapters
        PrismaAdapter["Prisma ORM (schema.prisma)"]
        QueueAdapter["BullMQ Queue Provider (order.queue.ts)"]
        StorageAdapter["Local & S3 Storage (lib/storage.ts)"]
    end

    subgraph State & Data Tier
        PostgresDB[("PostgreSQL 16 (18 Relational Models)")]
        RedisDB[("Redis (BullMQ & Rate Limits)")]
        StripeGateway["Stripe Connect API (Hosted Onboarding & Payouts)"]
    end

    Browser --> NextUI
    Browser --> AngularUI
    NextUI --> EdgeMW
    AngularUI --> EdgeMW
    EdgeMW --> WebCrypto
    EdgeMW --> RateLimiter
    EdgeMW --> APIHandler
    
    APIHandler --> AuthAPI
    APIHandler --> CatalogAPI
    APIHandler --> OrderAPI
    APIHandler --> PaymentAPI
    APIHandler --> SellerAPI
    APIHandler --> AdminAPI

    AuthAPI --> AuthService
    CatalogAPI --> StoreService
    OrderAPI --> OrderService
    PaymentAPI --> PaymentService
    SellerAPI --> StoreService
    AdminAPI --> StoreService

    OrderService --> LedgerModule
    OrderService --> QueueAdapter
    PaymentService --> LedgerModule
    PaymentService --> StripeGateway

    AuthService --> PrismaAdapter
    OrderService --> PrismaAdapter
    PaymentService --> PrismaAdapter
    StoreService --> PrismaAdapter

    PrismaAdapter --> PostgresDB
    QueueAdapter --> RedisDB
```

---

## 2. Component Responsibility Matrix

| Subsystem | Primary Technologies | File Locations | Primary Role & Invariants |
|---|---|---|---|
| **Frontend App** | Next.js 16.2.9, React 19, Tailwind CSS 4, Zustand 5 | `apps/src/app`, `apps/src/components` | Renders dynamic customer marketplace, seller dashboard, and admin portal. |
| **Admin Client** | Angular 22.1.0, Lucide Angular, Tailwind CSS | `angular-frontend/src/app` | Standalone client designed for backoffice administration and AI concierge. |
| **Security Guard**| Next.js Edge Runtime, Web Crypto API | `apps/src/middleware.ts`, `apps/src/lib/jwt.ts` | Authenticates JWT signatures, enforces RBAC route boundaries, rate-limits abuse. |
| **Domain Logic** | TypeScript, Hexagonal Services | `apps/src/services/*`, `apps/src/core/ports/*`| Enforces business rules, multi-vendor splits, inventory validation, double-entry escrow. |
| **Persistence** | PostgreSQL 16, Prisma 7.9.1 | `apps/prisma/schema.prisma` | Stores relational commerce models with transactional ACID guarantees. |
| **Asynchronous** | BullMQ 5.78, Redis, Nodemailer | `apps/src/lib/queue/*` | Processes transactional order confirmation emails with exponential backoff retries. |
| **Financials** | Stripe API 22.2.1, Double-Entry Ledger | `apps/src/lib/stripe.ts`, `apps/src/lib/ledger.ts` | Generates payment intents, validates webhook signatures, records debits/credits. |
