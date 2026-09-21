# ==============================================================================
# Production Multi-Stage Dockerfile for Nexus Multi-Vendor E-Commerce
# Supports Next.js 16 App Router & BullMQ Background Queue Worker
# ==============================================================================

# 1. Base Image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# 2. Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps

# 3. Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Dummy build-time env vars (Next.js needs these to compile server code;
# real values are injected at runtime via Render Secret Files)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV JWT_SECRET="build-placeholder-jwt-secret-minimum-32chars"
ENV JWT_REFRESH_SECRET="build-placeholder-jwt-refresh-secret"
ENV STRIPE_SECRET_KEY="sk_test_build_placeholder"
ENV STRIPE_WEBHOOK_SECRET="whsec_build_placeholder"
ENV UPSTASH_REDIS_REST_URL="https://build-placeholder.upstash.io"
ENV UPSTASH_REDIS_REST_TOKEN="build-placeholder-token"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV CLIENT_URL="http://localhost:3000"
ENV CRON_SECRET="build-placeholder-cron-secret"

RUN npx prisma generate
RUN npm run build

# 4. Production Runner Stage (Web Application)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# PORT is set by Render at runtime (typically 10000); fallback to 3000 for local Docker
ENV HOSTNAME="0.0.0.0"

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy runtime assets, source, and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/seeds ./seeds
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 10000 3000

# Shell form enables $PORT variable expansion from Render's runtime env
CMD npx next start -H 0.0.0.0 -p ${PORT:-3000}
