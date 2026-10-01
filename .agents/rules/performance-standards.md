# Frontend Performance & Accessibility Standards Rule

When working on UI components, layouts, or storefront pages, enforce the following performance, accessibility, and SEO standards:

## 1. Core Web Vitals Targets
- **Largest Contentful Paint (LCP):** < 1.0s. Use React Server Components and streaming SSR. Preload priority hero banners with `priority` attribute.
- **Cumulative Layout Shift (CLS):** < 0.01. Always specify explicit `width` and `height` (or aspect-ratio placeholders) on images and dynamic banners.
- **Total Blocking Time (TBT):** 0ms. Keep client JavaScript bundles lean; move non-interactive logic to server components.

## 2. Next.js 16 App Router & React 19 Practices
- Default to Server Components (`page.tsx`, `layout.tsx`). Use `"use client"` only where interactivity, local state, or browser APIs are required.
- Isolate client components to the leaves of the render tree (e.g., `<AddToCartButton />` inside a server-rendered `<ProductDetail />`).
- Use React Suspense boundaries for streaming components with asynchronous data fetching.

## 3. Accessibility (WCAG 2.1 AA)
- Ensure all interactive elements have accessible names and keyboard focus outlines.
- Check text contrast ratios (minimum 4.5:1 for normal text).
- Use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- Implement focus management in modal dialogs and slide-over drawers (e.g. cart drawer).

## 4. SEO & Metadata
- Every page must have unique `<title>` and `<meta name="description">` tags via Next.js `generateMetadata` or static `metadata` export.
- Run `npm run seo:audit` to verify SEO compliance across all routes.
