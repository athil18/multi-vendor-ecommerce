/**
 * Catalog Repository Port Interface
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

export interface ICatalogRepository {
  findProductsByIds(ids: string[], ctx?: any): Promise<any[]>;
  decrementVariantStock(variantId: string, productId: string, quantity: number, ctx?: any): Promise<any>;
  findCouponByCode(code: string, ctx?: any): Promise<any>;
  incrementCouponUsage(coupon: any, ctx?: any): Promise<void>;
  saveOrderItems(items: any[], ctx?: any): Promise<void>;
  aggregateOrderItemCounts(orderIds: string[]): Promise<Map<string, number>>;
  
  // Payment Webhook Methods
  findOrderItemsByOrderId(orderId: string, ctx?: any): Promise<any[]>;
  updateOrderItemsBulkStatus(orderId: string, status: string, ctx?: any): Promise<void>;
  updateSingleOrderItemStatus(itemId: string, status: string, ctx?: any): Promise<void>;
  restockVariant(variantId: string, quantity: number, ctx?: any): Promise<void>;
  updateStoreStripeStatus(stripeAccountId: string, payoutsEnabled: boolean, detailsSubmitted: boolean, ctx?: any): Promise<void>;
}
