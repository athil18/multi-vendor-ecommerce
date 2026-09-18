/**
 * AI Copilot Multi-Agent Integration Tests
 * 
 * @agent 13-customer-support-agent
 * @agent 01-web-research-agent
 * @agent 21-pii-sanitization-agent
 */

import { describe, it, expect } from 'vitest';
import { sanitizeText } from '../src/lib/pii';

describe('AI Copilot & Multi-Agent Dispatch (@agent 13-customer-support-agent)', () => {
  it('should sanitize PII from prompts prior to agent processing', () => {
    const rawPrompt = 'Help me track order for user test@example.com card 4111-2222-3333-4444';
    const sanitized = sanitizeText(rawPrompt);

    expect(sanitized).not.toContain('4111-2222-3333-4444');
    expect(sanitized).toContain('****-****-****-****');
    expect(sanitized).not.toContain('test@example.com');
    expect(sanitized).toContain('t***@example.com');
  });

  it('should format order summaries correctly', () => {
    const mockOrder = {
      id: 'ord_123456789',
      aggregateStatus: 'processing',
      totalAmount: 149.99,
      items: [{ product: { name: 'Wireless Headphones' } }],
    };

    const summary = `• **Order #${mockOrder.id.slice(0, 8)}**: Status is **${mockOrder.aggregateStatus.toUpperCase()}** (${mockOrder.items.length} items, Total: $${mockOrder.totalAmount.toFixed(2)})`;
    expect(summary).toContain('Order #ord_1234');
    expect(summary).toContain('PROCESSING');
    expect(summary).toContain('$149.99');
  });
});
