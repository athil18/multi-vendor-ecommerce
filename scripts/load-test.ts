/**
 * Realistic Multi-Scenario HTTP Load Testing Engine
 * Evaluates throughput, latency percentiles, error rates, and concurrency bounds.
 * 
 * Usage: npx tsx scripts/load-test.ts
 */

import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';

interface LoadTestOptions {
  baseUrl: string;
  concurrency: number;
  durationSeconds: number;
  scenarios: Array<{
    name: string;
    path: string;
    method?: string;
    weight: number; // percentage of requests
  }>;
}

interface LatencyResult {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
}

interface LoadTestReport {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  durationSeconds: number;
  requestsPerSecond: number;
  statusCodes: Record<string, number>;
  latency: LatencyResult;
  scenarioBreakdown: Record<string, { requests: number; errors: number; avgLatencyMs: number }>;
}

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

function makeRequest(
  url: string,
  method: string = 'GET'
): Promise<{ statusCode: number; durationMs: number; error?: string }> {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;
    const agent = isHttps ? httpsAgent : httpAgent;

    const start = performance.now();
    const req = client.request(
      url,
      {
        method,
        agent,
        headers: {
          'Accept': 'application/json, text/html',
          'User-Agent': 'Nexus-LoadTester/1.0',
        },
      },
      (res) => {
        res.on('data', () => {}); // Consume body to release socket
        res.on('end', () => {
          const durationMs = performance.now() - start;
          resolve({ statusCode: res.statusCode || 0, durationMs });
        });
      }
    );

    req.on('error', (err) => {
      const durationMs = performance.now() - start;
      resolve({ statusCode: 0, durationMs, error: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy(new Error('REQUEST_TIMEOUT'));
    });

    req.end();
  });
}

