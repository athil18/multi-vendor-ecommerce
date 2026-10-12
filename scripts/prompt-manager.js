/**
 * Nexus 500+ AI Agent — Central Prompt & Process Manager
 * 
 * Command-line tool to organize, track, audit, and document all historical,
 * active, and future prompts across the multi-vendor e-commerce platform.
 * 
 * @agent engineering-backend-architect
 * @agent documentation-and-adrs
 * @agent autonomous_4_agent_agency
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const REGISTRY_PATH = path.join(WORKSPACE_ROOT, '.ai', 'prompt-registry.json');
const MASTER_DOC_PATH = path.join(WORKSPACE_ROOT, '.ai', 'PROMPT_MANAGEMENT_MASTER_SYSTEM.md');
const PDF_DOC_PATH = path.join(WORKSPACE_ROOT, '.ai', 'PROMPT_MANAGEMENT_MASTER_SYSTEM.pdf');
const PDF_GENERATOR = path.join(WORKSPACE_ROOT, '.ai', 'generate_pdf.py');

function readRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`❌ Registry file not found at: ${REGISTRY_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

function saveRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function listPrompts() {
  const data = readRegistry();
  console.log('\n========================================================================');
  console.log('   NEXUS 500+ AI AGENT — PROMPT & PROCESS AUDIT REGISTRY');
  console.log('========================================================================\n');

  console.log(`Total Tracked Prompts: ${data.prompts.length}\n`);

  const phases = ['HISTORICAL_IMPLEMENTED', 'ACTIVE_CURRENT', 'FUTURE_PLANNED'];
  phases.forEach(phase => {
    const group = data.prompts.filter(p => p.phase === phase);
    console.log(`\n📌 [PHASE: ${phase}] (${group.length} prompts)`);
    console.log('------------------------------------------------------------------------');
    group.forEach(p => {
      const statusIcon = p.status === 'COMPLETED' ? '✅' : p.status === 'IN_PROGRESS' ? '⏳' : '📋';
      console.log(`${statusIcon} ${p.id} | [${p.category}] ${p.title}`);
      console.log(`   Governing Agent : ${p.governingAgent}`);
      console.log(`   Status          : ${p.status} | Date: ${p.executionDate}`);
      console.log(`   Prompt Text     : "${p.promptText.substring(0, 80)}..."`);
      console.log('');
    });
  });
}

function showStats() {
  const data = readRegistry();
  const total = data.prompts.length;
  const completed = data.prompts.filter(p => p.status === 'COMPLETED').length;
  const inProgress = data.prompts.filter(p => p.status === 'IN_PROGRESS').length;
  const queued = data.prompts.filter(p => p.status === 'QUEUED').length;

  console.log('\n📊 ==========================================');
  console.log('   PROMPT REGISTRY ANALYTICS & HEALTH');
  console.log('==========================================');
  console.log(`Total Prompts Logged    : ${total}`);
  console.log(`Completed / Verified    : ${completed} (${Math.round((completed/total)*100)}%)`);
  console.log(`In Progress             : ${inProgress}`);
  console.log(`Queued Future Prompts   : ${queued}`);
  console.log('------------------------------------------\n');
}

function syncDocumentation() {
  const data = readRegistry();
  console.log('📝 Generating Master Prompt Management Documentation...');

  let md = `# NEXUS 500+ AI AGENT: PROMPT & PROCESS MASTER REGISTRY
**Document ID:** \`NEXUS-PROMPT-REGISTRY-2026\`  
**System Title:** Nexus Multi-Vendor E-Commerce Platform  
**Governing Directorate:** 500+ AI Agent Ecosystem  
**Last Updated:** ${data.lastUpdated}  
**Total Registered Prompts:** ${data.prompts.length}  

---

## 1. System Overview & Lifecycle Methodology

This document serves as the **official single source of truth** for all prompts, instructions, execution traces, and outcomes utilized across the Nexus Multi-Vendor E-Commerce monorepo.

Every prompt is governed by a specialized agent from the **500+ AI Agent Ecosystem**, and tracked across three sequential phases:

1. **HISTORICAL_IMPLEMENTED**: Fully executed, audited, and verified prompts with production evidence.
2. **ACTIVE_CURRENT**: Prompts actively in development or verification.
3. **FUTURE_PLANNED**: Structured roadmap prompts queued for upcoming architectural milestones.

\`\`\`mermaid
graph LR
    A["Raw User Prompt / Intent"] --> B["GSD Mission Control / Intent Router"]
    B --> C["500+ AI Agent Assignment"]
    C --> D["Execution & Code Modification"]
    D --> E["Quality Gate & Test Verification"]
    E --> F["Prompt Registry & Documentation Sync (.ai/prompt-registry.json)"]
\`\`\`

---

## 2. Comprehensive Prompt Register

`;

  const phases = [
    { key: 'HISTORICAL_IMPLEMENTED', title: '✅ 1. Historical & Implemented Prompts' },
    { key: 'ACTIVE_CURRENT', title: '⏳ 2. Active & Current Prompts' },
    { key: 'FUTURE_PLANNED', title: '📋 3. Future & Planned Roadmap Prompts' }
  ];

  phases.forEach(({ key, title }) => {
    const list = data.prompts.filter(p => p.phase === key);
    md += `\n### ${title} (${list.length} Prompts)\n\n`;

    list.forEach(p => {
      md += `#### **[${p.id}] ${p.title}**\n`;
      md += `* **Category:** \`${p.category}\` | **Status:** \`${p.status}\` | **Date:** \`${p.executionDate}\`\n`;
      md += `* **Governing Agent:** ${p.governingAgent}\n\n`;
      md += `> **Exact Prompt Text:**  \n> *"${p.promptText}"*\n\n`;
      
      md += `**Execution & Process Trace:**\n`;
      p.processTrace.forEach(step => {
        md += `- ${step}\n`;
      });
      md += `\n`;

      md += `**Impacted Codebase Files:**\n`;
      p.impactedFiles.forEach(f => {
        md += `- \`${f}\`\n`;
      });
      md += `\n`;

      md += `**Verification Proof & Outcome:**  \n${p.verificationProof}\n\n`;
      md += `---\n\n`;
    });
  });

  md += `## 3. How to Log & Manage Prompts (CLI Guide)

To maintain 100% traceability for all future prompts, use the dedicated CLI tool in \`multi-vendor-ecommerce\`:

\`\`\`bash
# 1. View all logged prompts
npm run prompt:list

# 2. View statistical analytics
npm run prompt:stats

# 3. Synchronize markdown & compile official PDF
npm run prompt:doc
\`\`\`
`;

  fs.writeFileSync(MASTER_DOC_PATH, md, 'utf-8');
  console.log(`✅ Master Markdown generated at: ${MASTER_DOC_PATH}`);

  // Compile PDF via python ReportLab
  if (fs.existsSync(PDF_GENERATOR)) {
    console.log('📕 Compiling Master PDF via ReportLab...');
    try {
      execFileSync('python', [PDF_GENERATOR, MASTER_DOC_PATH, PDF_DOC_PATH], { stdio: 'inherit' });
      console.log(`✅ Master PDF compiled at: ${PDF_DOC_PATH}`);
    } catch (e) {
      console.error('⚠️ PDF compilation error:', e.message);
    }
  }
}

function addPrompt(options) {
  const data = readRegistry();
  const nextIdNumber = data.prompts.length + 1;
  const id = `PRMPT-${String(nextIdNumber).padStart(3, '0')}`;

  const newEntry = {
    id,
    title: options.title || 'Untitled Prompt',
    category: options.category || 'GENERAL',
    phase: options.phase || 'ACTIVE_CURRENT',
    status: options.status || 'IN_PROGRESS',
    executionDate: new Date().toISOString(),
    governingAgent: options.agent || '🏗️ engineering-backend-architect',
    promptText: options.prompt || '',
    processTrace: options.process ? options.process.split(';') : ['Initial prompt registration'],
    impactedFiles: options.files ? options.files.split(';') : [],
    verificationProof: options.proof || 'Pending verification'
  };

  data.prompts.push(newEntry);
  data.lastUpdated = new Date().toISOString();
  saveRegistry(data);

  console.log(`✅ Successfully added prompt [${id}]: "${newEntry.title}"`);
  syncDocumentation();
}

// CLI Argument Routing
const command = process.argv[2] || 'list';

switch (command) {
  case 'list':
    listPrompts();
    break;
  case 'stats':
    showStats();
    break;
  case 'sync-doc':
  case 'doc':
    syncDocumentation();
    break;
  case 'add':
    // Simple key-value argument parser
    const args = process.argv.slice(3);
    const opts = {};
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i].replace(/^--/, '');
      opts[key] = args[i + 1];
    }
    addPrompt(opts);
    break;
  default:
    console.log(`Unknown command: ${command}. Available commands: list, stats, sync-doc, add`);
}
