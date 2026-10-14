import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './redis';
import { ORDER_CONFIRMATION_QUEUE_NAME, OrderConfirmationPayload } from './order.queue';
import { logger, logError } from '../logger';
import * as Sentry from '@sentry/node';
import { AlertDispatcher } from '../alerting';

import { sendOrderConfirmation } from '../email';

const sendOrderConfirmationEmail = async (payload: OrderConfirmationPayload) => {
  logger.info(`Attempting to send email to ${payload.email} for order ${payload.orderId}...`);
  
  const result = await sendOrderConfirmation(payload.email, {
    orderId: payload.orderId,
    totalAmount: payload.totalAmount,
  });

  if (!result.success) {
    logger.error(`Order confirmation email delivery failed for ${payload.email}:`, { error: result.error });
    throw new Error(result.error || 'Email dispatch failed');
  }

  logger.info(`Email successfully delivered via [${result.provider}] to ${payload.email}. MessageId: ${result.messageId}`);
  return true;
};

export const startWorker = () => {
  logger.info('Starting Background Job Worker...', { queue: ORDER_CONFIRMATION_QUEUE_NAME });

  const worker = new Worker<OrderConfirmationPayload>(
    ORDER_CONFIRMATION_QUEUE_NAME,
    async (job: Job<OrderConfirmationPayload>) => {
      return Sentry.withIsolationScope(async () => {
        Sentry.setTag('job_id', job.id);
        Sentry.setTag('job_name', job.name);
        
        logger.info(`Processing Job [${job.id}]`, { 
          jobId: job.id, 
          name: job.name, 
          attemptsMade: job.attemptsMade,
          payload: job.data 
        });

        if (job.name === 'send-order-email') {
          const startTime = Date.now();
          try {
            await sendOrderConfirmationEmail(job.data);
            const duration = Date.now() - startTime;
            logger.info(`Job [${job.id}] completed successfully`, { durationMs: duration });
            return { success: true, durationMs: duration };
          } catch (error) {
            const duration = Date.now() - startTime;
            logError(error, { 
              jobId: job.id,
              durationMs: duration,
              attemptsMade: job.attemptsMade
            });
            throw error;
          }
        }
      });
    },
    {
      connection: getRedisConnection() as any,
      concurrency: 5, // Process up to 5 jobs concurrently
    }
  );

  worker.on('failed', (job, err) => {
    logger.warn(`Job [${job?.id}] has failed with error: ${err.message}`);
    // If it fails on the last attempt, we should alert
    if (job?.attemptsMade === job?.opts.attempts) {
      AlertDispatcher.dispatch('medium', 'Worker Job Failed Continuously', { jobId: job?.id, error: err });
    }
  });

  worker.on('error', err => {
    logError(err, { context: 'Worker Error' });
    AlertDispatcher.dispatch('critical', 'Queue Worker Crashed', { error: err });
  });

  return worker;
};

// Start immediately if executed directly via node
if (require.main === module) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://mock@sentry.io/12345',
    tracesSampleRate: 1.0,
  });
  const worker = startWorker();

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down background worker gracefully...`);
    try {
      await worker.close();
      logger.info('Background worker closed safely.');
    } catch (err: any) {
      logger.error('Error during worker shutdown:', { error: err.message });
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