export async function runLoadTest(options: LoadTestOptions): Promise<LoadTestReport> {
  const { baseUrl, concurrency, durationSeconds, scenarios } = options;
  const latencies: number[] = [];
  const statusCodes: Record<string, number> = {};
  const scenarioStats: Record<string, { requests: number; errors: number; totalMs: number }> = {};

  for (const s of scenarios) {
    scenarioStats[s.name] = { requests: 0, errors: 0, totalMs: 0 };
  }

  // Pre-calculate scenario selection pool based on weights
  const weightedPool: Array<{ name: string; path: string; method?: string }> = [];
  for (const s of scenarios) {
    for (let i = 0; i < s.weight; i++) {
      weightedPool.push(s);
    }
  }

  console.log(`\n===============================================================`);
  console.log(`🚀 INITIATING LOAD TEST SUITE: ${baseUrl}`);
  console.log(`Concurrency: ${concurrency} virtual users | Duration: ${durationSeconds}s`);
  console.log(`Scenarios: ${scenarios.map(s => `${s.name} (${s.weight}%)`).join(', ')}`);
  console.log(`===============================================================\n`);

  const startTime = performance.now();
  const endTime = startTime + durationSeconds * 1000;
  let activeWorkers = 0;
  let isRunning = true;

  return new Promise((resolve) => {
    async function worker() {
      activeWorkers++;
      while (performance.now() < endTime && isRunning) {
        const scenario = weightedPool[Math.floor(Math.random() * weightedPool.length)];
        const url = `${baseUrl}${scenario.path}`;

        const res = await makeRequest(url, scenario.method || 'GET');

        latencies.push(res.durationMs);
        const codeKey = String(res.statusCode);
        statusCodes[codeKey] = (statusCodes[codeKey] || 0) + 1;

        const stat = scenarioStats[scenario.name];
        stat.requests++;
        stat.totalMs += res.durationMs;
        if (res.statusCode >= 500 || res.statusCode === 0) {
          stat.errors++;
        }
      }
      activeWorkers--;
      if (activeWorkers === 0) {
        finish();
      }
    }

    // Launch concurrent virtual users
    for (let i = 0; i < concurrency; i++) {
      worker();
    }

    function finish() {
      const actualDuration = (performance.now() - startTime) / 1000;
      latencies.sort((a, b) => a - b);

      const totalRequests = latencies.length;
      const getPercentile = (p: number) => {
        if (totalRequests === 0) return 0;
        const index = Math.min(Math.floor((p / 100) * totalRequests), totalRequests - 1);
        return Math.round(latencies[index] * 100) / 100;
      };

      const sum = latencies.reduce((acc, val) => acc + val, 0);
      const avg = totalRequests > 0 ? Math.round((sum / totalRequests) * 100) / 100 : 0;
      const min = totalRequests > 0 ? Math.round(latencies[0] * 100) / 100 : 0;
      const max = totalRequests > 0 ? Math.round(latencies[totalRequests - 1] * 100) / 100 : 0;

      let successCount = 0;
      let rateLimitCount = 0;
      let errorCount = 0;

      for (const [code, count] of Object.entries(statusCodes)) {
        const num = parseInt(code, 10);
        if (num >= 200 && num < 400) successCount += count;
        else if (num === 429) rateLimitCount += count;
        else errorCount += count;
      }

      const scenarioBreakdown: Record<string, { requests: number; errors: number; avgLatencyMs: number }> = {};
      for (const [name, s] of Object.entries(scenarioStats)) {
        scenarioBreakdown[name] = {
          requests: s.requests,
          errors: s.errors,
          avgLatencyMs: s.requests > 0 ? Math.round((s.totalMs / s.requests) * 100) / 100 : 0,
        };
      }

      const report: LoadTestReport = {
        totalRequests,
        successfulRequests: successCount,
        failedRequests: errorCount,
        rateLimitedRequests: rateLimitCount,
        durationSeconds: Math.round(actualDuration * 10) / 10,
        requestsPerSecond: Math.round((totalRequests / actualDuration) * 10) / 10,
        statusCodes,
        latency: {
          p50: getPercentile(50),
          p90: getPercentile(90),
          p95: getPercentile(95),
          p99: getPercentile(99),
          min,
          max,
          avg,
        },
        scenarioBreakdown,
      };

      console.log(`\n===============================================================`);
      console.log(`📊 LOAD TEST RESULTS SUMMARY`);
      console.log(`===============================================================`);
      console.log(`Total Requests:         ${report.totalRequests}`);
      console.log(`Duration:               ${report.durationSeconds}s`);
      console.log(`Throughput:             ${report.requestsPerSecond} req/s`);
      console.log(`Success Rate:           ${Math.round((report.successfulRequests / (report.totalRequests || 1)) * 1000) / 10}%`);
      console.log(`Rate Limited (429):     ${report.rateLimitedRequests}`);
      console.log(`Server Errors (5xx/Err):${report.failedRequests}`);
      console.log(`\nLatency Percentiles:`);
      console.log(`  Min:                  ${report.latency.min} ms`);
      console.log(`  Avg:                  ${report.latency.avg} ms`);
      console.log(`  p50 (Median):         ${report.latency.p50} ms`);
      console.log(`  p90:                  ${report.latency.p90} ms`);
      console.log(`  p95:                  ${report.latency.p95} ms`);
      console.log(`  p99:                  ${report.latency.p99} ms`);
      console.log(`  Max:                  ${report.latency.max} ms`);
      console.log(`\nStatus Codes Breakdown:`);
      for (const [code, count] of Object.entries(report.statusCodes)) {
        console.log(`  HTTP ${code}:             ${count} requests`);
      }
      console.log(`\nScenario Breakdown:`);
      for (const [name, stats] of Object.entries(report.scenarioBreakdown)) {
        console.log(`  ${name.padEnd(25)}: ${stats.requests} reqs | Avg: ${stats.avgLatencyMs}ms | Errors: ${stats.errors}`);
      }
      console.log(`===============================================================\n`);

      resolve(report);
    }
  });
}

// Self-executing runner for CLI invocation
if (require.main === module || process.argv[1]?.endsWith('load-test.ts')) {
  runLoadTest({
    baseUrl: process.env.TEST_TARGET_URL || 'http://localhost:3000',
    concurrency: 15,
    durationSeconds: 10,
    scenarios: [
      { name: 'Storefront Homepage', path: '/', weight: 30 },
      { name: 'Catalog API Query', path: '/api/products?limit=20', weight: 35 },
      { name: 'Filtered Search Query', path: '/api/products?category=tech-electronics', weight: 20 },
      { name: 'Health Live Probe', path: '/api/health/live', weight: 15 },
    ],
  }).catch(err => {
    console.error('Load test execution failed:', err);
    process.exit(1);
  });
}
