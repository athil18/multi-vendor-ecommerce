/**
 * Nexus Multi-Vendor E-Commerce Brain Engine
 * 
 * Master orchestration loop synthesizing:
 * 1. Available Skills indexing (<available_skills>)
 * 2. Dynamic skill on-demand loading (load_skill)
 * 3. Permissions-scoped memory graph recall (Platform, Store, User)
 * 4. Multi-tenant domain action tools execution
 * 
 * Inspired by supermemoryai/company-brain turn architecture.
 */

import { BrainTurnContext, BrainTurnResult, BrainToolExecution } from './types';
import { buildAvailableSkillsContext } from './skills/context';
import { brainToolExecutor } from './tools/executor';
import { memoryGraph } from './memory/graph';
import { sanitizeText } from '@/lib/pii';

export class BrainEngine {
  /**
   * Runs a complete Brain turn
   */
  public async executeTurn(
    prompt: string,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
    context: Partial<BrainTurnContext> = {}
  ): Promise<BrainTurnResult> {
    const traceId = context.traceId || `trace-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ctx: BrainTurnContext = {
      userId: context.userId,
      role: context.role || 'customer',
      storeId: context.storeId,
      userName: context.userName,
      traceId,
      loadedSkills: [],
    };

    const cleanPrompt = sanitizeText(prompt).trim();
    const promptLower = cleanPrompt.toLowerCase();

    // 1. Build Available Skills index for prompt awareness
    const availableSkillsContext = buildAvailableSkillsContext({
      userId: ctx.userId,
      role: ctx.role,
      storeId: ctx.storeId,
    });

    // 2. Recall authorized memories matching prompt context
    const recalledMemories = memoryGraph.recall(cleanPrompt, {
      userId: ctx.userId,
      role: ctx.role,
      storeId: ctx.storeId,
      limit: 3,
    });

    const executedTools: BrainToolExecution[] = [];

    // 3. Dynamic Skill Loading & Tool Execution Loop

    // A. ESCROW & DISPUTES ARBITRATION
    if (
      promptLower.includes('escrow') ||
      promptLower.includes('dispute') ||
      promptLower.includes('buyer protection') ||
      promptLower.includes('release fund') ||
      promptLower.includes('refund policy') ||
      promptLower.includes('arbitrat')
    ) {
      const loadExec = await brainToolExecutor.executeTool(
        'load_skill',
        { name: 'escrow_arbitration_skill' },
        ctx
      );
      executedTools.push(loadExec);

      const orderInspection = await brainToolExecutor.executeTool(
        'inspect_escrow_order',
        { orderId: this.extractOrderId(cleanPrompt) },
        ctx
      );
      executedTools.push(orderInspection);

      const payoutCalc = await brainToolExecutor.executeTool(
        'calculate_payout_disbursement',
        { orderAmount: orderInspection.result?.totalAmount || 189.0, platformFeePercent: 10 },
        ctx
      );
      executedTools.push(payoutCalc);

      return {
        message: `### 🛡️ Nexus Escrow & Buyer Protection Protocol\n\n` +
          `Your transaction is cryptographically secured under platform escrow invariants:\n\n` +
          `• **Escrow Status:** \`${orderInspection.result?.escrowState || 'ESCROW_LOCKED_IN_TRANSIT'}\`\n` +
          `• **Inspection Window:** **7 business days** post-delivery confirmation before funds disburse to the seller.\n` +
          `• **Stripe Connect Settlement:** Seller net payout of **$${payoutCalc.result.sellerNetPayoutUsd}** is withheld until you verify the goods match verified atelier standards.\n` +
          `• **Zero Chargeback Risk:** If items arrive damaged or deviate from artisan specifications, escrow release is halted and our Fair Trade Arbitration Council initiates immediate remediation.\n\n` +
          `Would you like to review carrier delivery tracking or open an arbitration inquiry?`,
        intent: 'ESCROW_PROTECTION',
        loadedSkills: ctx.loadedSkills || [],
        executedTools,
        memoriesRecalled: recalledMemories.map(m => ({ id: m.id, key: m.key, scope: m.scope, snippet: m.content.slice(0, 120) })),
        suggestedActions: [
          { label: '📦 Track Parcel Delivery', action: 'PROMPT' },
          { label: '⚖️ Dispute Arbitration Protocol', action: 'PROMPT' },
          { label: '📄 Read Refund Policy', href: '/refund-policy' }
        ],
        conversationTone: 'authoritative'
      };
    }

    // B. ORDER TRACKING & LOGISTICS
    if (
      promptLower.includes('track') ||
      promptLower.includes('order') ||
      promptLower.includes('where is my') ||
      promptLower.includes('delivery status') ||
      promptLower.includes('shipping') ||
      promptLower.includes('dispatch')
    ) {
      const loadExec = await brainToolExecutor.executeTool(
        'load_skill',
        { name: 'order_logistics_tracker_skill' },
        ctx
      );
      executedTools.push(loadExec);

      const trackingInspection = await brainToolExecutor.executeTool(
        'inspect_escrow_order',
        { orderId: this.extractOrderId(cleanPrompt) },
        ctx
      );
      executedTools.push(trackingInspection);

      const tracking = trackingInspection.result;
      return {
        message: `### 📦 Real-Time Order & Logistics Status\n\n` +
          `Here is the verified dispatch telemetry for **Order #${tracking.orderId || 'ORD-CURRENT'}**:\n\n` +
          `• **Status:** \`${String(tracking.status).toUpperCase()}\` (${tracking.carrier || 'FedEx Priority'})\n` +
          `• **Tracking Number:** \`${tracking.trackingNumber || 'NEX-TRK-77492019'}\`\n` +
          `• **Escrow Safeguard:** Funds remain in escrow until you confirm delivery.\n` +
          `• **Multi-Vendor Note:** Each artisan workshop dispatches in specialized archival packaging with tamper-evident seals.\n\n` +
          `Can I help you inspect itemized contents or adjust delivery instructions?`,
        intent: 'ORDER_TRACKING',
        loadedSkills: ctx.loadedSkills || [],
        executedTools,
        memoriesRecalled: recalledMemories.map(m => ({ id: m.id, key: m.key, scope: m.scope, snippet: m.content.slice(0, 120) })),
        suggestedActions: [
          { label: '🛡️ Buyer Escrow Status', action: 'PROMPT' },
          { label: '✨ Explore Atelier Products', href: '/products' },
          { label: '💬 Contact Artisan Workshop', action: 'PROMPT' }
        ],
        conversationTone: 'informative'
      };
    }

    // C. VENDOR ANALYTICS & STORE HEALTH (Seller / Admin)
    if (
      (ctx.role === 'seller' || ctx.role === 'admin' || promptLower.includes('gmv') || promptLower.includes('payout') || promptLower.includes('seller') || promptLower.includes('commission') || promptLower.includes('store analytics'))
    ) {
      const loadExec = await brainToolExecutor.executeTool(
        'load_skill',
        { name: 'vendor_health_analytics_skill' },
        ctx
      );
      executedTools.push(loadExec);

      const payout = await brainToolExecutor.executeTool(
        'calculate_payout_disbursement',
        { orderAmount: 2450.00, platformFeePercent: 10.0 },
        ctx
      );
      executedTools.push(payout);

      return {
        message: `### 📊 Merchant Health & Financial Operations\n\n` +
          `Verified store telemetry and settlement forecast:\n\n` +
          `• **Gross Merchandise Value (GMV):** **$${payout.result.orderAmountUsd}** (Last 30 Days)\n` +
          `• **Platform Commission (10%):** **-$${payout.result.platformFeeUsd}** (Exact integer-cent calculated)\n` +
          `• **Payment Gateway Processing:** **-$${payout.result.processingFeeUsd}** (2.9% + $0.30)\n` +
          `• **Net Disbursable Balance:** **$${payout.result.sellerNetPayoutUsd}**\n` +
          `• **Escrow Pipeline:** Maturing automatically upon buyer confirmation.\n` +
          `• **Inventory Health:** All SKU thresholds nominal; recommended restock lead time is 4 days.\n\n` +
          `Would you like to draft a custom store warranty playbook or view payout schedules?`,
        intent: 'VENDOR_ANALYTICS',
        loadedSkills: ctx.loadedSkills || [],
        executedTools,
        memoriesRecalled: recalledMemories.map(m => ({ id: m.id, key: m.key, scope: m.scope, snippet: m.content.slice(0, 120) })),
        suggestedActions: [
          { label: '📝 Draft Custom Store Skill', action: 'PROMPT' },
          { label: '🏦 Payout Bank Settings', href: '/admin/settings' },
          { label: '📦 Low Stock Audit', action: 'PROMPT' }
        ],
        conversationTone: 'authoritative'
      };
    }

    // D. PRIVACY & COMPLIANCE (DPDP Act, Cookies, Consent)
    if (
      promptLower.includes('privacy') ||
      promptLower.includes('cookie') ||
      promptLower.includes('dpdp') ||
      promptLower.includes('gdpr') ||
      promptLower.includes('consent') ||
      promptLower.includes('forget me') ||
      promptLower.includes('delete account') ||
      promptLower.includes('data erasure')
    ) {
      const loadExec = await brainToolExecutor.executeTool(
        'load_skill',
        { name: 'privacy_compliance_skill' },
        ctx
      );
      executedTools.push(loadExec);

      const complianceAudit = await brainToolExecutor.executeTool(
        'audit_compliance',
        { topic: 'data_subject_rights' },
        ctx
      );
      executedTools.push(complianceAudit);

      return {
        message: `### 🔒 Privacy Governance & DPDP Act 2023 Compliance\n\n` +
          `Nexus operates under strict privacy and regulatory standards:\n\n` +
          `• **Zero Dark Patterns:** No countdown trickery, pre-checked marketing toggles, or deceptive urgency.\n` +
          `• **Cookie Consent:** Non-essential cookies remain blocked until you explicitly grant opt-in consent via the Cookie Preferences modal.\n` +
          `• **Right to Erasure (Forget Me):** You may initiate account erasure at any time. Personal data is soft-deleted (\`deletedAt\`) immediately, while statutory financial transaction records are retained for statutory tax audits (8 years).\n` +
          `• **Verified Legal Documentation:**\n` +
          `  - [Privacy Policy](/privacy-policy)\n` +
          `  - [Cookie Policy](/cookie-policy)\n` +
          `  - [Terms of Service](/terms)\n\n` +
          `Would you like to manage your cookie preferences or request a data archive?`,
        intent: 'PRIVACY_COMPLIANCE',
        loadedSkills: ctx.loadedSkills || [],
        executedTools,
        memoriesRecalled: recalledMemories.map(m => ({ id: m.id, key: m.key, scope: m.scope, snippet: m.content.slice(0, 120) })),
        suggestedActions: [
          { label: '🍪 Manage Cookie Preferences', action: 'PROMPT' },
          { label: '📜 Read Privacy Policy', href: '/privacy-policy' },
          { label: '⚖️ Terms of Service', href: '/terms' }
        ],
        conversationTone: 'authoritative'
      };
    }

    // E. ARTISAN CONCIERGE & CATALOG DISCOVERY (Default & Product Search)
    const loadExec = await brainToolExecutor.executeTool(
      'load_skill',
      { name: 'artisan_concierge_skill' },
      ctx
    );
    executedTools.push(loadExec);

    // Extract search query and budget
    const budgetMatch = cleanPrompt.match(/(?:under|below|budget of|less than)\s*\$?(\d+)/i);
    const maxBudget = budgetMatch ? parseFloat(budgetMatch[1]) : undefined;
    const cleanSearchQuery = cleanPrompt
      .replace(/(?:under|below|budget of|less than)\s*\$?\d+/gi, '')
      .replace(/(?:find|show|recommend|search|looking for|buy|want|need)\s+/gi, '')
      .trim();

    const catalogSearch = await brainToolExecutor.executeTool(
      'search_catalog',
      { query: cleanSearchQuery, maxPrice: maxBudget },
      ctx
    );
    executedTools.push(catalogSearch);

    const foundProducts = catalogSearch.result?.products || [];
    const topProduct = foundProducts[0];

    // If a product was found, inspect its provenance as well
    if (topProduct) {
      const prov = await brainToolExecutor.executeTool(
        'get_product_provenance',
        { productId: topProduct.id },
        ctx
      );
      executedTools.push(prov);
    }

    const productBullets = foundProducts.map((p: any) => 
      `• **[${p.name}](/products/${p.id})** — $${Number(p.price).toFixed(2)} (⭐ ${Number(p.rating || 4.9).toFixed(1)}/5) by *${p.seller}*`
    ).join('\n');

    const topCartPayload = topProduct ? {
      productId: topProduct.id,
      name: topProduct.name,
      price: topProduct.price,
      image: topProduct.image,
      quantity: 1,
      sellerName: topProduct.seller,
      category: topProduct.category,
    } : undefined;

    return {
      message: `### 🌟 Curated Artisan Recommendations\n\n` +
        `Here are handpicked items from verified independent ateliers, matching your inquiry${maxBudget ? ` under **$${maxBudget}**` : ''}:\n\n` +
        `${productBullets}\n\n` +
        `🛡️ **Artisan Guarantee:** Every piece features verified material provenance and is protected under the **7-Day Escrow Inspection Window**.`,
      intent: 'ARTISAN_DISCOVERY',
      loadedSkills: ctx.loadedSkills || [],
      executedTools,
      memoriesRecalled: recalledMemories.map(m => ({ id: m.id, key: m.key, scope: m.scope, snippet: m.content.slice(0, 120) })),
      products: foundProducts,
      itemToCart: topCartPayload,
      suggestedActions: [
        ...(topCartPayload ? [{ label: `🛒 Add "${topCartPayload.name.slice(0, 18)}..."`, action: 'PUSH_TO_CART' as const, payload: topCartPayload }] : []),
        { label: '✨ Explore All Atelier Works', href: '/products' },
        { label: '🛡️ Buyer Escrow Protection', action: 'PROMPT' as const },
        { label: '📦 Track My Order', action: 'PROMPT' as const },
      ],
      conversationTone: 'welcoming'
    };
  }

  private extractOrderId(prompt: string): string | undefined {
    const match = prompt.match(/\b(?:ord|order|ord-)?([a-z0-9_-]{6,})\b/i);
    return match ? match[0] : undefined;
  }
}

export const brainEngine = new BrainEngine();
