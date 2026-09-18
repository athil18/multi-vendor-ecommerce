# Sub-Agent 13: Performance & Scalability Report
**Agent Responsibility:** Database Query Efficiency, N+1 Query Risks, Bundling, Caching, and Core Web Vitals.

---

## 1. Performance Diagnostics

| Layer | Component | Findings | Recommendation |
|---|---|---|---|
| **Database** | Multi-Vendor Cart Aggregation | Uses single query with `in: productIds` | Keep batch pattern |
| **Database** | Review Rating Aggregation | `Review` counts and average ratings updated on submit | Pre-compute in `Product.rating` |
| **Database** | Missing Index on Foreign Keys | `Category.parentId` lacks index | Add `@@index([parentId])` |
| **Frontend** | Next.js Server Components | Home and product pages use SSR | Keep SSR for SEO |
| **Frontend** | Image Optimization | Product images use standard `<img>` in parts | Adopt `next/image` with WebP/AVIF |
| **Edge Cache** | Rate Limiting | In-memory sliding window cache | For multi-instance, switch to Redis |

---

## 2. Evidence-Based Query Efficiency Findings

### 2.1 Batch Query Optimization in `OrderService` (CONFIRMED)
- In `apps/src/services/OrderService.ts`:
  ```typescript
  const productIds = data.orderItems.map(i => i.productId);
  const products = await this.catalogRepo.findProductsByIds(productIds, txCtx);
  ```
  Instead of executing individual queries in a loop (N+1 anti-pattern), products are fetched in a single batch query.

### 2.2 Slow Query Logging (CONFIRMED)
- In `apps/src/lib/api-handler.ts`, any API call taking `> 1000ms` triggers a `Slow API Request` structured warning with duration and route context.
