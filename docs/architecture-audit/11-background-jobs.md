# Sub-Agent 11: Redis, Queue & Background Jobs Report
**Agent Responsibility:** BullMQ Queue Producers, Consumers, Concurrency, Retry Policies, Dead-Letter Recovery, and Telemetry.

---

## 1. Queue Architecture & Workflow

```text
Payment Webhook / Order API
       │
       ▼
  enqueueOrderConfirmation (apps/src/lib/queue/order.queue.ts)
       │
       ▼
  Redis Queue: 'order-confirmation'
       │
       ▼
  BullMQ Worker (apps/src/lib/queue/worker.ts)
       ├── Concurrency: 5
       ├── Attempts: 3
       ├── Exponential Backoff: 2000ms
       ├── Sentry Isolation Scope Tracking
       └── Nodemailer SMTP Delivery (Ethereal / Production SMTP)
```

---

## 2. Evidence-Based Technical Audit

### 2.1 Job Idempotency (CONFIRMED)
- Enqueued jobs define deterministic IDs: `jobId: order-conf-${payload.orderId}`.
- Prevents sending duplicate order confirmation emails if a webhook retries.

### 2.2 Dead-Letter Queue & Retention Policy (CONFIRMED)
- `removeOnComplete: true`: Successful jobs are pruned to conserve Redis memory.
- `removeOnFail: 100`: The last 100 failed jobs are preserved in Redis for forensic debugging.

### 2.3 Sentry Telemetry Integration (CONFIRMED)
- Each job execution executes inside `Sentry.withIsolationScope`.
- Tags `job_id` and `job_name` are injected for distributed error tracking.
- Worker crashes trigger critical alerts via `AlertDispatcher.dispatch('critical', 'Queue Worker Crashed')`.
