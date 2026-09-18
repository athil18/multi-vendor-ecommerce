# Nexus Multi-Vendor Marketplace API Specification

Welcome to the official API documentation for the **Nexus Multi-Vendor Marketplace**. This documentation defines all API contracts, security flows, authorization schemes, and standardized error formats.

---

## 1. Authentication & Security

The Nexus API uses a two-tier token mechanism consisting of short-lived **JWT Access Tokens** and long-lived **Refresh Tokens** to secure API resources.

### JWT Access Tokens
* **Transmission**: Sent via the HTTP header:
  `Authorization: Bearer <access_token>`
* **Lifetime**: 15 minutes.
* **Usage**: Statelessly verifies the client's identity and permissions (RBAC) at the route layer.

### Refresh Tokens & Rotation
* **Transmission**: Handled automatically via a secure cookie.
* **Cookie Attributes**:
  * `HttpOnly`: Invisible to client-side scripts to prevent XSS-based token theft.
  * `Secure`: Transmitted only over encrypted (HTTPS) connections.
  * `SameSite=Strict`: Prevents CSRF attacks by restricting cookie transmission to first-party contexts.
* **Rotation Flow**: Upon calling `/api/auth/refresh`, the server invalidates the old refresh token, generates a new refresh token, sets it in a new secure cookie, and issues a new access token.
* **Revocation**: Calling `/api/auth/logout` explicitly deletes the refresh token cookie and invalidates the session in the database.

---

## 2. Role-Based Access Control (RBAC) Matrix

Users in the system are assigned one of three roles:
1. **Customer**: Standard buyer account.
2. **Seller**: Merchant account managing a custom store.
3. **Admin**: Platform manager responsible for moderation and system-wide settings.

| Endpoint | HTTP Method | Customer | Seller | Admin | Auth Required |
|----------|-------------|:---:|:---:|:---:|:---:|
| **Authentication** | | | | | |
| `/api/auth/register` | `POST` | ✅ | ✅ | ✅ | Public |
| `/api/auth/login` | `POST` | ✅ | ✅ | ✅ | Public |
| `/api/auth/refresh` | `POST` | ✅ | ✅ | ✅ | Public (Cookie) |
| `/api/auth/logout` | `POST` | ✅ | ✅ | ✅ | Public (Cookie) |
| `/api/auth/me` | `GET` | ✅ | ✅ | ✅ | Bearer Token |
| `/api/auth/forgot-password` | `POST` | ✅ | ✅ | ✅ | Public |
| `/api/auth/reset-password` | `POST` | ✅ | ✅ | ✅ | Public |
| **Products** | | | | | |
| `/api/products` | `GET` | ✅ | ✅ | ✅ | Public |
| `/api/products` | `POST` | ❌ | ✅ | ✅ | Bearer Token |
| `/api/products/{id}` | `GET` | ✅ | ✅ | ✅ | Public* |
| `/api/products/{id}` | `PUT` | ❌ | Owner | ✅ | Bearer Token |
| `/api/products/{id}` | `DELETE` | ❌ | Owner | ✅ | Bearer Token |
| `/api/products/slug/{slug}` | `GET` | ✅ | ✅ | ✅ | Public* |
| **Orders** | | | | | |
| `/api/orders` | `GET` | Owner | ❌ | ✅ | Bearer Token |
| `/api/orders` | `POST` | ✅ | ❌ | ✅ | Bearer Token |
| `/api/orders/{id}` | `GET` | Owner | ❌ | ✅ | Bearer Token |
| **Addresses** | | | | | |
| `/api/addresses` | `GET` | Owner | Owner | ✅ | Bearer Token |
| `/api/addresses` | `POST` | ✅ | ✅ | ✅ | Bearer Token |
| `/api/addresses/{id}` | `PUT` | Owner | Owner | ✅ | Bearer Token |
| `/api/addresses/{id}` | `DELETE` | Owner | Owner | ✅ | Bearer Token |
| **Seller Profiles & Operations** | | | | | |
| `/api/seller/store` | `GET` | ❌ | ✅ | ✅ | Bearer Token |
| `/api/seller/store` | `POST` | ❌ | ✅ | ✅ | Bearer Token |
| `/api/seller/products` | `GET` | ❌ | ✅ | ✅ | Bearer Token |
| `/api/seller/products/{id}/status`| `PATCH` | ❌ | Owner | ✅ | Bearer Token |
| `/api/seller/orders` | `GET` | ❌ | ✅ | ✅ | Bearer Token |
| `/api/seller/orders/{id}/status` | `PUT` | ❌ | Owner | ✅ | Bearer Token |
| `/api/seller/dashboard` | `GET` | ❌ | ✅ | ✅ | Bearer Token |
| **Admin Operations** | | | | | |
| `/api/admin/products` | `GET` | ❌ | ❌ | ✅ | Bearer Token |
| `/api/admin/products/{id}/status`| `PATCH` | ❌ | ❌ | ✅ | Bearer Token |
| **Payments** | | | | | |
| `/api/payments/create-intent` | `POST` | ✅ | ❌ | ✅ | Bearer Token |
| `/api/payments/webhook` | `POST` | ✅ | ✅ | ✅ | Public (Signature) |
| `/api/payments/onboarding` | `POST` | ❌ | ✅ | ✅ | Bearer Token |
| `/api/payments/payout-status` | `GET` | ❌ | ✅ | ✅ | Bearer Token |
| **Categories** | | | | | |
| `/api/categories` | `GET` | ✅ | ✅ | ✅ | Public |

