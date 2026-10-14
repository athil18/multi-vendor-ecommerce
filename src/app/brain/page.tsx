'use client';

/**
 * Nexus Commerce Brain & Dynamic Skills Command Center
 * 
 * Inspired by supermemoryai/company-brain:
 * - Dynamic runtime skills registry & playbook inspector
 * - Permissions-scoped multi-tier memory graph (Platform, Store, User)
 * - Interactive multi-role turn playground with real-time tool execution traces
 * - Skill authoring studio for custom merchant & admin playbooks
 * 
 * @module app/brain/page
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  Zap,
  Shield,
  Layers,
  Terminal,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Store,
  User,
  ArrowRight,
  RefreshCw,
  Cpu,
  Sliders,
  DollarSign,
  Package,
  Eye,
  Send,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface BrainSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  scope: 'platform' | 'store' | 'personal';
  requiredRole?: string;
  body: string;
  tools?: string[];
  isSystem?: boolean;
}

interface MemoryRecord {
  id: string;
  scope: 'platform' | 'store' | 'user';
  scopeId?: string;
  category: string;
  key: string;
  content: string;
  tags: string[];
  confidence: number;
}

interface TurnTrace {
  prompt: string;
  response: string;
  intent: string;
  loadedSkills: { id: string; name: string; version: string }[];
  executedTools: { tool: string; input: any; result: any; durationMs?: number }[];
  memoriesRecalled: { id: string; key: string; scope: string; snippet: string }[];
}

export default function BrainHubPage() {
  const [activeTab, setActiveTab] = useState<'skills' | 'memory' | 'studio' | 'author'>('skills');

  // Skills State
  const [skills, setSkills] = useState<BrainSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<BrainSkill | null>(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillRoleFilter, setSkillRoleFilter] = useState<string>('all');
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Memory State
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [memorySearch, setMemorySearch] = useState('');
  const [memoryScopeFilter, setMemoryScopeFilter] = useState<'all' | 'platform' | 'store' | 'user'>('all');
  const [loadingMemory, setLoadingMemory] = useState(true);

  // Playground / Studio State
  const [simulatedRole, setSimulatedRole] = useState<'customer' | 'seller' | 'admin'>('customer');
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioLoading, setStudioLoading] = useState(false);
  const [latestTrace, setLatestTrace] = useState<TurnTrace | null>(null);

  // Author Studio State
  const [authorName, setAuthorName] = useState('');
  const [authorDesc, setAuthorDesc] = useState('');
  const [authorScope, setAuthorScope] = useState<'platform' | 'store' | 'personal'>('store');
  const [authorBody, setAuthorBody] = useState('');
  const [authorStatus, setAuthorStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [authorSaving, setAuthorSaving] = useState(false);

  // Fetch initial skills
  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const res = await fetch('/api/brain/skills');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSkills(data.data);
        if (!selectedSkill && data.data.length > 0) {
          setSelectedSkill(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed fetching skills:', err);
    } finally {
      setLoadingSkills(false);
    }
  };

  // Fetch initial memories
  const fetchMemories = async (query = '') => {
    setLoadingMemory(true);
    try {
      const url = query ? `/api/brain/memory?q=${encodeURIComponent(query)}` : '/api/brain/memory';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMemories(data.data);
      }
    } catch (err) {
      console.error('Failed fetching memories:', err);
    } finally {
      setLoadingMemory(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchMemories();
  }, []);

  // Studio Turn Submission
  const handleExecuteTurn = async (customPrompt?: string) => {
    const text = (customPrompt || studioPrompt).trim();
    if (!text || studioLoading) return;

    setStudioLoading(true);
    try {
      const res = await fetch('/api/brain/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          simulatedRole,
          storeId: simulatedRole === 'seller' ? 'store-atelier-alpha' : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setLatestTrace({
          prompt: text,
          response: data.data.message,
          intent: data.data.intent,
          loadedSkills: data.data.loadedSkills || [],
          executedTools: data.data.executedTools || [],
          memoriesRecalled: data.data.memoriesRecalled || [],
        });
      }
    } catch (err) {
      console.error('Turn execution failed:', err);
    } finally {
      setStudioLoading(false);
    }
  };

  // Author Skill Submission
  const handleSaveAuthorSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorStatus(null);
    setAuthorSaving(true);

    try {
      const res = await fetch('/api/brain/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authorName,
          description: authorDesc,
          scope: authorScope,
          body: authorBody,
          simulatedRole,
          storeId: 'store-atelier-alpha',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAuthorStatus({
          type: 'success',
          message: `Skill "${data.data.name}" (${data.data.version}) successfully saved and active in runtime!`,
        });
        setAuthorName('');
        setAuthorDesc('');
        setAuthorBody('');
        fetchSkills();
      } else {
        setAuthorStatus({ type: 'error', message: data.error || 'Failed to save skill.' });
      }
    } catch (err: any) {
      setAuthorStatus({ type: 'error', message: err.message || 'Network error saving skill.' });
    } finally {
      setAuthorSaving(false);
    }
  };

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    if (skillRoleFilter !== 'all' && s.requiredRole !== 'any' && s.requiredRole !== skillRoleFilter) {
      return false;
    }
    if (skillSearch) {
      const q = skillSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter memories
  const filteredMemories = memories.filter((m) => {
    if (memoryScopeFilter !== 'all' && m.scope !== memoryScopeFilter) return false;
    if (memorySearch) {
      const q = memorySearch.toLowerCase();
      return m.key.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-900 via-indigo-950 to-surface-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/40">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold uppercase tracking-wider">
                <Brain className="h-3.5 w-3.5" /> Company Brain Architecture
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Nexus Commerce Brain & Skills Engine
              </h1>
              <p className="text-surface-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Autonomous dynamic skills engine, multi-tier permissions memory graph, and live domain tools influencing shoppers, merchants, and platform governance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-colors"
              >
                Storefront Catalog
              </Link>
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Terminal className="h-3.5 w-3.5" /> Launch Brain Studio
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-200 dark:border-surface-800 gap-2 sm:gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'skills'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" /> Active Skills Registry ({skills.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'memory'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" /> Multi-Tier Memory Graph ({memories.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'studio'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="h-4 w-4" /> Brain Simulation Studio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('author')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'author'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="h-4 w-4" /> Skill Authoring Studio
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ACTIVE SKILLS REGISTRY                             */}
        {/* ========================================================= */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Skill List & Filters */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search playbooks..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <select
                  value={skillRoleFilter}
                  onChange={(e) => setSkillRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Shopper</option>
                  <option value="seller">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {loadingSkills ? (
                <div className="p-8 text-center text-surface-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-brand-500" /> Loading runtime skills...
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredSkills.map((skill) => (
                    <div
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        selectedSkill?.id === skill.id
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm'
                          : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono font-semibold text-xs text-surface-900 dark:text-white truncate">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                            v{skill.version}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded ${
                            skill.scope === 'platform'
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                          }`}>
                            {skill.scope}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Selected Skill Playbook Inspector */}
            <div className="lg:col-span-7">
              {selectedSkill ? (
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-mono text-base font-bold text-surface-900 dark:text-white">
                          {selectedSkill.name}
                        </h2>
                        {selectedSkill.isSystem && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-500 mt-1">
                        {selectedSkill.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStudioPrompt(`Execute workflow using ${selectedSkill.name}`);
                        setActiveTab('studio');
                      }}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Terminal className="h-3.5 w-3.5" /> Test in Studio
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200/60 dark:border-surface-800/60">
                      <span className="text-[10px] uppercase font-bold text-surface-400 block">Scope</span>
                      <span className="font-semibold capitalize text-surface-800 dark:text-surface-200">
                        {selectedSkill.scope}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200/60 dark:border-surface-800/60">
                      <span className="text-[10px] uppercase font-bold text-surface-400 block">Version</span>
                      <span className="font-mono font-semibold text-surface-800 dark:text-surface-200">
                        {selectedSkill.version}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200/60 dark:border-surface-800/60">
                      <span className="text-[10px] uppercase font-bold text-surface-400 block">Required Role</span>
                      <span className="font-semibold capitalize text-surface-800 dark:text-surface-200">
                        {selectedSkill.requiredRole || 'Any'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200/60 dark:border-surface-800/60">
                      <span className="text-[10px] uppercase font-bold text-surface-400 block">Allowed Tools</span>
                      <span className="font-mono text-[11px] text-surface-800 dark:text-surface-200 truncate block">
                        {selectedSkill.tools?.length || 0} tools
                      </span>
                    </div>
                  </div>

                  {/* Playbook Markdown Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-surface-400">
                        SKILL.md Executable Playbook
                      </span>
                      <span className="text-[10px] text-surface-400">
                        Dynamically loaded into context via load_skill
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-950 text-surface-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-[420px] whitespace-pre-wrap border border-surface-800">
                      {selectedSkill.body}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-surface-400 border border-dashed border-surface-300 dark:border-surface-800 rounded-2xl">
                  Select a skill playbook from the left to inspect its instructions and invariants.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MULTI-TIER PERMISSIONS MEMORY GRAPH                */}
        {/* ========================================================= */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={memorySearch}
                    onChange={(e) => {
                      setMemorySearch(e.target.value);
                      fetchMemories(e.target.value);
                    }}
                    placeholder="Search memory graph..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Scope Toggles */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
                {(['all', 'platform', 'store', 'user'] as const).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setMemoryScopeFilter(sc)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                      memoryScopeFilter === sc
                        ? 'bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm'
                        : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                    }`}
                  >
                    {sc === 'all' ? 'All Tiers' : `${sc} Tier`}
                  </button>
                ))}
              </div>
            </div>

            {/* Memory Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                        mem.scope === 'platform'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : mem.scope === 'store'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      }`}>
                        {mem.scope} Memory
                      </span>
                      <span className="text-[10px] font-mono text-surface-400">
                        {Math.round(mem.confidence * 100)}% conf
                      </span>
                    </div>

                    <h3 className="font-mono font-bold text-xs text-surface-900 dark:text-white">
                      {mem.key}
                    </h3>

                    <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                      {mem.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-surface-100 dark:border-surface-800/80">
                    {mem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] text-surface-500 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BRAIN SIMULATION STUDIO                            */}
        {/* ========================================================= */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input & Persona Selector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-5 space-y-4 shadow-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">
                    Simulate User Persona
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'customer', label: 'Shopper', icon: User },
                      { role: 'seller', label: 'Merchant', icon: Store },
                      { role: 'admin', label: 'Admin', icon: Shield },
                    ].map(({ role, label, icon: Icon }) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSimulatedRole(role as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          simulatedRole === role
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">
                    Query Prompt
                  </label>
                  <textarea
                    rows={4}
                    value={studioPrompt}
                    onChange={(e) => setStudioPrompt(e.target.value)}
                    placeholder="Ask about products, escrow releases, store analytics, or privacy rights..."
                    className="w-full p-3 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteTurn()}
                  disabled={studioLoading || !studioPrompt.trim()}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {studioLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Executing Brain Turn...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Execute Autonomous Turn
                    </>
                  )}
                </button>

                {/* Pre-Baked Scenarios */}
                <div className="space-y-1.5 pt-2 border-t border-surface-200 dark:border-surface-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Try Pre-Configured Scenarios
                  </span>
                  {[
                    { label: '🛡️ Check Escrow & 7-Day Window', q: 'How does escrow protection work on my order?' },
                    { label: '🌟 Curated Walnut Desk Accessories', q: 'Find solid walnut minimalist desk accessories under $150' },
                    { label: '📊 Merchant Store GMV & Settlement', q: 'What is my current GMV and payout disbursement breakdown?' },
                    { label: '🔒 DPDP Compliance & Forget Me', q: 'What are my data rights and how does account erasure work?' },
                  ].map((sc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setStudioPrompt(sc.q);
                        handleExecuteTurn(sc.q);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-surface-50 dark:bg-surface-950 hover:bg-surface-100 dark:hover:bg-surface-800 text-[11px] text-surface-700 dark:text-surface-300 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{sc.label}</span>
                      <ArrowRight className="h-3 w-3 text-surface-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Trace Visualizer */}
            <div className="lg:col-span-7">
              {latestTrace ? (
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-6 shadow-sm">
                  {/* Loaded Skills Strip */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-brand-500" /> Dynamically Loaded Playbooks
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {latestTrace.loadedSkills.length > 0 ? (
                        latestTrace.loadedSkills.map((sk) => (
                          <div
                            key={sk.id}
                            className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-mono font-semibold flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {sk.name} (v{sk.version})
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-surface-400 italic">No skills loaded</span>
                      )}
                    </div>
                  </div>

                  {/* Recalled Memories Strip */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-indigo-500" /> Permissions-Scoped Memories Recalled
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {latestTrace.memoriesRecalled.length > 0 ? (
                        latestTrace.memoriesRecalled.map((mem) => (
                          <div
                            key={mem.id}
                            className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200 text-xs font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span>{mem.key}</span>
                            <span className="text-[9px] uppercase px-1 rounded bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                              {mem.scope}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-surface-400 italic">No previous memories recalled</span>
                      )}
                    </div>
                  </div>

                  {/* Executed Tools Strip */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-amber-500" /> Multi-Tenant Domain Tools Executed
                    </span>
                    <div className="space-y-2">
                      {latestTrace.executedTools.map((tool, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 font-mono text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-surface-900 dark:text-white font-semibold">
                            <span className="text-brand-600 dark:text-brand-400">tool_call: {tool.tool}</span>
                            <span className="text-[10px] text-surface-400">{tool.durationMs}ms</span>
                          </div>
                          <div className="text-[11px] text-surface-600 dark:text-surface-400 overflow-x-auto max-h-24">
                            <code>{JSON.stringify(tool.result, null, 2)}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generated Assistant Output */}
                  <div className="space-y-2 pt-2 border-t border-surface-200 dark:border-surface-800">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400 block">
                      Autonomous Brain Output (Intent: {latestTrace.intent})
                    </span>
                    <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs text-surface-800 dark:text-surface-200 leading-relaxed whitespace-pre-wrap">
                      {latestTrace.response}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-surface-400 border border-dashed border-surface-300 dark:border-surface-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Terminal className="h-8 w-8 text-surface-300 dark:text-surface-700" />
                  <p className="text-xs">
                    Execute a turn from the panel on the left to witness real-time skill loading, tool dispatch, and memory influence.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SKILL AUTHORING STUDIO                             */}
        {/* ========================================================= */}
        {activeTab === 'author' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                Draft & Publish Runtime Skill Playbook
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Empower your store with custom, reusable operational procedures. Playbooks are verified, stored in the runtime registry, and become dynamically callable via <code className="text-brand-600">load_skill</code>.
              </p>
            </div>

            {authorStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  authorStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {authorStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                )}
                <span>{authorStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveAuthorSkill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                    Skill Identifier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. bespoke_engraving_sla_skill"
                    className="w-full px-3 py-2 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                  <span className="text-[10px] text-surface-400 mt-1 block">
                    Alphanumeric with underscores (max 64 chars)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                    Permission Scope
                  </label>
                  <select
                    value={authorScope}
                    onChange={(e) => setAuthorScope(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none"
                  >
                    <option value="store">Store (Merchant Atelier Only)</option>
                    <option value="personal">Personal (Private to Creator)</option>
                    <option value="platform">Platform (Global Marketplace - Admin Only)</option>
                  </select>
                  <span className="text-[10px] text-surface-400 mt-1 block">
                    Defines multi-tenant visibility boundary
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                  Routing Trigger Description
                </label>
                <input
                  type="text"
                  required
                  value={authorDesc}
                  onChange={(e) => setAuthorDesc(e.target.value)}
                  placeholder="e.g. Use when customer inquires about bespoke monogram timelines, font choices, or non-refundable engraving terms."
                  className="w-full px-3 py-2 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[10px] text-surface-400 mt-1 block">
                  Shown in &lt;available_skills&gt; index for model routing (max 240 chars)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">
                  Markdown Playbook Instructions (Body)
                </label>
                <textarea
                  rows={8}
                  required
                  value={authorBody}
                  onChange={(e) => setAuthorBody(e.target.value)}
                  placeholder={`# Bespoke Crafting Policy Playbook\n\n## Rules\n1. Explain monogramming lead times (3-5 days).\n2. Remind buyer that customized goods are final sale once proof is approved.\n3. Verify laser engraving depth and font choice.`}
                  className="w-full p-3 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={authorSaving}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {authorSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Publishing Skill Playbook...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" /> Publish to Nexus Brain
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
