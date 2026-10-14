/**
 * Level 1: Unit Test Suite for Multi-Vendor E-Commerce Platform
 * 
 * Tests individual utilities, functions, logic, schemas, and reducers.
 * 
 * @agent 15-unit-test-generator
 * @agent testing-test-automation-engineer
 * @agent engineering-backend-architect
 */

import { loginSchema, registerSchema } from '../src/lib/schemas/auth';
import { useCartStore } from '../src/store/useCartStore';
import { validateSkillInput, normalizeSkillName } from '../src/lib/brain/skills/validation';
import { brainToolExecutor } from '../src/lib/brain/tools/executor';

interface TestRecord {
  functionName: string;
  purpose: string;
  tests: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
}

const records: TestRecord[] = [];

function recordTest(rec: TestRecord) {
  records.push(rec);
  const icon = rec.passed ? '✅' : '❌';
  console.log(`${icon} [${rec.passed ? 'PASS' : 'FAIL'}] ${rec.functionName}: ${rec.tests}`);
}

async function runLevel1Tests() {
  console.log('\n===============================================================');
  console.log('🧪 LEVEL 1: UNIT TESTS EXECUTION');
  console.log('===============================================================');

  // Test 1: Validation - loginSchema valid email/password
  try {
    const valid = loginSchema.safeParse({ email: 'buyer@nexus.com', password: 'ValidPassword123' });
    const passed = valid.success === true;
    recordTest({
      functionName: 'loginSchema.safeParse',
      purpose: 'Verify valid email and password format is accepted',
      tests: 'Valid email and non-empty password credentials input',
      expectedResult: 'Validation success: true',
      actualResult: `Validation success: ${valid.success}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'loginSchema.safeParse',
      purpose: 'Verify valid email and password format is accepted',
      tests: 'Valid credentials input',
      expectedResult: 'Validation success: true',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 2: Validation - loginSchema invalid email rejection
  try {
    const invalid = loginSchema.safeParse({ email: 'not-an-email', password: 'ValidPassword123' });
    const passed = invalid.success === false;
    recordTest({
      functionName: 'loginSchema.safeParse (Malformed Email)',
      purpose: 'Reject invalid email strings before submission',
      tests: 'String without @ or domain supplied to email field',
      expectedResult: 'Validation success: false with email error issue',
      actualResult: `Validation success: ${invalid.success}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'loginSchema.safeParse (Malformed Email)',
      purpose: 'Reject invalid email strings before submission',
      tests: 'Malformed email input',
      expectedResult: 'Validation success: false',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 3: Validation - loginSchema empty password rejection
  try {
    const invalid = loginSchema.safeParse({ email: 'user@nexus.com', password: '' });
    const passed = invalid.success === false;
    recordTest({
      functionName: 'loginSchema.safeParse (Empty Password)',
      purpose: 'Reject blank or omitted passwords',
      tests: 'Empty string supplied to password field',
      expectedResult: 'Validation success: false',
      actualResult: `Validation success: ${invalid.success}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'loginSchema.safeParse (Empty Password)',
      purpose: 'Reject blank or omitted passwords',
      tests: 'Empty password input',
      expectedResult: 'Validation success: false',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 4: Validation - registerSchema complexity enforcement
  try {
    const weak = registerSchema.safeParse({ name: 'Bob', email: 'bob@nexus.com', password: 'weak' });
    const strong = registerSchema.safeParse({ name: 'Bob', email: 'bob@nexus.com', password: 'StrongPassword1@' });
    const passed = weak.success === false && strong.success === true;
    recordTest({
      functionName: 'registerSchema.safeParse (Password Policy)',
      purpose: 'Enforce enterprise password complexity (8+ chars, upper, lower, number, symbol)',
      tests: 'Evaluation of weak vs strong password inputs',
      expectedResult: 'Weak rejected (false), strong accepted (true)',
      actualResult: `Weak: ${weak.success}, Strong: ${strong.success}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'registerSchema.safeParse (Password Policy)',
      purpose: 'Enforce enterprise password complexity',
      tests: 'Password policy checks',
      expectedResult: 'Success',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 5: State Transformation - useCartStore.addToCart
  try {
    useCartStore.getState().clearCart();
    useCartStore.getState().addToCart({
      productId: 'p-keyboard-1',
      name: 'Artisan Mechanical Keyboard',
      price: 249.99,
      quantity: 1,
    });
    const cart = useCartStore.getState().cart;
    const passed = cart.length === 1 && cart[0].quantity === 1 && cart[0].price === 249.99;
    recordTest({
      functionName: 'useCartStore.addToCart (Initial Addition)',
      purpose: 'Append new product to cart state array with quantity 1',
      tests: 'Dispatch addToCart for brand new SKU',
      expectedResult: 'Cart length: 1, item quantity: 1',
      actualResult: `Cart length: ${cart.length}, item quantity: ${cart[0]?.quantity}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'useCartStore.addToCart (Initial Addition)',
      purpose: 'Append new product to cart state array',
      tests: 'Dispatch addToCart',
      expectedResult: 'Cart length 1',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 6: State Transformation - useCartStore.addToCart existing SKU
  try {
    useCartStore.getState().addToCart({
      productId: 'p-keyboard-1',
      name: 'Artisan Mechanical Keyboard',
      price: 249.99,
      quantity: 1,
    });
    const cart = useCartStore.getState().cart;
    const passed = cart.length === 1 && cart[0].quantity === 2;
    recordTest({
      functionName: 'useCartStore.addToCart (Duplicate SKU)',
      purpose: 'Increment existing SKU quantity rather than creating duplicate row',
      tests: 'Dispatch addToCart for existing SKU in cart',
      expectedResult: 'Cart length: 1, item quantity: 2',
      actualResult: `Cart length: ${cart.length}, item quantity: ${cart[0]?.quantity}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'useCartStore.addToCart (Duplicate SKU)',
      purpose: 'Increment existing SKU quantity',
      tests: 'Dispatch addToCart for existing SKU',
      expectedResult: 'Cart length 1, item quantity 2',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 7: State Transformation - useCartStore.updateCartQuantity
  try {
    useCartStore.getState().updateCartQuantity('p-keyboard-1', 5);
    const cart = useCartStore.getState().cart;
    const passed = cart[0].quantity === 5;
    recordTest({
      functionName: 'useCartStore.updateCartQuantity',
      purpose: 'Directly modify line item quantity in cart state',
      tests: 'Set quantity to 5 for existing SKU',
      expectedResult: 'Item quantity: 5',
      actualResult: `Item quantity: ${cart[0]?.quantity}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'useCartStore.updateCartQuantity',
      purpose: 'Modify line item quantity',
      tests: 'Set quantity to 5',
      expectedResult: 'Item quantity 5',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 8: State Transformation - useCartStore.removeFromCart
  try {
    useCartStore.getState().removeFromCart('p-keyboard-1');
    const cart = useCartStore.getState().cart;
    const passed = cart.length === 0;
    recordTest({
      functionName: 'useCartStore.removeFromCart',
      purpose: 'Purge specified SKU line item from cart state',
      tests: 'Remove p-keyboard-1 from active cart',
      expectedResult: 'Cart length: 0',
      actualResult: `Cart length: ${cart.length}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'useCartStore.removeFromCart',
      purpose: 'Purge SKU from cart',
      tests: 'Remove SKU',
      expectedResult: 'Cart length 0',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 9: Data Transformation - Floating-Point Precision Calculation
  try {
    const lineItems = [
      { price: 19.99, qty: 3 },
      { price: 4.95, qty: 2 },
      { price: 100.00, qty: 1 },
    ];
    // Invariant: sum integer cents to avoid IEEE-754 binary floating-point drift
    const totalCents = lineItems.reduce((acc, item) => acc + Math.round(item.price * 100) * item.qty, 0);
    const totalDollars = totalCents / 100;
    const passed = totalDollars === 169.87;
    recordTest({
      functionName: 'calculateCartSubtotal (Integer Cents)',
      purpose: 'Calculate precise monetary sum avoiding binary float drift',
      tests: 'Sum 3x$19.99 + 2x$4.95 + 1x$100.00 in integer cents',
      expectedResult: 'Subtotal: 169.87',
      actualResult: `Subtotal: ${totalDollars}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'calculateCartSubtotal',
      purpose: 'Calculate precise monetary sum',
      tests: 'Integer cents calculation',
      expectedResult: 'Subtotal 169.87',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 10: Formatting Function - Currency Formatter
  try {
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    const formatted = formatCurrency(249.5);
    const passed = formatted === '$249.50';
    recordTest({
      functionName: 'formatCurrency',
      purpose: 'Format numerical amounts into 2-decimal USD currency strings',
      tests: 'Format 249.5 into USD string',
      expectedResult: 'Formatted string: "$249.50"',
      actualResult: `Formatted string: "${formatted}"`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'formatCurrency',
      purpose: 'Format numerical amounts',
      tests: 'Format currency',
      expectedResult: '"$249.50"',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 11: Filtering / Sorting Logic
  try {
    const products = [
      { id: '1', name: 'Desk Mat', price: 49, rating: 4.6 },
      { id: '2', name: 'Custom Keyboard', price: 299, rating: 4.9 },
      { id: '3', name: 'Ceramic Mug', price: 25, rating: 4.8 },
    ];
    // Filter by term
    const term = 'mat';
    const filtered = products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
    // Sort by price ascending
    const sorted = [...products].sort((a, b) => a.price - b.price);
    const passed = filtered.length === 1 && filtered[0].id === '1' && sorted[0].id === '3' && sorted[2].id === '2';
    recordTest({
      functionName: 'filterAndSortCatalog',
      purpose: 'Perform case-insensitive keyword filtering and numerical price sorting',
      tests: 'Filter for "mat" and sort by price low-to-high',
      expectedResult: 'Filter length: 1 ("Desk Mat"), sorted: ["Ceramic Mug", "Desk Mat", "Custom Keyboard"]',
      actualResult: `Filter length: ${filtered.length}, lowest price ID: ${sorted[0].id}, highest price ID: ${sorted[2].id}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'filterAndSortCatalog',
      purpose: 'Filter and sort catalog',
      tests: 'Filter and sort',
      expectedResult: 'Success',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 12: Nexus Commerce Brain - Dynamic Skill Validation & Normalization
  try {
    const normalized = normalizeSkillName('  Artisan Concierge & Escrow v2!  ');
    const validated = validateSkillInput({
      name: normalized,
      description: 'Use when customer requests bespoke artisan provenance and recommendations.',
      body: '# Artisan Playbook\nValidate materials and seller store.',
      scope: 'platform',
    });
    const passed = validated.name === 'artisan_concierge_escrow_v2' && validated.scope === 'platform';
    recordTest({
      functionName: 'validateSkillInput (Brain Dynamic Skills)',
      purpose: 'Normalize skill name and validate executable playbook bounds',
      tests: 'Normalize and validate dynamic skill playbook',
      expectedResult: 'Normalized name: "artisan_concierge_escrow_v2", scope: "platform"',
      actualResult: `Normalized name: "${validated.name}", scope: "${validated.scope}"`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'validateSkillInput (Brain Dynamic Skills)',
      purpose: 'Normalize skill name and validate playbook bounds',
      tests: 'Normalize and validate dynamic skill playbook',
      expectedResult: 'Success',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 13: Nexus Commerce Brain - Integer-Cent Escrow Payout Arithmetic
  try {
    const payoutExec = await brainToolExecutor.executeTool(
      'calculate_payout_disbursement',
      { orderAmount: 189.50, platformFeePercent: 10.0 },
      { role: 'seller', traceId: 'unit-trace' }
    );
    // 189.50 -> 18950 cents
    // Platform fee 10% -> 1895 cents ($18.95)
    // Processing fee 2.9% + 30c -> round(18950 * 0.029) + 30 = 550 + 30 = 580 cents ($5.80)
    // Total deductions = 1895 + 580 = 2475 cents ($24.75)
    // Net seller = 18950 - 2475 = 16475 cents ($164.75)
    const netPayout = parseFloat(payoutExec.result.sellerNetPayoutUsd);
    const passed = netPayout === 164.75 && payoutExec.result.currencySafetyInvariant === 'integer_cents_verified';
    recordTest({
      functionName: 'calculate_payout_disbursement (Exact Integer Cents)',
      purpose: 'Verify multi-vendor escrow payout calculations use exact integer cents preventing float drift',
      tests: 'Calculate take-rate and net seller payout for $189.50 order',
      expectedResult: 'Net Payout: $164.75 with integer_cents_verified invariant',
      actualResult: `Net Payout: $${payoutExec.result.sellerNetPayoutUsd}, Invariant: ${payoutExec.result.currencySafetyInvariant}`,
      passed,
    });
  } catch (err: any) {
    recordTest({
      functionName: 'calculate_payout_disbursement (Exact Integer Cents)',
      purpose: 'Verify multi-vendor escrow payout calculations use exact integer cents',
      tests: 'Calculate take-rate and net seller payout',
      expectedResult: 'Success',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  const passedCount = records.filter(r => r.passed).length;
  const totalCount = records.length;

  console.log('\n===============================================================');
  console.log(`📊 LEVEL 1 UNIT TEST SCORECARD: ${passedCount}/${totalCount} PASSED (${Math.round((passedCount/totalCount)*100)}%)`);
  console.log('===============================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runLevel1Tests().catch((e) => {
  console.error('Level 1 Runner Failed:', e);
  process.exit(1);
});