> \* Note: Non-published products are restricted to the Seller Owner and Admins.

---

## 3. Standardized Error Envelopes

All API error responses follow a consistent format, enabling frontend clients to handle operational and validation states uniformly.

### Error Fields
* `message`: A human-readable description of the error.
* `code`: A string-based machine-readable error code.
* `errors` *(Optional)*: An object detailing specific validation failures keyed by field.

### Error Types & Examples

#### A. Validation Failure (HTTP `400 Bad Request`)
```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

#### B. Authentication Error (HTTP `401 Unauthorized`)
```json
{
  "message": "Not authorized",
  "code": "AUTHENTICATION_ERROR"
}
```

#### C. Authorization Error (HTTP `403 Forbidden`)
```json
{
  "message": "Forbidden",
  "code": "AUTHORIZATION_ERROR"
}
```

#### D. Resource Not Found (HTTP `404 Not Found`)
```json
{
  "message": "Product not found",
  "code": "NOT_FOUND_ERROR"
}
```

#### E. Rate Limit Exceeded (HTTP `429 Too Many Requests`)
```json
{
  "message": "Too many requests",
  "code": "RATE_LIMIT_ERROR"
}
```

#### F. Internal Server Error (HTTP `500 Internal Server Error`)
```json
{
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 4. Endpoint Reference

### 4.1 Authentication

#### `POST /api/auth/register`
Creates a user account and outputs tokens.
* **Auth**: None
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "607f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    }
  }
  ```

#### `POST /api/auth/login`
Authenticates a user and sets a secure cookie.
* **Auth**: None
* **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (`200 OK`)**:
  * **Headers**: `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict`
  * **Body**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "607f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "customer"
      }
    }
    ```

#### `POST /api/auth/refresh`
Rotates the session using the HTTP cookie.
* **Auth**: Cookie-based `refreshToken`
* **Success Response (`200 OK`)**:
  * **Headers**: `Set-Cookie: refreshToken=...`
  * **Body**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

#### `POST /api/auth/logout`
Invalidates session and clears cookies.
* **Auth**: Cookie-based `refreshToken`
* **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### `GET /api/auth/me`
Retrieves current profile details.
* **Auth**: Bearer Token
* **Success Response (`200 OK`)**:
  ```json
  {
    "id": "607f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "status": "active"
  }
  ```

#### `POST /api/auth/forgot-password`
Initiates password reset flow.
* **Auth**: None
* **Request Body**:
  ```json
  {
    "email": "john.doe@example.com"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "message": "If a user with that email exists, a reset link has been sent.",
    "resetToken": "dev-token-string"
  }
  ```

#### `POST /api/auth/reset-password`
Completes password reset flow.
* **Auth**: None
* **Request Body**:
  ```json
  {
    "token": "dev-token-string",
    "password": "newsecurepassword123"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Password reset successful"
  }
  ```

---

### 4.2 Products

