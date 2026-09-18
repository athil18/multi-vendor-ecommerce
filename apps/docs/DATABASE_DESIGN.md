# Database Design — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14

---

## Database: MongoDB Atlas

- **Connection**: SRV protocol with custom DNS (8.8.8.8, 1.1.1.1)
- **Database name**: `marketplace`
- **ODM**: Mongoose 9.7.x
- **Connection pattern**: Singleton cached across hot reloads (`global.mongoose`)

## Collections (14)

| Collection | Document Count Model | Primary Access Pattern |
|-----------|---------------------|----------------------|
| `users` | Moderate (thousands) | By email (login), by _id (auth check) |
| `profiles` | 1:1 with users | By userId |
| `stores` | 1:1 with sellers | By sellerId |
| `products` | High (thousands+) | By status (catalog), by sellerId (seller dashboard), text search |
| `variants` | High (per product) | By productId, compound (productId + sku) |
| `categories` | Low (dozens) | By slug, full list |
| `brands` | Low (dozens) | By slug |
| `orders` | High (growing) | By customerId, by _id |
| `orderitems` | High (per order) | By orderId, by sellerId |
| `payments` | 1:1 with orders | By stripePaymentIntentId (webhook), by orderId |
| `coupons` | Low (dozens) | By code |
| `addresses` | Moderate | By userId |
| `reviews` | High | By productId |
| `wishlists` | 1:1 with customers | By customerId |

## Index Strategy

| Collection | Index | Type | Purpose |
|-----------|-------|------|---------|
| users | `email` | Unique | Login lookup |
| products | `slug` | Unique | URL resolution |
| products | `sellerId` | Single | Seller's product list |
| products | `categoryId` | Single | Category filtering |
| products | `inStock` | Single | Stock filtering |
| products | `{ name, description }` | Text | Full-text search |
| variants | `productId` | Single | Variant lookup |
| variants | `sellerId` | Single | Seller inventory |
| variants | `{ productId, sku }` | Compound unique | SKU uniqueness per product |
| orders | `customerId` | Single | Customer order history |
| orderitems | `orderId` | Single | Order detail breakdown |
| orderitems | `sellerId` | Single | Seller fulfillment |
| stores | `sellerId` | Unique | One store per seller |
| categories | `slug` | Unique | URL resolution |
| brands | `slug` | Unique | URL resolution |
| payments | `stripePaymentIntentId` | Unique | Webhook idempotency |
| payments | `orderId` | Single | Payment lookup |
| addresses | `userId` | Single | User address list |
| reviews | `productId` | Single | Product reviews |
| wishlists | `customerId` | Unique | One wishlist per customer |
| coupons | `code` | Unique | Coupon validation |

## Transaction Boundaries

### Order Creation Transaction
**Scope**: `orders`, `orderitems`, `variants`, `coupons`

```
session.startTransaction()
  → Coupon.findOne() [validate]
  → for each item:
      Product.findById() [validate]
      Variant.findOneAndUpdate() [atomic stock decrement]
  → Order.save()
  → OrderItem.insertMany()
  → Coupon.save() [increment usage]
session.commitTransaction()  // or abortTransaction() on failure
```

## Data Integrity Rules

1. **Referential integrity**: Enforced at application level (no DB-level foreign keys)
2. **Cascade deletes**: Not implemented — deleted products show as "Deleted Product" in orders
3. **Unique constraints**: Enforced at MongoDB index level
4. **Enum validation**: Enforced at Mongoose schema level
5. **Required fields**: Enforced at Mongoose schema level
6. **Min/Max values**: Enforced at Mongoose schema level (`min`, `max` validators)

---

> **Cross-references**: [schema.md](schema.md) (entity details), [techspec.md](techspec.md) (architecture)
