# Technical Specification — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14 | Status: Active

---

## System Overview

Nexus is a full-stack multi-vendor marketplace built as a monolithic Next.js 16 application with server-side API routes backed by MongoDB (Mongoose ODM) and Stripe Connect for payment processing. The frontend uses React 19, Tailwind CSS 4, and a custom design token system with glassmorphism aesthetics.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  React 19 CSR + AppContext (state) + localStorage        │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTPS (fetch)
┌──────────────────────▼──────────────────────────────────┐
│               Next.js 16 (Turbopack)                     │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Pages (SSG/CSR) │  │  API Routes (/api/*)         │  │
│  │  - /             │  │  - /api/auth/*               │  │
│  │  - /auth/*       │  │  - /api/products/*           │  │
│  │  - /checkout     │  │  - /api/orders/*             │  │
│  │  - /seller       │  │  - /api/seller/*             │  │
│  │  - /customer     │  │  - /api/admin/*              │  │
│  │  - /admin        │  │  - /api/payments/*           │  │
│  └─────────────────┘  └──────────┬───────────────────┘  │
└──────────────────────────────────┼──────────────────────┘
                                   │
         ┌─────────────────────────┼───────────────────┐
         │                         │                    │
┌────────▼──────────┐   ┌─────────▼────────┐  ┌───────▼──────┐
│  MongoDB Atlas     │   │  Stripe Connect   │  │  JWT Auth    │
│  (Mongoose ODM)    │   │  - Payments       │  │  - Access    │
│  - 14 Collections  │   │  - Transfers      │  │  - Refresh   │
│  - Transactions    │   │  - Webhooks       │  │  - bcrypt    │
│  - Indexes         │   │  - Onboarding     │  │              │
└───────────────────┘   └──────────────────┘  └──────────────┘
```

## Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Runtime** | Node.js | 20+ | LTS, required by Next.js 16 |
| **Framework** | Next.js (App Router) | 16.2.9 | Full-stack React framework with API routes, SSG, Turbopack |
| **Language** | TypeScript | 5.x | Type safety, IDE tooling, compile-time error detection |
| **UI Library** | React | 19.2.4 | Latest stable with concurrent features |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS with `@theme` design tokens |
| **Typography** | Inter (Google Fonts) | Variable | Modern, highly legible sans-serif |
| **Icons** | Lucide React | 1.18.x | Consistent, tree-shakeable icon set |
| **Animations** | Framer Motion | 12.40.x | Declarative React animations (available, not yet fully utilized) |
| **State** | React Context + localStorage | — | Simple global state for auth, cart, theme |
| **Forms** | React Hook Form + Zod | 7.79.x / 4.4.x | Performant forms with schema validation |
| **Database** | MongoDB Atlas | — | Document store with transactions, SRV DNS |
| **ODM** | Mongoose | 9.7.x | Schema enforcement, populate, middleware |
| **Auth** | JSON Web Tokens | 9.0.x | Stateless auth with access/refresh token pattern |
| **Passwords** | bcryptjs | 3.0.x | Secure password hashing |
| **Payments** | Stripe SDK | 22.2.x | Payment intents, Connect, Webhooks, Transfers |
| **Slugs** | slugify | 1.6.x | URL-friendly slugs for products/categories |
| **Toasts** | react-hot-toast | 2.6.x | Non-blocking user feedback |
| **HTTP Client** | axios | 1.17.x | Available but not currently used (fetch preferred) |
| **Build** | Turbopack | Bundled | Next.js 16 default bundler |

## Architecture Decisions

> All decisions are recorded in [ADR.md](ADR.md) with full context.

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | Monolithic Next.js (not microservices) | Simplicity, single deployment, shared types, faster iteration for v1.0 |
| ADR-002 | MongoDB over PostgreSQL | Flexible schemas for product options/variants, natural fit for document-oriented catalog data |
| ADR-003 | JWT over session-based auth | Stateless API routes, no server-side session store required, works with CSR |
| ADR-004 | React Context over Redux for state | Cart + auth state is small enough; Context avoids Redux boilerplate. Redux is installed but unused |
| ADR-005 | Stripe Connect with Transfer model | Enables multi-seller payouts without requiring each seller to manage their own payment processor |
| ADR-006 | Client-side rendering for all pages | Simplifies data fetching patterns; API routes handle all server logic |
| ADR-007 | Atomic stock decrement (`$inc` with `$gte` guard) | Prevents overselling race conditions without application-level locks |
| ADR-008 | MongoDB transactions for order creation | Ensures order + order items + coupon usage + inventory are atomically consistent |

## Frontend Strategy

### Component Architecture
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home / catalog (CSR)
│   ├── layout.tsx         # Root layout with Navbar + Footer
│   ├── globals.css        # Design tokens + glassmorphism
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── checkout/page.tsx
│   ├── customer/page.tsx
│   ├── seller/page.tsx
│   └── admin/page.tsx
├── components/
│   └── Navbar.tsx         # Global navigation with cart, auth, theme toggle
├── context/
│   └── AppContext.tsx     # Global state (user, cart, theme)
└── lib/                   # Shared utilities
```

### Design Token System
Defined in `globals.css` via Tailwind `@theme` directive:
- **Brand palette**: Purple spectrum (`brand-50` through `brand-950`)
- **Surface palette**: Slate spectrum (`surface-50` through `surface-950`)
- **Typography**: Inter font family
- **Effects**: `glass` and `glass-card` utility classes for glassmorphism

### Client State Management
- **Authentication**: `user`, `token` in React Context, persisted to `localStorage`
- **Cart**: `CartItem[]` in React Context, synced to `localStorage`
- **Theme**: `light | dark` toggle, applied via `document.documentElement.classList`

## Backend Strategy

### API Route Pattern
All API routes follow this pattern:
```typescript
export async function METHOD(req: NextRequest) {
  await dbConnect();                              // 1. Ensure DB connection
  const user = await getAuthUser(req);            // 2. Extract JWT user (nullable)
  if (!user || !authorizeRole(user, [roles])) {   // 3. RBAC guard
    return NextResponse.json({ message }, { status: 403 });
  }
  // 4. Business logic
  // 5. Return NextResponse.json(data, { status })
}
```

### Database Connection
Singleton cached Mongoose connection with global cache for hot-reload persistence. Custom DNS servers (`8.8.8.8`, `1.1.1.1`) configured to resolve MongoDB SRV records reliably.

### Pagination
All list endpoints accept `?page=N&limit=N` with defaults (page=1, limit=20, max=100). Response shape:
```json
{
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

## Security Approach

| Concern | Implementation |
|---------|---------------|
| **Authentication** | JWT access tokens (15min TTL) + refresh tokens (7-day, httpOnly cookie) |
| **Password storage** | bcryptjs hashing (auto-salt) |
| **Refresh token storage** | SHA-256 hashed in DB, never stored in plain text |
| **RBAC** | Role field on User model; `authorizeRole()` guard on every protected route |
| **Suspended users** | Checked on every auth middleware call; denied if `status === 'suspended'` |
| **Webhook verification** | Stripe signature verification via `stripe.webhooks.constructEvent()` |
| **Password field** | `select: false` on User schema; never returned in API responses |
| **Input validation** | Zod schemas for auth endpoints; manual validation for others |
| **CORS** | Next.js default (same-origin) |

### Known Security Gaps (v1.0)
- No rate limiting on auth endpoints
- No CSRF protection (JWT-based, so CSRF risk is lower but not zero)
- Cart stored in localStorage (not tamper-proof but acceptable for v1.0)
- Stripe webhook secret is optional (fallback to empty string in dev)

## Performance Strategy

| Technique | Implementation |
|-----------|---------------|
| **Connection pooling** | Singleton Mongoose connection cached across hot reloads |
| **Database indexes** | Compound and single-field indexes on all query-heavy fields |
| **Lean queries** | `.lean()` used on seller product listing for reduced memory |
| **Aggregate pipelines** | Used for variant stats, order item counts — avoids N+1 |
| **Static generation** | Auth and checkout pages pre-rendered as static shells |
| **Client-side caching** | Cart and user session persisted in localStorage |
| **Turbopack** | ~13s compile time for production build |

## Scalability Strategy

### Current Architecture (v1.0 — Monolith)
- Single Next.js process handles both SSR/SSG and API routes
- MongoDB Atlas handles scaling at the database layer
- Stripe handles payment processing scaling

### Future Scaling Path (v2.0+)
1. **Extract API routes into standalone Edge Functions or serverless** for independent scaling
2. **Add Redis** for session caching and rate limiting
3. **Move to microservices** for order processing, inventory, and payments
4. **Add CDN** for product images (currently URL-referenced)
5. **Add Elasticsearch** for full-text product search
6. **Add message queue** (SQS/RabbitMQ) for async webhook processing

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| MongoDB Atlas cold-start latency | Medium | Connection caching + custom DNS |
| Stripe webhook replay/duplicate | Medium | Idempotent upsert pattern on Payment model |
| localStorage cart manipulation | Low | Server-side price validation at order creation |
| JWT token theft | Medium | Short-lived access tokens (15min) + httpOnly refresh |
| Overselling under concurrency | High | Atomic `findOneAndUpdate` with `$gte` stock guard |
| Partial order state | High | MongoDB transactions with abort-on-failure |

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Monolith over microservices | Faster development, but harder to scale individual services later |
| MongoDB over PostgreSQL | Flexible schemas, but lose relational integrity and complex joins |
| JWT over sessions | Stateless and scalable, but harder to invalidate individual tokens |
| Client-side rendering | Simpler data flow, but worse SEO for product pages |
| React Context over Redux | Less boilerplate, but no middleware, devtools, or time-travel debugging |
| URL-based images | No upload infrastructure needed, but dependent on external image hosts |

---

> **Cross-references**: [prd.md](prd.md) (WHAT/WHY), [schema.md](schema.md) (data model), [ARCHITECTURE.md](ARCHITECTURE.md) (deep dive)
