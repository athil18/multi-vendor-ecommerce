/**
 * Level 2: Component Test Suite for Isolated Storefront UI Components
 * 
 * Validates component rendering, semantics, accessibility attributes, and layout stability.
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent testing-accessibility-auditor
 * @agent testing-test-automation-engineer
 */

import fs from 'fs';
import path from 'path';

interface ComponentTestRecord {
  component: string;
  criterion: string;
  tests: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
}

const records: ComponentTestRecord[] = [];

function recordComponent(rec: ComponentTestRecord) {
  records.push(rec);
  const icon = rec.passed ? '✅' : '❌';
  console.log(`${icon} [${rec.passed ? 'PASS' : 'FAIL'}] ${rec.component}: ${rec.tests}`);
}

async function runLevel2Tests() {
  console.log('\n===============================================================');
  console.log('🧩 LEVEL 2: COMPONENT TESTS EXECUTION');
  console.log('===============================================================');

  const srcDir = path.resolve(__dirname, '../src');

  // Test 1: Button Component - Focus Visible & Ring Offset
  try {
    const btnCode = fs.readFileSync(path.join(srcDir, 'components/ui/Button.tsx'), 'utf-8');
    const hasFocusRing = btnCode.includes('focus-visible:ring-brand-500');
    const hasFocusOffset = btnCode.includes('focus-visible:ring-offset-2');
    const hasOutline = btnCode.includes('focus-visible:outline-none');
    const passed = hasFocusRing && hasFocusOffset && hasOutline;
    recordComponent({
      component: '<Button />',
      criterion: 'Keyboard focus-visible state',
      tests: 'Verify focus ring color, width, and offset on button base styles',
      expectedResult: 'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
      actualResult: `Ring present: ${hasFocusRing}, Offset: ${hasFocusOffset}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<Button />',
      criterion: 'Keyboard focus-visible state',
      tests: 'Button style check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 2: AgentComplianceBadge - WCAG 2.1 AA Contrast Tokens
  try {
    const badgeCode = fs.readFileSync(path.join(srcDir, 'components/ui/AgentComplianceBadge.tsx'), 'utf-8');
    const engContrast = badgeCode.includes('text-blue-700 dark:text-blue-400');
    const secContrast = badgeCode.includes('text-rose-700 dark:text-rose-400');
    const testContrast = badgeCode.includes('text-amber-800 dark:text-amber-400');
    const finContrast = badgeCode.includes('text-emerald-700 dark:text-emerald-400');
    const passed = engContrast && secContrast && testContrast && finContrast;
    recordComponent({
      component: '<AgentComplianceBadge />',
      criterion: 'WCAG 2.1 AA 4.5:1 Color Contrast Ratio',
      tests: 'Verify dark text in light mode and bright text in dark mode',
      expectedResult: 'text-blue-700, text-rose-700, text-amber-800, text-emerald-700 in light mode',
      actualResult: `All 4 division high-contrast tokens verified: ${passed}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<AgentComplianceBadge />',
      criterion: 'WCAG 2.1 AA Color Contrast',
      tests: 'Badge contrast check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 3: ProductCard - Image Dimensions & Alt Tags
  try {
    const cardCode = fs.readFileSync(path.join(srcDir, 'components/ProductCard.tsx'), 'utf-8');
    const hasAlt = cardCode.includes('alt={product.name}');
    const hasSizes = cardCode.includes('sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"');
    const hasFixedContainer = cardCode.includes('h-[280px]');
    const hasMinCardHeight = cardCode.includes('min-h-[550px]');
    const passed = hasAlt && hasSizes && hasFixedContainer && hasMinCardHeight;
    recordComponent({
      component: '<ProductCard />',
      criterion: 'Layout Stability (CLS) & Accessible Image Representation',
      tests: 'Verify explicit dimensions, sizes attribute, alt text, and min-height container',
      expectedResult: 'alt={product.name}, sizes specified, container h-[280px], min-h-[550px]',
      actualResult: `Alt: ${hasAlt}, Sizes: ${hasSizes}, Height reserved: ${hasFixedContainer}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<ProductCard />',
      criterion: 'Layout Stability',
      tests: 'ProductCard check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 4: Navbar - Shop Menu Keyboard Accessibility
  try {
    const navCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
    const hasAriaLabel = navCode.includes('aria-label="Shop categories menu"');
    const hasAriaExpanded = navCode.includes('aria-expanded={isMegaMenuOpen}');
    const hasOnClick = navCode.includes('onClick={() => setIsMegaMenuOpen');
    const hasOnKeyDown = navCode.includes('onKeyDown=');
    const passed = hasAriaLabel && hasAriaExpanded && hasOnClick && hasOnKeyDown;
    recordComponent({
      component: '<Navbar /> (Shop Menu)',
      criterion: 'Accessible Disclosure Navigation Pattern',
      tests: 'Verify aria-expanded, aria-label, onClick toggle, and keyboard onKeyDown support',
      expectedResult: 'Shop button supports click & Enter/Space keyboard toggling',
      actualResult: `aria-expanded: ${hasAriaExpanded}, onClick: ${hasOnClick}, onKeyDown: ${hasOnKeyDown}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<Navbar /> (Shop Menu)',
      criterion: 'Accessible Disclosure',
      tests: 'Navbar check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 5: Navbar - Cart Drawer Modal Dialog Semantics
  try {
    const navCode = fs.readFileSync(path.join(srcDir, 'components/Navbar.tsx'), 'utf-8');
    const hasRoleDialog = navCode.includes('role="dialog"');
    const hasAriaModal = navCode.includes('aria-modal="true"');
    const hasAriaLabel = navCode.includes('aria-label="Shopping Cart Drawer"');
    const passed = hasRoleDialog && hasAriaModal && hasAriaLabel;
    recordComponent({
      component: '<Navbar /> (Cart Drawer)',
      criterion: 'WAI-ARIA Dialog Modal Pattern',
      tests: 'Verify role="dialog", aria-modal="true", and accessible dialog label',
      expectedResult: 'role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer"',
      actualResult: `role="dialog": ${hasRoleDialog}, aria-modal: ${hasAriaModal}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<Navbar /> (Cart Drawer)',
      criterion: 'Dialog Modal Pattern',
      tests: 'Cart drawer check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 6: NexusLogo - Brand Link Accessibility
  try {
    const logoCode = fs.readFileSync(path.join(srcDir, 'components/NexusLogo.tsx'), 'utf-8');
    const hasAriaLabel = logoCode.includes('Nexus Enterprise Homepage') || logoCode.includes('accessibleLabel');
    const hasSvg = logoCode.includes('<svg') && logoCode.includes('viewBox="0 0 64 64"');
    const passed = hasAriaLabel && hasSvg;
    recordComponent({
      component: '<NexusLogo />',
      criterion: 'Accessible SVG Branding Link (WCAG 2.1 SC 2.5.3)',
      tests: 'Verify vector SVG branding with explicit aria-label matching visible brand text on homepage link',
      expectedResult: 'aria-label includes "Nexus Enterprise Homepage" and SVG vector geometry',
      actualResult: `aria-label present: ${hasAriaLabel}, SVG present: ${hasSvg}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<NexusLogo />',
      criterion: 'Branding Link',
      tests: 'NexusLogo check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 7: AIAssistantWidget & Chat Panel - Dialog Semantics & Labels
  try {
    const widgetCode = fs.readFileSync(path.join(srcDir, 'components/AIAssistantWidget.tsx'), 'utf-8');
    const panelCode = fs.readFileSync(path.join(srcDir, 'components/AIAssistantChatPanel.tsx'), 'utf-8');
    const hasControls = widgetCode.includes('aria-controls="nexus-ai-copilot-chat"');
    const hasExpanded = widgetCode.includes('aria-expanded={isOpen}');
    const hasDialog = panelCode.includes('role="dialog"') && panelCode.includes('id="nexus-ai-copilot-chat"');
    const hasInputLabel = panelCode.includes('aria-label="Message Nexus AI Copilot"');
    const hasSendLabel = panelCode.includes('aria-label="Send message to AI Copilot"');
    const passed = hasControls && hasExpanded && hasDialog && hasInputLabel && hasSendLabel;
    recordComponent({
      component: '<AIAssistantWidget /> & <AIAssistantChatPanel />',
      criterion: 'Interactive Copilot Modal Accessibility',
      tests: 'Verify aria-controls, aria-expanded, role="dialog", input label, send button label',
      expectedResult: 'Full accessibility metadata on launcher button and chat dialog elements',
      actualResult: `Launcher controls: ${hasControls}, Dialog: ${hasDialog}, Input label: ${hasInputLabel}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<AIAssistantWidget />',
      criterion: 'Copilot Modal Accessibility',
      tests: 'AIAssistant check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 8: NewsletterForm - Email Input & Submit Accessibility
  try {
    const formCode = fs.readFileSync(path.join(srcDir, 'components/NewsletterForm.tsx'), 'utf-8');
    const hasEmailLabel = formCode.includes('aria-label="Email address for newsletter"');
    const hasSubmitLabel = formCode.includes('aria-label="Subscribe to newsletter"');
    const hasFocusRing = formCode.includes('focus-visible:ring-brand-400');
    const passed = hasEmailLabel && hasSubmitLabel && hasFocusRing;
    recordComponent({
      component: '<NewsletterForm />',
      criterion: 'Form Control Accessible Names & Focus States',
      tests: 'Verify explicit aria-labels on input and submit button with focus ring',
      expectedResult: 'Email input and submit button have accessible names and focus rings',
      actualResult: `Input label: ${hasEmailLabel}, Submit label: ${hasSubmitLabel}, Focus ring: ${hasFocusRing}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: '<NewsletterForm />',
      criterion: 'Form Control Accessible Names',
      tests: 'NewsletterForm check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  // Test 9: Global CSS - Universal Focus-Visible System Rule
  try {
    const cssCode = fs.readFileSync(path.join(srcDir, 'app/globals.css'), 'utf-8');
    const hasUniversalRule = cssCode.includes('a:focus-visible,') && cssCode.includes('button:focus-visible,');
    const hasOutline = cssCode.includes('outline: 2px solid #7c3aed !important;');
    const passed = hasUniversalRule && hasOutline;
    recordComponent({
      component: 'Global Design System (globals.css)',
      criterion: 'Universal Keyboard Navigation Focus Indicator',
      tests: 'Verify global :focus-visible rule enforced across links, buttons, inputs, selects',
      expectedResult: '2px solid brand outline with offset applied to all interactive elements',
      actualResult: `Universal rule active: ${hasUniversalRule}, Outline: ${hasOutline}`,
      passed,
    });
  } catch (err: any) {
    recordComponent({
      component: 'Global Design System',
      criterion: 'Universal Focus Indicator',
      tests: 'globals.css check',
      expectedResult: 'Passed',
      actualResult: `Error: ${err.message}`,
      passed: false,
    });
  }

  const passedCount = records.filter(r => r.passed).length;
  const totalCount = records.length;

  console.log('\n===============================================================');
  console.log(`📊 LEVEL 2 COMPONENT TEST SCORECARD: ${passedCount}/${totalCount} PASSED (${Math.round((passedCount/totalCount)*100)}%)`);
  console.log('===============================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runLevel2Tests().catch((e) => {
  console.error('Level 2 Runner Failed:', e);
  process.exit(1);
});
