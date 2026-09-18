# Engineering Rules — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14

---

## Engineering Rules

### Rule 1: Never Ship Broken Builds
`npm run build` must pass with zero TypeScript errors before any feature is considered complete. No exceptions.

### Rule 2: API Routes Follow the Standard Pattern
Every API route must follow this structure in order:
1. `await dbConnect()` — Ensure database connection
2. `await getAuthUser(req)` — Extract user identity (if protected)
3. `authorizeRole(user, [roles])` — Check RBAC (if protected)
4. Input validation (Zod preferred)
5. Business logic
6. Return `NextResponse.json(data, { status })`

### Rule 3: Database Operations Are Transactional When Multi-Document
Any operation that writes to more than one collection within a single request must use a MongoDB session with `startTransaction()` / `commitTransaction()` / `abortTransaction()`.

### Rule 4: Status Transitions Are Explicit
All status changes must check the `PRODUCT_STATUS_TRANSITIONS` map or equivalent. No status field should be set directly without validating the transition is allowed.

### Rule 5: Prices Are Server-Side Validated
Client-submitted prices are never trusted. The server always looks up the canonical price from the Product/Variant document at order creation time.

### Rule 6: Inventory Uses Atomic Operations
Stock decrements must use `findOneAndUpdate` with `{ stock: { $gte: quantity } }` guard. No read-then-write patterns for inventory.

---

## Coding Standards

### TypeScript
- Strict TypeScript with `noEmit: false` not enforced (Next.js handles compilation)
- Interfaces for all model documents (exported as `IModelName`)
- Type assertions limited to Stripe event objects (`as any`)
- Avoid `any` except for Stripe event payloads and dynamic filter objects

### Naming Conventions
| Entity | Convention | Example |
|--------|-----------|---------|
| Files | PascalCase (models, components), camelCase (utilities) | `Product.ts`, `pagination.ts` |
| Interfaces | `I` prefix + PascalCase | `IProduct`, `IOrder` |
| Types | PascalCase | `ProductStatus`, `AuthenticatedUser` |
| API Routes | lowercase kebab-case directories | `api/seller/orders/[id]/status` |
| Environment vars | SCREAMING_SNAKE_CASE | `MONGO_URI`, `JWT_SECRET` |
| CSS classes | kebab-case (Tailwind utilities) | `glass-card`, `animate-pulse-slow` |

### File Organization
```
src/
├── app/                  # Pages and API routes (Next.js App Router)
│   ├── api/             # Server-only API routes
│   └── [page]/page.tsx  # Client-rendered pages
├── components/          # Reusable React components
├── context/             # React Context providers
├── lib/                 # Shared utilities (auth, db, jwt, stripe, pagination)
│   └── schemas/         # Zod validation schemas
└── models/              # Mongoose model definitions
```

### API Response Shapes
**Success (list)**:
```json
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```

**Success (single)**:
```json
{ "_id": "...", "field": "value", ... }
```

**Error**:
```json
{ "message": "Human-readable error description" }
```

---

## Review Requirements

### Before Merging
1. TypeScript compiles with zero errors (`npm run build`)
2. No `console.log` in production paths (use `console.error` or `console.warn` for errors/warnings only)
3. All protected routes have auth + RBAC guards
4. No hardcoded secrets or credentials in code
5. New API routes follow the standard pattern
6. Database indexes exist for all queried fields
7. Documentation updated if behavior changes

### Code Quality Checks
- [ ] Are there any N+1 query patterns? Use aggregation pipelines instead.
- [ ] Is the response shape consistent with existing endpoints?
- [ ] Are error messages descriptive but not leaking internal details?
- [ ] Is the feature accessible (keyboard nav, labels, contrast)?

---

## Security Requirements

### Mandatory
1. **Passwords**: Always hashed with bcryptjs. Never stored, logged, or returned in responses.
2. **Tokens**: Access tokens are short-lived (15min). Refresh tokens are httpOnly, secure, sameSite strict.
3. **Refresh tokens**: Hashed (SHA-256) before database storage.
4. **RBAC**: Every protected route checks role membership.
5. **Suspended users**: Checked on every authenticated request.
6. **Webhook verification**: Stripe signatures must be verified. No unsigned webhooks in production.
7. **Input validation**: Required on all auth endpoints. Should expand to all API routes.
8. **Password fields**: `select: false` on schema. Must use `.select('+password')` explicitly.

### Prohibited
- Storing JWT secrets in client-side code
- Returning password hashes in any API response
- Trusting client-submitted prices for order totals
- Skipping auth middleware on protected routes
- Using `eval()` or `Function()` on user input

---

## Documentation Requirements

### Required Updates
| Event | Documents to Update |
|-------|--------------------|
| New feature implemented | `implementationplan.md`, `tracker.md` |
| Schema change | `schema.md`, `DATABASE_DESIGN.md` |
| New API endpoint | `API_DOCUMENTATION.md` |
| Architecture decision | `ADR.md` |
| Behavior change | `CHANGELOG.md` |
| New UI component | `design.md` |
| Security change | `SECURITY_GUIDELINES.md` |
| Bug fix | `CHANGELOG.md`, `tracker.md` |

---

## Quality Gates

### Per-Phase Gate
No phase may be marked complete unless:
1. ✅ All deliverables from `implementationplan.md` are implemented
2. ✅ Acceptance criteria from `prd.md` are met
3. ✅ `npm run build` passes
4. ✅ `tracker.md` reflects reality
5. ✅ Technical debt is documented
6. ✅ No known regressions

### Per-Feature Gate
1. ✅ Follows coding standards
2. ✅ Has appropriate auth/RBAC guards
3. ✅ Input validation present
4. ✅ Error states handled gracefully
5. ✅ Responsive design works on mobile breakpoints

---

## Release Rules

### Pre-Release Checklist
- [ ] All phases through current are gate-complete
- [ ] Environment variables validated (no empty strings in production)
- [ ] Stripe keys are production keys (not test)
- [ ] MongoDB URI points to production cluster
- [ ] JWT secrets are strong (≥256 bits of entropy)
- [ ] `NODE_ENV=production`
- [ ] No mock/fallback data in production paths
- [ ] All `console.log` calls removed (only `.error` and `.warn` remain)

---

## Anti-Patterns

### ❌ Do Not
| Anti-Pattern | Why | Do Instead |
|-------------|-----|------------|
| `require('mongoose')` in client components | Bundles Node.js modules into browser bundle | Use API routes for server-side operations |
| Read-then-write for inventory | Race condition → overselling | Use atomic `findOneAndUpdate` with `$gte` guard |
| Trusting `localStorage` for pricing | Client-side tampering | Validate all prices server-side |
| Inline styles for reusable patterns | Inconsistency, maintenance burden | Extract to components or CSS utility classes |
| Catching errors silently (`catch {}`) | Hides bugs | Always log with `console.error` or re-throw |
| Storing tokens in `localStorage` | XSS vulnerability | Access tokens in memory, refresh in httpOnly cookie |
| Hardcoding role strings | Typo risk | Use a shared enum or constant |
| Skipping `await dbConnect()` | Connection may not exist | Always call first in every API route |

---

> **Cross-references**: [techspec.md](techspec.md) (architecture), [SECURITY_GUIDELINES.md](SECURITY_GUIDELINES.md) (security deep dive)
