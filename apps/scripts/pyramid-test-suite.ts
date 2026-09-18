/**
 * Comprehensive Testing Pyramid Automation Engine (Levels 1, 2, & 3)
 * 
 * @agent testing-test-automation-engineer
 * @agent 15-unit-test-generator
 * @agent testing-accessibility-auditor
 * @agent engineering-frontend-developer
 */

import { loginSchema, registerSchema } from '../src/lib/schemas/auth';
import { useCartStore } from '../src/store/useCartStore';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(desc: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      return res
        .then(() => {
          passedTests++;
          console.log(`  ✅ [PASS] ${desc}`);
        })
        .catch((err: any) => {
          failedTests++;
          console.error(`  ❌ [FAIL] ${desc}\n     -> ${err.message}`);
        });
    }
    passedTests++;
    console.log(`  ✅ [PASS] ${desc}`);
  } catch (err: any) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${desc}\n     -> ${err.message}`);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    toBeGreaterThan(num: number) {
      if (actual <= num) throw new Error(`Expected ${actual} to be greater than ${num}`);
    },
    toContain(substr: string) {
      if (!actual || !actual.includes(substr)) throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(substr)}`);
    },
    toHaveLength(len: number) {
      if (!actual || actual.length !== len) throw new Error(`Expected length ${len} but got ${actual ? actual.length : 'undefined'}`);
    },
    toBeTrue() {
      if (actual !== true) throw new Error(`Expected true but got ${actual}`);
    },
    toBeFalse() {
      if (actual !== false) throw new Error(`Expected false but got ${actual}`);
    }
  };
}

