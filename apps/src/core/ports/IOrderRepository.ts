/**
 * Order Repository Port Interface
 * 
 * @agent engineering-backend-architect
 * @agent engineering-payments-billing-engineer
 */

export interface OrderData {
  customerId: string;
  sellerIds: string[];
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  aggregateStatus: string;
  paymentStatus?: string;
  paidAt?: Date;
  stripePaymentIntentId?: string;
  couponId?: string | any;
}

export interface IOrderRepository {
  findById(id: string, ctx?: any): Promise<any | null>;
  findByPaymentIntentId(intentId: string, ctx?: any): Promise<any | null>;
  saveOrder(data: OrderData, ctx?: any): Promise<any>;
  updateOrder(orderId: string, data: Partial<OrderData>, ctx?: any): Promise<any>;
  countByCustomer(customerId: string, filters: { status?: string, search?: string }): Promise<number>;
  findByCustomer(customerId: string, filters: { status?: string, search?: string }, pagination: { skip: number, limit: number }): Promise<any[]>;
}
