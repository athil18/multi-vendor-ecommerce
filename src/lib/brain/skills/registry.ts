/**
 * Built-in Core E-Commerce Skills Registry
 * 
 * High-depth, executable markdown playbooks that give the agent domain mastery
 * across multi-vendor commerce operations.
 */

import { BrainSkill } from '../types';

export const BUILT_IN_SKILLS: BrainSkill[] = [
  {
    id: 'skill-artisan-concierge',
    name: 'artisan_concierge_skill',
    description: 'Use when customer requests product discovery, bespoke artisan recommendations, material provenance, or aesthetic curated recommendations.',
    version: '1.2.0',
    scope: 'platform',
    requiredRole: 'any',
    isSystem: true,
    tools: ['search_catalog', 'get_product_provenance', 'recall_memory'],
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
    body: `# Artisan Concierge Playbook

## Objective
Provide high-touch, empathetic shopping assistance that elevates artisan craftsmanship, material provenance, and transparent specifications.

## Operating Rules
1. **Catalog Truth:** Always search the active marketplace database via \`search_catalog\` before offering specific products. Never hallucinate items or make up prices.
2. **Material Provenance:** When asked about materials, durability, or craft, call \`get_product_provenance\` to present genuine workshop details, country of origin, and ethical sourcing.
3. **Budget Adherence:** When customer mentions a budget (e.g. "under $100"), strictly filter products where \`price <= budget\`. Highlight savings if coupons are available.
4. **Style Profiling:** Check customer memory for past aesthetic preferences (e.g. minimalist, ergonomic, leatherwork, dark walnut).
5. **Direct Actions:** Offer instant 1-click cart addition for top recommendations and direct navigation links to verified store ateliers.
`
  },
  {
    id: 'skill-escrow-arbitration',
    name: 'escrow_arbitration_skill',
    description: 'Use when reviewing order status, buyer protection guarantees, delivery disputes, Stripe Connect escrow holds, or release arbitrations.',
    version: '1.4.0',
    scope: 'platform',
    requiredRole: 'any',
    isSystem: true,
    tools: ['inspect_escrow_order', 'arbitrate_dispute', 'calculate_payout_disbursement'],
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
    body: `# Escrow & Dispute Arbitration Playbook

## Invariants & Principles
1. **Cryptographic Escrow Hold:** All buyer payments are securely held in escrow via Stripe Connect until:
   - Explicit buyer delivery confirmation, OR
   - Expiration of the 7-day post-delivery inspection window with no open dispute.
2. **Integer Cent Math:** Take-rate deductions (e.g., 10% platform fee) and seller net proceeds must be computed down to exact integer cents:
   \`\`\`
   feeCents = Math.round(orderAmountCents * platformFeePercent / 100);
   sellerNetCents = orderAmountCents - feeCents;
   \`\`\`
3. **Dispute Arbitration Workflow:**
   - Call \`inspect_escrow_order\` to verify tracking carrier status, delivery timestamp, and signature proof.
   - For claims of "Item Not Received" where carrier shows delivered: require buyer signature verification or carrier coordinate check.
   - For claims of "Item Damaged" or "Wrong Item": inspect photo evidence. If seller accepted return or failed SLA, recommend full buyer refund.
   - If dispute resolved in buyer's favor: reverse escrow transfer.
   - If dispute resolved in seller's favor: release escrow to vendor Connected Account.
`
  },
  {
    id: 'skill-vendor-analytics',
    name: 'vendor_health_analytics_skill',
    description: 'Use when a seller or admin asks about store performance, GMV, fee breakdown, low-stock inventory alerts, or escrow payout forecasts.',
    version: '1.1.0',
    scope: 'platform',
    requiredRole: 'seller',
    isSystem: true,
    tools: ['calculate_payout_disbursement', 'recall_memory'],
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
    body: `# Vendor Health & Inventory Analytics Playbook

## Objective
Provide actionable store intelligence for merchant operations, stock replenishment, and financial forecasts.

## Guidelines
1. **Multi-Tenant Isolation:** Strictly scope all metrics to the merchant's authenticated \`storeId\`. Never reveal competing stores' data or platform-wide aggregates.
2. **Inventory Velocity:** Alert the merchant if any active variant has \`stock <= lowStockThreshold\` (default: 10 units).
3. **Payout Forecast:** Break down pending escrow funds currently maturing in the 7-day confirmation window versus ready-to-disburse payouts.
4. **Fee Transparency:** Clearly report the platform commission rate (standard 10%) and payment processing fee breakdown.
`
  },
  {
    id: 'skill-privacy-compliance',
    name: 'privacy_compliance_skill',
    description: 'Use when handling customer privacy inquiries, DPDP Act 2023 rights, cookie consent adjustments, right to erasure, or compliance audits.',
    version: '1.3.0',
    scope: 'platform',
    requiredRole: 'any',
    isSystem: true,
    tools: ['audit_compliance', 'recall_memory'],
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
    body: `# Privacy & Regulatory Compliance Playbook (DPDP Act & GDPR)

## Mandates
1. **Zero Dark Patterns:** Reject deceptive urgency, false countdown timers, or pre-ticked marketing consents.
2. **Consent State Gating:** Verify whether the customer has granted \`analytics\` or \`marketing\` consent before referencing tracking data.
3. **Data Subject Rights:**
   - **Right to Access / Export:** Explain clearly how to download account data via the Privacy Center.
   - **Right to Erasure (Forget Me):** State the protocol: soft-delete customer record (\`deletedAt: new Date()\`), redact PII from order logs while retaining anonymized tax ledger records for statutory retention periods (8 years).
4. **Transparent Policy Links:** Always reference official legal pages: \`/privacy-policy\`, \`/terms\`, \`/refund-policy\`, and \`/cookie-policy\`.
`
  },
  {
    id: 'skill-pricing-integrity',
    name: 'pricing_integrity_skill',
    description: 'Use when verifying discount codes, checking coupon eligibility, validating multi-item bundle pricing, or checking transparent checkout totals.',
    version: '1.0.0',
    scope: 'platform',
    requiredRole: 'any',
    isSystem: true,
    tools: ['calculate_payout_disbursement'],
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
    body: `# Pricing Integrity & Coupon Validation Playbook

## Rules
1. **Coupon Validation:** Check valid date range, min order value, usage limits, and seller scope (global vs. seller-specific).
2. **Transparent Tax & Shipping:** Break down:
   - Subtotal (sum of items)
   - Verified Discount
   - Transparent Shipping calculation
   - Total Charged to Card
3. **No Hidden Surcharges:** Guarantee to customer that checkout total matches card statement without hidden processing surcharges.
`
  },
  {
    id: 'skill-order-logistics-tracker',
    name: 'order_logistics_tracker_skill',
    description: 'Use when a customer or seller asks for tracking status, delivery updates, carrier dispatch ETA, or split shipment coordination.',
    version: '1.2.0',
    scope: 'platform',
    requiredRole: 'any',
    isSystem: true,
    tools: ['inspect_escrow_order'],
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
    body: `# Multi-Vendor Logistics & Parcel Tracker Playbook

## Protocol
1. **Identify Order:** Extract order number or query user's latest order using \`inspect_escrow_order\`.
2. **Multi-Vendor Dispatch:** In a multi-vendor order, explain that items may dispatch from different artisan ateliers in split parcels with individual tracking numbers.
3. **Status Transitions:**
   - Pending → Processing → Shipped (with Carrier tracking number) → Delivered.
4. **Post-Delivery Assurance:** Remind customer of the 7-day inspection guarantee: "If the item is not as described, your payment remains protected in escrow until you are 100% satisfied."
`
  },
  {
    id: 'skill-store-policy-customizer',
    name: 'store_policy_customizer_skill',
    description: 'Use when a merchant wants to configure, update, or audit custom store policies, bespoke crafting timelines, or return allowances.',
    version: '1.0.0',
    scope: 'store',
    requiredRole: 'seller',
    isSystem: true,
    tools: ['save_skill', 'record_memory'],
    createdAt: 1718000000000,
    updatedAt: 1718000000000,
    body: `# Store Policy Customizer Playbook

## Protocol
1. **Merchant-Specific Scope:** Policies defined here apply strictly to the merchant's store products and fulfillment operations.
2. **Platform Floor Rule:** Store policies may be more generous than platform standards (e.g., 30-day returns instead of 14 days), but can never supersede core platform invariants (escrow protection, DPDP privacy, prohibited items).
3. **Bespoke Crafting Lead Times:** Custom monogrammed or made-to-order goods must declare a clear production SLA (e.g. "3-5 business days crafting lead time prior to dispatch").
`
  }
];
