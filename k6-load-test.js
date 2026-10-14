import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
export const errorRate = new Rate('errors');
export const catalogLatency = new Trend('catalog_latency');
export const homepageLatency = new Trend('homepage_latency');

export const options = {
  stages: [
    { duration: '15s', target: 20 },  // Ramp-up to 20 virtual users
    { duration: '30s', target: 50 },  // Sustained load at 50 virtual users
    { duration: '15s', target: 100 }, // Stress spike at 100 virtual users
    { duration: '15s', target: 0 },   // Graceful ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms
    errors: ['rate<0.02'],                          // Under 2% error rate
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  const roll = Math.random();

  if (roll < 0.35) {
    // Scenario 1: Storefront Homepage (35% traffic)
    const res = http.get(`${BASE_URL}/`, {
      tags: { name: 'Homepage' },
    });
    homepageLatency.add(res.timings.duration);
    const success = check(res, {
      'homepage status 200': (r) => r.status === 200,
    });
    errorRate.add(!success);
  } else if (roll < 0.70) {
    // Scenario 2: Catalog Products Query (35% traffic)
    const res = http.get(`${BASE_URL}/api/products?limit=24`, {
      tags: { name: 'CatalogAPI' },
    });
    catalogLatency.add(res.timings.duration);
    const success = check(res, {
      'catalog status 200': (r) => r.status === 200,
      'has data array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data);
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
  } else if (roll < 0.85) {
    // Scenario 3: Faceted Category Filter (15% traffic)
    const res = http.get(`${BASE_URL}/api/products?category=tech-electronics&sort=price_desc`, {
      tags: { name: 'FilteredSearch' },
    });
    const success = check(res, {
      'filtered status 200': (r) => r.status === 200,
    });
    errorRate.add(!success);
  } else {
    // Scenario 4: Health Live Check (15% traffic)
    const res = http.get(`${BASE_URL}/api/health/live`, {
      tags: { name: 'HealthCheck' },
    });
    const success = check(res, {
      'health status 200': (r) => r.status === 200,
    });
    errorRate.add(!success);
  }

  // Realistic user think time
  sleep(Math.random() * 0.5 + 0.2);
}
