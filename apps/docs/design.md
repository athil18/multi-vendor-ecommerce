# Design System — Nexus Marketplace

> Version: 1.0.0 | Last Updated: 2026-06-14

---

## Design Principles

1. **Premium First** — Every surface must feel curated and high-end. No generic defaults.
2. **Clarity Over Decoration** — Visual hierarchy drives comprehension. Decoration serves purpose.
3. **Consistent Density** — Information density should feel intentional, never cluttered.
4. **Dark Mode Native** — Design for dark mode first; light mode is derived. Both must feel equally polished.
5. **Motion with Intent** — Animations guide attention and confirm actions, never distract.
6. **Accessible by Default** — Contrast ratios, keyboard navigation, and semantic HTML are non-negotiable.

## UX Standards

### Feedback Patterns
| Action | Feedback Mechanism |
|--------|--------------------|
| Add to cart | Toast notification (bottom-right) + cart count increment in Navbar |
| Form submission | Loading spinner on button + disabled state |
| Error | Toast error notification with specific message |
| Status change | Toast success notification |
| Theme toggle | Toast confirmation + immediate visual update |
| Page loading | Full-screen centered spinner (Loader2 icon) |

### Form Behavior
- All required fields validated before submission
- Error messages inline where Zod validation is used
- Loading state disables submit button and shows spinner
- Card number auto-formatted with spaces every 4 digits

## Accessibility Rules

| Rule | Implementation |
|------|---------------|
| Color contrast | Brand-600 on white = 4.6:1 (AA pass). Surface-500 on surface-50 = 4.5:1 |
| Focus indicators | Tailwind `focus:ring-2 focus:ring-brand-500` on all inputs |
| Semantic HTML | `<main>`, `<footer>`, `<article>`, `<nav>`, `<section>` used correctly |
| Alt text | Product images have `alt={p.name}` |
| Button labels | Action buttons have descriptive text ("Add to Cart", "Approve", "Reject") |
| Form labels | All inputs have `<label>` elements with `htmlFor` |
| `lang` attribute | `<html lang="en">` set on root layout |
| Keyboard navigation | Native `<button>`, `<a>`, `<select>`, `<input>` elements used |

### Known Gaps
- Skip-to-content link not implemented
- ARIA landmarks for sidebar filters not added
- Screen reader announcements for cart updates not implemented

## Layout Guidelines

### Page Shell
```
┌──────────────────────────────────────────────┐
│                  Navbar (sticky)              │
├──────────────────────────────────────────────┤
│                                              │
│              <main> (flex-grow)              │
│                                              │
│    ┌──────────────────────────────────┐      │
│    │  max-w-7xl mx-auto px-4/6/8     │      │
│    │  (Content container)             │      │
│    └──────────────────────────────────┘      │
│                                              │
├──────────────────────────────────────────────┤
│                  Footer                       │
└──────────────────────────────────────────────┘
```

### Grid System
- **Max width**: `max-w-7xl` (1280px)
- **Padding**: `px-4` (mobile), `sm:px-6` (tablet), `lg:px-8` (desktop)
- **Column layout**: `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3/4`

### Spacing Scale
- Section gaps: `gap-8` or `gap-10`
- Card internal padding: `p-6` or `p-8`
- Component gaps: `gap-4` or `gap-6`
- Inline gaps: `gap-1.5` or `gap-2`

## Component Inventory

| Component | File | Description |
|-----------|------|-------------|
| **Navbar** | `components/Navbar.tsx` | Global nav with logo, search, cart, auth menu, theme toggle, role switcher |
| **AppProvider** | `context/AppContext.tsx` | Global state wrapper with Toaster |
| **Hero Banner** | `app/page.tsx` (inline) | Gradient hero with CTA and featured store card |
| **Product Card** | `app/page.tsx` (inline) | Image, category badge, brand, name, rating, price, add-to-cart |
| **Filter Sidebar** | `app/page.tsx` (inline) | Price slider, stock toggle, sort dropdown |
| **Glass Card** | CSS utility class | Glassmorphism container with backdrop-blur |
| **Metric Card** | `app/seller/page.tsx`, `app/admin/page.tsx` | Icon + label + value dashboard metric |
| **Data Table** | `app/seller/page.tsx`, `app/admin/page.tsx` | Responsive table with status badges and action buttons |
| **Status Badge** | Inline styled `<span>` | Color-coded pill badge (green/blue/yellow/red) |
| **Input Field** | Inline styled `<input>` | Rounded-xl with surface bg, border, focus ring |
| **Primary Button** | Inline styled `<button>` | Brand-600 bg, white text, rounded-full/xl, shadow |
| **Category Tab** | Inline styled `<button>` | Pill-shaped toggle with active state |
| **Checkout Form** | `app/checkout/page.tsx` | Two-column layout: shipping + payment forms + order summary |

