# 🗂️ MASTER WORKSPACE FILE ORGANIZER & CODEBASE MAP
## Multi-Vendor E-Commerce Platform — 5-Agent Collaborative Output

> **Governing Framework:** 500+ AI Agent Ecosystem  
> **Workspace:** `e:/500+_AI_Agent/multi-vendor-ecommerce`  
> **Active Specialist Agents Dispatched:**
> 1. `🛠️ engineering-developer-tooling-engineer` — Workspace structure & DX
> 2. `🗺️ engineering-codebase-onboarding-engineer` — Codebase mapping & context indexing
> 3. `📑 engineering-orgscript-engineer` — File automation & maintenance scripts
> 4. `🏗️ engineering-backend-architect` — Hexagonal domain layer boundaries
> 5. `✍️ 16-documentation-writer` — Structured documentation registry

---

## 1. 🗺️ MASTER CODEBASE DIRECTORY MAP
*Influenced by `engineering-codebase-onboarding-engineer` & `engineering-developer-tooling-engineer`*

```text
multi-vendor-ecommerce/
│
├── 📁 .agents/                             # 500+ AI Agent Directives & Domain Rules
│   └── AGENTS.md                          # Ecosystem governance directives
│
├── 📁 .ai/                                 # Centralized Master Documentation & State
│   ├── AGENT_REGISTRY.md                  # Domain Agent to Directory Mapping
│   ├── AGENT_WORKFLOW.md                  # Lead Orchestrator Execution Hierarchy
│   ├── MASTER_FILE_ORGANIZER_REPORT.md    # Active File Organization Master Plan
│   ├── MASTER_FORENSIC_AUDIT_REPORT.md    # Forensic System Audit & Baseline
│   ├── PROJECT_CONTEXT.md                 # Unified Technology & Port Specification
│   └── TASK_STATE.md                      # Active Task & Subsystem Health Tracking
│
├── 📁 angular-frontend/                    # 🅰️ Angular 22 Admin & Seller Portal (:4200)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                      # Services, Models, Guards, Auth Interceptor
│   │   │   │   ├── interceptors/          # withCredentials HTTP interceptor
│   │   │   │   ├── models/                # commerce.model.ts (User, Store, Product, Order)
│   │   │   │   └── services/              # AuthService, CartService, OrderService, SellerService
│   │   │   ├── features/                  # Admin & Customer feature modules
│   │   │   └── shared/                    # Cart Drawer, Navbar, Footer components
│   │   └── styles.css                     # Global Tailwind 4 styles & CSS variables
│   ├── angular.json                       # Angular CLI Build & Dev Server config
│   └── package.json                       # Angular 22.1 dependencies
│
└── 📁 apps/                                # 🌐 Next.js 16 Storefront & Backend API (:3000)
    ├── prisma/
    │   └── schema.prisma                  # PostgreSQL 16 Schema (18 Relational Models)
    ├── seeds/
    │   └── index.ts                       # Idempotent Database Seed Script
    ├── src/
    │   ├── app/                           # Next.js App Router (Storefront + API Routes)
    │   │   ├── api/                       # REST Endpoints (Auth, Products, Cart, Orders, Webhook)
    │   │   ├── (storefront)/              # Customer Storefront Pages (Home, Product Details, Cart)
    │   │   └── layout.tsx / page.tsx
    │   ├── core/                          # 🏛️ Hexagonal Domain Ports
    │   │   └── ports/                     # IOrderRepository, ICatalogRepository, IUserRepository, etc.
    │   ├── infrastructure/                # 🔌 Concrete Adapters & Repositories
    │   │   ├── database/                  # PrismaOrderRepository, PrismaCatalogRepository, etc.
    │   │   └── queue/                     # BullMQ Queue Provider & Redis connection
    │   ├── lib/                           # Core Utilities (JWT, Cookies, PII Scrubbing, CORS)
    │   ├── models/                        # Domain Models & Interfaces
    │   └── services/                      # Decoupled Domain Services (AuthService, OrderService, etc.)
    ├── test/                              # Vitest Unit & Integration Suites (auth, services, ledger)
    ├── .env / .env.example                # Local PostgreSQL Connection (postgresql://postgres:123@localhost:5432/marketplace)
    ├── next.config.ts                     # Next.js 16 Turbopack Configuration
    ├── prisma.config.ts                   # Prisma 7 Database Configuration
    └── package.json                       # Node.js Dependencies & NPM Scripts
```

