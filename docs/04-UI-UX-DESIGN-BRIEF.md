# 04 — UI/UX Design Brief & Component System

> **Document ID:** DOC-04-DESIGN-BRIEF  
> **Platform:** Nexus Multi-Vendor E-Commerce Marketplace  
> **Status:** Canonical & Active  
> **Last Updated:** 2026-09-30  
> **Author:** Principal UI/UX Design Engineer  

---

## 1. Brand Personality & Core Principles

Nexus represents **curation, precision, trust, and understated luxury**. The interface must evoke the feel of high-end editorial commerce (e.g., Apple Store, SSENSE, Linear) rather than an ad-heavy bazaar.

### Core Principles:
1. **Utility First, Aesthetics Second:** Every visual element must inform, guide, or accelerate a user decision.
2. **Strict Hierarchy:** Typography scale and spacing establish visual order. No competing loud colors.
3. **Dark Mode Native, Light Mode Equal:** Full dual-theme parity with deliberate contrast ratios.
4. **Accessible by Law & Standard:** Every interactive element meets WCAG 2.1 AA (4.5:1 contrast, visible focus rings, ARIA labels).

---

## 2. Anti-AI-Slop Directives

The following patterns are strictly banned:
- ❌ Meaningless rainbow gradients or neon accents.
- ❌ Opaque or unreadable glassmorphism that impairs contrast.
- ❌ Massive hero headers (80vh+) with no product information above the fold.
- ❌ Template-like dashboard cards displaying fake or meaningless stats.
- ❌ Infinite decorative animations that delay user interaction.
- ❌ Low-contrast gray text (`#94a3b8` on white) that fails readability.

---

## 3. Color Architecture & Design Tokens

### 3.1 Primary Brand Palette

```css
/* Dark Mode Palette (Default) */
--color-bg-primary: #090d16;       /* Deep slate-charcoal */
--color-bg-secondary: #0f172a;     /* Elevated panel surface */
--color-bg-card: #131d35;          /* Card container */
--color-border: #1e293b;           /* Subtle border stroke */
--color-text-primary: #f8fafc;     /* 98% white high contrast */
--color-text-secondary: #94a3b8;   /* 65% muted slate */

/* Brand & Interactive Accents */
--color-brand-500: #2563eb;        /* Royal Cobalt Primary */
--color-brand-600: #1d4ed8;        /* Hover Active State */
--color-accent-emerald: #10b981;   /* In-Stock / Success / Paid */
--color-accent-amber: #f59e0b;     /* Pending Moderation / Escrow Locked */
--color-accent-rose: #ef4444;      /* Destructive / Out of Stock / Rejected */
```

### 3.2 Typography Tokens
- **Font Family:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Hierarchy:**
  - `Display / H1`: `28px` (Mobile) / `36px` (Desktop), Font Weight: 800, Tracking: `-0.025em`.
  - `H2 (Section Header)`: `20px` (Mobile) / `24px` (Desktop), Font Weight: 700, Tracking: `-0.02em`.
  - `H3 (Card Title)`: `16px`, Font Weight: 600.
  - `Body Standard`: `14px`, Font Weight: 400, Line Height: `1.5`.
  - `Caption / Meta`: `12px`, Font Weight: 500, Tracking: `0.01em`.

---

## 4. Component Rules & Standards

### 4.1 Buttons (`<Button />`)
- **Sizes:** `sm` (32px height, 12px font), `md` (40px height, 14px font), `lg` (48px height, 16px font).
- **Variants:**
  - `primary`: Solid brand blue with white text. Hover: brand-600. Focus: `ring-2 ring-offset-2 ring-brand-500`.
  - `secondary`: Slate border, transparent background, text-primary. Hover: bg-slate-800.
  - `danger`: Solid rose red with white text for irreversible actions.
  - `ghost`: Transparent with no border; icon-only or secondary actions.
- **States:** `default`, `hover`, `active`, `focus-visible`, `disabled` (opacity-50, cursor-not-allowed), `loading` (spinner with maintained width to prevent layout shift).

### 4.2 Product Cards (`<ProductCard />`)
- Minimum container height: `380px` to prevent layout shifts.
- Image container: Fixed `1:1` aspect ratio with object-cover and lazy loading.
- Visual elements:
  - Seller store name badge (clickable link to vendor profile).
  - Product title (max 2 lines, ellipsis overflow).
  - Price display in bold USD currency (`formatCurrency`).
  - Stock indicator: Green dot for In Stock, Red for Out of Stock.
  - Quick "Add to Cart" button with instant quantity increment.

### 4.3 Form Inputs (`<Input />`, `<Select />`, `<Textarea />`)
- Height: `40px` (Inputs), `auto` (Textareas).
- Background: `bg-slate-900` with `border border-slate-700`.
- Focus state: `border-brand-500 ring-2 ring-brand-500/20` (never browser default outline).
- Labels: Always visible `<label>` above input with explicit `htmlFor` matching input `id`.
- Error display: Inline text below input in `text-rose-400 text-xs` with `aria-describedby` linkage.

### 4.4 Tables & Data Grids (`<Table />`)
- Sticky headers with `bg-slate-900` background.
- Row zebra striping: Subtle alternating backgrounds (`bg-slate-950` / `bg-slate-900`).
- Text alignment: Left-aligned for text/names; right-aligned for currency/numbers; centered for status pills.
- Mobile fallback: Horizontal scroll with sticky first column or stacked card transformation below 640px.

### 4.5 Modals & Dialogs
- Backdrop: `rgba(0, 0, 0, 0.7)` with subtle `backdrop-blur-sm`.
- Dialog container: Centered, max-w-lg, `bg-slate-900`, `border border-slate-800`, `rounded-xl`.
- Accessibility: `role="dialog"`, `aria-modal="true"`, focus trapped inside dialog, `Escape` key closes, close button has `aria-label="Close dialog"`.

---

## 5. Responsive Breakpoint Strategy

| Breakpoint | Minimum Width | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile (`sm`)** | `< 640px` | 1-column product grid, bottom navigation sheet, drawer filters, full-width checkout form. |
| **Tablet (`md`)** | `640px - 1023px` | 2-column product grid, collapsable sidebar navigation, 2-column checkout summary. |
| **Desktop (`lg`)**| `1024px - 1279px`| 3-column product grid, persistent filter sidebar, side-by-side checkout. |
| **Wide (`xl`)** | `1280px+` | 4-column product grid, max content container `max-w-7xl mx-auto px-6`. |

---

## 6. Accessibility & WCAG Standards

1. **Color Contrast:** All body text must achieve at least `4.5:1` contrast ratio against its direct background.
2. **Keyboard Focus:** Global `:focus-visible` styles enforced with `ring-2 ring-brand-500 ring-offset-2`.
3. **Screen Readers:** All vector SVG icons must include `aria-hidden="true"` or descriptive `<title>`.
4. **Touch Targets:** Interactive buttons on mobile must provide a minimum touch target of `44x44px`.
