/**
 * Core Order Domain Service (Hexagonal Architecture)
 * 
 * @agent engineering-backend-architect
 * @agent engineering-payments-billing-engineer
 * @agent 02-code-review-agent
 */

import { ITransactionManager } from '@/core/ports/ITransactionManager';
import { IOrderRepository } from '@/core/ports/IOrderRepository';
import { ICatalogRepository } from '@/core/ports/ICatalogRepository';
import { IQueueProvider } from '@/core/ports/IQueueProvider';
import { BadRequestError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export class OrderService {
  static readonly PLATFORM_FEE_PERCENTAGE = 0.10;

  constructor(
    private readonly txManager: ITransactionManager,
    private readonly orderRepo: IOrderRepository,
    private readonly catalogRepo: ICatalogRepository,
    private readonly queueProvider: IQueueProvider,
    private readonly userService: any
  ) {}

  /**
   * Fetch orders for a user with item counts.
   */
  async getOrdersForCustomer(customerId: string, filters: { status?: string, search?: string }, pagination: { skip: number, limit: number }) {
    const [orders, total] = await Promise.all([
      this.orderRepo.findByCustomer(customerId, filters, pagination),
      this.orderRepo.countByCustomer(customerId, filters)
    ]);

    const orderIds = orders.map((o) => o.id);
    const countMap = await this.catalogRepo.aggregateOrderItemCounts(orderIds);

    return { orders, total, countMap };
  }

  /**
   * Create an order with transaction management.
   */
  async createOrder(data: {
    customerId: string;
    orderItems: { productId: string; variantId?: string; quantity: number }[];
    shippingAddressId: string;
    paymentMethod: string;
    couponCode?: string;
  }) {
    return this.txManager.executeInTransaction(async (txCtx) => {
      let computedSubtotal = 0;
      let eligibleSubtotalForCoupon = 0;
      const validatedItems: any[] = [];
      const sellerIds = new Set<string>();

      // 1. Resolve Coupon
      let coupon = null;
      if (data.couponCode) {
        coupon = await this.catalogRepo.findCouponByCode(data.couponCode, txCtx);
        if (!coupon) throw new BadRequestError('Invalid coupon code');
        if (coupon.validFrom > new Date() || coupon.validTo < new Date()) throw new BadRequestError('Coupon is expired or not active');
        if (coupon.usedCount >= coupon.usageLimit) throw new BadRequestError('Coupon usage limit reached');
      }

      // 2. Validate Items and Lock Inventory
      const productIds = data.orderItems.map(i => i.productId);
      const products = await this.catalogRepo.findProductsByIds(productIds, txCtx);
      const productMap = new Map(products.map(p => [p.id, p]));

      for (const item of data.orderItems) {
        const product = productMap.get(item.productId);
        if (!product) throw new BadRequestError(`Product not found: ${item.productId}`);

        let price = product.basePrice;

        if (item.variantId) {
          const variant = await this.catalogRepo.decrementVariantStock(item.variantId, product.id, item.quantity, txCtx);
          if (!variant) throw new BadRequestError(`Insufficient stock or invalid variant: ${item.variantId}`);
          price = variant.price;
        } else if (!product.inStock) {
          throw new BadRequestError(`Product out of stock: ${product.name}`);
        }

        const lineTotal = price * item.quantity;
        computedSubtotal += lineTotal;
        sellerIds.add(product.sellerId);

        const isEligibleForCoupon = coupon && (
          coupon.scope === 'global' || 
          (coupon.scope === 'seller' && coupon.sellerId === product.sellerId)
        );

        if (isEligibleForCoupon) eligibleSubtotalForCoupon += lineTotal;

        validatedItems.push({
          productId: product.id,
          variantId: item.variantId,
          sellerId: product.sellerId,
          quantity: item.quantity,
          price,
          lineTotal,
          isEligibleForCoupon,
        });
      }

      // 3. Coupon Minimum Value Check
      if (coupon && coupon.minOrderValue && eligibleSubtotalForCoupon < coupon.minOrderValue) {
        throw new Error(`Minimum eligible amount for this coupon is ${coupon.minOrderValue}`);
      }

      // 4. Calculate Total Discount
      let totalDiscount = 0;
      if (coupon) {
        if (coupon.discountType === 'fixed') totalDiscount = Math.min(coupon.value, eligibleSubtotalForCoupon);
        else if (coupon.discountType === 'percentage') totalDiscount = (coupon.value / 100) * eligibleSubtotalForCoupon;
        
        if (coupon.maxDiscount && totalDiscount > coupon.maxDiscount) totalDiscount = coupon.maxDiscount;
      }

      // 5. Build Ledger and Prorate Discount
      const totalAmount = computedSubtotal - totalDiscount;
      let distributedDiscount = 0;
      
      const finalOrderItems = validatedItems.map((item, index) => {
        let discountApplied = 0;
        if (item.isEligibleForCoupon && eligibleSubtotalForCoupon > 0) {
          if (index === validatedItems.length - 1) {
            discountApplied = totalDiscount - distributedDiscount;
          } else {
            const ratio = item.lineTotal / eligibleSubtotalForCoupon;
            discountApplied = parseFloat((totalDiscount * ratio).toFixed(2));
            distributedDiscount += discountApplied;
          }
        }

        const platformFee = parseFloat((item.lineTotal * OrderService.PLATFORM_FEE_PERCENTAGE).toFixed(2));
        const sellerPayout = item.lineTotal - discountApplied - platformFee;

        return {
          productId: item.productId,
          variantId: item.variantId,
          sellerId: item.sellerId,
          quantity: item.quantity,
          price: item.price,
          status: 'pending',
          platformFee,
          sellerPayout,
          discountApplied,
          taxAmount: 0,
        };
      });

      // 6. Create Order
      const createdOrder = await this.orderRepo.saveOrder({
        customerId: data.customerId,
        sellerIds: Array.from(sellerIds),
        shippingAddress: data.shippingAddressId,
        paymentMethod: data.paymentMethod,
        totalAmount,
        aggregateStatus: 'pending',
        couponId: coupon?.id,
      }, txCtx);

      // 7. Save Order Items
      const orderItemDocs = finalOrderItems.map((item) => ({
        orderId: createdOrder.id,
        ...item,
      }));

      await this.catalogRepo.saveOrderItems(orderItemDocs, txCtx);

      // 8. Update Coupon Usage
      if (coupon) {
        await this.catalogRepo.incrementCouponUsage(coupon, txCtx);
      }

      // Background Job (Failsafe)
      try {
        const orderUser = await this.userService.getUserEmail(data.customerId);
        await this.queueProvider.enqueueOrderConfirmation({
          orderId: createdOrder.id,
          customerId: data.customerId,
          email: orderUser || 'customer@example.com',
          totalAmount: totalAmount,
        });
      } catch (err) {
        logger.error('Failed to enqueue order confirmation email', { error: String(err) });
      }

      return createdOrder;
    });
  }
}
