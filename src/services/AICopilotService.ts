/**
 * Enterprise AI Marketplace Copilot & Customer Concierge Service
 * 
 * Multi-turn, intent-driven customer handling engine with semantic product discovery,
 * order tracking, policies, and conversational assistance.
 * 
 * @agent 13-customer-support-agent
 * @agent product-experience-lead
 * @agent engineering-backend-architect
 */

import prisma from '@/lib/prisma';
import { sanitizeText } from '@/lib/pii';
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';

export interface CartItemPayload {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  sellerName?: string;
  category?: string;
}

export interface SuggestedAction {
  label: string;
  href?: string;
  action?: 'PUSH_TO_CART' | 'NAVIGATE' | 'PROMPT';
  item?: CartItemPayload;
}

export interface CopilotProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sellerName: string;
  rating: number;
  slug: string;
  inStock: boolean;
}

export interface CopilotResponse {
  message: string;
  intent: string;
  suggestedActions: SuggestedAction[];
  products?: CopilotProductItem[];
  itemToCart?: CartItemPayload;
  conversationTone: 'welcoming' | 'informative' | 'transactional' | 'empathic';
}

export interface ChatMessageContext {
  role: 'user' | 'assistant';
  content: string;
}

export class AICopilotService {
  /**
   * Main entry point to process a customer message
   */
  public async handleCustomerQuery(
    rawPrompt: string,
    history: ChatMessageContext[] = [],
    authUser?: { id: string; name?: string; email?: string; role?: string } | null
  ): Promise<CopilotResponse> {
    const cleanPrompt = sanitizeText(rawPrompt).trim();
    if (!cleanPrompt) {
      return {
        message: "Hello! I'm your Nexus personal concierge. How can I help you today? Feel free to ask about products, track your orders, or explore our return policies.",
        intent: 'EMPTY_PROMPT',
        suggestedActions: [
          { label: '✨ Trending Products' },
          { label: '📦 Track My Orders' },
          { label: '🛡️ Buyer Protection' }
        ],
        conversationTone: 'welcoming'
      };
    }

    const lower = cleanPrompt.toLowerCase();

    // 1. GREETINGS & APPRECIATION
    if (this.isGreeting(lower)) {
      const greetingName = authUser?.name ? `, ${authUser.name}` : '';
      return {
        message: `Hello${greetingName}! Welcome to Nexus Marketplace. I'm your personal shopping concierge.\n\nI can help you:\n• 🔍 **Find curated products & artisan collections**\n• 📦 **Track real-time order delivery & dispatch**\n• 🏷️ **Apply discounts, coupons & payment methods**\n• 🛡️ **Assist with returns, escrow & buyer guarantees**\n\nWhat are you looking for today?`,
        intent: 'GREETING',
        suggestedActions: [
          { label: '✨ Show Trending Products' },
          { label: '🎧 Audio & Desk Setup' },
          { label: '📦 Track My Orders' },
          { label: '🛡️ Return & Refund Policy' }
        ],
        conversationTone: 'welcoming'
      };
    }

    if (this.isGratitude(lower)) {
      return {
        message: `You're very welcome! It's an absolute pleasure helping you. Let me know if you need anything else—whether checking out another product, tracking an order, or browsing categories!`,
        intent: 'GRATITUDE',
        suggestedActions: [
          { label: '🛍️ Continue Shopping', href: '/products' },
          { label: '🛒 View Active Cart', href: '/checkout' }
        ],
        conversationTone: 'welcoming'
      };
    }

    // 2. ORDER TRACKING & STATUS INQUIRIES
    if (this.isOrderTracking(lower)) {
      return this.handleOrderTracking(cleanPrompt, authUser);
    }

    // 3. RETURNS, REFUNDS & DISPUTES
    if (this.isReturnOrRefund(lower)) {
      return this.handleReturnsAndRefunds(authUser);
    }

    // 4. SHIPPING, DELIVERY TIMELINES & FEES
    if (this.isShippingInquiry(lower)) {
      return this.handleShippingInquiry();
    }

    // 5. PAYMENT, CHECKOUT & COUPONS
    if (this.isPaymentOrCoupon(lower)) {
      return this.handlePaymentAndCoupons();
    }

    // 6. SELLER / VENDOR QUESTIONS
    if (this.isSellerInquiry(lower)) {
      return this.handleSellerInquiry(authUser);
    }

    // 7. SPECIFIC CART ADDITION ("Add X to cart", "buy this", "push to cart")
    if (this.isAddToCartIntent(lower)) {
      return this.handleAddToCart(cleanPrompt);
    }

    // 8. PRODUCT SEARCH & RECOMMENDATIONS (default shopping intent)
    return this.handleProductSearch(cleanPrompt);
  }

