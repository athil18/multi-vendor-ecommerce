# Docker Setup & Containerization

This document outlines the containerization strategy for the Marketplace Platform. The infrastructure is defined using `docker-compose.yml` to orchestrate the Frontend, Backend, and MongoDB services.

## Prerequisites
- Docker Engine 24.x or later
- Docker Compose v2

## Services Architecture
1. **mongodb**: Official MongoDB 6.0 image with persistent volume mapping (`mongodb_data`).
2. **backend**: Next.js Standalone server running the API routes on port 3001. Built using `backend/Dockerfile`.
3. **frontend**: Next.js Standalone server rendering the UI on port 3000. Built using `frontend/Dockerfile`.

## Build & Run Commands

### Start All Services
```bash
docker compose up -d --build
```
This builds the Dockerfiles, initializes the database, ensures the backend is healthy, and finally brings up the frontend.

### View Logs
```bash
docker compose logs -f
```

### Stop Services
```bash
docker compose down
```

## Local Development Workflow
If you want to use Docker just for the database during local development, you can spin up only MongoDB:
```bash
docker compose up -d mongodb
```
Then run the Next.js app locally via `npm run dev`.

## Healthchecks
Container readiness is strictly validated before dependent services start:
- **MongoDB**: Runs an internal `ping` command using `mongosh`.
- **Backend**: Verifies `GET /api/health` returns HTTP 200.
- **Frontend**: Verifies the main HTML index `/` returns HTTP 200.

## Security Constraints Applied
- **Non-root Execution**: Frontend and Backend containers run under a least-privileged `nextjs` (UID 1001) user.
- **Minimal Image Footprint**: Uses `node:20-alpine` and Next.js `standalone` mode to strip out development dependencies.
- **Secrets Management**: Secrets are injected securely via the environment variables in `docker-compose.yml` (and shouldn't be baked into the image).

## Troubleshooting
- **Port Conflicts**: If port `3000` or `3001` or `27017` is in use, modify the host port mappings in `docker-compose.yml` (e.g., `"8080:3000"`).
- **Stale Builds**: If code changes are not reflecting in the container, ensure you force a rebuild using `docker compose up --build --force-recreate`.
- **Database Connection Issues**: Ensure `backend` waits for `mongodb: service_healthy`. If the backend crashes, check if MongoDB is stuck initializing.
