/**
 * Centralized Resend Transactional Email Engine
 * 
 * @agent engineering-backend-architect
 * @agent security-appsec-engineer
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/node';

// Validate Resend client availability without leaking credentials
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const defaultFromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'Nexus Marketplace <onboarding@resend.dev>';

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  success: boolean;
  provider: 'resend' | 'smtp' | 'mock';
  messageId?: string;
  error?: string;
}

/**
 * Fallback SMTP transporter for local dev or when Resend key is unconfigured
 */
const createSmtpFallback = () => {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'mock_ethereal_user@ethereal.email',
      pass: 'mock_password',
    },
  });
};

/**
 * Centralized method to dispatch emails across the platform
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const from = options.from || defaultFromEmail;
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  // 1. Preferred Pathway: Resend API
  if (resend) {
    try {
      logger.info('Dispatching transactional email via Resend API', {
        recipientsCount: recipients.length,
        subject: options.subject,
      });

      const { data, error } = await resend.emails.send({
        from,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        tags: options.tags,
      });

      if (error) {
        logger.error('Resend delivery reported error', { error: error.message });
        throw new Error(error.message);
      }

      logger.info('Resend email successfully accepted by delivery queue', {
        id: data?.id,
      });

      return {
        success: true,
        provider: 'resend',
        messageId: data?.id,
      };
    } catch (err: any) {
      logger.error('Resend delivery exception, attempting fallback transport', {
        error: String(err?.message || err),
      });
      Sentry.captureException(err, { extra: { subject: options.subject } });
      // Proceed to fallback transport below
    }
  }

  // 2. Secondary Pathway: SMTP Fallback / Development Mock
  try {
    const isMock = !process.env.SMTP_URL;
    logger.info(`Dispatching email via ${isMock ? 'Mock Development' : 'Local SMTP'} transport`, {
      recipientsCount: recipients.length,
      subject: options.subject,
    });

    const transporter = createSmtpFallback();
    const info = await transporter.sendMail({
      from,
      to: recipients.join(', '),
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return {
      success: true,
      provider: isMock ? 'mock' : 'smtp',
      messageId: info.messageId,
    };
  } catch (smtpErr: any) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('[Email Local Mock]: SMTP unavailable, simulated email delivery successfully recorded in development.', {
        subject: options.subject,
        recipientsCount: recipients.length,
      });
      return {
        success: true,
        provider: 'mock',
        messageId: `mock-dev-${Date.now()}`,
      };
    }
    logger.error('SMTP email dispatch failed completely', {
      error: String(smtpErr?.message || smtpErr),
    });
    return {
      success: false,
      provider: 'smtp',
      error: smtpErr?.message || 'Email delivery failed',
    };
  }
}
