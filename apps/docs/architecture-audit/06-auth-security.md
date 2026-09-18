# Sub-Agent 06: Authentication & Authorization Report
**Agent Responsibility:** JWT Token Lifecycle, Password Security, Edge Runtime Middleware, Role Boundaries, and RBAC Enforcement.

---

## 1. Authentication Architecture

```text
User Request
     │
     ├── Bearer Token (Authorization header)
     └── auth_token Cookie (HttpOnly, Secure, SameSite=Strict)
     │
     ▼
Next.js Edge Middleware (apps/src/middleware.ts)
     │
     ├── Web Crypto API HMAC-SHA256 Signature Verification
     ├── Role Extraction (admin | seller | customer)
     └── Route Guard Evaluation (/admin, /seller, /customer, /checkout)
```

---

## 2. Evidence-Based Security Verifications

### 2.1 Password Hashing (CONFIRMED)
- **Library:** `bcryptjs` with salt rounds = 10.
- **Implementation:** `apps/src/services/AuthService.ts` hashes passwords during registration and verifies with `bcrypt.compare` during login.

### 2.2 Token Strategy (CONFIRMED)
- **Access Token:** Short-lived JWT (15 minutes).
- **Refresh Token:** Long-lived JWT (7 days), stored in the `User.refreshTokens` array in PostgreSQL for revocation support.
- **Edge Verification:** `apps/src/middleware.ts` verifies JWT tokens using Web Crypto API directly on the Edge Runtime without Node.js crypto module dependencies.

### 2.3 Role-Based Access Control (RBAC) Matrix (CONFIRMED)

| Path Prefix | Allowed Roles | Enforcement Mechanism | Failure Action |
|---|---|---|---|
| `/admin/*` | `admin` | `middleware.ts` | Redirect to `/auth/login?returnUrl=...` |
| `/seller/*` | `seller`, `admin` | `middleware.ts` | Redirect to `/auth/login?returnUrl=...` |
| `/customer/*` | `customer`, `seller`, `admin` | `middleware.ts` | Redirect to `/auth/login?returnUrl=...` |
| `/checkout` | `customer`, `seller`, `admin` | `middleware.ts` | Redirect to `/auth/login?returnUrl=...` |

### 2.4 Rate Limiting on Auth Endpoints (CONFIRMED)
- **Implementation:** In-memory sliding window rate limiter in `apps/src/lib/rate-limit.ts`.
- **Policy:**
  - Login / Register: 5 requests per 15 minutes per IP.
  - Password Reset: 3 requests per 1 hour per IP.
  - Token Refresh: 10 requests per 15 minutes per IP.
  - Exceeding limit returns HTTP 429 with standard `Retry-After` headers.
