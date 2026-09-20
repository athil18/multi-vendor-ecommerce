# ==============================================================================
# Nexus Multi-Vendor E-Commerce Platform - Automated 1-Click Production Deploy
# PowerShell Automation Script for Windows / Cloud Hosts
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Nexus Multi-Vendor E-Commerce 100% Open-Source Deployment" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# 1. Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Engine / Docker Desktop first." -ForegroundColor Red
    exit 1
}

# 2. Check .env.production
if (-not (Test-Path .env.production)) {
    Write-Host "⚠️  .env.production not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item .env.production.example .env.production
    Write-Host "👉 Created .env.production. Please edit it with your live domain and passwords." -ForegroundColor Yellow
}

# 3. Build containers
Write-Host "`n📦 Building production Docker images..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml build

# 4. Start Postgres and Redis
Write-Host "`n🛢️ Starting PostgreSQL and Redis..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml up -d postgres redis

# 5. Start Web, Worker, and Caddy
Write-Host "`n🌐 Starting Next.js Web App, BullMQ Worker, and Caddy SSL Proxy..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml up -d web worker caddy

# 6. Run Migrations
Write-Host "`n🔄 Running Prisma Database Migrations..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
docker compose -f docker-compose.prod.yml exec -T web npx prisma migrate deploy

# 7. Show Status
Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host "🎉 Nexus Multi-Vendor E-Commerce is LIVE!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
docker compose -f docker-compose.prod.yml ps
