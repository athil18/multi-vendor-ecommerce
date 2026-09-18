import { IQueueProvider } from '@/core/ports/IQueueProvider';
import { enqueueOrderConfirmation } from '@/lib/queue/order.queue';

export class BullMQProvider implements IQueueProvider {
  async enqueueOrderConfirmation(data: { orderId: string; customerId: string; email: string; totalAmount: number; }) {
    await enqueueOrderConfirmation(data);
  }
}
