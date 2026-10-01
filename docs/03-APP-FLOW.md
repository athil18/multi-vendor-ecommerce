# 03 — Application Flow & User Journeys

> **Document ID:** DOC-03-APP-FLOW  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Lead UI/UX Engineer & Full-Stack Architect  

---

## 1. Global Navigation & Information Architecture

```mermaid
graph TD
    Entry[Visitor Enters Nexus Marketplace] --> Home[Landing Page /]
    
    Home --> Catalog[Catalog Page /products]
    Home --> ProductDetail[Product Detail /products/:id or /products/slug/:slug]
    Home --> AuthModal[Auth Flow /auth/login, /auth/register]
    
    Catalog --> CartDrawer[Cart Drawer / Slideout]
    ProductDetail --> CartDrawer
    
    CartDrawer --> Checkout[Checkout Page /checkout]
    Checkout --> StripeGateway[Stripe Payment Elements]
    StripeGateway --> OrderSuccess[Order Confirmation /customer/orders/:id]
    
    AuthModal --> RoleRouting{Role Check}
    RoleRouting -->|customer| CustomerDash[/customer Dashboard]
    RoleRouting -->|seller| SellerDash[/seller Dashboard]
    RoleRouting -->|admin| AdminDash[/admin Dashboard]
```

---

## 2. Core User Flows (State Transition Pipelines)

### 2.1 Customer Purchase & Checkout Flow

```
USER ACTION:
  Click "Place Order & Pay" on /checkout
  ↓
CLIENT VALIDATION:
  - Shipping address fields validated (Name, Street, City, Zip, Country via Zod)
  - Cart item count >= 1
  - Payment method chosen (Card)
  ↓
API REQUEST:
  POST /api/orders { orderItems, shippingAddressId, paymentMethod: 'card' }
  POST /api/payments/create-intent { orderId }
  ↓
LOADING STATE:
  Button disabled, inline spinner displayed, text: "Securing your items..."
  ↓
SUCCESS / FAILURE:
  Success: HTTP 201 Created with clientSecret from Stripe PaymentIntent
  Failure: HTTP 400/409 (Out of stock or invalid coupon)
  ↓
UI RESPONSE:
  Success: Confirm PaymentIntent via Stripe.js elements
  Failure: Show inline error toast ("Item X has insufficient inventory")
  ↓
NEXT SCREEN:
  Redirect to /customer/orders/[id] with "Order Confirmed" badge and delivery tracking stepper.
```

### 2.2 Seller Product Onboarding & Lifecycle Flow

```
USER ACTION:
  Seller clicks "Submit for Review" on Draft Product
  ↓
CLIENT VALIDATION:
  Product must have: Title (min 2 chars), Price (> 0), at least 1 Category, at least 1 Image.
  ↓
API REQUEST:
  PATCH /api/seller/products/[id]/status { status: 'pending_review' }
  ↓
LOADING STATE:
  Button disabled, badge displays "Submitting..."
  ↓
SUCCESS / FAILURE:
  Success: HTTP 200 with updated status = 'pending_review'
  Failure: HTTP 403 Forbidden (Ownership mismatch) or 400 Bad Request
  ↓
UI RESPONSE:
  Success: Toast: "Product submitted for marketplace moderation"
  Failure: Toast: "Failed to submit product: [error detail]"
  ↓
NEXT SCREEN:
  Seller Product List updates badge to yellow "Pending Review".
  NOTE: Sellers CANNOT self-approve to 'approved'; state machine enforces admin approval.
```

### 2.3 Admin Moderation Workflow

```
USER ACTION:
  Admin reviews product in /admin/moderation and clicks "Approve & Publish"
  ↓
CLIENT VALIDATION:
  Admin confirmation prompt confirmed.
  ↓
API REQUEST:
  PATCH /api/seller/products/[id]/status { status: 'approved' } (via Admin authorization token)
  ↓
LOADING STATE:
  Row action button displays spinner.
  ↓
SUCCESS / FAILURE:
  Success: HTTP 200 with status = 'approved'
  Failure: HTTP 401/403 (Unauthorized / Non-admin role)
  ↓
UI RESPONSE:
  Row animated out of pending moderation queue; success toast displayed.
  ↓
NEXT SCREEN:
  Product is immediately visible in public catalog search (`/products`).
```

