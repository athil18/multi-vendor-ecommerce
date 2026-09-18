# 03. Architecture & Dependency Intelligence Report

## Dependency Graph Overview

The Nexus Marketplace utilizes a multi-layered monolithic architecture within a Next.js App Router context. 

### Presentation Layer (Frontend)
- **App Router:** `src/app/` handles route-aware layouts (e.g., `AdminLayout`, `SellerLayout`, `ConditionalShell`).
- **State Management:** `src/store/` relies on Zustand for ephemeral state (`useAuthStore`, `useCartStore`, `useThemeStore`).
- **Data Fetching:** React Query interacts via a singleton Axios client (`src/lib/api-client.ts`).
- **Design System:** Tailwind CSS v4 + native CSS Variables for glassmorphic tokens.

### API Layer (Backend)
- **Middleware:** `src/middleware.ts` guards routes and applies rate limits.
- **Route Handlers:** `src/app/api/` handles domain logic.
- **API Utilities:** `src/lib/api-handler.ts` wraps all routes to provide consistent error handling, logging, and execution timing.

### Business & Data Layer
- **ORM:** Mongoose schemas in `src/models/` enforce data constraints.
- **Financial Ledger:** `src/lib/ledger.ts` orchestrates `TransactionLine` and `JournalEntry` mutations wrapped in MongoDB ACID transactions.
- **Queue/Workers:** `src/lib/queue/worker.ts` leverages BullMQ + Redis for asynchronous processing (e.g., Email Confirmations).

## High-Risk Dependency Chains

### 1. The Webhook-to-Ledger Pipeline
**Flow:** Stripe Event -> `webhook/route.ts` -> `validatePaymentTransition` -> `Order.save()` -> `OrderItem.updateMany()` -> `postJournalEntry()`
**Risk:** This chain is incredibly deep and spans multiple database collections. If any step fails after the Stripe charge succeeds, the system risks falling out of sync with actual cash flow.

### 2. Authentication Flow
**Flow:** JWT Token -> Next.js Middleware -> `auth_role` Cookie -> `ConditionalShell` -> `/api/*` -> `getAuthUser()`
**Risk:** The frontend trusts a spoofable `auth_role` cookie to determine UI rendering logic. While the API layer verifies the JWT signature securely, the UI layer does not.

## Database Relationship Map
- `User (1)` -> `(M) Order (Customer)`
- `User (1)` -> `(1) Store (Seller)` -> `(M) Product`
- `Order (1)` -> `(M) OrderItem`
- `Order (1)` -> `(1) Payment (Stripe)`
- `Order (1)` -> `(M) FinancialLedger (Summary)`
- `JournalEntry (1)` -> `(M) TransactionLine (Cents)`

*Note: The Ledger utilizes double-entry principles, strictly enforcing Debit = Credit at the application layer.*