  // ─── Intent Classifiers ───────────────────────────────────────────────────

  private isGreeting(text: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what can you do', 'sup', 'greetings'];
    return greetings.some(g => text === g || text.startsWith(g + ' ') || text.startsWith(g + '!'));
  }

  private isGratitude(text: string): boolean {
    const thanks = ['thanks', 'thank you', 'thx', 'appreciate it', 'awesome', 'great', 'perfect', 'cool', 'goodbye', 'bye'];
    return thanks.some(t => text.includes(t));
  }

  private isOrderTracking(text: string): boolean {
    const keywords = ['order', 'track', 'where is my package', 'delivery status', 'shipped', 'dispatch', 'tracking number', 'eta', 'arrival'];
    return keywords.some(k => text.includes(k));
  }

  private isReturnOrRefund(text: string): boolean {
    const keywords = ['return', 'refund', 'money back', 'exchange', 'cancel order', 'damaged item', 'wrong item', 'dispute', 'broken product', 'warranty'];
    return keywords.some(k => text.includes(k));
  }

  private isShippingInquiry(text: string): boolean {
    const keywords = ['shipping cost', 'shipping fee', 'free shipping', 'how long does shipping', 'how long will it take', 'delivery time', 'international shipping', 'courier'];
    return keywords.some(k => text.includes(k));
  }

  private isPaymentOrCoupon(text: string): boolean {
    const keywords = ['coupon', 'promo code', 'discount code', 'voucher', 'payment method', 'apple pay', 'credit card', 'stripe', 'how do i pay'];
    return keywords.some(k => text.includes(k));
  }

  private isSellerInquiry(text: string): boolean {
    const keywords = ['become a seller', 'how to sell', 'vendor fee', 'seller commission', 'open a store', 'merchant payout', 'sell my products'];
    return keywords.some(k => text.includes(k));
  }

  private isAddToCartIntent(text: string): boolean {
    const triggers = ['add to cart', 'add to bag', 'put in cart', 'push to cart', 'buy now', 'purchase this'];
    return triggers.some(t => text.includes(t));
  }

  // ─── Domain Handlers ──────────────────────────────────────────────────────

  private async handleOrderTracking(
    prompt: string,
    authUser?: { id: string; name?: string } | null
  ): Promise<CopilotResponse> {
    if (!authUser) {
      return {
        message: `I'd be delighted to look up your order status!\n\nTo view your live delivery tracking and shipment milestones, please **sign in to your account**. Alternatively, if you have your **Order ID** (e.g. from your confirmation email), you can check your status directly.`,
        intent: 'ORDER_TRACKING_UNAUTH',
        suggestedActions: [
          { label: '🔑 Sign In to View Orders', href: '/auth/login' },
          { label: '🛍️ Browse Products', href: '/products' }
        ],
        conversationTone: 'informative'
      };
    }

    try {
      const orders = await prisma.order.findMany({
        where: { customerId: authUser.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          items: {
            take: 2,
            include: {
              product: { select: { name: true, images: true } }
            }
          }
        }
      });

      if (orders.length === 0) {
        return {
          message: `Hello ${authUser.name || 'there'}! You don't have any active or past orders on your account yet.\n\nOnce you place an order, all artisans and vendors are required to dispatch tracking within 24–48 hours under our **100% Escrow Buyer Protection**.`,
          intent: 'ORDER_TRACKING_EMPTY',
          suggestedActions: [
            { label: '✨ Explore Featured Products', href: '/products' },
            { label: '🏷️ View Current Deals', href: '/deals' }
          ],
          conversationTone: 'informative'
        };
      }

      const summaries = orders.map((o) => {
        const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const itemsPreview = o.items.map(i => i.product.name).join(', ');
        const statusBadge = o.aggregateStatus.toUpperCase();
        return `📦 **Order #${o.id.slice(0, 8)}** (${dateStr})\n• **Status**: \`${statusBadge}\`\n• **Items**: ${itemsPreview}\n• **Total**: $${o.totalAmount.toFixed(2)}`;
      }).join('\n\n');

      return {
        message: `Here is the current status of your recent orders:\n\n${summaries}\n\nAll shipments are backed by our **Escrow Vault Guarantee**. Click below to see complete tracking details:`,
        intent: 'ORDER_TRACKING_FOUND',
        suggestedActions: [
          { label: '📋 View All Orders in Dashboard', href: '/customer' },
          { label: `🔍 Track Order #${orders[0]?.id.slice(0, 8)}`, href: `/customer/orders/${orders[0]?.id}` }
        ],
        conversationTone: 'informative'
      };
    } catch {
      return {
        message: `I'm having a brief issue retrieving your live orders. You can view all your orders directly in your customer dashboard:`,
        intent: 'ORDER_TRACKING_FALLBACK',
        suggestedActions: [{ label: '📋 Customer Dashboard', href: '/customer' }],
        conversationTone: 'empathic'
      };
    }
  }

