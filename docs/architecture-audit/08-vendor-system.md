# Sub-Agent 08: Multi-Vendor & Seller System Report
**Agent Responsibility:** Seller Onboarding, Store Profiles, Vendor Inventory, Payout Accounts, and Multi-Tenant Data Isolation.

---

## 1. Vendor System Architecture

```text
User (Role: seller)
       │
       ▼
  Store Model (stores table)
       ├── sellerId (FK: users.id, unique)
       ├── name, slug, description, logo, banner
       ├── stripeConnectedAccountId
       ├── stripeOnboardingComplete
       ├── payoutsEnabled
       ├── trustScore (default 100.0)
       ├── fraudRiskLevel (low | medium | high | critical)
       └── governanceStatus (good_standing | probation | suspended | banned)
```

---

## 2. Evidence-Based Verification

### 2.1 Vendor Data Isolation (CONFIRMED)
- In `apps/src/app/api/seller/products/route.ts`:
  ```typescript
  const products = await prisma.product.findMany({
    where: { sellerId: user.id },
    include: { variants: true }
  });
  ```
- Vendor product and order queries are strictly constrained by `where: { sellerId: user.id }`.
- A seller cannot query, update, or delete products belonging to another vendor.

### 2.2 Vendor Trust & Fraud Governance (CONFIRMED)
- Store model tracks `trustScore`, `fraudRiskLevel`, and `governanceStatus`.
- If a vendor's `governanceStatus` is `suspended` or `banned`, admin endpoints block product publication.
- History of disciplinary actions is preserved in `enforcementHistory: Json`.

### 2.3 Vendor Orders Management (CONFIRMED)
- In `apps/src/app/api/seller/orders/route.ts`, sellers receive only the `order_items` where `sellerId === user.id`.
- The aggregate order total for other vendors in the same multi-vendor basket is kept private.
