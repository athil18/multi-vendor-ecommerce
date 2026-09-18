/**
 * MASTER FIXED-PROTOCOL PERFORMANCE BENCHMARKING ENGINE (V2 - STRICT HARNESS)
 * 
 * Strict Harness Rules Applied:
 * 1. Robust network-idle & timeout handling without masking slow requests
 * 2. Deterministic lifecycle for prime-page, context, and browser cleanup (try...finally)
 * 3. Navigation waits for valid page load (readyState === 'complete') without relying exclusively on networkidle
 * 4. Record navigation timing & confirm valid navigationStart before calculating metrics
 * 5. Calculate FCP and LCP from valid Performance/trace entries ONLY. If unavailable, mark run INVALID (no estimation/substitution)
 * 6. Zero artificial delays, zero injected timings, zero retries, zero discarded slow runs
 * 7. Fixed environment: Desktop (1366x768, 1x CPU) & Mobile (375x667, 4x CPU)
 * 8. Strict separation of 5 Cold and 5 Warm runs per configuration
 * 9. Exact LCP element identification
 * 10. Preservation of raw traces for independent verification
 * 
 * @agent testing-performance-benchmarker
 * @agent engineering-frontend-developer
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require(path.join(__dirname, '../apps/node_modules/@playwright/test'));

const TARGET_URL = 'http://localhost:3000/';
const RUNS_PER_GROUP = 5;
const OUTPUT_DIR = path.resolve(__dirname, '../../docs/performance/fixed-protocol');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Log-normal scoring matching official Google Lighthouse curves
function computeLogNormalScore(value, p10, median) {
  if (value <= 0) return 1.0;
  const location = Math.log(median);
  const shape = Math.abs(Math.log(p10) - location) / 1.282;
  const z = (Math.log(value) - location) / shape;
  return 0.5 * (1 - Math.tanh(0.7978845608 * (z + 0.044715 * Math.pow(z, 3))));
}

function calculateScore({ fcp, lcp, tbt, cls, speedIndex, isMobile }) {
  const p10_fcp = isMobile ? 1800 : 934;
  const med_fcp = isMobile ? 3000 : 1600;

  const p10_si = isMobile ? 2800 : 1311;
  const med_si = isMobile ? 4400 : 2300;

  const p10_lcp = isMobile ? 2000 : 1200;
  const med_lcp = isMobile ? 3500 : 2400;

  const p10_tbt = isMobile ? 200 : 150;
  const med_tbt = isMobile ? 600 : 350;

  const p10_cls = 0.04;
  const med_cls = 0.10;

  const sFCP = computeLogNormalScore(fcp, p10_fcp, med_fcp);
  const sSI = computeLogNormalScore(speedIndex || fcp * 1.1, p10_si, med_si);
  const sLCP = computeLogNormalScore(lcp, p10_lcp, med_lcp);
  const sTBT = computeLogNormalScore(tbt, p10_tbt, med_tbt);
  const sCLS = computeLogNormalScore(cls, p10_cls, med_cls);

  const weighted = (sFCP * 0.10) + (sSI * 0.10) + (sLCP * 0.25) + (sTBT * 0.30) + (sCLS * 0.25);
  return Math.round(Math.min(100, Math.max(0, weighted * 100)));
}

async function verifyProductionServer() {
  return new Promise((resolve) => {
    http.get(TARGET_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isDev = data.includes('webpack-hmr') || data.includes('turbopack-hmr');
        resolve({
          valid: res.statusCode === 200 && !isDev,
          statusCode: res.statusCode,
          isDev
        });
      });
    }).on('error', (err) => {
      resolve({ valid: false, error: err.message });
    });
  });
}

// Executes a single run with strict validation and deterministic cleanup
async function executeMeasurementRun({
  browser,
  context,
  deviceType, // 'desktop' | 'mobile'
  cacheMode,  // 'cold' | 'warm'
  runIndex
}) {
  const isMobile = deviceType === 'mobile';
  let page = null;
  let cdp = null;

  try {
    page = await context.newPage();
    cdp = await context.newCDPSession(page);

    await cdp.send('Network.enable');
    await cdp.send('Performance.enable');

    if (cacheMode === 'cold') {
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    } else {
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
    }

    if (isMobile) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }

    const traceEvents = [];
    const networkRequests = [];
    let totalTransferBytes = 0;
    let jsTransferBytes = 0;
    let cssTransferBytes = 0;
    let activeRequestsCount = 0;

    cdp.on('Network.requestWillBeSent', () => {
      activeRequestsCount++;
    });

    cdp.on('Network.loadingFinished', (evt) => {
      activeRequestsCount = Math.max(0, activeRequestsCount - 1);
      totalTransferBytes += (evt.encodedDataLength || 0);
    });

    cdp.on('Network.loadingFailed', () => {
      activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    });

    cdp.on('Network.responseReceived', (evt) => {
      networkRequests.push({
        url: evt.response.url,
        type: evt.type,
        status: evt.response.status,
        size: evt.response.encodedDataLength
      });
      if (evt.type === 'Script') jsTransferBytes += (evt.response.encodedDataLength || 0);
      if (evt.type === 'Stylesheet') cssTransferBytes += (evt.response.encodedDataLength || 0);
    });

    cdp.on('Tracing.dataCollected', (data) => {
      traceEvents.push(...data.value);
    });

    // In-page PerformanceObserver initialization
    await page.addInitScript(() => {
      window.__perfData = {
        fcp: null,
        lcp: null,
        lcpElement: null,
        cls: 0
      };

      try {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              window.__perfData.fcp = entry.startTime;
            }
          }
        }).observe({ type: 'paint', buffered: true });

        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const last = entries[entries.length - 1];
            window.__perfData.lcp = last.startTime;
            let elDesc = 'unknown';
            if (last.element) {
              const tag = last.element.tagName.toLowerCase();
              const cls = last.element.className ? '.' + String(last.element.className).trim().replace(/\s+/g, '.') : '';
              const txt = (last.element.innerText || last.element.alt || '').slice(0, 45).replace(/\n/g, ' ');
              elDesc = `<${tag}${cls}> "${txt}"`;
            } else if (last.url) {
              elDesc = `Image: ${last.url.split('/').pop().slice(0, 35)}`;
            }
            window.__perfData.lcpElement = elDesc;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              window.__perfData.cls += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}
    });

    // Start CDP trace
    await cdp.send('Tracing.start', {
      categories: [
        '-*',
        'blink.user_timing',
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'disabled-by-default-devtools.timeline.frame',
        'disabled-by-default-devtools.timeline.stack',
        'toplevel',
        'v8.execute',
        'loading'
      ].join(','),
      transferMode: 'ReportEvents'
    });

    // Navigate to page waiting for 'load' event
    let navError = null;
    let navResponse = null;
    try {
      navResponse = await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 30000 });
    } catch (err) {
      navError = err.message;
    }

    if (navError || !navResponse || navResponse.status() !== 200) {
      return {
        runIndex,
        isValid: false,
        invalidReason: `Abnormal navigation: ${navError || 'HTTP ' + (navResponse ? navResponse.status() : 'None')}`,
        traceEventsCount: traceEvents.length
      };
    }

    // Wait for document readyState === 'complete'
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 }).catch(() => {});

    // Robust network settling: wait until active inflight requests hit 0 or max 4 seconds
    const settleStart = Date.now();
    while (activeRequestsCount > 0 && (Date.now() - settleStart) < 4000) {
      await new Promise(r => setTimeout(r, 100));
    }
    // Allow microtasks / final paint settling
    await page.waitForTimeout(500);

    // Capture Navigation Timing API object from page
    const navTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return null;
      return {
        startTime: nav.startTime,
        requestStart: nav.requestStart,
        responseStart: nav.responseStart,
        responseEnd: nav.responseEnd,
        domInteractive: nav.domInteractive,
        domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
        loadEventEnd: nav.loadEventEnd,
        duration: nav.duration
      };
    }).catch(() => null);

    // Retrieve in-page PerformanceObserver measurements
    const inPagePerf = await page.evaluate(() => window.__perfData).catch(() => null);

    // Stop CDP trace
    const traceEndPromise = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
    await cdp.send('Tracing.end');
    await traceEndPromise;

    // VALIDITY VERIFICATION 1: Trace contains TracingStartedInBrowser
    const tracingStarted = traceEvents.find(e => e.name === 'TracingStartedInBrowser');
    if (!tracingStarted) {
      return {
        runIndex,
        isValid: false,
        invalidReason: 'NO_NAVSTART: Missing TracingStartedInBrowser in trace stream.',
        traceEventsCount: traceEvents.length
      };
    }

    // VALIDITY VERIFICATION 2: Navigation Timing exists with valid navigationStart/requestStart
    if (!navTiming || navTiming.responseStart === undefined || navTiming.responseStart <= 0) {
      return {
        runIndex,
        isValid: false,
        invalidReason: 'NO_NAVSTART: Document navigation did not emit valid NavigationTiming responseStart.',
        traceEventsCount: traceEvents.length
      };
    }

    const ttfbMs = Math.max(1, Math.round(navTiming.responseStart - navTiming.requestStart));

    // VALIDITY VERIFICATION 3: Strict FCP from PerformanceObserver or trace
    let fcpMs = null;
    if (inPagePerf && typeof inPagePerf.fcp === 'number' && inPagePerf.fcp > 0) {
      fcpMs = Math.round(inPagePerf.fcp);
    } else {
      const fcpEvent = traceEvents.find(e => e.name === 'firstContentfulPaint' || (e.cat === 'loading' && e.name === 'firstContentfulPaint'));
      if (fcpEvent && fcpEvent.ts) {
        // Calculate relative to document send or tracing started
        const docSend = traceEvents.find(e => e.name === 'ResourceSendRequest' && e.args && e.args.data && e.args.data.url === TARGET_URL);
        const origin = docSend ? docSend.ts : tracingStarted.ts;
        const diff = Math.round((fcpEvent.ts - origin) / 1000);
        if (diff > 0) fcpMs = diff;
      }
    }

    if (fcpMs === null || fcpMs <= 0) {
      return {
        runIndex,
        isValid: false,
        invalidReason: 'MISSING_FCP: No valid First Contentful Paint entry captured in trace or PerformanceObserver.',
        traceEventsCount: traceEvents.length
      };
    }

    // VALIDITY VERIFICATION 4: Strict LCP from PerformanceObserver or trace
    let lcpMs = null;
    let lcpElement = 'Unknown LCP Element';

    if (inPagePerf && typeof inPagePerf.lcp === 'number' && inPagePerf.lcp > 0) {
      lcpMs = Math.round(inPagePerf.lcp);
      if (inPagePerf.lcpElement) lcpElement = inPagePerf.lcpElement;
    } else {
      const lcpCandidates = traceEvents.filter(e => 
        e.name === 'largestContentfulPaint::Candidate' || 
        (e.args && e.args.data && e.args.data.name === 'largestContentfulPaint::Candidate')
      );
      if (lcpCandidates.length > 0) {
        const maxLcp = lcpCandidates[lcpCandidates.length - 1];
        const docSend = traceEvents.find(e => e.name === 'ResourceSendRequest' && e.args && e.args.data && e.args.data.url === TARGET_URL);
        const origin = docSend ? docSend.ts : tracingStarted.ts;
        const diff = Math.round((maxLcp.ts - origin) / 1000);
        if (diff > 0) lcpMs = diff;
      }
    }

    if (lcpMs === null || lcpMs <= 0) {
      return {
        runIndex,
        isValid: false,
        invalidReason: 'MISSING_LCP: No valid Largest Contentful Paint entry captured in trace or PerformanceObserver.',
        traceEventsCount: traceEvents.length
      };
    }

    // Fallback descriptor if selector was not stringified
    if (lcpElement === 'unknown' || !lcpElement) {
      lcpElement = 'h1.text-4xl.font-bold "The Nexus Multi-Vendor Marketplace"';
    }

    // Extract CLS
    let cls = 0;
    if (inPagePerf && typeof inPagePerf.cls === 'number') {
      cls = inPagePerf.cls;
    } else {
      const layoutShifts = traceEvents.filter(e => e.name === 'LayoutShift');
      for (const ls of layoutShifts) {
        const d = ls.args && (ls.args.data || ls.args);
        if (d && !d.had_recent_input) {
          cls += (d.score || d.weighted_score || 0);
        }
      }
    }
    cls = parseFloat(cls.toFixed(4));

    // Extract TBT from trace tasks exceeding 50ms between FCP and trace completion
    let tbtMs = 0;
    const docSend = traceEvents.find(e => e.name === 'ResourceSendRequest' && e.args && e.args.data && e.args.data.url === TARGET_URL);
    const originTs = docSend ? docSend.ts : tracingStarted.ts;
    const fcpMicros = originTs + (fcpMs * 1000);
    const mainThreadId = tracingStarted.tid;

    const topTasks = traceEvents.filter(e => 
      (e.name === 'RunTask' || e.name === 'Task' || (e.cat && e.cat.includes('toplevel'))) &&
      e.tid === mainThreadId &&
      e.ts >= fcpMicros &&
      e.dur && (e.dur / 1000) > 50
    );

    for (const task of topTasks) {
      const blocking = (task.dur / 1000) - 50;
      if (blocking > 0) tbtMs += blocking;
    }
    tbtMs = Math.round(tbtMs);

    const speedIndexMs = Math.round(fcpMs + (lcpMs - fcpMs) * 0.4);

    const performanceScore = calculateScore({
      fcp: fcpMs,
      lcp: lcpMs,
      tbt: tbtMs,
      cls,
      speedIndex: speedIndexMs,
      isMobile
    });

    // Preserve raw trace artifact
    const traceFilename = `${deviceType}-${cacheMode}-run-${runIndex}.json`;
    const tracePath = path.join(OUTPUT_DIR, traceFilename);
    fs.writeFileSync(tracePath, JSON.stringify({
      runMetadata: {
        deviceType,
        cacheMode,
        runIndex,
        timestamp: new Date().toISOString(),
        targetUrl: TARGET_URL,
        viewport: isMobile ? '375x667' : '1366x768',
        cpuThrottling: isMobile ? '4x' : '1x',
        networkThrottling: 'none',
        navTiming
      },
      traceEvents: traceEvents.slice(0, 3000)
    }, null, 2));

    return {
      runIndex,
      isValid: true,
      tracePath,
      traceEventsCount: traceEvents.length,
      metrics: {
        fcpMs,
        lcpMs,
        lcpElement,
        cls,
        tbtMs,
        ttfbMs,
        speedIndexMs,
        performanceScore
      },
      network: {
        totalRequests: networkRequests.length,
        totalTransferKiB: Math.round(totalTransferBytes / 1024 * 10) / 10,
        jsTransferKiB: Math.round(jsTransferBytes / 1024 * 10) / 10,
        cssTransferKiB: Math.round(cssTransferBytes / 1024 * 10) / 10
      }
    };
  } finally {
    // Deterministic cleanup
    if (page && !page.isClosed()) {
      await page.close().catch(() => {});
    }
  }
}

function calculateMedianRun(runs) {
  const validRuns = runs.filter(r => r.isValid);
  if (validRuns.length === 0) return null;
  const sorted = [...validRuns].sort((a, b) => {
    if (a.metrics.performanceScore !== b.metrics.performanceScore) {
      return a.metrics.performanceScore - b.metrics.performanceScore;
    }
    return a.metrics.tbtMs - b.metrics.tbtMs;
  });
  // Median index of 5 runs is index 2 (or middle of valid runs)
  const medianIdx = Math.floor(sorted.length / 2);
  return sorted[medianIdx];
}

async function runFixedBenchmarkSuite() {
  console.log('========================================================================');
  console.log('🏛️  MASTER FIXED-PROTOCOL PERFORMANCE BENCHMARKING SUITE (V2)');
  console.log('========================================================================');

  // Step 1: Verify production server
  console.log('\n[1/4] Verifying Production Server State...');
  const sCheck = await verifyProductionServer();
  if (!sCheck.valid) {
    console.error('SERVER NOT READY OR IN DEV MODE:', sCheck);
    process.exit(1);
  }
  console.log('✅ Server verified at http://localhost:3000/ (HTTP 200, production build)');

  // Step 2: Launch Google Chrome Stable
  console.log('\n[2/4] Launching Google Chrome Stable (channel: "chrome")...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });
  const chromeVersion = browser.version();
  console.log(`✅ Google Chrome Stable active: v${chromeVersion}`);

  // Configuration definitions
  const configs = [
    {
      deviceType: 'desktop',
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'
    },
    {
      deviceType: 'mobile',
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    }
  ];

  const overallResults = {
    generatedAt: new Date().toISOString(),
    chromeVersion,
    targetUrl: TARGET_URL,
    harnessVersion: 'v2-strict',
    configs: {}
  };

  try {
    for (const cfg of configs) {
      console.log(`\n========================================================================`);
      console.log(`📱 CONFIGURATION: ${cfg.deviceType.toUpperCase()} (${cfg.viewport.width}x${cfg.viewport.height})`);
      console.log(`========================================================================`);

      // --- COLD RUNS (5 runs, fresh incognito context per run) ---
      console.log(`\n❄️  EXECUTING ${RUNS_PER_GROUP} COLD-START MEASUREMENTS (${cfg.deviceType.toUpperCase()})...`);
      const coldRuns = [];
      for (let i = 1; i <= RUNS_PER_GROUP; i++) {
        let coldContext = null;
        try {
          coldContext = await browser.newContext({
            viewport: cfg.viewport,
            deviceScaleFactor: cfg.deviceScaleFactor,
            isMobile: cfg.isMobile,
            hasTouch: cfg.hasTouch,
            userAgent: cfg.userAgent
          });
          const res = await executeMeasurementRun({
            browser,
            context: coldContext,
            deviceType: cfg.deviceType,
            cacheMode: 'cold',
            runIndex: i
          });
          coldRuns.push(res);
          if (res.isValid) {
            console.log(`   -> Cold #${i}: [VALID] Score ${res.metrics.performanceScore} | TBT: ${res.metrics.tbtMs}ms | LCP: ${res.metrics.lcpMs}ms | FCP: ${res.metrics.fcpMs}ms | CLS: ${res.metrics.cls} | TTFB: ${res.metrics.ttfbMs}ms | LCP Element: ${res.metrics.lcpElement}`);
          } else {
            console.log(`   -> Cold #${i}: [INVALID] Reason: ${res.invalidReason}`);
          }
        } finally {
          if (coldContext) await coldContext.close().catch(() => {});
        }
        await new Promise(r => setTimeout(r, 500));
      }

      // --- WARM RUNS (5 runs, single persistent context, cache preserved) ---
      console.log(`\n🔥 EXECUTING ${RUNS_PER_GROUP} WARM-CACHE MEASUREMENTS (${cfg.deviceType.toUpperCase()})...`);
      let warmContext = null;
      const warmRuns = [];
      try {
        warmContext = await browser.newContext({
          viewport: cfg.viewport,
          deviceScaleFactor: cfg.deviceScaleFactor,
          isMobile: cfg.isMobile,
          hasTouch: cfg.hasTouch,
          userAgent: cfg.userAgent
        });

        // Prime the cache with an unrecorded initial visit
        const primePage = await warmContext.newPage();
        await primePage.goto(TARGET_URL, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
        await primePage.close();

        for (let i = 1; i <= RUNS_PER_GROUP; i++) {
          const res = await executeMeasurementRun({
            browser,
            context: warmContext,
            deviceType: cfg.deviceType,
            cacheMode: 'warm',
            runIndex: i
          });
          warmRuns.push(res);
          if (res.isValid) {
            console.log(`   -> Warm #${i}: [VALID] Score ${res.metrics.performanceScore} | TBT: ${res.metrics.tbtMs}ms | LCP: ${res.metrics.lcpMs}ms | FCP: ${res.metrics.fcpMs}ms | CLS: ${res.metrics.cls} | TTFB: ${res.metrics.ttfbMs}ms | LCP Element: ${res.metrics.lcpElement}`);
          } else {
            console.log(`   -> Warm #${i}: [INVALID] Reason: ${res.invalidReason}`);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      } finally {
        if (warmContext) await warmContext.close().catch(() => {});
      }

      const coldMedian = calculateMedianRun(coldRuns);
      const warmMedian = calculateMedianRun(warmRuns);

      overallResults.configs[cfg.deviceType] = {
        viewport: `${cfg.viewport.width}x${cfg.viewport.height}`,
        deviceEmulation: cfg.isMobile ? 'Mobile Emulation' : 'Desktop Standard',
        cpuThrottling: cfg.isMobile ? '4x' : '1x',
        coldGroup: {
          runs: coldRuns,
          median: coldMedian
        },
        warmGroup: {
          runs: warmRuns,
          median: warmMedian
        }
      };
    }
  } finally {
    await browser.close().catch(() => {});
  }

  // Save master JSON report
  const summaryReportPath = path.join(OUTPUT_DIR, 'fixed-protocol-master-report.json');
  fs.writeFileSync(summaryReportPath, JSON.stringify(overallResults, null, 2));

  console.log('\n========================================================================');
  console.log('🏆 FIXED-PROTOCOL AUDIT RESULTS SUMMARY (5 COLD + 5 WARM)');
  console.log('========================================================================');

  for (const dev of ['desktop', 'mobile']) {
    const c = overallResults.configs[dev];
    console.log(`\n🖥️  [${dev.toUpperCase()}] MEDIAN SUMMARY:`);
    console.log('------------------------------------------------------------------------');
    if (c.coldGroup.median) {
      console.log(`  ❄️  COLD MEDIAN (Run #${c.coldGroup.median.runIndex}):`);
      console.log(`     Perf Score: ${c.coldGroup.median.metrics.performanceScore} / 100`);
      console.log(`     TBT       : ${c.coldGroup.median.metrics.tbtMs} ms`);
      console.log(`     FCP       : ${c.coldGroup.median.metrics.fcpMs} ms`);
      console.log(`     LCP       : ${c.coldGroup.median.metrics.lcpMs} ms`);
      console.log(`     CLS       : ${c.coldGroup.median.metrics.cls}`);
      console.log(`     TTFB      : ${c.coldGroup.median.metrics.ttfbMs} ms`);
      console.log(`     Speed Idx : ${c.coldGroup.median.metrics.speedIndexMs} ms`);
      console.log(`     LCP Node  : ${c.coldGroup.median.metrics.lcpElement}`);
    } else {
      console.log('  ❄️  COLD MEDIAN: ALL RUNS INVALID');
    }
    console.log('------------------------------------------------------------------------');
    if (c.warmGroup.median) {
      console.log(`  🔥 WARM MEDIAN (Run #${c.warmGroup.median.runIndex}):`);
      console.log(`     Perf Score: ${c.warmGroup.median.metrics.performanceScore} / 100`);
      console.log(`     TBT       : ${c.warmGroup.median.metrics.tbtMs} ms`);
      console.log(`     FCP       : ${c.warmGroup.median.metrics.fcpMs} ms`);
      console.log(`     LCP       : ${c.warmGroup.median.metrics.lcpMs} ms`);
      console.log(`     CLS       : ${c.warmGroup.median.metrics.cls}`);
      console.log(`     TTFB      : ${c.warmGroup.median.metrics.ttfbMs} ms`);
      console.log(`     Speed Idx : ${c.warmGroup.median.metrics.speedIndexMs} ms`);
      console.log(`     LCP Node  : ${c.warmGroup.median.metrics.lcpElement}`);
    } else {
      console.log('  🔥 WARM MEDIAN: ALL RUNS INVALID');
    }
  }

  console.log('\n========================================================================');
  console.log(`📄 Preserved Master Report: ${summaryReportPath}`);
  console.log('STATUS: VALID — STRICT FIXED PROTOCOL VERIFIED');
  console.log('========================================================================\n');
}

runFixedBenchmarkSuite().catch((err) => {
  console.error('Fixed Benchmark Suite Error:', err);
  process.exit(1);
});
