/**
 * Lazy-Loaded AI Marketplace Copilot Chat Panel
 * Code-split from initial bundle to eliminate main-thread hydration overhead.
 * 
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 * @agent 13-customer-support-agent
 * @agent testing-performance-benchmarker
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Send, X, Shield, RefreshCw, ChevronRight, Zap, ShoppingCart, Check, Store, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface CartItemPayload {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  sellerName?: string;
  category?: string;
  escrowSplit?: {
    sellerAmount: number;
    platformFee: number;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  dispatchedAgents?: string[];
  suggestedActions?: { label: string; href?: string; action?: string; item?: CartItemPayload }[];
  itemToCart?: CartItemPayload;
  timestamp: Date;
}

export function AIAssistantChatPanel({ onClose }: { onClose: () => void }) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const [pushedItems, setPushedItems] = useState<Record<string, boolean>>({});

  const handlePushToCart = (item: CartItemPayload) => {
    addToCart({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
    setPushedItems((prev) => ({ ...prev, [item.productId]: true }));
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      text: '👋 Hello! I am the **Nexus AI Copilot**, backed by our **500+ AI Agent Ecosystem**.\n\nAsk me anything about products, order tracking, seller insights, or tell me to **push products to your cart**!',
      dispatchedAgents: ['product-behavioral-nudge-engine', '13-customer-support-agent', 'engineering-payments-billing-engineer'],
      suggestedActions: [
        { label: '🛒 Push Top Tech Item to Cart' },
        { label: '🎧 Push ANC Headphones to Cart' },
        { label: '📦 Track My Orders' },
        { label: '🛡️ Buyer Protection Policy' },
      ],
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await res.json();

      const agentMessage: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: data.message || 'I processed your request with the 500+ AI Agent network.',
        dispatchedAgents: data.dispatchedAgents || ['13-customer-support-agent'],
        suggestedActions: data.suggestedActions,
        itemToCart: data.itemToCart,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: '⚠️ An error occurred while communicating with the AI Agent network. Please try again.',
        dispatchedAgents: ['engineering-sre'],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="nexus-ai-copilot-chat"
      role="dialog"
      aria-modal="true"
      aria-label="Nexus AI Copilot Chat"
      className="fixed inset-y-0 right-0 sm:right-6 sm:bottom-24 sm:inset-y-auto w-full sm:w-[420px] sm:h-[620px] bg-white/95 dark:bg-surface-950/95 backdrop-blur-2xl sm:rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-200/80 dark:border-surface-800/80 bg-gradient-to-r from-brand-600/10 via-purple-600/10 to-indigo-600/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-500 to-purple-600 text-white rounded-xl shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-surface-900 dark:text-white text-sm">Nexus AI Copilot</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                500+ AI Agents
              </span>
            </div>
            <p className="text-[11px] text-surface-500 flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Multi-Agent Orchestration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/agent-ecosystem"
            title="View Full Agent Ecosystem Matrix"
            aria-label="View Full Agent Ecosystem Matrix"
            className="p-1.5 text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <Zap className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close AI Assistant"
            className="p-1.5 text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                  : 'bg-surface-100 dark:bg-surface-900 text-surface-800 dark:text-surface-200 rounded-bl-none border border-surface-200/60 dark:border-surface-800/60'
              }`}
            >
              <div className="whitespace-pre-line prose-sm dark:prose-invert">
                {msg.text}
              </div>

              {/* Dispatched AI Agents Badge */}
              {msg.dispatchedAgents && msg.dispatchedAgents.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-surface-200/50 dark:border-surface-800/50 flex flex-wrap items-center gap-1.5 text-[10px] text-surface-500">
                  <Shield className="h-3 w-3 text-brand-500 inline" />
                  <span>Governed by:</span>
                  {msg.dispatchedAgents.map((ag) => (
                    <span
                      key={ag}
                      className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-800 font-mono text-[9px] text-brand-600 dark:text-brand-400"
                    >
                      @{ag}
                    </span>
                  ))}
                </div>
              )}

              {/* AI Cart Push Card */}
              {msg.itemToCart && (
                <div className="mt-3 p-3 bg-white dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2.5 text-surface-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-100 dark:bg-surface-900 overflow-hidden flex-shrink-0 border border-surface-200/60 dark:border-surface-800/60">
                      <img
                        src={msg.itemToCart.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                        alt={msg.itemToCart.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider">
                        {msg.itemToCart.category || 'Curated'}
                      </span>
                      <h4 className="font-medium text-surface-900 dark:text-white text-xs truncate">
                        {msg.itemToCart.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-surface-500 mt-0.5">
                        <Store className="h-3 w-3 text-surface-400" />
                        <span className="truncate">{msg.itemToCart.sellerName || 'Nexus Verified Atelier'}</span>
                      </div>
                    </div>
                  </div>

                  {msg.itemToCart.escrowSplit && (
                    <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-surface-50 dark:bg-surface-900/60 text-[10px] text-surface-500 border border-surface-200/40 dark:border-surface-800/40">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="h-3 w-3" /> 90% Seller Escrow: ${msg.itemToCart.escrowSplit.sellerAmount.toFixed(2)}
                      </span>
                      <span className="font-mono text-surface-400">10% Platform Fee</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePushToCart(msg.itemToCart!)}
                    disabled={pushedItems[msg.itemToCart.productId]}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      pushedItems[msg.itemToCart.productId]
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
                    }`}
                  >
                    {pushedItems[msg.itemToCart.productId] ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Pushed to Cart Successfully!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3.5 w-3.5" /> Push to Live Cart — ${msg.itemToCart.price.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Suggested Action Buttons / Chips */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                {msg.suggestedActions.map((action, idx) =>
                  action.href ? (
                    <Link
                      key={idx}
                      href={action.href}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 rounded-full border border-brand-200 dark:border-brand-800 transition-colors"
                    >
                      {action.label}
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  ) : action.action === 'PUSH_TO_CART' && action.item ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePushToCart(action.item!)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-brand-600 text-white hover:bg-brand-500 rounded-full shadow-sm transition-all cursor-pointer"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      {action.label}
                    </button>
                  ) : (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(action.label)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-surface-100 dark:bg-surface-800/60 text-surface-700 dark:text-surface-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 rounded-full border border-surface-200 dark:border-surface-700 transition-colors cursor-pointer"
                    >
                      {action.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-surface-500 text-xs py-2 px-3 bg-surface-100 dark:bg-surface-900 rounded-xl w-fit animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-500" />
            <span>Consulting 500+ AI Agent Ecosystem...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask anything about orders, products, sellers..."
          aria-label="Message Nexus AI Copilot"
          className="flex-1 bg-white dark:bg-surface-950 text-surface-900 dark:text-white px-3.5 py-2 text-sm rounded-xl border border-surface-200 dark:border-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-surface-400"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          aria-label="Send message to AI Copilot"
          className="p-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
