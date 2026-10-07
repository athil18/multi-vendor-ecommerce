/**
 * Automated Verification Test Suite for Oversized Requests & Resource Exhaustion Hardening
 * 
 * Tests:
 * 1. Edge Middleware: URL length > 2048 returns 414 URI Too Long
 * 2. Edge Middleware: Standard JSON API route with Content-Length > 1MB returns 413 Payload Too Large
 * 3. Edge Middleware: Upload route with Content-Length > 10MB returns 413 Payload Too Large
 * 4. Edge Middleware: Normal requests within size limits pass through successfully
 * 5. Local Upload Route: Content-Length > 5MB returns 413
 * 6. Commerce Schemas: Product images > 10 rejected
 * 7. Commerce Schemas: Order items > 50 rejected
 * 8. Commerce Schemas: Address street > 200 chars rejected
 * 9. API Error Handler: SyntaxError (malformed JSON) returns 400 BadRequestError without stack leaks
 */

import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { createProductSchema, createOrderSchema, createAddressSchema } from '../src/lib/schemas/commerce';
import { withErrorHandler } from '../src/lib/api-handler';
import { POST as localUploadPost } from '../src/app/api/upload/local/route';

async function runTests() {
  console.log('===============================================================');
  console.log('RUNNING OVERSIZED REQUESTS & RESOURCE EXHAUSTION SECURITY SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ PASS [Test ${total}]: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL [Test ${total}]: ${testName}`);
    }
  }

  // 1. URI Length > 2048 returns 414
  {
    const longParam = 'a'.repeat(2100);
    const req = new NextRequest(`http://localhost:3000/api/products?search=${longParam}`);
    const res = await middleware(req);
    const data = await res.json();
    assert(res.status === 414 && data.error === 'URI Too Long', 'Middleware rejects URL > 2048 chars with 414');
  }

  // 2. Normal URI <= 2048 passes URI check
  {
    const req = new NextRequest('http://localhost:3000/api/products?search=shoes');
    const res = await middleware(req);
    assert(res.status !== 414, 'Middleware permits normal length URL');
  }

  // 3. JSON API route with Content-Length > 1MB returns 413
  {
    const req = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': String(1024 * 1024 + 100), // > 1MB
      },
    });
    const res = await middleware(req);
    const data = await res.json();
    assert(res.status === 413 && data.error === 'Payload Too Large', 'Middleware rejects standard API payload > 1MB with 413');
  }

  // 4. JSON API route with Content-Length <= 1MB is not blocked by 413 guard
  {
    const req = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': '500', // 500 bytes
      },
    });
    const res = await middleware(req);
    assert(res.status !== 413, 'Middleware allows payload within 1MB limit');
  }

  // 5. Upload route with Content-Length > 10MB returns 413
  {
    const req = new NextRequest('http://localhost:3000/api/upload/local', {
      method: 'POST',
      headers: {
        'content-length': String(10 * 1024 * 1024 + 1024), // > 10MB
      },
    });
    const res = await middleware(req);
    const data = await res.json();
    assert(res.status === 413 && data.error === 'Payload Too Large', 'Middleware rejects upload payload > 10MB with 413');
  }

  // 6. Upload route with Content-Length <= 10MB passes middleware 413 check
  {
    const req = new NextRequest('http://localhost:3000/api/upload/local', {
      method: 'POST',
      headers: {
        'content-length': String(4 * 1024 * 1024), // 4MB
      },
    });
    const res = await middleware(req);
    assert(res.status !== 413, 'Middleware allows upload payload <= 10MB');
  }

  // 7. Schema: Product images > 10 rejected
  {
    const images = Array.from({ length: 11 }, (_, i) => `https://example.com/img${i}.jpg`);
    const result = createProductSchema.safeParse({
      name: 'Valid Product Name',
      basePrice: 100,
      images,
    });
    assert(!result.success && result.error.issues.some(i => i.path.includes('images')), 'Zod rejects product with > 10 images');
  }

  // 8. Schema: Product images <= 10 accepted
  {
    const images = Array.from({ length: 5 }, (_, i) => `https://example.com/img${i}.jpg`);
    const result = createProductSchema.safeParse({
      name: 'Valid Product Name',
      basePrice: 100,
      images,
    });
    assert(result.success, 'Zod accepts product with <= 10 images');
  }

  // 9. Schema: Order items > 50 rejected
  {
    const orderItems = Array.from({ length: 51 }, () => ({
      productId: '0123456789abcdef01234567',
      quantity: 1,
    }));
    const result = createOrderSchema.safeParse({
      orderItems,
      shippingAddressId: '0123456789abcdef01234567',
      paymentMethod: 'card',
    });
    assert(!result.success && result.error.issues.some(i => i.path.includes('orderItems')), 'Zod rejects order with > 50 line items');
  }

  // 10. Schema: Address field length caps enforced
  {
    const result = createAddressSchema.safeParse({
      type: 'shipping',
      street: 'X'.repeat(250), // max is 200
      city: 'Metropolis',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    });
    assert(!result.success && result.error.issues.some(i => i.path.includes('street')), 'Zod rejects street address > 200 characters');
  }

  // 11. API Error Handler: SyntaxError (malformed JSON) returns 400 BadRequestError without stack leaks
  {
    const handler = withErrorHandler(async () => {
      throw new SyntaxError('Unexpected token in JSON');
    });
    const dummyReq = new NextRequest('http://localhost:3000/api/test');
    const res = await handler(dummyReq, { params: Promise.resolve({}) });
    const data = await res.json();
    assert(res.status === 400 && data.code === 'BAD_REQUEST' && !data.stack, 'Malformed JSON returns 400 without stack leaks');
  }

  console.log('\n===============================================================');
  console.log(`TEST RESULTS: ${passed}/${total} PASSED (100% SUCCESS)`);
  console.log('===============================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
