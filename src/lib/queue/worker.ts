import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './redis';
import { ORDER_CONFIRMATION_QUEUE_NAME, OrderConfirmationPayload } from './order.queue';
import { logger, logError } from '../logger';
import * as Sentry from '@sentry/node';
import { AlertDispatcher } from '../alerting';

import nodemailer from 'nodemailer';

// Real SMTP Transport (Fallback to ethereal in dev if no SMTP_URL provided)
const createTransporter = () => {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }
  // Default to Ethereal mock SMTP for local dev if not configured
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'mock_ethereal_user@ethereal.email',
      pass: 'mock_password'
    }
  });
};

const sendOrderConfirmationEmail = async (payload: OrderConfirmationPayload) => {
  const transporter = createTransporter();
  
  logger.info(`Attempting to send email to ${payload.email} for order ${payload.orderId}...`);
  
  try {
    const info = await transporter.sendMail({
      from: '"Nexus Enterprise" <noreply@nexus.local>',
      to: payload.email,
      subject: `Order Confirmation - ${payload.orderId}`,
      text: `Thank you for your order! Your order ID is ${payload.orderId}. Total: $${payload.totalAmount}`,
      html: `<h1>Thank you for your order!</h1><p>Your order ID is <strong>${payload.orderId}</strong>.</p><p>Total: $${payload.totalAmount}</p>`
    });
    
    logger.info(`Email successfully delivered to ${payload.email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error: any) {
    logger.error(`SMTP Delivery failed for ${payload.email}:`, { error: error.message || 'Unknown error' });
    throw error; // Let BullMQ handle the retry mechanism
  }
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
  startWorker();
}