### Missing Components (Technical Debt)
- [ ] Reusable `<Button>` component
- [ ] Reusable `<Input>` / `<TextField>` component
- [ ] Reusable `<Card>` component
- [ ] Reusable `<Badge>` component
- [ ] Reusable `<Modal>` / `<Dialog>` component
- [ ] Reusable `<Table>` component
- [ ] Product detail page component

## Interaction Patterns

### Hover Effects
- Product cards: `hover:shadow-xl hover:-translate-y-0.5` + image `group-hover:scale-105`
- Buttons: `hover:bg-brand-700` or `hover:border-brand-500`
- Table rows: `hover:bg-surface-50/50 dark:hover:bg-surface-850/20`

### Active States
- Category tabs: Active = `bg-brand-600 text-white shadow-md`, Inactive = `bg-white border-surface-200`
- Filter tabs (admin): Active = `bg-purple-600 text-white`, Inactive = `text-surface-600`

### Loading States
- Full page: Centered `<Loader2 className="animate-spin" />`
- Button in-progress: `<Loader2 className="animate-spin" />` replaces icon + text changes to "Processing..."
- Data fetching: Previous content remains visible while loading

## Responsive Strategy

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| Default (mobile) | < 640px | Single column, stacked layout |
| `sm` | ≥ 640px | 2-column product grid, inline form fields |
| `md` | ≥ 768px | Footer row layout |
| `lg` | ≥ 1024px | 3-column product grid, sidebar filters, dashboard metrics in 4 columns |

### Mobile-Specific Behaviors
- Navbar collapses to icon-only actions
- Filter sidebar stacks above product grid
- Checkout form stacks (form above, order summary below)
- Tables gain `overflow-x-auto` horizontal scroll

## Motion Guidelines

### Current Animations
| Animation | Element | Specification |
|-----------|---------|---------------|
| `animate-spin` | Loader2 icon | Continuous rotation for loading states |
| `animate-pulse` | Sparkles icon | Subtle attention pulse in hero |
| `animate-pulse-slow` | Glow effect | 3s cubic-bezier, 0.5–0.8 opacity cycle |
| `transition-all duration-300` | Product cards | Smooth shadow and transform on hover |
| `transition-transform duration-500` | Product images | Slow zoom on hover |
| `transition-colors duration-200` | Body, footer | Smooth theme toggle |

### Motion Principles
1. **Duration**: UI feedback ≤ 200ms, decorative ≤ 500ms, ambient ≤ 3s
2. **Easing**: `cubic-bezier(0.4, 0, 0.6, 1)` for ambient, default for interactions
3. **Reduce motion**: Not yet implemented (`prefers-reduced-motion` media query needed)

---

## Color Token Reference

### Brand Palette (Purple)
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#f5f3ff` | Backgrounds, hover tints |
| `brand-500` | `#8b5cf6` | Selection highlight, accent |
| `brand-600` | `#7c3aed` | Primary buttons, links, CTAs |
| `brand-700` | `#6d28d9` | Hover states |
| `brand-950` | `#2e1065` | Hero gradient base |

### Surface Palette (Slate)
| Token | Hex | Light Usage | Dark Usage |
|-------|-----|-------------|------------|
| `surface-50` | `#f8fafc` | Page background | — |
| `surface-200` | `#e2e8f0` | Borders, dividers | — |
| `surface-500` | `#64748b` | Muted text | — |
| `surface-800` | `#1e293b` | — | Card backgrounds |
| `surface-900` | `#0f172a` | Primary text | — |
| `surface-950` | `#020617` | — | Page background |

---

> **Cross-references**: [prd.md](prd.md) (features), [rules.md](rules.md) (coding standards)
