/**
 * Lightweight AI Marketplace Copilot Launcher Widget
 * Zero-overhead startup: Chat modal is dynamically imported only upon user click.
 * 
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 * @agent testing-performance-benchmarker
 */

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Bot, Sparkles } from 'lucide-react';

const AIAssistantChatPanel = dynamic(
  () => import('./AIAssistantChatPanel').then((mod) => mod.AIAssistantChatPanel),
  { ssr: false }
);

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "AI Copilot - Close AI Assistant" : "AI Copilot - Open AI Assistant"}
          aria-expanded={isOpen}
          aria-controls="nexus-ai-copilot-chat"
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-brand-500/25 hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-md cursor-pointer"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <Bot className="h-5 w-5 animate-pulse" />
          <span className="font-semibold text-sm tracking-wide hidden sm:inline">AI Copilot</span>
          <Sparkles className="h-4 w-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Slide-over Chat Panel: Loaded & mounted only when user clicks launcher */}
      {isOpen && <AIAssistantChatPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}
