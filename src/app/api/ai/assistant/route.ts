/**
 * AI Marketplace Copilot & Customer Concierge API Route
 * 
 * Enterprise-grade multi-turn customer handling engine with semantic catalog search,
 * real-time order tracking, return/refund assistance, and polite shopping guidance.
 * 
 * @agent 13-customer-support-agent
 * @agent product-experience-lead
 * @agent engineering-backend-architect
 * @agent 21-pii-sanitization-agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-handler';
import { getAuthUser } from '@/lib/auth';
import { copilotService } from '@/services/AICopilotService';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const body = await req.json();
  const rawPrompt: string = body.prompt || '';
  const history = Array.isArray(body.messages) ? body.messages : [];

  const copilotResponse = await copilotService.handleCustomerQuery(
    rawPrompt,
    history,
    user ? { id: user.id, role: user.role } : null
  );

  // Map agents for governance badge display
  const dispatchedAgents = [
    '13-customer-support-agent',
    'product-experience-lead',
    '21-pii-sanitization-agent'
  ];

  if (copilotResponse.intent.includes('ORDER')) {
    dispatchedAgents.push('engineering-support-engineer');
  } else if (copilotResponse.intent.includes('CART') || copilotResponse.intent.includes('PAYMENT')) {
    dispatchedAgents.push('engineering-payments-billing-engineer');
  } else if (copilotResponse.intent.includes('SELLER')) {
    dispatchedAgents.push('marketing-seo-specialist');
  }

  return NextResponse.json({
    success: true,
    prompt: rawPrompt,
    message: copilotResponse.message,
    intent: copilotResponse.intent,
    suggestedActions: copilotResponse.suggestedActions,
    products: copilotResponse.products,
    itemToCart: copilotResponse.itemToCart,
    dispatchedAgents,
    conversationTone: copilotResponse.conversationTone,
  });
});
