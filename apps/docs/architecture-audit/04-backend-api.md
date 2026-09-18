# Sub-Agent 04: Backend & API Architecture Report
**Agent Responsibility:** Next.js Route Handlers, Hexagonal Architecture, Domain Services, Error Handling, and API Contracts.

---

## 1. Backend Architecture Pattern: Hexagonal (Ports & Adapters)

```text
HTTP Request (Route Handler)
       │
       ▼
   withErrorHandler (lib/api-handler.ts)
       │
       ▼
   Application Service (OrderService, PaymentService, AuthService)
       │
       ▼
   Port Interface (IOrderRepository, ITransactionManager, ICatalogRepository)
       │
       ▼
   Infrastructure Adapter (PrismaTransactionManager, BullMQProvider)
       │
       ▼
PostgreSQL Database / Redis Queue
```

---

## 2. API Surface Catalog & Audit

The backend exposes **46 API Route Handlers** under `apps/src/app/api/`:

| Module | Route Path | Methods | Error Wrapper | Status |
|---|---|---|---|---|
| **Auth** | `/api/auth/login` | POST | `withErrorHandler` | `CONFIRMED` |
| **Auth** | `/api/auth/register` | POST | `withErrorHandler` | `CONFIRMED` |
| **Auth** | `/api/auth/logout` | POST | `withErrorHandler` | `CONFIRMED` |
| **Auth** | `/api/auth/refresh` | POST | `withErrorHandler` | `CONFIRMED` |
| **Auth** | `/api/auth/me` | GET, PATCH | `withErrorHandler` | `CONFIRMED` |
| **Products** | `/api/products` | GET, POST | `withErrorHandler` | `CONFIRMED` |
| **Products** | `/api/products/[id]` | GET, PUT, DELETE | `withErrorHandler` | `CONFIRMED` |
| **Products** | `/api/products/slug/[slug]` | GET | `withErrorHandler` | `CONFIRMED` |
| **Orders** | `/api/orders` | GET, POST | `withErrorHandler` | `CONFIRMED` |
| **Orders** | `/api/orders/[id]` | GET, PATCH | `withErrorHandler` | `CONFIRMED` |
| **Payments** | `/api/payments/create-intent` | POST | `withErrorHandler` | `CONFIRMED` |
| **Payments** | `/api/payments/webhook` | POST | Direct (Raw Body) | `CONFIRMED` |
| **Payments** | `/api/payments/payouts` | POST | `withErrorHandler` | `CONFIRMED` |
| **Seller** | `/api/seller/dashboard` | GET | `withErrorHandler` | `CONFIRMED` |
| **Seller** | `/api/seller/products` | GET, POST | `withErrorHandler` | `CONFIRMED` |
| **Admin** | `/api/admin/governance/sellers/[id]/trust` | POST | `withErrorHandler` | `CONFIRMED` |
| **Disputes** | `/api/disputes` | GET, POST | `withErrorHandler` | `CONFIRMED` |
| **Health** | `/api/health` & `/api/health/live` | GET | Direct | `CONFIRMED` |
| **Documentation** | `/api/docs/openapi` | GET | Direct (Zod-to-OpenAPI) | `CONFIRMED` |

---

## 3. Findings & Code Evidence

### 3.1 Consistent Error Wrapping (`withErrorHandler`)
- **Evidence:** `apps/src/lib/api-handler.ts` wraps route handlers with uniform logging, requestId injection, execution duration metrics, and Zod error formatting.
- **Classification:** `CONFIRMED`

### 3.2 Inconsistent Object ID References
- **Evidence:** In `apps/src/services/OrderService.ts`:
  ```typescript
  const orderIds = orders.map((o) => o._id.toString());
  const productMap = new Map(products.map(p => [p._id.toString(), p]));
  ```
  While Prisma models generate standard string IDs (`id`), the service code accesses `_id` assuming Mongoose/MongoDB conventions. It only works at runtime because `wrapRecord` injects an enumerable `_id` property.
- **Impact:** TypeScript compile warnings/errors when strict Prisma types are checked.
- **Classification:** `CONFIRMED`

### 3.3 Strict Webhook Signature Verification
- **Evidence:** In `apps/src/app/api/payments/webhook/route.ts`, the route reads the raw buffer `await req.text()` and verifies `stripe.webhooks.constructEvent` before parsing JSON. It also uses the `EventLog` table for idempotency guards.
- **Classification:** `CONFIRMED`
