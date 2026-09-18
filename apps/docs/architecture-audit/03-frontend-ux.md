# Sub-Agent 03: Frontend & UX Architecture Report
**Agent Responsibility:** Next.js App Router, Angular Client, UI Design System, Responsiveness, and Accessibility.

---

## 1. Frontend Architecture Comparison

| Dimension | Next.js Fullstack Frontend (`apps/`) | Angular Standalone Client (`angular-frontend/`) |
|---|---|---|
| **Framework Version** | Next.js 16.2.9, React 19.2.4 | Angular 22.1.0 |
| **Styling** | Tailwind CSS 4 (`globals.css`, `@tailwindcss/postcss`) | Tailwind CSS 4.1.12 (`app.css`) |
| **Icons** | Lucide React (`lucide-react` 1.18.0) | Lucide Angular (`lucide-angular` 1.0.0) |
| **State Management** | Zustand 5 (`useAuthStore`, `useCartStore`, `useThemeStore`) | RxJS Services (`CartService`, `AuthService`, `SellerService`) |
| **Routing** | File-based App Router with Server Components | Standalone Component Routes (`app.routes.ts`) |
| **SEO & Social** | Dynamic `ProductJsonLd`, `robots.ts`, `sitemap.ts`, `manifest.ts` | Basic Single Page Application (SPA) client |
| **Edge Middleware** | `src/middleware.ts` with Edge Web Crypto & rate-limiting | HTTP Interceptors (`auth.interceptor.ts`) |

---

## 2. Key Components & Design System Analysis

### 2.1 Reusable UI Primitives (`apps/src/components/ui/`)
- `Button.tsx`: Supports variants (`primary`, `secondary`, `outline`, `destructive`, `ghost`), loading spinners, and size tokens.
- `Card.tsx`: Glassmorphic styling with dark mode border utilities.
- `Input.tsx` & `Textarea.tsx`: Focus rings, accessible ARIA attributes, error states.
- `Badge.tsx`: Visual status indicators for order statuses, fraud risk levels, and governance states.
- `Spinner.tsx`: Hardware-accelerated SVG loading animation.
- `EmptyState.tsx` & `ErrorState.tsx`: Reusable recovery fallbacks for empty query results and network failures.
- `AgentComplianceBadge.tsx`: Displays AI agent attribution badge (`engineering-backend-architect`, etc.).

### 2.2 Shell & Layout Components
- `ConditionalShell.tsx`: Dynamically attaches Navbar and Footer on customer-facing routes while suppressing them on `/admin` or `/seller` dashboards.
- `DashboardLayoutShell.tsx`: Provides responsive drawer sidebar, collapsible navigation, and user avatar dropdown.
- `ThemeInit.tsx`: Prevents dark mode hydration flash using local storage theme synchronization.

---

## 3. Forensic UX & Accessibility Findings

### 3.1 Hydration Discrepancy Risk in Cart Store (PARTIALLY VERIFIED)
- **Evidence:** `useCartStore.ts` reads `localStorage` during initial client mount. If an initial render mismatch occurs between server-rendered HTML and client hydration, Next.js logs hydration warnings.
- **Remediation:** Introduce an `isHydrated` check or delay rendering sensitive cart totals until after mount.

### 3.2 Form Validation Feedback (CONFIRMED)
- **Evidence:** Forms use React Hook Form with Zod schema validation (`lib/schemas/auth.ts`, `lib/schemas/commerce.ts`). Form errors are displayed inline with accessible error messages.

### 3.3 Broken / Redundant Angular Interceptor (CONFIRMED)
- **Evidence:** In `angular-frontend/src/app/core/interceptors/auth.interceptor.ts`, the interceptor expects tokens from `localStorage.getItem('token')`, whereas Next.js sets cookies (`auth_token`) via HTTP-only flags. Angular proxy must ensure cross-origin credentials (`withCredentials: true`) are forwarded.
