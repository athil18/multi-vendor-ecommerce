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
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/90 text-slate-100 border border-cyan-500/30 shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(56,189,248,0.4)] transition-all duration-300 backdrop-blur-md cursor-pointer group"
        >
          <div className="relative w-3 h-3 rounded-full bg-cyan-400 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75"></div>
          </div>
          <span className="font-semibold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
            JEV AI System-1
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
            &lt;1ms
          </span>
        </button>
      ) : (
        <div className="w-80 md:w-96 rounded-2xl bg-slate-950/90 text-slate-100 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl p-5 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                JEV AI Engine
                <span className="text-[10px] uppercase font-mono font-medium text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                  Strict Mode
                </span>
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close JEV AI Widget"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Task Selector */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Fast Decision Task
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
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
                  className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    task === t
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {t === 'OPTIMIZE_PRICING' ? 'Price' : t === 'CLASSIFY_PRODUCT' ? 'Catalog' : 'Fraud'}
                </button>
              ))}
            </div>
          </div>

          {/* Input field */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {task === 'OPTIMIZE_PRICING' ? 'Base Price ($)' : task === 'CLASSIFY_PRODUCT' ? 'Product Name' : 'Transaction Amount ($)'}
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              placeholder="Enter value..."
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleRunDecision}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white font-semibold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Executing JEV Decision...' : 'Run JEV Decision (< 1ms)'}
          </button>

          {/* Results display */}
          {result && (
            <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                <span className="font-mono text-cyan-400 font-semibold">{result.engine}</span>
                <span className="text-slate-400 font-mono">{result.latencyMs} ms | Conf: {(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed italic">
                "{result.reasoning}"
              </p>
              <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-teal-300 overflow-x-auto border border-slate-800">
                <pre>{JSON.stringify(result.decision, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