---

## 3. Screen Inventory & State Specifications

### 3.1 Storefront Screens

| Screen | URL Route | Key Interactive Elements | Empty State | Error State |
| :--- | :--- | :--- | :--- | :--- |
| **Home Landing** | `/` | Hero search, category carousels, featured vendor grid, AI assistant pill. | Default curated fallbacks rendered. | Graceful catalog fallback with retry button. |
| **Product Catalog**| `/products` | Filter drawer (category, price slider, in-stock toggle), sort dropdown, pagination. | "No products match your filters" with Reset button. | Red error banner with "Reload catalog" action. |
| **Product Detail** | `/products/[id]` | Image gallery thumbnail selector, variant pills (size/color), quantity counter, "Add to Cart", review form. | N/A (404 if deleted or invalid). | "Product not found" card with link back to catalog. |
| **Shopping Cart** | Drawer & `/cart` | Item quantity increment/decrement, remove item, coupon input, subtotal breakdown, Checkout CTA. | "Your cart is empty" with "Discover Products" button. | Item stock conflict warning with auto-adjust button. |
| **Checkout** | `/checkout` | Shipping address selector/form, coupon code field, Stripe Card Element, Order Summary. | Redirect to `/products` if cart is empty. | Payment card declined banner with specific error reason. |

### 3.2 Customer Portal

| Screen | URL Route | Features & Actions |
| :--- | :--- | :--- |
| **Customer Dashboard** | `/customer` | Recent orders summary, saved shipping addresses, active wishlist items. |
| **Order Detail Tracking**| `/customer/orders/[id]` | Itemized line items, seller attribution, fulfillment stepper (`Ordered` → `Processing` → `Shipped` → `Delivered`), write review button. |
| **Address Manager** | `/customer/addresses` | Add new address modal, edit existing address, set default shipping/billing. |

### 3.3 Seller Portal

| Screen | URL Route | Features & Actions |
| :--- | :--- | :--- |
| **Seller Dashboard** | `/seller` | Gross sales, net payouts, pending orders count, escrow balance summary. |
| **Product Manager** | `/seller/products` | Create product modal, variant matrix builder, status transition controls (`draft` ↔ `pending_review`). |
| **Order Fulfillment**| `/seller/orders` | Multi-vendor order items assigned to seller, status update actions (`processing` → `shipped` with tracking number). |
| **Payout Settings** | `/seller/payouts` | Stripe Connect Express onboarding trigger, payout history logs, escrow release schedule. |

### 3.4 Admin Control Plane

| Screen | URL Route | Features & Actions |
| :--- | :--- | :--- |
| **Admin Overview** | `/admin` | Total platform GMV, 10% platform revenue, total active sellers, active dispute count. |
| **Moderation Queue**| `/admin/moderation`| Unapproved product queue, product inspection modal, "Approve" (green) and "Reject" (red with reason text). |
| **User Management** | `/admin/users` | User search, role management, account suspension toggle. |
| **Ledger & Escrow** | `/admin/escrow` | Platform escrow balance audit, automated payout scheduler trigger (`/api/payments/payouts`). |

---

## 4. Error, Loading & Recovery Standard

1. **Every Network Request Must Have 3 Explicit States:**
   - `loading`: Visual skeleton or disabled button with spinning indicator.
   - `error`: Human-readable error message with actionable recovery step (retry, fix input, contact support).
   - `success`: Visual confirmation (toast, badge update, or navigation).
2. **Session Expiration:**
   - 401 response from any protected API automatically triggers silent token refresh via `/api/auth/refresh`.
   - If refresh fails, user is cleanly redirected to `/auth/login` with `?redirect=[current_url]` preserved.
3. **No Dead Clicks:**
   - Every button must either trigger a navigation, open a modal, execute a mutation, or show a disabled tooltip explaining why it cannot be clicked.
