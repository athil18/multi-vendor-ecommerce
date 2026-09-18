# Sub-Agent 05: Database & Prisma Architecture Report
**Agent Responsibility:** PostgreSQL Relational Design, Prisma Schema, Data Normalization, Indexes, and ACID Transactions.

---

## 1. Database Model Catalog

`apps/prisma/schema.prisma` defines **18 Models** and **17 Enums**:

| Model Name | Table Mapping | Purpose | Primary Key | Relations |
|---|---|---|---|---|
| `User` | `users` | User accounts (Customer, Seller, Admin) | `id` (cuid) | Store, Orders, Reviews, Disputes, Ledger |
| `Store` | `stores` | Multi-vendor store profile & Stripe Connect | `id` (cuid) | `seller` (User) |
| `Category` | `categories` | Self-referencing hierarchical categories | `id` (cuid) | `parent`, `children`, `products` |
| `Product` | `products` | Base product catalog | `id` (cuid) | `seller`, `category`, `variants`, `reviews` |
| `Variant` | `variants` | SKU-level pricing, attributes & stock | `id` (cuid) | `product`, `seller`, `orderItems` |
| `Address` | `addresses` | Customer shipping & billing addresses | `id` (cuid) | `user`, `orders` |
| `Coupon` | `coupons` | Discounts (Global or Vendor-scoped) | `id` (cuid) | `seller`, `orders` |
| `Order` | `orders` | Header-level aggregate purchase order | `id` (cuid) | `customer`, `items`, `ledgers`, `disputes` |
| `OrderItem` | `order_items` | Line-item order breakdown with vendor splits | `id` (cuid) | `order`, `product`, `variant`, `seller` |
| `Review` | `reviews` | Verified buyer product reviews | `id` (cuid) | `product`, `customer`, `moderator` |
| `Dispute` | `disputes` | Buyer-seller escrow disputes | `id` (cuid) | `order`, `orderItem`, `buyer`, `seller` |
| `Wishlist` | `wishlists` | Customer saved items | `id` (cuid) | `user` |
| `FinancialLedger`| `financial_ledgers`| Escrow tracking & financial journal | `id` (cuid) | `order`, `seller` |
| `JournalEntry` | `journal_entries` | Double-entry general journal | `id` (cuid) | `order`, `lines` |
| `TransactionLine`| `transaction_lines`| Double-entry line items (DEBIT/CREDIT) | `id` (cuid) | `journalEntry`, `entity` |
| `TransferLog` | `transfer_logs` | Stripe Connect transfer attempts & retries | `id` (cuid) | `order`, `seller` |
| `EventLog` | `event_logs` | Webhook idempotency tracking | `id` (cuid) | None |
| `FileAsset` | `file_assets` | Uploaded images & documents metadata | `id` (cuid) | `uploadedBy` |

---

## 2. Key Database Architecture Highlights

### 2.1 Double-Entry Bookkeeping Ledger
- Models `JournalEntry` and `TransactionLine` enforce integer-cent accounting (`amount: Int`).
- Account chart:
  - `1000`: STRIPE_CASH_IN_TRANSIT
  - `1100`: STRIPE_CASH_SETTLED
  - `2000`: VENDOR_ESCROW
  - `2100`: TAX_PAYABLE
  - `4000`: PLATFORM_COMMISSION
  - `5000`: STRIPE_FEES
- Invariant: `SUM(DEBIT) == SUM(CREDIT)` verified in `apps/src/lib/ledger.ts`.

### 2.2 Webhook Idempotency Table (`EventLog`)
- Uses `eventId` with `@unique` constraint.
- Ensures duplicate webhook events from Stripe are processed exactly once.

---

## 3. Database Vulnerabilities & Optimization Opportunities

### 3.1 Unindexed Foreign Key References (CONFIRMED)
- `Category.parentId`: Self-referencing hierarchy lacks an explicit index, which may cause slow recursive category tree queries.
- `Product.categoryId`: Relies on compound index `[status, categoryId, createdAt(sort: Desc)]`. A simple single-column index on `categoryId` is recommended for category-specific admin queries.

### 3.2 Cascading Delete Safety
- `User` deletion cascades to `Store`, `Address`, `Review`, and `FileAsset`.
- `Order` does **NOT** cascade on User deletion (`fields: [customerId], references: [id]`), preventing accidental deletion of financial records. This adheres to accounting compliance standards.
