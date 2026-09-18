import fs from 'fs';
import path from 'path';

/**
 * In-Code Technical SEO & Metadata Audit Tool
 * 
 * @agent marketing-seo-specialist
 * @agent 02-code-review-agent
 */
interface SeoIssue {
  file: string;
  level: 'ERROR' | 'WARN' | 'PASS';
  message: string;
}

const appDir = path.resolve(__dirname, '../src/app');
const issues: SeoIssue[] = [];

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['api', 'admin', 'seller'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(appDir, filePath);

  // Check 1: Root layout metadata
  if (relativePath === 'layout.tsx') {
    if (!content.includes('metadataBase')) {
      issues.push({ file: relativePath, level: 'WARN', message: 'Missing metadataBase in root layout metadata.' });
    } else {
      issues.push({ file: relativePath, level: 'PASS', message: 'metadataBase configured properly.' });
    }
    if (!content.includes('openGraph')) {
      issues.push({ file: relativePath, level: 'WARN', message: 'Missing OpenGraph metadata specification.' });
    } else {
      issues.push({ file: relativePath, level: 'PASS', message: 'OpenGraph metadata verified.' });
    }
    if (!content.includes('robots')) {
      issues.push({ file: relativePath, level: 'WARN', message: 'Missing robots metadata directive.' });
    } else {
      issues.push({ file: relativePath, level: 'PASS', message: 'Robots directives present.' });
    }
  }

  // Check 2: Image alt text
  if (content.includes('<img ') && !content.includes('alt=')) {
    issues.push({ file: relativePath, level: 'WARN', message: 'Raw <img> tag detected without alt text. Use Next.js <Image> with alt.' });
  }

  // Check 3: Structured Data JSON-LD
  if (relativePath.includes('products/[id]') && !content.includes('application/ld+json')) {
    issues.push({ file: relativePath, level: 'WARN', message: 'Product detail page is missing Schema.org JSON-LD structured data.' });
  }
}

console.log('🔍 Starting Codebase Technical SEO Audit...\n');
scanDirectory(appDir);

// Verify Sitemap & Robots exist
const sitemapExists = fs.existsSync(path.join(appDir, 'sitemap.ts'));
const robotsExists = fs.existsSync(path.join(appDir, 'robots.ts'));

issues.push({
  file: 'sitemap.ts',
  level: sitemapExists ? 'PASS' : 'ERROR',
  message: sitemapExists ? 'Dynamic sitemap handler active.' : 'Missing sitemap.ts handler.',
});

issues.push({
  file: 'robots.ts',
  level: robotsExists ? 'PASS' : 'ERROR',
  message: robotsExists ? 'Dynamic robots.ts handler active.' : 'Missing robots.ts handler.',
});

// Summary Reporting
let passCount = 0;
let warnCount = 0;
let errorCount = 0;

issues.forEach((i) => {
  const icon = i.level === 'PASS' ? '✅' : i.level === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} [${i.level}] ${i.file}: ${i.message}`);
  if (i.level === 'PASS') passCount++;
  if (i.level === 'WARN') warnCount++;
  if (i.level === 'ERROR') errorCount++;
});

console.log('\n------------------------------------------------------------');
console.log(`SEO Audit Summary: ${passCount} Passed, ${warnCount} Warnings, ${errorCount} Errors.`);
console.log('------------------------------------------------------------\n');
