# Sub-Agent 09: Customer Experience & Buyer Journey Report
**Agent Responsibility:** End-to-End Buyer Journey, Cart UX, Checkout Usability, Order History, and Dispute Handling.

---

## 1. Customer Experience Flow

| Step | Implementation | Usability Status | Evidence |
|---|---|---|---|
| **Discovery** | `/` (Home Hero & Featured) | Smooth, responsive | `apps/src/app/page.tsx` |
| **Search** | `/products?search=...` | Fast client filtering | `apps/src/app/products/page.tsx` |
| **Product Detail** | `/products/[id]` | Variants, pricing, reviews | `apps/src/app/products/[id]/page.tsx` |
| **Cart Drawer** | Zustand `useCartStore` | Instant update, persistent | `apps/src/store/useCartStore.ts` |
| **Checkout** | `/checkout` | 3-step wizard | `apps/src/app/checkout/page.tsx` |
| **Order History** | `/customer` | Tabular with status badges | `apps/src/app/customer/page.tsx` |
| **Order Details** | `/customer/orders/[id]` | Line items & tracking | `apps/src/app/customer/orders/[id]/page.tsx`|
| **Dispute Filing** | Customer Portal Modal | Accessible modal | `apps/src/models/Dispute.ts` |

---

## 2. Evidence-Based Observations

### 2.1 Cart State Persistence (CONFIRMED)
- Uses Zustand with `persist` middleware targeting `localStorage`.
- Cart items retain product ID, variant ID, seller ID, name, price, quantity, and thumbnail.
- Automatically computes subtotal, item counts, and multi-vendor groups.

### 2.2 Hardcoded Address Fallback in Backend (CONFIRMED)
- **Finding:** In `apps/src/models/Order.ts` lines 24-35, if no shipping address ID is passed in the order creation payload, the system queries the customer's first existing address or automatically seeds a mock address (`123 Main St, Anytown, CA 90210`).
- **Risk:** In production, this can lead to orders being registered with fake addresses if checkout validation fails to enforce address selection.
- **Recommendation:** Require explicit `shippingAddressId` validation and reject order creation with HTTP 400 if missing.
