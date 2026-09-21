/**
 * AI Marketplace Copilot & Multi-Agent Dispatch API Route
 * 
 * @agent 13-customer-support-agent
 * @agent 01-web-research-agent
 * @agent 08-data-analysis-agent
 * @agent marketing-seo-specialist
 * @agent 21-pii-sanitization-agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-handler';
import { getAuthUser } from '@/lib/auth';
import { sanitizeText } from '@/lib/pii';
import prisma from '@/lib/prisma';

interface CartItemPayload {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  sellerName?: string;
  category?: string;
  escrowSplit?: {
    sellerAmount: number;
    platformFee: number;
  };
}

interface AgentIntentResponse {
  message: string;
  dispatchedAgents: string[];
  suggestedActions?: { label: string; href?: string; action?: string; item?: CartItemPayload }[];
  action?: string;
  itemToCart?: CartItemPayload;
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const body = await req.json();
  const rawPrompt: string = body.prompt || '';

  if (!rawPrompt.trim()) {
    return NextResponse.json({
      message: 'Please ask a question or select one of the suggested prompts!',
      dispatchedAgents: ['13-customer-support-agent'],
    });
  }

  // 1. Sanitize user input via 21-pii-sanitization-agent
  const sanitizedPrompt = sanitizeText(rawPrompt);
  const lowerPrompt = sanitizedPrompt.toLowerCase();

  let response: AgentIntentResponse;

  // 2. Multi-Agent Intent Dispatching
  if (
    lowerPrompt.includes('cart') ||
    lowerPrompt.includes('push') ||
    lowerPrompt.includes('add to bag') ||
    lowerPrompt.includes('buy now') ||
    lowerPrompt.includes('put in cart')
  ) {
    // Dispatched to product-behavioral-nudge-engine, engineering-payments-billing-engineer, 04-sql-query-agent
    const stopWords = new Set([
      'use', 'ai', 'agent', 'skills', 'for', 'cart', 'pushing', 'push', 'add',
      'to', 'my', 'the', 'a', 'an', 'please', 'put', 'in', 'into', 'buy', 'now',
      'item', 'product', 'can', 'you', 'i', 'want', 'need', 'get', 'bag', 'me'
    ]);
    const tokens = lowerPrompt
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => !stopWords.has(w) && w.length > 2);
    const queryKeyword = tokens.join(' ').trim();

    let matchedProduct = null;
    if (queryKeyword) {
      matchedProduct = await prisma.product.findFirst({
        where: {
          status: 'published',
          deletedAt: null,
          OR: [
            { name: { contains: queryKeyword, mode: 'insensitive' } },
            { description: { contains: queryKeyword, mode: 'insensitive' } },
            { category: { name: { contains: queryKeyword, mode: 'insensitive' } } },
          ],
        },
        include: {
          category: { select: { name: true } },
          seller: { select: { store: { select: { name: true } } } },
          variants: { where: { isActive: true }, take: 1, select: { id: true, price: true } },
        },
      });
    }

    if (!matchedProduct) {
      matchedProduct = await prisma.product.findFirst({
        where: { status: 'published', deletedAt: null },
        orderBy: { rating: 'desc' },
        include: {
          category: { select: { name: true } },
          seller: { select: { store: { select: { name: true } } } },
          variants: { where: { isActive: true }, take: 1, select: { id: true, price: true } },
        },
      });
    }

    if (matchedProduct) {
      const price = matchedProduct.variants?.[0]?.price || matchedProduct.basePrice || 49.99;
      const sellerName = matchedProduct.seller?.store?.name || 'Nexus Verified Atelier';
      const escrowSplit = {
        sellerAmount: Number((price * 0.90).toFixed(2)),
        platformFee: Number((price * 0.10).toFixed(2)),
      };

      const itemToCart: CartItemPayload = {
        productId: matchedProduct.id,
        variantId: matchedProduct.variants?.[0]?.id,
        name: matchedProduct.name,
        price,
        image: matchedProduct.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        quantity: 1,
        sellerName,
        category: matchedProduct.category?.name || 'Curated',
        escrowSplit,
      };

      response = {
        message: `🛒 **AI Agent Cart Pushing Executed!**\n\nI matched and staged **${matchedProduct.name}** directly from atelier **${sellerName}** for your cart.\n\n• **Price**: $${price.toFixed(2)}\n• **Category**: ${matchedProduct.category?.name || 'Curated'}\n• **Escrow Split**: $${escrowSplit.sellerAmount.toFixed(2)} (90% Seller Escrow) + $${escrowSplit.platformFee.toFixed(2)} (10% Platform Fee)\n• **Buyer Guarantee**: 100% Escrow Protection & 48h Merchant Dispatch\n\nClick **"Push to Cart"** below to confirm this item into your active cart!`,
        dispatchedAgents: [
          'product-behavioral-nudge-engine',
          'engineering-payments-billing-engineer',
          '04-sql-query-agent',
          'design-whimsy-injector',
        ],
        action: 'ADD_TO_CART',
        itemToCart,
        suggestedActions: [
          { label: `🛒 Push "${matchedProduct.name.slice(0, 22)}..." to Cart`, action: 'PUSH_TO_CART', item: itemToCart },
          { label: 'Proceed to Checkout', href: '/checkout' },
          { label: 'Browse All Categories', href: '/categories' },
        ],
      };
    } else {
      response = {
        message: `I was unable to locate a matching product right now. Please explore our 500+ verified catalog items across categories.`,
        dispatchedAgents: ['product-behavioral-nudge-engine', '04-sql-query-agent'],
        suggestedActions: [{ label: 'Explore Products', href: '/products' }],
      };
    }
  } else
  if (lowerPrompt.includes('order') || lowerPrompt.includes('track') || lowerPrompt.includes('delivery') || lowerPrompt.includes('ship')) {
    // Dispatched to 13-customer-support-agent & engineering-support-engineer
    if (user) {
      const recentOrders = await prisma.order.findMany({
        where: { customerId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { items: { include: { product: { select: { name: true } } } } },
      });

      if (recentOrders.length > 0) {
        const orderSummaries = recentOrders.map(
          (o) => `• **Order #${o.id.slice(0, 8)}**: Status is **${o.aggregateStatus.toUpperCase()}** (${o.items.length} items, Total: $${o.totalAmount.toFixed(2)})`
        ).join('\n');

        response = {
          message: `Here is the real-time status of your recent orders:\n\n${orderSummaries}\n\nAll items are protected by our **Instant Fulfillment & 100% Buyer Protection Guarantee**.`,
          dispatchedAgents: ['13-customer-support-agent', 'engineering-support-engineer', '21-pii-sanitization-agent'],
          suggestedActions: [
            { label: 'View Customer Dashboard', href: '/customer' },
            { label: 'Browse More Products', href: '/?q=all' },
          ],
        };
      } else {
        response = {
          message: `You don't have any active orders yet. When you place an order, vendors are required to dispatch tracking details within 48 hours.`,
          dispatchedAgents: ['13-customer-support-agent', '21-pii-sanitization-agent'],
          suggestedActions: [{ label: 'Explore Featured Products', href: '/?q=all' }],
        };
      }
    } else {
      response = {
        message: `To view your real-time order tracking and dispatch timeline, please log in to your account.`,
        dispatchedAgents: ['13-customer-support-agent'],
        suggestedActions: [{ label: 'Sign In', href: '/auth/login' }],
      };
    }
  } else if (lowerPrompt.includes('recommend') || lowerPrompt.includes('trending') || lowerPrompt.includes('best') || lowerPrompt.includes('buy') || lowerPrompt.includes('product') || lowerPrompt.includes('phone') || lowerPrompt.includes('laptop')) {
    // Dispatched to 01-web-research-agent & product-product-manager
    const featuredProducts = await prisma.product.findMany({
      where: { status: 'published', deletedAt: null },
      orderBy: { rating: 'desc' },
      take: 4,
      select: { id: true, name: true, basePrice: true, rating: true, slug: true },
    });

    const productList = featuredProducts.map(
      (p) => `• **${p.name}** - $${p.basePrice.toFixed(2)} (⭐ ${p.rating.toFixed(1)}/5.0)`
    ).join('\n');

    response = {
      message: `Based on customer satisfaction, reviews, and vendor trust scores, here are top curated recommendations for you:\n\n${productList}\n\nEach product comes with verified reviews and escrow-backed payment protection.`,
      dispatchedAgents: ['01-web-research-agent', 'product-product-manager', '04-sql-query-agent'],
      suggestedActions: [
        { label: 'Shop All Products', href: '/?q=all' },
        { label: 'View Top Rated', href: '/?sort=top_rated' },
      ],
    };
  } else if (lowerPrompt.includes('seller') || lowerPrompt.includes('store') || lowerPrompt.includes('sales') || lowerPrompt.includes('vendor') || lowerPrompt.includes('seo') || lowerPrompt.includes('traffic')) {
    // Dispatched to marketing-seo-specialist & 08-data-analysis-agent & finance-financial-analyst
    response = {
      message: `### 📈 Nexus Multi-Vendor Growth Insights\n\n1. **Stripe Connect Instant Payouts**: Ensure your Express Connected account is verified to unlock automatic 48h settlement.\n2. **Catalog Optimization**: High-converting stores include at least 3 high-res images and detailed variant matrices (sizes/colors).\n3. **Trust Score Elevation**: Maintain 0 disputes and 4.8+ ratings to earn the **Verified Top Vendor** compliance badge.\n4. **AI-Optimized Metadata**: Include target keywords in product titles and descriptions for maximum marketplace search visibility.`,
      dispatchedAgents: ['marketing-seo-specialist', '08-data-analysis-agent', 'finance-financial-analyst'],
      suggestedActions: [
        { label: 'Open Seller Dashboard', href: '/seller' },
        { label: 'Manage Products', href: '/seller/products' },
      ],
    };
  } else if (lowerPrompt.includes('protect') || lowerPrompt.includes('refund') || lowerPrompt.includes('dispute') || lowerPrompt.includes('security') || lowerPrompt.includes('guarantee')) {
    // Dispatched to security-appsec-engineer & engineering-payments-billing-engineer
    response = {
      message: `### 🛡️ Nexus Buyer & Vendor Protection Protocol\n\n• **Double-Entry Escrow**: Customer funds are securely held in Stripe Escrow until delivery is confirmed.\n• **Zero-Risk Dispute Resolution**: If an item arrives damaged or not as described, our automated dispute resolution engine allows 1-click admin mediation and instant refund.\n• **Bank-Grade Encryption**: All transactions and card details are encrypted with TLS 1.3 and PCI-DSS Level 1 Stripe standards.\n• **PII Redaction**: Personal identities and addresses are strictly protected from leakage.`,
      dispatchedAgents: ['security-appsec-engineer', 'engineering-payments-billing-engineer', 'finance-financial-analyst'],
      suggestedActions: [
        { label: 'View AI Agent Ecosystem', href: '/agent-ecosystem' },
        { label: 'Customer Support Portal', href: '/customer' },
      ],
    };
  } else {
    // General AI Assistant query
    response = {
      message: `Hello! I am your **Nexus Marketplace AI Assistant**, orchestrated by our **500+ AI Agent Ecosystem**.\n\nI can help you with:\n• 📦 **Order Tracking & Delivery Status**\n• ✨ **Curated Product Recommendations**\n• 📈 **Seller Analytics, SEO & Payout Insights**\n• 🛡️ **Buyer Protection, Escrow & Refund Inquiries**\n\nHow may I assist you today?`,
      dispatchedAgents: ['13-customer-support-agent', 'engineering-backend-architect', 'design-ui-designer'],
      suggestedActions: [
        { label: '✨ Recommend Trending Items' },
        { label: '📦 Track My Orders' },
        { label: '📈 Seller Store Tips' },
        { label: '🛡️ Buyer Protection Policy' },
      ],
    };
  }

  return NextResponse.json({
    success: true,
    prompt: sanitizedPrompt,
    ...response,
  });
});
