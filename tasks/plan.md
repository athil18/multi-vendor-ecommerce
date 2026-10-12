# Implementation Plan: Premium Product Quality Transformation

Audit and upgrade the entire e-commerce product catalog from A to Z, creating a sophisticated US premium-retail shopping experience (Nordstrom / SSENSE / Apple / Sephora caliber) across Technology, Fragrance, Beauty, Fashion, Footwear, Horology, and Architectural Home.

## User Constraints & Invariants
- **Authenticity Invariant:** Never invent fake brands, fake specifications, fake reviews, or fabricated discounts (e.g. eradicate hardcoded `* 1.25` and fake `-20%`).
- **Data Integrity:** Preserve valid working functionality (Zustand cart, checkout, Next.js routing, API route schemas, order placement).
- **Curated Selection:** Eliminate irrelevant junk (vacuum bags, car wire harnesses, test strings like "probe test" and "string", raw groceries, obsolete 10-year-old tech).
- **Multi-Category Excellence:** Prioritize premium technology, luxury fragrances, fine beauty/skincare, haute fashion, premium footwear, horology, and modern home essentials.

## Phased Execution Roadmap

### Phase 1: Catalog Audit, Data Modeling & Dataset Curation
- [ ] Audit every category and purge all junk/placeholder records (raw groceries, test strings, car parts, vacuum bags).
- [ ] Curate 80+ high-consideration flagship products across 6 core pillars:
  1. `Technology & Audio` (Laptops, Smartphones, Studio Headphones, Mechanical Keyboards, 4K Monitors)
  2. `Luxury Fragrances & Fine Beauty` (Chanel, Dior, Tom Ford, Gucci, Calvin Klein, prestige skincare)
  3. `Haute Fashion & Tailored Apparel` (Tailored blazers, silk dresses, cashmere outerwear, luxury shirts)
  4. `Premium Footwear & Iconic Sneakers` (Nike Air Jordan 1, Puma Future Rider, Chelsea boots, Italian loafers)
  5. `Horology, Fine Jewelry & Leathercraft` (Rolex Submariner/Datejust, Longines, Tuscan leather weekenders)
  6. `Modern Architectural Home & Living` (Knoll Saarinen, Annibale Colombo, minimalist lighting)
- [ ] For every individual product, specify:
  - Accurate high-resolution image sets (multiple studio angles)
  - Realistic color/size/volume variants with authentic hex swatches and SKUs
  - Category-specific technical specifications table (`specs`)
  - Genuine product benefits (`benefits`)
  - Accurate direct retail pricing and honest MSRP
- [ ] Update `src/data/products.json` with the enriched catalog.
- [ ] Update `src/lib/catalog-fallbacks.ts` with updated types, filters, and fallback maps.

### Phase 2: Component & UI Elevation (Storefront & Catalog)
- [ ] **Product Card (`src/components/ProductCard.tsx`)**:
  - Fix duplicate pricing display.
  - Display authentic pricing with honest compare-at MSRP only when genuinely present.
  - Add category badges, verified maker indicators, and multi-angle hover preview.
- [ ] **Storefront UX Showcase (`src/components/storefront/StorefrontUXShowcase.tsx`)**:
  - Re-align categories to the 5 premium pillars: All Flagships, Precision Tech, Luxury Fragrance, Designer Fashion, Horology & Living.
  - Showcase real flagship specimens with authentic specifications.
- [ ] **Homepage (`src/app/page.tsx`)**:
  - Align hero and curation with the multi-category US premium retail experience.

### Phase 3: Product Detail Page & Discovery Architecture
- [ ] **Product Detail Page (`src/components/ProductStudioView.tsx`)**:
  - Replace static mock variants with dynamic variants from `product.variants`.
  - Replace hardcoded aluminum specs with dynamic category-specific `product.specs`.
  - Replace hardcoded benefit statements with genuine `product.benefits`.
  - Remove fake `* 1.25` discount calculation; use honest pricing.
- [ ] **Dynamic Slug Route (`src/app/products/slug/[slug]/page.tsx`)**:
  - Upgrade to utilize `ProductStudioView` and `ProductJsonLd` for visual and functional consistency.
- [ ] **Catalog Page (`src/app/products/page.tsx`)**:
  - Support all 6 refined categories with accurate counts.
  - Clean faceted filtering (Category, Price Range, In-Stock, Sort by Price/Rating/Featured).
  - Responsive mobile filter drawer.

### Phase 4: Testing & Verification
- [ ] Run Level 1 Unit Tests (`npm run test:unit`).
- [ ] Run Level 2 Component Tests (`npm run test:component`).
- [ ] Run Level 3 Pyramid Tests (`npm run test:pyramid`).
- [ ] Run Technical SEO Audit (`npm run seo:audit`).
- [ ] Run REA Forensic Audit (`npm run rea:audit`).
- [ ] Run Next.js Production Build (`npm run build`).
- [ ] Verify HTTP SSR responses for catalog and product detail pages.