  private handleReturnsAndRefunds(authUser?: { id: string } | null): CopilotResponse {
    return {
      message: `### 🛡️ Nexus 30-Day Hassle-Free Returns & Escrow Protection\n\nWe ensure complete peace of mind for every shopper:\n\n1. **30-Day Window**: You can request a return or exchange within 30 days of receiving your item.\n2. **Escrow Security**: Vendor payouts remain safely vaulted in escrow until you confirm delivery or your return window closes.\n3. **Damaged or Incorrect Item**: If your item arrives damaged or differs from the description, you receive an instant full refund or replacement.\n4. **How to Initiate**: Go to your Customer Dashboard, select the order, and click **"Request Return / Dispute"**. Our team reviews requests within 24 hours.`,
      intent: 'RETURNS_POLICY',
      suggestedActions: [
        { label: '📋 Open Customer Dashboard', href: '/customer' },
        { label: '🛡️ Buyer Protection Guide', href: '/buyer-protection' }
      ],
      conversationTone: 'empathic'
    };
  }

  private handleShippingInquiry(): CopilotResponse {
    return {
      message: `### 🚚 Shipping & Delivery Information\n\n• **Standard Delivery**: 2 to 4 business days for domestic shipments.\n• **Express Option**: 1 to 2 business days available at checkout on select merchant items.\n• **Multi-Vendor Orders**: Because Nexus connects independent verified artisans and stores, items from different sellers ship in separate, carefully packed parcels.\n• **Tracking Included**: Every shipment includes end-to-end carrier tracking sent straight to your email and customer dashboard.\n• **Free Shipping**: Many of our verified ateliers offer complimentary free shipping on orders over $50!`,
      intent: 'SHIPPING_INQUIRY',
      suggestedActions: [
        { label: '🛍️ Explore Catalog', href: '/products' },
        { label: '📦 Track My Orders', href: '/customer' }
      ],
      conversationTone: 'informative'
    };
  }

  private handlePaymentAndCoupons(): CopilotResponse {
    return {
      message: `### 💳 Payments, Security & Promotional Codes\n\n• **Accepted Payment Methods**: Visa, MasterCard, American Express, Apple Pay, and Google Pay through bank-grade **Stripe Connect**.\n• **Promotional Codes**: Enter your discount code in the promo box on the **Checkout page** before confirming your payment.\n• **100% Secure Checkout**: All payment information is tokenized with PCI-DSS Level 1 compliance and 256-bit SSL encryption. We never store your raw credit card numbers.`,
      intent: 'PAYMENT_AND_COUPONS',
      suggestedActions: [
        { label: '🛒 View Cart & Checkout', href: '/checkout' },
        { label: '🏷️ View Current Deals', href: '/deals' }
      ],
      conversationTone: 'informative'
    };
  }