#### `GET /api/products`
Retrieves catalog products with sorting and page filters.
* **Auth**: None
* **Query Parameters**:
  * `keyword` (string): Search text.
  * `category` (string): Category ID.
  * `minPrice` / `maxPrice` (number).
  * `inStock` (string: "true"/"false").
  * `sort` (enum): `newest`, `price_asc`, `price_desc`, `popular`, `top_rated`.
  * `page` (number, default: 1).
  * `limit` (number, default: 20).
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "607f1f77bcf86cd799439020",
        "name": "Wireless Mouse",
        "description": "Ergonomic wireless mouse",
        "slug": "wireless-mouse-1623849103",
        "basePrice": 29.99,
        "categoryId": {
          "_id": "607f1f77bcf86cd799439014",
          "name": "Electronics",
          "slug": "electronics"
        },
        "images": ["https://example.com/mouse.jpg"],
        "tags": ["accessory", "wireless"],
        "status": "published",
        "sellerId": "607f1f77bcf86cd799439013",
        "createdAt": "2026-06-15T10:00:00.000Z",
        "updatedAt": "2026-06-15T10:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### `POST /api/products`
Creates a draft product.
* **Auth**: Bearer Token (Seller / Admin)
* **Request Body**:
  ```json
  {
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "basePrice": 29.99,
    "categoryId": "607f1f77bcf86cd799439014"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439020",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "slug": "wireless-mouse-1623849103",
    "basePrice": 29.99,
    "categoryId": "607f1f77bcf86cd799439014",
    "status": "draft",
    "sellerId": "607f1f77bcf86cd799439013",
    "createdAt": "2026-06-16T12:00:00.000Z"
  }
  ```

#### `GET /api/products/{id}`
Returns details of a specific product ID.
* **Auth**: None (Public products only, unpublished require owner/admin auth)
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439020",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "slug": "wireless-mouse-1623849103",
    "basePrice": 29.99,
    "categoryId": {
      "_id": "607f1f77bcf86cd799439014",
      "name": "Electronics",
      "slug": "electronics"
    },
    "sellerId": {
      "_id": "607f1f77bcf86cd799439013",
      "name": "Tech Store",
      "email": "seller@example.com"
    },
    "images": ["https://example.com/mouse.jpg"],
    "tags": ["accessory", "wireless"],
    "status": "published",
    "createdAt": "2026-06-15T10:00:00.000Z"
  }
  ```

#### `PUT /api/products/{id}`
Updates details of an existing product.
* **Auth**: Bearer Token (Seller Owner / Admin)
* **Request Body**:
  ```json
  {
    "basePrice": 34.99,
    "name": "Wireless Mouse V2"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439020",
    "name": "Wireless Mouse V2",
    "description": "Ergonomic wireless mouse",
    "slug": "wireless-mouse-v2-1623849103",
    "basePrice": 34.99,
    "categoryId": "607f1f77bcf86cd799439014",
    "status": "draft",
    "sellerId": "607f1f77bcf86cd799439013",
    "updatedAt": "2026-06-16T12:30:00.000Z"
  }
  ```

#### `DELETE /api/products/{id}`
Deletes a product and its variants.
* **Auth**: Bearer Token (Seller Owner / Admin)
* **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Product and its variants deleted successfully"
  }
  ```

