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
import { Bot } from 'lucide-react';

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
          aria-label={isOpen ? "Customer Support - Close Assistant" : "Customer Support - Open Assistant"}
          aria-expanded={isOpen}
          aria-controls="nexus-ai-copilot-chat"
          className="group relative flex items-center gap-2 px-3.5 py-2.5 bg-surface-900 dark:bg-white text-white dark:text-surface-900 rounded-lg shadow-lg hover:bg-surface-800 dark:hover:bg-surface-100 transition-colors border border-surface-200 dark:border-surface-800 cursor-pointer text-sm font-medium"
        >
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">Help & Support</span>
        </button>
      </div>

      {/* Slide-over Chat Panel: Loaded & mounted only when user clicks launcher */}
      {isOpen && <AIAssistantChatPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}
