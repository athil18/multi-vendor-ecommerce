import { Queue } from 'bullmq';
import { getRedisConnection } from './redis';
import { logger } from '../logger';

// Queue Name
export const ORDER_CONFIRMATION_QUEUE_NAME = 'order-confirmation';

// Payload structure
export interface OrderConfirmationPayload {
  orderId: string;
  customerId: string;
  email: string;
  totalAmount: number;
}

// Initialize Queue
let orderConfirmationQueue: Queue<OrderConfirmationPayload> | null = null;

const getOrderConfirmationQueue = () => {
  if (!orderConfirmationQueue) {
    orderConfirmationQueue = new Queue<OrderConfirmationPayload>(ORDER_CONFIRMATION_QUEUE_NAME, {
      connection: getRedisConnection() as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true, // Auto-cleanup successful jobs
        removeOnFail: 100, // Keep last 100 failed jobs for dead-letter analysis
      },
    });
  }
  return orderConfirmationQueue!;
};

// Enqueue Job Helper
export const enqueueOrderConfirmation = async (payload: OrderConfirmationPayload) => {
  try {
    const queue = getOrderConfirmationQueue();
    // Unique jobId to prevent duplicate processing for the same order confirmation
    const job = await queue.add('send-order-email', payload, {
      jobId: `order-conf-${payload.orderId}`,
    });
    
    logger.info(`Enqueued Order Confirmation Job`, {
      queue: ORDER_CONFIRMATION_QUEUE_NAME,
      jobId: job.id,
      orderId: payload.orderId,
    });
    
    return job;
  } catch (error) {
    logger.error('Failed to enqueue order confirmation job', {
      error,
      queue: ORDER_CONFIRMATION_QUEUE_NAME,
      payload,
    });
    throw error;
  }
};
