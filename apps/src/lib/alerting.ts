import { logger, logError } from './logger';

export type AlertSeverity = 'critical' | 'high' | 'medium';

interface AlertContext {
  service?: string;
  error?: Error;
  [key: string]: any;
}

export class AlertDispatcher {
  static async dispatch(severity: AlertSeverity, title: string, context?: AlertContext) {
    const payload = {
      event: 'system_alert',
      severity,
      title,
      ...context,
      error_message: context?.error?.message,
    };

    // Log the alert for aggregators (e.g. Datadog / Splunk)
    logger.error(`ALERT [${severity.toUpperCase()}]: ${title}`, payload);

    // Send to Slack if webhook is configured
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const slackMessage = {
          text: `*[${severity.toUpperCase()}]* ${title}\n\`\`\`${JSON.stringify(payload, null, 2)}\`\`\``
        };
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage)
        });
        } catch (e: any) {
          logger.error('Failed to send alert to Slack:', { error: e.message || 'Unknown error' });
        }
    }
  }

}
