/**
 * Automated Production Storefront Performance & Web Vitals Benchmarking Engine
 * Powered by Chrome DevTools Protocol (CDP) & Playwright
 * 
 * @agent testing-performance-benchmarker
 * @agent testing-accessibility-auditor
 * @agent engineering-frontend-developer
 */

const path = require('path');
const { chromium } = require(path.join(__dirname, '../apps/node_modules/@playwright/test'));
const fs = require('fs');

async function runAudit() {
  console.log('🚀 Launching Headless Chromium with Chrome DevTools Protocol...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('Performance.enable');
  await cdp.send('Network.enable');

  const resources = [];
  let totalTransferBytes = 0;
  let jsTransferBytes = 0;
  let cssTransferBytes = 0;
  let imgTransferBytes = 0;
  let fontTransferBytes = 0;

  cdp.on('Network.loadingFinished', (event) => {
    totalTransferBytes += event.encodedDataLength || 0;
  });

  cdp.on('Network.responseReceived', (event) => {
    const res = event.response;
    const type = event.type;
    const url = res.url;
    resources.push({ url, type, status: res.status, mimeType: res.mimeType, size: res.encodedDataLength });
    if (type === 'Script') jsTransferBytes += res.encodedDataLength || 0;
    if (type === 'Stylesheet') cssTransferBytes += res.encodedDataLength || 0;
    if (type === 'Image') imgTransferBytes += res.encodedDataLength || 0;
    if (type === 'Font') fontTransferBytes += res.encodedDataLength || 0;
  });

  console.log('📡 Navigating to http://localhost:3000/ and capturing Web Vitals...');
  
  // Inject web vitals listener before navigate
  await page.addInitScript(() => {
    window.__webVitals = {
      fcp: null,
      lcp: null,
      cls: 0,
      entries: []
    };

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.__webVitals.fcp = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });

      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          window.__webVitals.lcp = entry.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__webVitals.cls += entry.value;
            window.__webVitals.entries.push({
              value: entry.value,
              sources: (entry.sources || []).map(s => ({
                node: s.node ? s.node.nodeName + '.' + (s.node.className || '') : 'unknown',
                currentRect: s.currentRect,
                previousRect: s.previousRect
              }))
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error(e);
    }
  });

  const navStart = Date.now();
  const response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  const navEnd = Date.now();

  console.log(`Page loaded with HTTP status ${response.status()} in ${navEnd - navStart}ms`);

  // Wait 1.5s for any idle layout shifts or late paints
  await page.waitForTimeout(1500);

  // Extract metrics from browser runtime
  const metrics = await cdp.send('Performance.getMetrics');
  const metricMap = {};
  for (const m of metrics.metrics) {
    metricMap[m.name] = m.value;
  }

  const clientVitals = await page.evaluate(() => window.__webVitals);
  const timing = await page.evaluate(() => {
    const t = performance.getEntriesByType('navigation')[0];
    return {
      ttfb: t ? t.responseStart - t.requestStart : 0,
      domInteractive: t ? t.domInteractive : 0,
      domContentLoaded: t ? t.domContentLoadedEventEnd : 0,
      loadEvent: t ? t.loadEventEnd : 0,
      duration: t ? t.duration : 0,
    };
  });

  // Verify key UI elements exist
  const heroHeading = await page.$eval('h1', el => el.innerText).catch(() => 'NOT_FOUND');
  const productCards = await page.$$eval('[data-component="product-card"], .group\\/card, article', els => els.length).catch(() => 0);
  const navLinks = await page.$$eval('nav a', els => els.length).catch(() => 0);
  const copilotButton = await page.$('button[aria-label*="AI Copilot"]');

  // Verify Contrast / Accessibility
  const a11yAudit = await page.evaluate(() => {
    const issues = [];
    // Check images for alt
    document.querySelectorAll('img').forEach((img, i) => {
      if (!img.hasAttribute('alt') && !img.hasAttribute('aria-hidden')) {
        issues.push(`Image without alt: ${img.src}`);
      }
    });
    // Check buttons for accessible name
    document.querySelectorAll('button').forEach((btn, i) => {
      const text = btn.innerText.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      if (!text && !ariaLabel) {
        issues.push(`Button without text or aria-label: ${btn.outerHTML.slice(0, 50)}`);
      }
    });
    return { issuesCount: issues.length, issues };
  });

  await browser.close();

  const results = {
    timestamp: new Date().toISOString(),
    status: response.status(),
    webVitals: {
      fcpMs: clientVitals.fcp ? Math.round(clientVitals.fcp) : Math.round(timing.domInteractive),
      lcpMs: clientVitals.lcp ? Math.round(clientVitals.lcp) : Math.round(timing.domContentLoaded),
      cls: parseFloat(clientVitals.cls.toFixed(4)),
      ttfbMs: Math.round(timing.ttfb),
      domContentLoadedMs: Math.round(timing.domContentLoaded),
      loadEventMs: Math.round(timing.loadEvent),
      totalPageDurationMs: Math.round(timing.duration)
    },
    cdpMetrics: {
      jsHeapUsedSizeMB: Math.round((metricMap.JSHeapUsedSize || 0) / 1024 / 1024 * 100) / 100,
      jsHeapTotalSizeMB: Math.round((metricMap.JSHeapTotalSize || 0) / 1024 / 1024 * 100) / 100,
      layoutCount: metricMap.LayoutCount || 0,
      recalcStyleCount: metricMap.RecalcStyleCount || 0,
      taskDurationSeconds: metricMap.TaskDuration ? parseFloat(metricMap.TaskDuration.toFixed(3)) : 0,
      scriptDurationSeconds: metricMap.ScriptDuration ? parseFloat(metricMap.ScriptDuration.toFixed(3)) : 0
    },
    network: {
      totalTransferKiB: Math.round(totalTransferBytes / 1024 * 10) / 10,
      jsTransferKiB: Math.round(jsTransferBytes / 1024 * 10) / 10,
      cssTransferKiB: Math.round(cssTransferBytes / 1024 * 10) / 10,
      fontTransferKiB: Math.round(fontTransferBytes / 1024 * 10) / 10,
      imgTransferKiB: Math.round(imgTransferBytes / 1024 * 10) / 10,
      totalRequests: resources.length
    },
    domHealth: {
      heroHeading: heroHeading.replace(/\n/g, ' '),
      navLinksCount: navLinks,
      copilotButtonFound: !!copilotButton,
      a11yIssuesCount: a11yAudit.issuesCount
    }
  };

  console.log('\n===============================================================');
  console.log('🎯 PRODUCTION CORE WEB VITALS & PERFORMANCE AUDIT REPORT');
  console.log('===============================================================');
  console.log(`  First Contentful Paint (FCP) : ${results.webVitals.fcpMs} ms  (Target: < 1200ms)`);
  console.log(`  Largest Contentful Paint (LCP): ${results.webVitals.lcpMs} ms  (Target: < 1800ms)`);
  console.log(`  Cumulative Layout Shift (CLS) : ${results.webVitals.cls}     (Target: < 0.05, Perfect: 0.00)`);
  if (clientVitals.entries && clientVitals.entries.length > 0) {
    console.log('  Layout Shift Culprits:');
    clientVitals.entries.forEach((e, idx) => {
      console.log(`    [Shift #${idx + 1}] value: ${e.value.toFixed(4)}`);
      (e.sources || []).forEach(s => {
        console.log(`      Node: ${s.node}`);
        if (s.previousRect && s.currentRect) {
          console.log(`      Movement: y ${s.previousRect.y} -> ${s.currentRect.y}`);
        }
      });
    });
  }
  console.log(`  Time to First Byte (TTFB)     : ${results.webVitals.ttfbMs} ms   (Target: < 200ms)`);
  console.log(`  DOM Content Loaded (DCL)      : ${results.webVitals.domContentLoadedMs} ms`);
  console.log(`  Total Page Load Duration      : ${results.webVitals.loadEventMs} ms`);
  console.log('---------------------------------------------------------------');
  console.log(`  Total Network Transfer        : ${results.network.totalTransferKiB} KiB (Baseline was 1,160 KiB)`);
  console.log(`  JavaScript Transfer           : ${results.network.jsTransferKiB} KiB (Baseline was 1,040 KiB)`);
  console.log(`  CSS Transfer                  : ${results.network.cssTransferKiB} KiB`);
  console.log(`  Script Execution Time         : ${results.cdpMetrics.scriptDurationSeconds} s (Baseline was 5.26s)`);
  console.log(`  JS Heap Memory                : ${results.cdpMetrics.jsHeapUsedSizeMB} MB`);
  console.log(`  Accessibility Audit Violations: ${results.domHealth.a11yIssuesCount}`);
  console.log('===============================================================\n');

  const outDir = path.resolve(__dirname, '../../docs/performance');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'production-audit-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Wrote complete audit results to: ${outPath}`);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