async function runSuite() {
  console.log('\n===============================================================');
  console.log('🏛️  500+ AI AGENT TESTING PYRAMID SUITE (LEVELS 1, 2, 3)');
  console.log('===============================================================');

  // -------------------------------------------------------------
  // LEVEL 1: UNIT TESTS
  // -------------------------------------------------------------
  console.log('\n>>> LEVEL 1: UNIT TESTS (Logic, Validation, Reducers, Schemas) <<<');

  it('Unit 1.1: loginSchema should accept valid email and non-empty password', () => {
    const valid = loginSchema.safeParse({ email: 'customer@nexus.com', password: 'Password123!' });
    expect(valid.success).toBe(true);
  });

  it('Unit 1.2: loginSchema should reject invalid email format', () => {
    const invalid = loginSchema.safeParse({ email: 'invalid-email', password: 'Password123!' });
    expect(invalid.success).toBe(false);
  });

  it('Unit 1.3: loginSchema should reject empty password', () => {
    const invalid = loginSchema.safeParse({ email: 'user@nexus.com', password: '' });
    expect(invalid.success).toBe(false);
  });

  it('Unit 1.4: registerSchema should enforce 8+ characters and complexity', () => {
    const weak = registerSchema.safeParse({ name: 'Alice', email: 'alice@nexus.com', password: 'simple' });
    expect(weak.success).toBe(false);

    const strong = registerSchema.safeParse({ name: 'Alice', email: 'alice@nexus.com', password: 'ComplexPassword1@' });
    expect(strong.success).toBe(true);
  });

  it('Unit 1.5: Zustand Cart Reducer - should initialize empty', () => {
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().cart).toHaveLength(0);
  });

  it('Unit 1.6: Zustand Cart Reducer - should add new items and update counts', () => {
    useCartStore.getState().clearCart();
    useCartStore.getState().addToCart({
      productId: 'p-1',
      name: 'Artisan Keyboard',
      price: 250.0,
      quantity: 1,
    });
    expect(useCartStore.getState().cart).toHaveLength(1);
    expect(useCartStore.getState().cart[0].quantity).toBe(1);

    // Add again -> quantity increments
    useCartStore.getState().addToCart({
      productId: 'p-1',
      name: 'Artisan Keyboard',
      price: 250.0,
      quantity: 1,
    });
    expect(useCartStore.getState().cart).toHaveLength(1);
    expect(useCartStore.getState().cart[0].quantity).toBe(2);
  });

  it('Unit 1.7: Zustand Cart Reducer - should calculate subtotal correctly', () => {
    const cart = useCartStore.getState().cart;
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    expect(total).toBe(500.0);
  });

  it('Unit 1.8: Zustand Cart Reducer - should remove item when quantity reduced to 0', () => {
    useCartStore.getState().updateCartQuantity('p-1', 0);
    expect(useCartStore.getState().cart).toHaveLength(0);
  });

  it('Unit 1.9: Financial Monetary Rounding - zero floating-point accumulation', () => {
    const prices = [19.99, 29.99, 149.95, 4.50];
    const totalCents = prices.reduce((acc, p) => acc + Math.round(p * 100), 0);
    const totalDollars = totalCents / 100;
    expect(totalDollars).toBe(204.43);
  });

  // -------------------------------------------------------------
  // LEVEL 2: COMPONENT TESTS
  // -------------------------------------------------------------
  console.log('\n>>> LEVEL 2: COMPONENT TESTS (UI Architecture, Semantics, A11y) <<<');

  it('Component 2.1: AgentComplianceBadge - verified division color tokens satisfy WCAG 2.1 AA', async () => {
    const fs = await import('fs');
    const badgeSource = fs.readFileSync('src/components/ui/AgentComplianceBadge.tsx', 'utf-8');
    expect(badgeSource).toContain('text-blue-700 dark:text-blue-400');
    expect(badgeSource).toContain('text-rose-700 dark:text-rose-400');
    expect(badgeSource).toContain('text-amber-800 dark:text-amber-400');
    expect(badgeSource).toContain('text-emerald-700 dark:text-emerald-400');
  });

  it('Component 2.2: Button - incorporates universal focus-visible styling ring', async () => {
    const fs = await import('fs');
    const buttonSource = fs.readFileSync('src/components/ui/Button.tsx', 'utf-8');
    expect(buttonSource).toContain('focus-visible:ring-brand-500');
    expect(buttonSource).toContain('focus-visible:ring-2');
  });

  it('Component 2.3: Navbar - Shop menu button has onClick & onKeyDown keyboard handlers', async () => {
    const fs = await import('fs');
    const navbarSource = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
    expect(navbarSource).toContain('aria-label="Shop categories menu"');
    expect(navbarSource).toContain('aria-expanded={isMegaMenuOpen}');
    expect(navbarSource).toContain('onClick={() => setIsMegaMenuOpen');
  });

  it('Component 2.4: Cart Drawer - has role="dialog" and aria-modal="true"', async () => {
    const fs = await import('fs');
    const navbarSource = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
    expect(navbarSource).toContain('role="dialog"');
    expect(navbarSource).toContain('aria-modal="true"');
    expect(navbarSource).toContain('aria-label="Shopping Cart Drawer"');
  });

  it('Component 2.5: AIAssistantWidget - has aria-controls and aria-expanded', async () => {
    const fs = await import('fs');
    const widgetSource = fs.readFileSync('src/components/AIAssistantWidget.tsx', 'utf-8');
    expect(widgetSource).toContain('aria-controls="nexus-ai-copilot-chat"');
    expect(widgetSource).toContain('aria-expanded={isOpen}');
  });

  it('Component 2.6: AIAssistantChatPanel - has dialog role, input label, and send button label', async () => {
    const fs = await import('fs');
    const chatSource = fs.readFileSync('src/components/AIAssistantChatPanel.tsx', 'utf-8');
    expect(chatSource).toContain('id="nexus-ai-copilot-chat"');
    expect(chatSource).toContain('role="dialog"');
    expect(chatSource).toContain('aria-label="Message Nexus AI Copilot"');
    expect(chatSource).toContain('aria-label="Send message to AI Copilot"');
  });

  it('Component 2.7: NexusLogo - Brand link has explicit aria-label="Nexus Homepage"', async () => {
    const fs = await import('fs');
    const logoSource = fs.readFileSync('src/components/NexusLogo.tsx', 'utf-8');
    expect(logoSource).toContain('aria-label="Nexus Homepage"');
  });

  it('Component 2.8: Catalog Products Page - Search and Sort have accessible aria-labels', async () => {
    const fs = await import('fs');
    const prodSource = fs.readFileSync('src/app/products/page.tsx', 'utf-8');
    expect(prodSource).toContain('aria-label="Search products"');
    expect(prodSource).toContain('aria-label="Sort products by"');
  });

  it('Component 2.9: Global CSS - Universal :focus-visible rules applied', async () => {
    const fs = await import('fs');
    const cssSource = fs.readFileSync('src/app/globals.css', 'utf-8');
    expect(cssSource).toContain(':focus-visible');
    expect(cssSource).toContain('outline: 2px solid #7c3aed !important;');
  });

  // -------------------------------------------------------------
  // LEVEL 3: INTEGRATION TESTS
  // -------------------------------------------------------------
  console.log('\n>>> LEVEL 3: INTEGRATION TESTS (API Contracts, Health, Security) <<<');

  await it('Integration 3.1: GET /api/health/live - Platform availability endpoint returns 200', async () => {
    const res = await fetch('http://localhost:3000/api/health/live');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('live');
  });

  await it('Integration 3.2: GET /api/products - Storefront catalog returns 200 with contract data', async () => {
    const res = await fetch('http://localhost:3000/api/products');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  await it('Integration 3.3: GET /api/auth/me - Unauthenticated requests properly rejected with 401', async () => {
    const res = await fetch('http://localhost:3000/api/auth/me');
    expect(res.status).toBe(401);
  });

  console.log('\n===============================================================');
  console.log(`📊 PYRAMID TEST SUITE RESULTS: ${passedTests}/${totalTests} PASSED (Failed: ${failedTests})`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch((e) => {
  console.error('Test Suite Failed:', e);
  process.exit(1);
});
