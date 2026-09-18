# Observability — Nexus Marketplace

> Version: 2.0.0 | Last Updated: 2026-06-17 | Status: Enterprise-Grade

---

## Current State

The Nexus Marketplace platform implements a complete Enterprise-Grade Observability, Monitoring, Alerting, and Production Debugging platform. It utilizes `@sentry/nextjs`, centralized logging, automated health probes, and distinct alerting severity levels.

## 1. Application Performance Monitoring & Error Tracking

We use **Sentry** for full application observability:
- **Exceptions & Crashes:** Captured globally across Edge, Server, and Client environments.
- **Queue Workers:** BullMQ workers are wrapped in Sentry Transactions, capturing latency, queue depth, and job failures.
- **Stripe Webhooks:** Failures securely capture Stripe event metadata for debuggability without logging raw PII.
- **Trace IDs:** Every request via Next.js middleware is assigned a unique `x-request-id` header (`uuid`), injected into logs and Sentry tags.

## 2. Health Check System

Probes available for Load Balancers, Kubernetes, and Uptime monitors:
- `GET /api/health` — Basic liveness (200 OK)
- `GET /api/health/live` — Edge liveness probe
- `GET /api/health/ready` — Deep readiness probe. Checks MongoDB connectivity, Redis connection, and critical Environment variables.

## 3. Alerting System

The `AlertDispatcher` routes anomalies to operations channels based on severity:
- **Critical (P0):** Application Down, Database Down, Redis Down, Queue Worker Crashed. (Triggers immediate PagerDuty/Escalation).
- **High (P1):** Checkout Failure Spike, Payment Failure Spike, Webhook Signature/Processing Failure.
- **Medium (P2):** Elevated API Error Rates, Latency > 3000ms.

## 4. Dashboards

Dashboards are stored as JSON specifications in the `/dashboards` directory for simple import into Datadog/Grafana:
- **Operations Dashboard:** Request rates, Error %, DB Latency, Active Workers.
- **Engineering Dashboard:** Queue Depth, Endpoint p95 Latency, Cache Hit Rates.
- **Business Dashboard:** Active Users, Checkout Conversion Rate, Payment Success Rate.

## 5. Incident Response & Escalation Flow

1. **Detection:** Sentry captures an unhandled exception or AlertDispatcher detects an anomaly.
2. **Notification:** Webhook triggers Slack/PagerDuty based on Severity (`P0/P1/P2`).
3. **Triage:** Engineer uses `x-request-id` from Sentry to cross-reference structured logs (JSON) in Datadog/ELK.
4. **Resolution:** Issue is patched. Root cause is documented if severity was Critical.

---

> **Cross-references**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md), [BACKUP_AND_DISASTER_RECOVERY.md](BACKUP_AND_DISASTER_RECOVERY.md)
