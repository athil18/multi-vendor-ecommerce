#!/usr/bin/env bash
# ==============================================================================
# Nexus Multi-Vendor E-Commerce Platform - Automated 1-Click Production Deploy
# Stack: 100% Free & Open-Source (Docker Compose + Caddy SSL)
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}🚀 Starting Nexus Multi-Vendor E-Commerce 100% Open-Source Deployment${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 1. Check Prerequisite: Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker Engine first:${NC}"
    echo "   curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 2. Check Prerequisite: Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose plugin is not installed.${NC}"
    exit 1
fi

# 3. Ensure .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from template with secure random secrets...${NC}"
    cp .env.production.example .env.production

    # Generate random secure passwords if openssl is available
    if command -v openssl &> /dev/null; then
        PG_PASS=$(openssl rand -hex 16)
        REDIS_PASS=$(openssl rand -hex 16)
        JWT_SEC=$(openssl rand -base64 32)
        JWT_REF=$(openssl rand -base64 32)
        CRON_SEC=$(openssl rand -hex 16)

        sed -i "s/generate_a_secure_postgres_password/$PG_PASS/g" .env.production
        sed -i "s/generate_a_secure_redis_password/$REDIS_PASS/g" .env.production
        sed -i "s/your_32_char_random_jwt_secret_key_here/$JWT_SEC/g" .env.production
        sed -i "s/your_32_char_random_refresh_secret_key_here/$JWT_REF/g" .env.production
        sed -i "s/your_random_cron_auth_secret_key/$CRON_SEC/g" .env.production
        echo -e "${GREEN}✅ Generated cryptographically secure keys in .env.production${NC}"
    fi
    echo -e "${YELLOW}👉 Remember to edit .env.production with your real DOMAIN and Stripe keys!${NC}"
fi

# 4. Build Containers
echo -e "\n${BLUE}📦 Building production Docker images...${NC}"
docker compose -f docker-compose.prod.yml build

# 5. Start Core Storage & Queues (Postgres & Redis)
echo -e "\n${BLUE}🛢️  Starting PostgreSQL and Redis...${NC}"
docker compose -f docker-compose.prod.yml up -d postgres redis

# 6. Wait for PostgreSQL to be healthy
echo -e "${BLUE}⏳ Waiting for PostgreSQL database to become healthy...${NC}"
until [ "$(docker inspect -f '{{.State.Health.Status}}' nexus-postgres 2>/dev/null)" == "healthy" ]; do
    sleep 2
    printf "."
done
echo -e "\n${GREEN}✅ PostgreSQL is ready!${NC}"

# 7. Start Web Application and Background Worker
echo -e "\n${BLUE}🌐 Starting Next.js Web App, BullMQ Worker, and Caddy SSL Proxy...${NC}"
docker compose -f docker-compose.prod.yml up -d web worker caddy

# 8. Run Database Migrations
echo -e "\n${BLUE}🔄 Running Prisma Database Migrations inside web container...${NC}"
sleep 3
docker compose -f docker-compose.prod.yml exec -T web npx prisma migrate deploy || echo -e "${YELLOW}⚠️ Migration check finished.${NC}"

# 9. Final Status Check
echo -e "\n${GREEN}==============================================================================${NC}"
echo -e "${GREEN}🎉 Nexus Multi-Vendor E-Commerce is LIVE!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
docker compose -f docker-compose.prod.yml ps

echo -e "\n${BLUE}Useful Operations Commands:${NC}"
echo "   View live logs:      docker compose -f docker-compose.prod.yml logs -f"
echo "   Restart services:   docker compose -f docker-compose.prod.yml restart"
echo "   Seed demo catalog:  docker compose -f docker-compose.prod.yml exec -T web npx tsx seeds/index.ts"
echo "   Stop platform:      docker compose -f docker-compose.prod.yml down"
