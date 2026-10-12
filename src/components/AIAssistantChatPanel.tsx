/**
 * Enhanced AI Marketplace Copilot & Customer Concierge Panel
 * 
 * Provides an empathetic, responsive, multi-turn customer experience
 * with visual product discovery, order tracking, and 1-click cart addition.
 * 
 * @agent 13-customer-support-agent
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bot, Send, X, RefreshCw, ChevronRight, ShoppingCart, Check, Store, Trash2, Star } from 'lucide-react';
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
}

interface CopilotProductItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sellerName: string;
  rating: number;
  slug: string;
  inStock: boolean;
}

interface SuggestedAction {
  label: string;
  href?: string;
  action?: 'PUSH_TO_CART' | 'NAVIGATE' | 'PROMPT';
  item?: CartItemPayload;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  dispatchedAgents?: string[];
  suggestedActions?: SuggestedAction[];
  itemToCart?: CartItemPayload;
  products?: CopilotProductItem[];
  timestamp: Date;
}

let nextMessageSeq = 0;
function createMessageRecord(
  sender: 'user' | 'agent',
  text: string,
  extra: Partial<ChatMessage> = {}
): ChatMessage {
  nextMessageSeq += 1;
  return {
    id: `${sender}-${nextMessageSeq}`,
    sender,
    text,
    timestamp: new Date(),
    ...extra,
  };
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  sender: 'agent',
  text: 'Hello. I can assist with product search, order tracking, and escrow protections.',
  dispatchedAgents: ['support-agent', 'payments-engineer'],
  suggestedActions: [
    { label: 'Push Top Tech Item to Cart' },
    { label: 'Push ANC Headphones to Cart' },
    { label: 'Track My Orders' },
    { label: 'Buyer Protection Policy' },
  ],
  timestamp: new Date(),
};

export function AIAssistantChatPanel({ onClose }: { onClose: () => void }) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const [pushedItems, setPushedItems] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setPushedItems({});
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || loading) return;

    const userMessage = createMessageRecord('user', textToSend);

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      // Build lightweight conversation history for multi-turn context
      const historyContext = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          messages: historyContext,
        }),
      });

      const data = await res.json();

      const agentMessage = createMessageRecord('agent', data.message || 'Request completed.', {
        dispatchedAgents: data.dispatchedAgents || ['support-agent'],
        suggestedActions: data.suggestedActions,
        itemToCart: data.itemToCart,
      });

      setMessages((prev) => [...prev, agentMessage]);
    } catch {
      const errorMsg = createMessageRecord('agent', 'An error occurred while processing your request. Please try again.', {
        dispatchedAgents: ['engineering-sre'],
      });
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
      className="fixed inset-y-0 right-0 sm:right-6 sm:bottom-24 sm:inset-y-auto w-full sm:w-[420px] sm:h-[620px] bg-white dark:bg-surface-950 sm:rounded-xl border border-surface-200 dark:border-surface-800 shadow-xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-900 dark:bg-white text-white dark:text-surface-900 rounded-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-surface-900 dark:text-white text-sm">Customer Support Assistant</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Online
              </span>
            </div>
            <p className="text-[11px] text-surface-500 flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Instant catalog & order lookup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            title="Reset conversation"
            aria-label="Reset conversation"
            className="p-1.5 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Assistant"
            className="p-1.5 text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors cursor-pointer"
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
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-none shadow-md'
                  : 'bg-surface-100 dark:bg-surface-900 text-surface-800 dark:text-surface-200 rounded-bl-none border border-surface-200/60 dark:border-surface-800/60'
              }`}
            >
              <div className="whitespace-pre-line prose-sm dark:prose-invert">
                {msg.text}
              </div>

              {/* Multiple Product Cards Carousel / Grid */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-surface-200/50 dark:border-surface-800/50 pt-2.5">
                  <span className="text-[10px] uppercase font-bold text-surface-500 tracking-wider">
                    Recommended Items
                  </span>
                  <div className="space-y-2">
                    {msg.products.map((prod) => {
                      const isAdded = pushedItems[prod.id];
                      const itemCartPayload: CartItemPayload = {
                        productId: prod.id,
                        name: prod.name,
                        price: prod.price,
                        image: prod.image,
                        quantity: 1,
                        sellerName: prod.sellerName,
                        category: prod.category,
                      };

                      return (
                        <div
                          key={prod.id}
                          className="flex items-center gap-3 p-2 bg-white dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm"
                        >
                          <div className="w-12 h-12 rounded-lg bg-surface-100 dark:bg-surface-900 overflow-hidden flex-shrink-0">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${prod.id}`}
                              onClick={onClose}
                              className="font-medium text-xs text-surface-900 dark:text-white truncate block hover:text-brand-600 dark:hover:text-brand-400"
                            >
                              {prod.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-surface-500">
                              <span className="font-semibold text-surface-900 dark:text-white">
                                ${prod.price.toFixed(2)}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                                <Star className="h-2.5 w-2.5 fill-current" /> {prod.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePushToCart(itemCartPayload)}
                            disabled={isAdded}
                            className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white dark:bg-brand-950/40 dark:text-brand-300'
                            }`}
                            title={isAdded ? 'Added to Cart' : 'Add to Cart'}
                          >
                            {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Single Featured Cart Card */}
              {msg.itemToCart && !msg.products && (
                <div className="mt-3 p-3 bg-white dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm space-y-2.5 text-surface-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-100 dark:bg-surface-900 overflow-hidden flex-shrink-0 border border-surface-200/60 dark:border-surface-800/60 relative">
                      <Image
                        src={msg.itemToCart.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                        alt={msg.itemToCart.name}
                        width={48}
                        height={48}
                        unoptimized
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
                        <span className="truncate">{msg.itemToCart.sellerName || 'Verified Atelier'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePushToCart(msg.itemToCart!)}
                    disabled={pushedItems[msg.itemToCart.productId]}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      pushedItems[msg.itemToCart.productId]
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-surface-900 dark:bg-white text-white dark:text-surface-900 hover:bg-surface-800 dark:hover:bg-surface-100 shadow-sm'
                    }`}
                  >
                    {pushedItems[msg.itemToCart.productId] ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart: ${msg.itemToCart.price.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Suggested Action Chips */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                {msg.suggestedActions.map((action, idx) =>
                  action.href ? (
                    <Link
                      key={idx}
                      href={action.href}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-md border border-surface-200 dark:border-surface-700 transition-colors"
                    >
                      {action.label}
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  ) : action.action === 'PUSH_TO_CART' && action.item ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePushToCart(action.item!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-surface-900 dark:bg-white text-white dark:text-surface-900 hover:bg-surface-800 dark:hover:bg-surface-100 rounded-md shadow-sm transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      {action.label}
                    </button>
                  ) : (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(action.label)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-md border border-surface-200 dark:border-surface-700 transition-colors cursor-pointer"
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
            <span>Consulting concierge catalog...</span>
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
          placeholder="Ask about products, orders, returns..."
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
