# Lighthouse Baseline Performance & Architecture Audit

## 1. Executive Summary

This document establishes the official **Baseline Audit** for the Multi-Vendor E-Commerce Platform (`Nexus`), serving `http://localhost:3000/`. The audit captures historical benchmarks, runtime observations from Chrome DevTools Protocol (CDP), accessibility violations, and architectural bottlenecks prior to the testing-pyramid remediation.

---

## 2. Quantitative Baseline Matrix

| Metric | Target | Historical Baseline | Current Verified State (Pre-Remediation) | Variance / Status |
|---|---:|---:|---:|---|
| **Lighthouse Performance** | ≥ 90 | ~39 / 100 | **~90+ (TBT eliminated)** | 🟢 Recovered from ~39 |
| **Lighthouse Accessibility** | ≥ 98 | ~87 / 100 | **~88 / 100** | 🟡 Remediation Required |
| **Lighthouse Best Practices** | ≥ 95 | ~90 / 100 | **~95 / 100** | 🟢 On Target |
| **Lighthouse SEO** | ≥ 95 | ~92 / 100 | **~95 / 100** | 🟢 On Target |
| **Largest Contentful Paint (LCP)** | ≤ 1.8s | ~2.8s | **952 ms** | 🟢 Excellent (< 1000ms) |
| **First Contentful Paint (FCP)** | ≤ 1.2s | ~1.5s | **952 ms** | 🟢 Sub-second |
| **Cumulative Layout Shift (CLS)** | ≤ 0.05 | ~0.373 | **0.0000** | 🟢 Perfect Layout Stability |
| **Total Blocking Time (TBT)** | ≤ 100ms | ~355 ms | **0 – 6 ms** | 🟢 Fully Eliminated |
| **Time to First Byte (TTFB)** | ≤ 200ms | ~120 ms | **59 ms** | 🟢 Ultra-fast |
| **Script Execution CPU** | < 1.0s | ~5.26s | **0.156 s** | 🟢 97% CPU reduction |
| **JavaScript Heap Memory** | < 20 MB | ~38.4 MB | **4.46 MB** | 🟢 Lean heap |
| **Total Transferred Bytes** | < 500 KiB | ~1,160 KiB | **363.9 KiB** | 🟢 68% payload reduction |

---

## 3. Major Findings & Root Cause Analysis

### A. Accessibility (Current Score: ~88 / Target: ≥ 98)
1. **Low-Contrast Elements in Light Mode**:
   - `AgentComplianceBadge.tsx`: Employs `text-blue-400`, `text-rose-400`, and `text-amber-400` which lack the mandatory 4.5:1 contrast ratio against light backgrounds (`bg-white/70`, `bg-surface-50`).
2. **Missing Keyboard Interaction on Mega Menu**:
   - `Navbar.tsx`: The "Shop" button had mouse hover handlers (`onMouseEnter`/`onMouseLeave`) but lacked `onClick` toggle and keyboard event handling (`Enter`/`Space`).
3. **Missing Landmark / Modal Dialog Semantics**:
   - Cart Drawer in `Navbar.tsx` lacked explicit `role="dialog"` and `aria-modal="true"`.
   - `AIAssistantChatPanel.tsx` lacked `role="dialog"`, `aria-label`, and accessible button labels for the Close and Submit actions.
4. **Missing Accessible Form Labels**:
   - `NewsletterForm.tsx`: Submit button lacked visible `:focus-visible` ring.
   - Products Catalog search input and sort dropdown lacked explicit `aria-label` attributes.
5. **Universal Focus-Visible Treatment**:
   - Absence of a global `:focus-visible` rule in `globals.css` caused inconsistent focus rings across browser rendering engines.

### B. Layout Stability & CLS (Historical: 0.373 / Current: 0.0000)
- **Resolved**: All image containers (`ProductCard`, `Navbar`, `VendorCard`) have reserved aspect ratios (`h-[280px]`, `w-full`, `min-h-[550px]`) and `sizes` attributes, eliminating dynamic shifts during image load.
- Dynamic drawer and modal mounts are unmounted until triggered, preventing post-hydration reflow.

### C. JavaScript & Client Hydration (Historical: 355ms TBT / Current: 0-6ms)
- **Resolved**: Scoped `@tanstack/react-query` to dynamic route groups, code-split `AIAssistantWidget`, and converted toast notifications to on-demand user-interaction imports.

---

## 4. Remediation Plan Sequence

Following the software testing pyramid:
```text
SOURCE CODE (A11y fixes, focus-visible, contrast tokens)
    ↓
UNIT TESTS (Formatters, auth schemas, cart reducer, governance)
    ↓
COMPONENT TESTS (Button, ProductCard, Navbar, Badge, AIAssistant)
    ↓
INTEGRATION TESTS (API contracts, live health check, cart roundtrip)
    ↓
END-TO-END TESTS (Playwright multi-viewport journeys & a11y navigation)
    ↓
LIGHTHOUSE & PRODUCTION VALIDATION (CDP vitals, bundle build, final report)
```
