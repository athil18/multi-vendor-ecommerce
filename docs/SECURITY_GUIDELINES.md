# Security Guidelines — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14

---

## Authentication Security

| Control | Status | Implementation |
|---------|--------|---------------|
| Password hashing | ✅ Implemented | bcryptjs with auto-salt |
| Short-lived access tokens | ✅ Implemented | 15-minute TTL |
| httpOnly refresh cookies | ✅ Implemented | Secure, SameSite=strict, 7-day TTL |
| Hashed refresh token storage | ✅ Implemented | SHA-256 before DB storage |
| Token rotation | ✅ Implemented | Old hash removed on refresh |
| Suspended user denial | ✅ Implemented | Checked on every auth call |
| Password field protection | ✅ Implemented | `select: false` on schema |
| Rate limiting | ❌ Not implemented | Required for auth endpoints |
| Account lockout | ❌ Not implemented | After N failed attempts |
| MFA / 2FA | ❌ Not implemented | Future consideration |

## Authorization Security

| Control | Status | Implementation |
|---------|--------|---------------|
| Role-based access control | ✅ Implemented | `authorizeRole()` on protected routes |
| Ownership verification | ✅ Implemented | Seller checks `sellerId === user.id` on orders/products |
| Admin-only moderation | ✅ Implemented | Admin routes require `role: 'admin'` |
| One store per seller | ✅ Implemented | Unique constraint on `sellerId` |

## Input Security

| Control | Status | Implementation |
|---------|--------|---------------|
| Auth input validation | ✅ Implemented | Zod schemas for register, login, forgot/reset password |
| API input validation | ⚠️ Partial | Only auth routes use Zod; others do manual checks |
| SQL/NoSQL injection | ✅ Mitigated | Mongoose parameterizes queries; no raw string interpolation |
| XSS prevention | ✅ Default | React auto-escapes JSX output |

## Payment Security

| Control | Status | Implementation |
|---------|--------|---------------|
| Server-side price validation | ✅ Implemented | Prices fetched from DB at order creation |
| Webhook signature verification | ✅ Implemented | `stripe.webhooks.constructEvent()` |
| Idempotent payment processing | ✅ Implemented | `findOneAndUpdate` upsert on Payment model |
| Platform fee enforcement | ✅ Implemented | 10% calculated server-side |

## Data Security

| Control | Status | Implementation |
|---------|--------|---------------|
| Sensitive field exclusion | ✅ Implemented | `select: false` on password, reset tokens, refresh tokens |
| Environment variable isolation | ✅ Implemented | `.env` file, not committed |
| HTTPS in production | ⚠️ Config needed | Depends on deployment platform |
| CORS | ✅ Default | Next.js same-origin policy |

## Known Vulnerabilities (v1.0)

| Vulnerability | Risk | Mitigation Plan |
|--------------|------|-----------------|
| No rate limiting on auth | Medium | Add rate limiting middleware (Phase 8) |
| Access token in localStorage | Medium | Currently in React state (OK); concern if persisted |
| No CSRF tokens | Low | JWT-based auth reduces CSRF risk; add tokens for forms |
| Stripe fallback to empty secret | Low | Only in development; enforce in production |
| `any` type in Stripe handlers | Low | Type assertions required due to Stripe SDK types |

## Production Hardening Checklist

- [ ] Enable rate limiting on `/api/auth/*` (e.g., 5 req/min per IP)
- [ ] Validate all environment variables at startup
- [ ] Ensure `STRIPE_WEBHOOK_SECRET` is never empty
- [ ] Set `secure: true` on cookies in production
- [ ] Add Content-Security-Policy headers
- [ ] Add X-Content-Type-Options: nosniff
- [ ] Add X-Frame-Options: DENY
- [ ] Implement request size limits
- [ ] Add logging for auth failures

---

> **Cross-references**: [rules.md](rules.md) (security requirements), [techspec.md](techspec.md) (security approach)
