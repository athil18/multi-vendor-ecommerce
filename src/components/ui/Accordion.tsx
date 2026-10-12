'use client';

import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id?: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIndex?: number | number[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIndex,
  className = '',
}: AccordionProps) {
  const baseId = useId();

  const [openIndices, setOpenIndices] = useState<number[]>(() => {
    if (defaultOpenIndex === undefined) return [];
    if (Array.isArray(defaultOpenIndex)) return defaultOpenIndex;
    return [defaultOpenIndex];
  });

  const toggleIndex = (idx: number) => {
    if (allowMultiple) {
      setOpenIndices((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setOpenIndices((prev) => (prev.includes(idx) ? [] : [idx]));
    }
  };

  return (
    <div className={`divide-y divide-surface-200 dark:divide-surface-800 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndices.includes(idx);
        const headerId = `${baseId}-header-${idx}`;
        const panelId = `${baseId}-panel-${idx}`;

        return (
          <div key={item.id || idx} className="group">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleIndex(idx)}
                className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left text-sm sm:text-base font-bold text-surface-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
              >
                <span>{item.title}</span>
                <span className={`h-7 w-7 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0 text-surface-500 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-brand-50 dark:bg-brand-950 text-brand-600' : ''}`}>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                isOpen ? 'px-5 pb-5 sm:px-6 sm:pb-6 block' : 'hidden'
              }`}
            >
              <div className="text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed pt-1 border-t border-surface-100 dark:border-surface-800/60">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
