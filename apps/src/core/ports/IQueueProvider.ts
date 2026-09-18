/**
 * Queue Provider Port Interface
 * 
 * @agent engineering-devops-automator
 * @agent engineering-backend-architect
 */

export interface IQueueProvider {
  enqueueOrderConfirmation(data: {
    orderId: string;
    customerId: string;
    email: string;
    totalAmount: number;
  }): Promise<void>;
}
