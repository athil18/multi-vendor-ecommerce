import { ValidationError } from './errors';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'partially_shipped' | 'failed';
export type OrderItemStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

const ALLOWED_ITEM_TRANSITIONS: Record<OrderItemStatus, OrderItemStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['cancelled'], // Delivered items can be cancelled if refunded
  cancelled: [], // Final state
};

const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['completed', 'failed'],
  completed: ['refunded'],
  failed: [], // Final state
  refunded: [], // Final state
};

/**
 * Recalculate aggregate status based on individual item statuses
 */
export function recalculateOrderAggregateStatus(itemStatuses: OrderItemStatus[]): OrderStatus {
  if (itemStatuses.length === 0) return 'pending';

  const uniqueStatuses = new Set(itemStatuses);

  // If all items are cancelled, order is cancelled
  if (uniqueStatuses.size === 1 && uniqueStatuses.has('cancelled')) {
    return 'cancelled';
  }

  // Filter out cancelled items to determine active state
  const activeStatuses = itemStatuses.filter(s => s !== 'cancelled');
  if (activeStatuses.length === 0) return 'cancelled';

  const uniqueActive = new Set(activeStatuses);

  // If all active items are of one status, order status is that status
  if (uniqueActive.size === 1) {
    const activeStatus = Array.from(uniqueActive)[0];
    return activeStatus as OrderStatus;
  }

  // If there's a mix of shipped/delivered and other active states, it's partially shipped
  if (uniqueActive.has('shipped') || uniqueActive.has('delivered')) {
    return 'partially_shipped';
  }

  if (uniqueActive.has('processing')) {
    return 'processing';
  }

  return 'pending';
}

/**
 * Validate that an Order transition is legal
 * Note: validateOrderTransition was removed as dead code.
 */

/**
 * Validate that an OrderItem transition is legal
 */
export function validateOrderItemTransition(current: OrderItemStatus, target: OrderItemStatus) {
  if (current === target) return;
  const allowed = ALLOWED_ITEM_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new ValidationError(`Illegal order item status transition: Cannot move order item status from '${current}' to '${target}'`);
  }
}

/**
 * Validate that a Payment transition is legal
 */
export function validatePaymentTransition(current: PaymentStatus, target: PaymentStatus) {
  if (current === target) return;
  const allowed = ALLOWED_PAYMENT_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new ValidationError(`Illegal paymentStatus transition: Cannot move payment status from '${current}' to '${target}'`);
  }
}