#### `GET /api/products/slug/{slug}`
Returns product by slug string.
* **Auth**: None
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439020",
    "name": "Wireless Mouse",
    "slug": "wireless-mouse-1623849103",
    "basePrice": 29.99,
    "status": "published"
  }
  ```

---

### 4.3 Orders

#### `GET /api/orders`
Lists all orders placed by the current customer.
* **Auth**: Bearer Token (Customer)
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "607f1f77bcf86cd799439030",
        "customerId": "607f1f77bcf86cd799439011",
        "sellerIds": ["607f1f77bcf86cd799439013"],
        "totalAmount": 34.99,
        "aggregateStatus": "pending",
        "shippingAddress": "607f1f77bcf86cd799439040",
        "paymentMethod": "card",
        "paymentStatus": "pending",
        "createdAt": "2026-06-16T11:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### `POST /api/orders`
Creates a checkout order session.
* **Auth**: Bearer Token (Customer)
* **Request Body**:
  ```json
  {
    "orderItems": [
      {
        "productId": "607f1f77bcf86cd799439020",
        "variantId": "607f1f77bcf86cd799439021",
        "quantity": 1
      }
    ],
    "shippingAddressId": "607f1f77bcf86cd799439040",
    "paymentMethod": "card"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439030",
    "customerId": "607f1f77bcf86cd799439011",
    "totalAmount": 34.99,
    "aggregateStatus": "pending",
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "createdAt": "2026-06-16T11:00:00.000Z"
  }
  ```

#### `GET /api/orders/{id}`
Returns granular order info and lines items.
* **Auth**: Bearer Token (Order Owner / Admin)
* **Success Response (`200 OK`)**:
  ```json
  {
    "order": {
      "_id": "607f1f77bcf86cd799439030",
      "customerId": "607f1f77bcf86cd799439011",
      "totalAmount": 34.99,
      "status": "pending",
      "shippingAddress": {
        "_id": "607f1f77bcf86cd799439040",
        "street": "123 Main St",
        "city": "Seattle",
        "state": "WA",
        "zip": "98101",
        "country": "USA"
      },
      "paymentMethod": "card",
      "paymentStatus": "pending",
      "createdAt": "2026-06-16T11:00:00.000Z"
    },
    "items": [
      {
        "_id": "607f1f77bcf86cd799439031",
        "orderId": "607f1f77bcf86cd799439030",
        "productId": {
          "_id": "607f1f77bcf86cd799439020",
          "name": "Wireless Mouse",
          "images": ["https://example.com/mouse.jpg"],
          "slug": "wireless-mouse-1623849103"
        },
        "variantId": "607f1f77bcf86cd799439021",
        "sellerId": "607f1f77bcf86cd799439013",
        "quantity": 1,
        "price": 29.99,
        "status": "pending"
      }
    ]
  }
  ```

---

### 4.4 Addresses

#### `GET /api/addresses`
Lists user's saved addresses.
* **Auth**: Bearer Token (Customer / Seller)
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "607f1f77bcf86cd799439040",
        "userId": "607f1f77bcf86cd799439011",
        "type": "shipping",
        "street": "123 Main St",
        "city": "Seattle",
        "state": "WA",
        "zip": "98101",
        "country": "USA",
        "isDefault": true,
        "createdAt": "2026-06-15T09:00:00.000Z"
      }
    ]
  }
  ```

#### `POST /api/addresses`
Creates a saved address.
* **Auth**: Bearer Token (Customer / Seller)
* **Request Body**:
  ```json
  {
    "type": "shipping",
    "street": "123 Main St",
    "city": "Seattle",
    "state": "WA",
    "zip": "98101",
    "country": "USA",
    "isDefault": false
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "data": {
      "_id": "607f1f77bcf86cd799439040",
      "userId": "607f1f77bcf86cd799439011",
      "type": "shipping",
      "street": "123 Main St",
      "city": "Seattle",
      "state": "WA",
      "zip": "98101",
      "country": "USA",
      "isDefault": false,
      "createdAt": "2026-06-16T12:00:00.000Z"
    }
  }
  ```

#### `PUT /api/addresses/{id}`
Updates an address document.
* **Auth**: Bearer Token (Address Owner)
* **Request Body**:
  ```json
  {
    "street": "456 Broadway Ave",
    "zip": "98102",
    "isDefault": true
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": {
      "_id": "607f1f77bcf86cd799439040",
      "userId": "607f1f77bcf86cd799439011",
      "type": "shipping",
      "street": "456 Broadway Ave",
      "city": "Seattle",
      "state": "WA",
      "zip": "98102",
      "country": "USA",
      "isDefault": true,
      "updatedAt": "2026-06-16T12:00:00.000Z"
    }
  }
  ```

#### `DELETE /api/addresses/{id}`
Deletes address ID.
* **Auth**: Bearer Token (Address Owner)
* **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Address deleted successfully"
  }
  ```

---

### 4.5 Seller Endpoints

#### `GET /api/seller/store`
Retrieves merchant store details.
* **Auth**: Bearer Token (Seller)
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439050",
    "sellerId": "607f1f77bcf86cd799439013",
    "storeName": "Super Gizmos",
    "description": "The best source for electronics",
    "logo": "https://example.com/logo.jpg",
    "isApproved": true,
    "createdAt": "2026-06-15T09:00:00.000Z"
  }
  ```

#### `POST /api/seller/store`
Registers a store profile.
* **Auth**: Bearer Token (Seller)
* **Request Body**:
  ```json
  {
    "storeName": "Super Gizmos",
    "description": "The best source for electronics",
    "logo": "https://example.com/logo.jpg"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439050",
    "sellerId": "607f1f77bcf86cd799439013",
    "storeName": "Super Gizmos",
    "isApproved": false
  }
  ```

