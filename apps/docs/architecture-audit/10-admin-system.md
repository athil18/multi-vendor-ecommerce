# Sub-Agent 10: Admin & Platform Governance Report
**Agent Responsibility:** Administrative Oversight, Seller Moderation, Product Approvals, Review Governance, and AI Agent Oversight.

---

## 1. Admin System Topology

```text
Admin User (Role: admin)
       │
       ▼
Admin Dashboard (apps/src/app/admin/page.tsx)
       ├── Metrics Overview (GMV, Vendor Count, Order Volume)
       ├── Product Moderation (Approve / Reject submitted drafts)
       ├── Seller Governance (Trust Score, Probation, Ban)
       ├── Customer Review Moderation (Approve / Flag suspicious reviews)
       └── AI Agent Ecosystem Dashboard (/agent-ecosystem)
```

---

## 2. Evidence-Based Verification

### 2.1 Product Moderation Workflow (CONFIRMED)
- Product status enum: `draft` → `pending_review` → `approved` → `published` | `rejected` | `archived`.
- Admins review pending products via `/api/admin/products/[id]/status`.
- Rejection preserves reason in the audit log.

### 2.2 Seller Trust & Enforcement Actions (CONFIRMED)
- `/api/admin/governance/sellers/[id]/enforce`:
  - Actions supported: `probation`, `suspend`, `ban`, `restore`.
  - Automatically records timestamp, admin ID, and reason in `Store.enforcementHistory`.
  - When `payoutsEnabled` is toggled off, seller cannot trigger payout transfers.

### 2.3 Agent Ecosystem Monitoring (CONFIRMED)
- Route: `/agent-ecosystem`.
- Displays real-time compliance status of the 500+ AI agent catalog (`engineering-backend-architect`, `database-reliability-engineer`, etc.).
