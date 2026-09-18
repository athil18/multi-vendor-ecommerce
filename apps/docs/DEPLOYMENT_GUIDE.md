# Deployment Guide — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14 | Status: Development Only

---

## Current Deployment

**Local development only** (`npm run dev` on `localhost:3000`)

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- MongoDB Atlas cluster (M0 free tier or higher)
- Stripe account with Connect enabled

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/marketplace

# Authentication
JWT_SECRET=<256-bit-random-string>
JWT_REFRESH_SECRET=<256-bit-random-string>

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Generating Secure Secrets
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Recommended: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables via Vercel dashboard or CLI
vercel env add MONGO_URI production
vercel env add JWT_SECRET production
# ... (all variables)
```

### Vercel Configuration
- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node.js Version**: 20.x

## Alternative: Docker Deployment

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Stripe Webhook Setup

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Post-Deployment Checklist

- [ ] All environment variables are set (no empty values)
- [ ] MongoDB network access allows Vercel/server IPs
- [ ] Stripe webhook endpoint is verified
- [ ] `NODE_ENV=production`
- [ ] JWT secrets are cryptographically strong (≥256 bits)
- [ ] HTTPS is enforced
- [ ] Application loads without errors
- [ ] Auth flow works end-to-end
- [ ] Product catalog displays correctly

---

> **Cross-references**: [SECURITY_GUIDELINES.md](SECURITY_GUIDELINES.md) (production security), [OBSERVABILITY.md](OBSERVABILITY.md) (monitoring)