  private handleSellerInquiry(authUser?: { id: string } | null): CopilotResponse {
    return {
      message: `### 🏪 Selling on Nexus Marketplace\n\nJoin our community of independent creators and top-tier vendors:\n\n• **Low 10% Platform Fee**: Transparent pricing with zero hidden monthly listing fees.\n• **Instant Stripe Connect Payouts**: Automated transfers direct to your bank account upon delivery confirmation.\n• **Storefront Customization**: Custom banners, logo, product variants, inventory alerts, and SEO optimization.\n• **Ready to begin?** Click below to launch your store in under 5 minutes!`,
      intent: 'SELLER_INQUIRY',
      suggestedActions: [
        { label: '🚀 Open a Store Today', href: '/seller' },
        { label: '📊 Seller Dashboard', href: '/seller' }
      ],
      conversationTone: 'informative'
    };
  }

  private async handleAddToCart(prompt: string): Promise<CopilotResponse> {
    const product = await this.findBestMatchingProduct(prompt);

    if (!product) {
      return {
        message: `I couldn't identify the exact item you'd like to add to your cart. Could you tell me the product name or category? (e.g. "mechanical keyboard" or "leather bag")`,
        intent: 'ADD_TO_CART_NOT_FOUND',
        suggestedActions: [{ label: '🛍️ Browse All Products', href: '/products' }],
        conversationTone: 'empathic'
      };
    }

    const cartPayload: CartItemPayload = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      sellerName: product.sellerName,
      category: product.category,
    };