#### `GET /api/seller/products`
Lists seller's catalog and stock.
* **Auth**: Bearer Token (Seller)
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "607f1f77bcf86cd799439020",
        "name": "Wireless Mouse",
        "slug": "wireless-mouse-1623849103",
        "basePrice": 29.99,
        "status": "published",
        "variants": [
          {
            "_id": "607f1f77bcf86cd799439021",
            "sku": "MSE-WRLS-BLK",
            "price": 29.99,
            "stock": 45
          }
        ]
      }
    ]
  }
  ```

#### `PATCH /api/seller/products/{id}/status`
Requests status transitions (e.g. submit for review).
* **Auth**: Bearer Token (Seller Owner)
* **Request Body**:
  ```json
  {
    "status": "pending_review"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439020",
    "status": "pending_review"
  }
  ```

#### `GET /api/seller/orders`
Lists order items assigned to seller store.
* **Auth**: Bearer Token (Seller)
* **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "_id": "607f1f77bcf86cd799439031",
        "orderId": "607f1f77bcf86cd799439030",
        "productId": {
          "_id": "607f1f77bcf86cd799439020",
          "name": "Wireless Mouse"
        },
        "quantity": 1,
        "price": 29.99,
        "status": "pending"
      }
    ]
  }
  ```

#### `PUT /api/seller/orders/{id}/status`
Updates shipment status of an item.
* **Auth**: Bearer Token (Seller Owner)
* **Request Body**:
  ```json
  {
    "status": "processing"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439031",
    "status": "processing"
  }
  ```

#### `GET /api/seller/dashboard`
Returns seller sales analytics.
* **Auth**: Bearer Token (Seller)
* **Success Response (`200 OK`)**:
  ```json
  {
    "revenue": 450.75,
    "ordersCount": 12,
    "popularProducts": [
      {
        "name": "Wireless Mouse",
        "salesCount": 8
      }
    ]
  }
  ```

---

### 4.6 Admin Endpoints

#### `GET /api/admin/products`
Lists all products in the system.
* **Auth**: Bearer Token (Admin)
* **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "607f1f77bcf86cd799439020",
      "name": "Wireless Mouse",
      "status": "pending_review",
      "sellerId": "607f1f77bcf86cd799439013",
      "createdAt": "2026-06-16T12:00:00.000Z"
    }
  ]
  ```

#### `PATCH /api/admin/products/{id}/status`
Approves or rejects a product.
* **Auth**: Bearer Token (Admin)
* **Request Body**:
  ```json
  {
    "status": "published"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "_id": "607f1f77bcf86cd799439020",
    "status": "published"
  }
  ```

---

### 4.7 Payments

#### `POST /api/payments/create-intent`
Initiates Stripe PaymentIntent session.
* **Auth**: Bearer Token (Customer / Admin)
* **Request Body**:
  ```json
  {
    "orderId": "607f1f77bcf86cd799439030"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "clientSecret": "pi_3J4x9v2eZvKYlo2C1abcde_secret_fghij"
  }
  ```

#### `POST /api/payments/webhook`
Stripe event receiver.
* **Auth**: Stripe Signature Header Verification
* **Success Response (`200 OK`)**:
  ```json
  {
    "received": true
  }
  ```

#### `POST /api/payments/onboarding`
Creates seller connect integration link.
* **Auth**: Bearer Token (Seller)
* **Success Response (`200 OK`)**:
  ```json
  {
    "url": "https://connect.stripe.com/setup/s/acct_123abc"
  }
  ```

#### `GET /api/payments/payout-status`
Checks merchant payout abilities.
* **Auth**: Bearer Token (Seller)
* **Success Response (`200 OK`)**:
  ```json
  {
    "payoutsEnabled": true,
    "chargesEnabled": true,
    "detailsSubmitted": true
  }
  ```

---

### 4.8 Categories

#### `GET /api/categories`
Lists categories hierarchical tree.
* **Auth**: None
* **Success Response (`200 OK`)**:
  ```json
  [
    {
      "_id": "607f1f77bcf86cd799439014",
      "name": "Electronics",
      "slug": "electronics",
      "parentId": null,
      "image": "https://example.com/cat.jpg"
    }
  ]
  ```
