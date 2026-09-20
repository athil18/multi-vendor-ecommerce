# 100% Free & Open-Source Production Deployment Guide
## Nexus Multi-Vendor E-Commerce Platform (Docker Compose + Caddy SSL)

This deployment pipeline is **100% Free and Open-Source**. It relies on zero cloud subscriptions, zero SaaS PaaS intermediaries, and zero proprietary platforms.

---

## 1. System Components

The stack is composed of 5 containerized services running on a shared internal bridge network:

1. **`web`**: Next.js 16 (App Router + React 19) production server running on port 3000.
2. **`worker`**: BullMQ queue worker executing order confirmation emails, webhook dispatch, and retry pipelines.
3. **`postgres`**: PostgreSQL 16 Alpine database with health checks and persistent volume storage.
4. **`redis`**: Redis 7 Alpine in-memory queue broker with password protection and persistent append-only files.
5. **`caddy`**: Caddy 2 reverse proxy with automated Let's Encrypt TLS certificate generation, HSTS enforcement, and Gzip compression.

---

## 2. Prerequisites

Any Linux server (Ubuntu 22.04 / 24.04 LTS recommended):
- Minimum: 2 vCPU, 2GB RAM (e.g., Hetzner, DigitalOcean, Oracle Cloud Always Free, AWS EC2, or local machine).
- Docker Engine & Docker Compose plugin installed:
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```

---

## 3. Quickstart: 1-Click Deployment

Clone the repository and run the automated deployment script:

```bash
git clone https://github.com/athil18/multi-vendor-ecommerce.git
cd multi-vendor-ecommerce

# Make deploy script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

The script will:
1. Generate `.env.production` with cryptographically random secrets for Postgres, Redis, and JWTs.
2. Build optimized multi-stage Docker images.
3. Start PostgreSQL and Redis, waiting until database health checks pass.
4. Launch the Next.js Web Application, BullMQ Worker, and Caddy SSL proxy.
5. Automatically apply Prisma schema migrations (`npx prisma migrate deploy`).

---

## 4. Manual Step-by-Step Deployment

If you prefer executing the steps manually:

### Step 1: Configure Environment Variables
```bash
cp .env.production.example .env.production
nano .env.production
```
Configure your public domain:
```env
DOMAIN=nexus.yourdomain.com
NEXT_PUBLIC_APP_URL=https://nexus.yourdomain.com
CLIENT_URL=https://nexus.yourdomain.com
```

### Step 2: Build & Start Services
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Step 3: Run Database Migrations
```bash
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy
```

### Step 4: Seed Demo Catalog & Merchant Ateliers (Optional)
```bash
docker compose -f docker-compose.prod.yml exec web npx tsx seeds/index.ts
```

---

## 5. Daily Operations & Maintenance

| Action | Command |
|---|---|
| **View Real-Time Logs** | `docker compose -f docker-compose.prod.yml logs -f` |
| **View Web App Logs Only** | `docker compose -f docker-compose.prod.yml logs -f web` |
| **View Worker Queue Logs** | `docker compose -f docker-compose.prod.yml logs -f worker` |
| **Restart Platform** | `docker compose -f docker-compose.prod.yml restart` |
| **Stop Platform** | `docker compose -f docker-compose.prod.yml down` |
| **Update to Latest Code** | `git pull origin main && ./deploy.sh` |
| **Database Backup** | `docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres marketplace > backup.sql` |
| **Database Restore** | `cat backup.sql \| docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres marketplace` |

---

## 6. Stripe Live Webhook Setup

1. Open your [Stripe Dashboard](https://dashboard.stripe.com) &rarr; **Developers** &rarr; **Webhooks**.
2. Add Endpoint: `https://nexus.yourdomain.com/api/checkout/webhook`
3. Listen for events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
4. Copy the Signing Secret (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in `.env.production`.
5. Restart the web app: `docker compose -f docker-compose.prod.yml restart web`.