---

## 2. 🏛️ HEXAGONAL ARCHITECTURAL FILE BOUNDARIES
*Influenced by `engineering-backend-architect`*

To prevent architectural drift and maintain clean separation of concerns:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          1. API / ROUTE LAYER                               │
│  apps/src/app/api/auth/      apps/src/app/api/products/                    │
│  apps/src/app/api/orders/    apps/src/app/api/payments/                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Calls Domain Services
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       2. DOMAIN SERVICE LAYER                               │
│  AuthService.ts              StoreService.ts                                │
│  OrderService.ts             PaymentService.ts                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Implements Core Ports
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        3. CORE DOMAIN PORTS                                 │
│  IOrderRepository.ts         ICatalogRepository.ts                          │
│  IUserRepository.ts          ITransactionManager.ts                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Fulfilled by Concrete Adapters
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    4. INFRASTRUCTURE & ADAPTER LAYER                        │
│  PrismaOrderRepository.ts    PrismaCatalogRepository.ts                     │
│  PrismaTransactionManager.ts BullMQProvider.ts                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Executes SQL Queries
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          5. POSTGRESQL 16 DATABASE                          │
│  localhost:5432 / Database: marketplace                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 📑 AUTOMATED WORKSPACE MAINTENANCE RULES
*Influenced by `engineering-orgscript-engineer` & `engineering-developer-tooling-engineer`*

### Rule 1: No Stray Documentation Files at Root
All project context, audit reports, and task states MUST be stored strictly under `.ai/`.

### Rule 2: Clean Build & Temp Asset Exclusion
Temporary test logs and scratch scripts MUST be saved in `.ai/scratch/` or `apps/scratch/` and never committed to version control.

### Rule 3: Single Source of Truth for Schema & Seeds
* Schema: `apps/prisma/schema.prisma`
* Seeds: `apps/seeds/index.ts`
* DB Connection: `apps/.env` (`DATABASE_URL`)

---

## 4. ✍️ DOCUMENTATION REGISTRY
*Influenced by `16-documentation-writer`*

| Document Path | Purpose | Update Trigger |
|---|---|---|
| [`.ai/PROJECT_CONTEXT.md`](file:///e:/500+_AI_Agent/multi-vendor-ecommerce/.ai/PROJECT_CONTEXT.md) | Master Tech Stack & Port Specification | Stack changes / Port updates |
| [`.ai/TASK_STATE.md`](file:///e:/500+_AI_Agent/multi-vendor-ecommerce/.ai/TASK_STATE.md) | Active Milestone & Health Tracker | After every completed task |
| [`.ai/MASTER_FORENSIC_AUDIT_REPORT.md`](file:///e:/500+_AI_Agent/multi-vendor-ecommerce/.ai/MASTER_FORENSIC_AUDIT_REPORT.md) | Forensic System Audit & Risks | Architecture/System shifts |
| [`.ai/AGENT_REGISTRY.md`](file:///e:/500+_AI_Agent/multi-vendor-ecommerce/.ai/AGENT_REGISTRY.md) | AI Agent to Subsystem Mapping | Agent roster updates |
| [`.ai/AGENT_WORKFLOW.md`](file:///e:/500+_AI_Agent/multi-vendor-ecommerce/.ai/AGENT_WORKFLOW.md) | Orchestrator Execution Pipeline | Workflow adjustments |
| [`.ai/MASTER_FILE_ORGANIZER_REPORT.md`](file:///e:/500+_AI_Agent/multi-vendor-ecommerce/.ai/MASTER_FILE_ORGANIZER_REPORT.md) | Workspace Structure & File Boundaries | File organization updates |

---

## 5. 🎯 SUMMARY OF VERIFIED WORKSPACE HEALTH

* **Clean Structure:** 0 legacy/scratch files cluttering the root.
* **Database Connected:** PostgreSQL 16 running on `localhost:5432`, database `marketplace` synchronized with 18 tables and seeded demo accounts.
* **Frontends Online:** Next.js Storefront on `http://localhost:3000` & Angular Admin on `http://localhost:4200`.
* **Testing:** 100% of domain service tests (9/9) and double-entry ledger tests (4/4) passing.
