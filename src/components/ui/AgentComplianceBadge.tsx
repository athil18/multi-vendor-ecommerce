/**
 * 500+ AI Agent Compliance & Governance Badge Component
 * 
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 * @agent design-brand-guardian
 */

'use client';

import React from 'react';
import { ShieldCheck, Sparkles, Code2, Lock, Cpu } from 'lucide-react';

export interface AgentComplianceBadgeProps {
  agentName?: string;
  division?: 'engineering' | 'security' | 'design' | 'testing' | 'finance';
  status?: 'verified' | 'active' | 'reviewing';
  className?: string;
}

const DIVISION_CONFIG = {
  engineering: {
    icon: Code2,
    color: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    label: 'Engineering Agent',
  },
  security: {
    icon: Lock,
    color: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    label: 'Security Agent',
  },
  design: {
    icon: Sparkles,
    color: 'text-pink-700 dark:text-pink-400 bg-pink-500/10 border-pink-500/20',
    label: 'Design Agent',
  },
  testing: {
    icon: ShieldCheck,
    color: 'text-amber-800 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    label: 'QA Agent',
  },
  finance: {
    icon: Cpu,
    color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    label: 'Fintech Agent',
  },
};

export const AgentComplianceBadge: React.FC<AgentComplianceBadgeProps> = ({
  agentName = '500+ AI Agent Ecosystem',
  division = 'engineering',
  status = 'verified',
  className = '',
}) => {
  const config = DIVISION_CONFIG[division] || DIVISION_CONFIG.engineering;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-200 hover:scale-105 ${config.color} ${className}`}
      title={`Governed by ${agentName} (${config.label})`}
    >
      <Icon className="w-3.5 h-3.5 animate-pulse" />
      <span className="truncate max-w-[160px] font-mono tracking-tight">{agentName}</span>
      {status === 'verified' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      )}
    </div>
  );
};

export default AgentComplianceBadge;