    return {
      message: `I've prepared **${product.name}** from **${product.sellerName}** for your cart!\n\n• **Price**: $${product.price.toFixed(2)}\n• **Rating**: ⭐ ${product.rating.toFixed(1)}/5.0\n• **Category**: ${product.category}\n• **Protection**: 100% Escrow Guaranteed\n\nClick **"Add to Cart"** below to place it into your live shopping bag:`,
      intent: 'ADD_TO_CART_READY',
      itemToCart: cartPayload,
      suggestedActions: [
        { label: `🛒 Add "${product.name.slice(0, 20)}..." to Cart`, action: 'PUSH_TO_CART', item: cartPayload },
        { label: 'Proceed to Checkout', href: '/checkout' },
        { label: 'Keep Browsing', href: '/products' }
      ],
      conversationTone: 'transactional'
    };
  }

  private async handleProductSearch(prompt: string): Promise<CopilotResponse> {
    // 1. Extract budget constraint if present (e.g. "under 50", "below $100", "less than 200")
    let maxBudget: number | undefined;
    const budgetMatch = prompt.match(/(?:under|below|less than|max(?:imum)? of?)\s*\$?(\d+(?:\.\d{2})?)/i);
    if (budgetMatch) {
      maxBudget = parseFloat(budgetMatch[1]);
    }

    // 2. Extract meaningful search terms
    const stopWords = new Set([
      'i', 'want', 'need', 'looking', 'for', 'find', 'show', 'me', 'some', 'the', 'a', 'an',
      'good', 'best', 'cheap', 'recommend', 'recommendations', 'please', 'can', 'you', 'give',
      'what', 'do', 'have', 'any', 'items', 'products', 'stuff', 'something', 'nice', 'top'
    ]);

    const tokens = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => !stopWords.has(w) && w.length > 2);

    const searchTerm = tokens.join(' ').trim();

    // 3. Query Prisma Database
    let matchedProducts: CopilotProductItem[] = [];

    try {
      const whereClause: any = {
        status: 'published',
        deletedAt: null,
      };

      if (maxBudget) {
        whereClause.basePrice = { lte: maxBudget };
      }

      if (searchTerm) {
        whereClause.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
          { tags: { has: searchTerm } }
        ];
      }

      const dbResults = await prisma.product.findMany({
        where: whereClause,
        take: 3,
        orderBy: { rating: 'desc' },
        include: {
          category: { select: { name: true } },
          seller: { select: { store: { select: { name: true } } } },
          variants: { where: { isActive: true }, take: 1, select: { id: true, price: true } }
        }
      });

      if (dbResults && dbResults.length > 0) {
        matchedProducts = dbResults.map(p => ({
          id: p.id,
          name: p.name,
          price: p.variants?.[0]?.price || p.basePrice,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          category: p.category?.name || 'Curated',
          sellerName: p.seller?.store?.name || 'Verified Atelier',
          rating: p.rating || 4.9,
          slug: p.slug,
          inStock: p.inStock
        }));
      }
    } catch {
      // Fallback to static catalog if DB is unreachable
      matchedProducts = [];
    }

    // Fallback if 0 results
    if (matchedProducts.length === 0) {
      const fallbackList = FALLBACK_PRODUCTS_LIST.slice(0, 3).map((f, i) => ({
        id: f._id || `fallback-${i}`,
        name: f.name,
        price: f.basePrice,
        image: f.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        category: f.categoryName || 'Curated',
        sellerName: f.storeName || 'Atelier',
        rating: f.rating || 4.9,
        slug: (f as any).slug || f.name.toLowerCase().replace(/\s+/g, '-'),
        inStock: true
      }));
      matchedProducts = fallbackList;
    }

    const budgetPhrase = maxBudget ? ` under **$${maxBudget}**` : '';
    const queryPhrase = searchTerm ? ` for **"${searchTerm}"**` : '';

    const productBullets = matchedProducts
      .map(p => `• **[${p.name}](/products/${p.id})** — $${p.price.toFixed(2)} (⭐ ${p.rating.toFixed(1)}/5) by *${p.sellerName}*`)
      .join('\n');

    const firstProduct = matchedProducts[0];
    const topCartPayload: CartItemPayload | undefined = firstProduct ? {
      productId: firstProduct.id,
      name: firstProduct.name,
      price: firstProduct.price,
      image: firstProduct.image,
      quantity: 1,
      sellerName: firstProduct.sellerName,
      category: firstProduct.category
    } : undefined;

    return {
      message: `Here are handpicked recommendations${queryPhrase}${budgetPhrase} backed by verified customer reviews:\n\n${productBullets}\n\nEach item comes with **Buyer Protection** and verified merchant fulfillment. Would you like to add any of these to your cart?`,
      intent: 'PRODUCT_RECOMMENDATIONS',
      products: matchedProducts,
      itemToCart: topCartPayload,
      suggestedActions: [
        ...(topCartPayload ? [{ label: `🛒 Add "${topCartPayload.name.slice(0, 18)}..."`, action: 'PUSH_TO_CART' as const, item: topCartPayload }] : []),
        { label: 'Explore All Products', href: '/products' },
        { label: 'View Today\'s Deals', href: '/deals' },
        { label: 'Browse Categories', href: '/categories' }
      ],
      conversationTone: 'informative'
    };
  }

  private async findBestMatchingProduct(prompt: string): Promise<CopilotProductItem | null> {
    const stopWords = new Set([
      'add', 'put', 'push', 'to', 'in', 'cart', 'bag', 'buy', 'now', 'purchase',
      'item', 'product', 'the', 'a', 'an', 'please', 'me', 'for', 'want'
    ]);

    const keywords = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => !stopWords.has(w) && w.length > 2);

    const term = keywords.join(' ').trim();

    try {
      const product = await prisma.product.findFirst({
        where: {
          status: 'published',
          deletedAt: null,
          ...(term ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { category: { name: { contains: term, mode: 'insensitive' } } }
            ]
          } : {})
        },
        orderBy: { rating: 'desc' },
        include: {
          category: { select: { name: true } },
          seller: { select: { store: { select: { name: true } } } },
          variants: { where: { isActive: true }, take: 1, select: { id: true, price: true } }
        }
      });

      if (product) {
        return {
          id: product.id,
          name: product.name,
          price: product.variants?.[0]?.price || product.basePrice,
          image: product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          category: product.category?.name || 'Curated',
          sellerName: product.seller?.store?.name || 'Nexus Verified Atelier',
          rating: product.rating || 4.9,
          slug: product.slug,
          inStock: product.inStock
        };
      }
    } catch {
      // Fall through to fallback
    }

    const fallback = FALLBACK_PRODUCTS_LIST[0];
    if (fallback) {
      return {
        id: fallback._id,
        name: fallback.name,
        price: fallback.basePrice,
        image: fallback.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        category: fallback.categoryName || fallback.category?.name || 'Curated',
        sellerName: fallback.storeName || fallback.store?.name || fallback.seller?.name || 'Atelier',
        rating: fallback.rating || 4.9,
        slug: (fallback as any).slug || fallback.name.toLowerCase().replace(/\s+/g, '-'),
        inStock: true
      };
    }

    return null;
  }
}

export const copilotService = new AICopilotService();
