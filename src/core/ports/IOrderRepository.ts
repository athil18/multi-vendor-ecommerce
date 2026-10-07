/**
 * Order Repository Port Interface
 * 
 * @agent engineering-backend-architect
 * @agent engineering-payments-billing-engineer
 */

import { Order, Prisma, Address, OrderItem, Product, Variant } from '@prisma/client';
import { ITransactionContext } from './ITransactionManager';

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
  couponId?: string | null;
}

export type OrderRepoContext = { tx?: Prisma.TransactionClient } | ITransactionContext;

export type OrderWithDetails = Order & {
  _id?: string;
  shippingAddress?: Address | null;
  items?: (OrderItem & {
    product?: Product;
    variant?: Variant | null;
  })[];
};

export type OrderWithItems = Order & {
  _id?: string;
  shippingAddress?: Address | null;
  items?: OrderItem[];
};

export type OrderCustomerSummary = Order & {
  _id?: string;
  items?: (OrderItem & {
    product?: {
      id: string;
      name: string;
      images: string[];
    };
    variant?: {
      id: string;
      sku: string;
      attributes: Prisma.JsonValue;
    } | null;
  })[];
};

export interface IOrderRepository {
  findById(id: string, ctx?: OrderRepoContext): Promise<OrderWithDetails | null>;
  findByPaymentIntentId(intentId: string, ctx?: OrderRepoContext): Promise<OrderWithItems | null>;
  saveOrder(data: OrderData, ctx?: OrderRepoContext): Promise<Order & { _id?: string }>;
  updateOrder(orderId: string, data: Partial<OrderData>, ctx?: OrderRepoContext): Promise<Order & { _id?: string }>;
  countByCustomer(customerId: string, filters: { status?: string; search?: string }): Promise<number>;
  findByCustomer(
    customerId: string,
    filters: { status?: string; search?: string },
    pagination: { skip: number; limit: number }
  ): Promise<OrderCustomerSummary[]>;
}
