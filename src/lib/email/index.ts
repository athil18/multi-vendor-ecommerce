/**
 * Centralized Email System Entrypoint
 * 
 * @agent engineering-backend-architect
 */

import { sendEmail, SendEmailOptions, SendEmailResult } from './resend';
import { 
  orderConfirmationTemplate, 
  passwordResetTemplate, 
  welcomeEmailTemplate, 
  EmailOrderDetails 
} from './templates';

export { sendEmail };
export type { SendEmailOptions, SendEmailResult, EmailOrderDetails };

/**
 * High-level helper: Send order confirmation
 */
export async function sendOrderConfirmation(
  to: string, 
  details: EmailOrderDetails
): Promise<SendEmailResult> {
  const { subject, html, text } = orderConfirmationTemplate(details);
  return sendEmail({
    to,
    subject,
    html,
    text,
    tags: [
      { name: 'category', value: 'order_confirmation' },
      { name: 'order_id', value: details.orderId },
    ],
  });
}

/**
 * High-level helper: Send password reset
 */
export async function sendPasswordReset(
  to: string, 
  resetUrl: string, 
  name?: string
): Promise<SendEmailResult> {
  const { subject, html, text } = passwordResetTemplate(resetUrl, name);
  return sendEmail({
    to,
    subject,
    html,
    text,
    tags: [{ name: 'category', value: 'password_reset' }],
  });
}

/**
 * High-level helper: Send welcome notification
 */
export async function sendWelcomeNotification(
  to: string, 
  customerName: string
): Promise<SendEmailResult> {
  const { subject, html, text } = welcomeEmailTemplate(customerName);
  return sendEmail({
    to,
    subject,
    html,
    text,
    tags: [{ name: 'category', value: 'welcome' }],
  });
}
