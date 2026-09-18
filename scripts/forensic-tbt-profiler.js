/**
 * Principal Chrome Performance & TBT Forensic Profiler
 * Integrates PerformanceObserver, V8 Profiler, and Chrome DevTools Protocol (CDP)
 * 
 * @agent testing-performance-benchmarker
 * @agent engineering-frontend-developer
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(__dirname, '../apps/node_modules/@playwright/test'));

async function runForensicTBT(url = 'http://localhost:3000/') {
  console.log(`\n🔍 Starting Chrome DevTools Protocol Forensic TBT Investigation on: ${url}`);
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--js-flags=--expose-gc',
      '--enable-precise-memory-info'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  // Enable CDP domains
  await cdp.send('Performance.enable');
  await cdp.send('Network.enable');
  await cdp.send('Profiler.enable');

  const scripts = new Map();
  let totalTransferBytes = 0;
  let jsTransferBytes = 0;

  cdp.on('Network.responseReceived', (event) => {
    const { url, mimeType, encodedDataLength } = event.response;
    if (event.type === 'Script' || mimeType.includes('javascript')) {
      scripts.set(url, {
        url,
        encodedDataLength,
        status: event.response.status
      });
      jsTransferBytes += encodedDataLength || 0;
    }
    totalTransferBytes += encodedDataLength || 0;
  });

  // Inject in-browser Long Task & Web Vitals Telemetry
  await page.addInitScript(() => {
    window.__tbtAudit = {
      fcp: null,
      lcp: null,
      longTasks: [],
      jsErrors: [],
      hydrationEvents: []
    };

    try {
      // Paint observer (FCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.__tbtAudit.fcp = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });

      // Long Tasks observer (>50ms)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__tbtAudit.longTasks.push({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            blockingTime: Math.max(0, entry.duration - 50),
            attribution: (entry.attribution || []).map(a => ({
              name: a.name,
              entryType: a.entryType,
              containerType: a.containerType,
              containerSrc: a.containerSrc,
              containerId: a.containerId,
              containerName: a.containerName
            }))
          });
        }
      }).observe({ entryTypes: ['longtask'] });

    } catch (e) {
      window.__tbtAudit.jsErrors.push(String(e));
    }
  });

  // Start V8 CPU Profiler
  await cdp.send('Profiler.start');

  const navStart = Date.now();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  const navEnd = Date.now();

  // Wait 2 seconds of quiet time to capture late hydration / timers
  await page.waitForTimeout(2000);

  // Stop V8 CPU Profiler
  const { profile } = await cdp.send('Profiler.stop');

  // Collect Performance metrics
  const cdpMetrics = await cdp.send('Performance.getMetrics');
  const metricMap = {};
  for (const m of cdpMetrics.metrics) {
    metricMap[m.name] = m.value;
  }

  // Get In-Page audit results
  const inPageData = await page.evaluate(() => window.__tbtAudit);
  const timing = await page.evaluate(() => {
    const t = performance.getEntriesByType('navigation')[0];
    return {
      ttfb: t ? t.responseStart - t.requestStart : 0,
      domInteractive: t ? t.domInteractive : 0,
      domContentLoaded: t ? t.domContentLoadedEventEnd : 0,
      duration: t ? t.duration : 0
    };
  });

  await browser.close();

  // Process Long Tasks & Calculate TBT
  const fcp = inPageData.fcp || timing.domInteractive;
  const longTasks = inPageData.longTasks || [];
  
  // TBT is sum of blocking time (>50ms) for tasks between FCP and end of observation
  let totalBlockingTime = 0;
  let maxPotentialFid = 0;

  longTasks.forEach(task => {
    if (task.duration > maxPotentialFid) {
      maxPotentialFid = task.duration;
    }
    // Only count if it ends after FCP
    if (task.startTime + task.duration >= fcp) {
      totalBlockingTime += task.blockingTime;
    }
  });

  // Process V8 Profile for Top CPU Functions
  const topFunctions = [];
  const nodeMap = new Map();
  profile.nodes.forEach(n => nodeMap.set(n.id, n));

  const functionCost = new Map();
  profile.samples.forEach((nodeId, idx) => {
    const timeDelta = profile.timeDeltas[idx] || 0;
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const key = `${node.callFrame.functionName || '(anonymous)'} @ ${node.callFrame.url || 'internal'}:${node.callFrame.lineNumber}`;
    const current = functionCost.get(key) || {
      name: node.callFrame.functionName || '(anonymous)',
      url: node.callFrame.url || 'internal',
      line: node.callFrame.lineNumber,
      hitCount: 0,
      cpuTimeUs: 0
    };
    current.hitCount++;
    current.cpuTimeUs += timeDelta;
    functionCost.set(key, current);
  });

  const sortedFunctions = [...functionCost.values()]
    .sort((a, b) => b.cpuTimeUs - a.cpuTimeUs)
    .slice(0, 15)
    .map(f => ({
      ...f,
      cpuTimeMs: Math.round(f.cpuTimeUs / 1000 * 100) / 100
    }));

  const report = {
    timestamp: new Date().toISOString(),
    url,
    totalBlockingTimeMs: Math.round(totalBlockingTime),
    maxPotentialFidMs: Math.round(maxPotentialFid),
    fcpMs: Math.round(fcp),
    longTaskCount: longTasks.length,
    longTasks: longTasks.sort((a, b) => b.duration - a.duration).map(t => ({
      durationMs: Math.round(t.duration),
      blockingTimeMs: Math.round(t.blockingTime),
      startTimeMs: Math.round(t.startTime),
      containerSrc: t.attribution[0]?.containerSrc || 'document'
    })),
    mainThreadWork: {
      scriptDurationSec: metricMap.ScriptDuration ? parseFloat(metricMap.ScriptDuration.toFixed(3)) : 0,
      taskDurationSec: metricMap.TaskDuration ? parseFloat(metricMap.TaskDuration.toFixed(3)) : 0,
      layoutDurationSec: metricMap.LayoutDuration ? parseFloat(metricMap.LayoutDuration.toFixed(3)) : 0,
      recalcStyleDurationSec: metricMap.RecalcStyleDuration ? parseFloat(metricMap.RecalcStyleDuration.toFixed(3)) : 0,
      jsHeapUsedMB: Math.round((metricMap.JSHeapUsedSize || 0) / 1024 / 1024 * 100) / 100
    },
    network: {
      totalTransferKiB: Math.round(totalTransferBytes / 1024 * 10) / 10,
      jsTransferKiB: Math.round(jsTransferBytes / 1024 * 10) / 10,
      scriptCount: scripts.size
    },
    topCpuFunctions: sortedFunctions
  };

  console.log('\n===============================================================');
  console.log('⚡ FORENSIC TOTAL BLOCKING TIME (TBT) REPORT');
  console.log('===============================================================');
  console.log(`  Total Blocking Time (TBT)  : ${report.totalBlockingTimeMs} ms  (Target: < 200 ms, Preferred: < 150 ms)`);
  console.log(`  Max Potential FID          : ${report.maxPotentialFidMs} ms`);
  console.log(`  First Contentful Paint     : ${report.fcpMs} ms`);
  console.log(`  Long Tasks Count (>50ms)   : ${report.longTaskCount}`);
  console.log('---------------------------------------------------------------');
  console.log('  Top Long Tasks:');
  report.longTasks.slice(0, 10).forEach((t, i) => {
    console.log(`    #${i + 1}: ${t.durationMs} ms (blocking: ${t.blockingTimeMs} ms) @ ${t.startTimeMs} ms [${t.containerSrc}]`);
  });
  console.log('---------------------------------------------------------------');
  console.log(`  Script Execution Time      : ${report.mainThreadWork.scriptDurationSec} s`);
  console.log(`  Total Task Duration        : ${report.mainThreadWork.taskDurationSec} s`);
  console.log(`  JavaScript Transfer        : ${report.network.jsTransferKiB} KiB across ${report.network.scriptCount} scripts`);
  console.log('---------------------------------------------------------------');
  console.log('  Top V8 CPU Functions:');
  report.topCpuFunctions.slice(0, 8).forEach((f, i) => {
    const filename = f.url.split('/').pop() || f.url;
    console.log(`    #${i + 1}: ${f.name} (${f.cpuTimeMs} ms) - ${filename}:${f.line}`);
  });
  console.log('===============================================================\n');

  return report;
}

if (require.main === module) {
  runForensicTBT().catch(console.error);
}

module.exports = { runForensicTBT };
