'use client';

/**
 * JEV AI System-1 Fast Decision Engine Widget
 * 
 * Apple-grade dark glassmorphism widget offering hyper-fast, non-verbose,
 * structured decisions for product classification, price optimization,
 * vendor fraud checking, and shopping routing.
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent design-whimsy-injector
 * @agent engineering-section-508-specialist
 */

import React, { useState } from 'react';

interface JevResult {
  engine: string;
  latencyMs: number;
  confidence: number;
  reasoning: string;
  decision: any;
}

export default function JevAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState<'OPTIMIZE_PRICING' | 'CLASSIFY_PRODUCT' | 'DETECT_FRAUD'>('OPTIMIZE_PRICING');
  const [inputVal, setInputVal] = useState('149.99');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JevResult | null>(null);

  const handleRunDecision = async () => {
    setLoading(true);
    setResult(null);
    try {
      let payload: Record<string, any> = {};
      if (task === 'OPTIMIZE_PRICING') {
        payload = { price: parseFloat(inputVal) || 100, demandIndex: 1.3, margin: 0.25 };
      } else if (task === 'CLASSIFY_PRODUCT') {
        payload = { title: inputVal || 'Wireless Noise-Canceling Headphones' };
      } else {
        payload = { amount: parseFloat(inputVal) || 2500, velocity: 2 };
      }

      const res = await fetch('/api/ai/jev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, payload }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('JEV Execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open JEV AI Fast Decision Engine"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-surface-900 text-surface-100 border border-surface-700 shadow-lg hover:border-surface-600 hover:bg-surface-800 transition-colors cursor-pointer group"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-xs tracking-wider uppercase text-white">
            JEV Decision Engine
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-300 font-mono border border-surface-700">
            &lt;1ms
          </span>
        </button>
      ) : (
        <div className="w-80 md:w-96 rounded-xl bg-surface-950 text-surface-100 border border-surface-800 shadow-2xl p-5 overflow-hidden transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                JEV Decision Engine
                <span className="text-[10px] uppercase font-mono font-medium text-surface-400 bg-surface-900 px-1.5 py-0.5 rounded border border-surface-800">
                  Strict Mode
                </span>
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close JEV AI Widget"
              className="text-surface-400 hover:text-white p-1 rounded-md hover:bg-surface-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Task Selector */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              Select Fast Decision Task
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-surface-900 border border-surface-800">
              {(['OPTIMIZE_PRICING', 'CLASSIFY_PRODUCT', 'DETECT_FRAUD'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTask(t);
                    setResult(null);
                    if (t === 'OPTIMIZE_PRICING') setInputVal('149.99');
                    else if (t === 'CLASSIFY_PRODUCT') setInputVal('Wireless Headphones');
                    else setInputVal('2500');
                  }}
                  className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                    task === t
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                  }`}
                >
                  {t === 'OPTIMIZE_PRICING' ? 'Price' : t === 'CLASSIFY_PRODUCT' ? 'Catalog' : 'Fraud'}
                </button>
              ))}
            </div>
          </div>

          {/* Input field */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              {task === 'OPTIMIZE_PRICING' ? 'Base Price ($)' : task === 'CLASSIFY_PRODUCT' ? 'Product Name' : 'Transaction Amount ($)'}
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-surface-900 border border-surface-700 text-surface-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="Enter value..."
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleRunDecision}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-xs tracking-wider uppercase transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Executing Decision...' : 'Run Decision (< 1ms)'}
          </button>

          {/* Results display */}
          {result && (
            <div className="mt-4 p-3 rounded-lg bg-surface-900 border border-surface-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] border-b border-surface-800 pb-1.5">
                <span className="font-mono text-brand-400 font-semibold">{result.engine}</span>
                <span className="text-surface-400 font-mono">{result.latencyMs} ms | Conf: {(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-surface-200 font-medium leading-relaxed italic">
                &ldquo;{result.reasoning}&rdquo;
              </p>
              <div className="p-2 rounded bg-surface-950 font-mono text-[10px] text-emerald-400 overflow-x-auto border border-surface-800">
                <pre>{JSON.stringify(result.decision, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
