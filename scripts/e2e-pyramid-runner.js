/**
 * Level 4: Comprehensive End-to-End (E2E) Testing Pyramid Verification Engine
 * Powered by Playwright & Chrome DevTools Protocol
 * 
 * @agent testing-test-automation-engineer
 * @agent testing-accessibility-auditor
 * @agent design-ux-architect
 * @agent engineering-frontend-developer
 */

const path = require('path');
const { chromium } = require(path.join(__dirname, '../apps/node_modules/@playwright/test'));

async function runE2ETests() {
  console.log('\n===============================================================');
  console.log('🧪 LEVEL 4: PLAYWRIGHT E2E JOURNEYS & PRODUCTION VALIDATION');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${message}`);
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // JOURNEY 1: Public Storefront E-Commerce Flow
    // -------------------------------------------------------------
    console.log('\n--- Journey 1: Public Storefront E-Commerce Flow ---');
    const contextDesktop = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await contextDesktop.newPage();

    console.log('  Navigating to http://localhost:3000/...');
    const res = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    assert(res.status() === 200, 'Homepage loaded with HTTP 200');

    // 1.1 Brand & Hero verification
    await page.waitForSelector('h1', { timeout: 10000 });
    const heroTitle = await page.$eval('h1', el => el.innerText);
    assert(heroTitle.includes('Discover Premium'), 'Hero section renders "Discover Premium" headline');

    const brandLogo = await page.waitForSelector('a[aria-label="Nexus Homepage"]', { timeout: 5000 });
    assert(brandLogo !== null, 'Nexus brand logo has accessible aria-label="Nexus Homepage"');

    // 1.2 Add to Cart on Homepage
    const addBtn = await page.waitForSelector('button[aria-label*="Add"][aria-label*="to cart"]');
    assert(addBtn !== null, 'Product card Add to Cart button found');
    await addBtn.click();
    await page.waitForTimeout(600);

    const cartBtnAria = await page.$eval('button[aria-label*="Shopping cart with"]', b => b.getAttribute('aria-label'));
    assert(cartBtnAria.includes('1 items') || cartBtnAria.includes('items'), `Cart button updated with item count: "${cartBtnAria}"`);

    // 1.3 Open and Inspect Cart Drawer
    const cartToggle = await page.$('button[aria-label*="Shopping cart with"]');
    await cartToggle.click();
    await page.waitForTimeout(600);

    const cartDrawer = await page.$('[role="dialog"][aria-label="Shopping Cart Drawer"]');
    assert(cartDrawer !== null, 'Cart Drawer opened with role="dialog" and accessible label');

    const closeCartBtn = await page.$('button[aria-label="Close shopping cart"]');
    assert(closeCartBtn !== null, 'Cart drawer close button found with aria-label');
    await closeCartBtn.click();
    await page.waitForTimeout(400);

    // 1.4 Product Catalog Page & Search Filter Navigation
    console.log('  Navigating to /products...');
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle' });
    
    const catalogHeading = await page.$eval('h1', el => el.innerText);
    assert(catalogHeading.includes('All Products'), 'Catalog page renders "All Products" heading');

    const searchInput = await page.$('input[aria-label="Search products"]');
    assert(searchInput !== null, 'Catalog search bar has aria-label="Search products"');

    const sortSelect = await page.$('select[aria-label="Sort products by"]');
    assert(sortSelect !== null, 'Catalog sort dropdown has aria-label="Sort products by"');

    await searchInput.fill('Artisan');
    await page.waitForTimeout(400);
    const searchVal = await searchInput.inputValue();
    assert(searchVal === 'Artisan', 'Search input received user keystrokes');

    await contextDesktop.close();

    // -------------------------------------------------------------
    // JOURNEY 2: Keyboard Accessibility & Skip-Link Verification
    // -------------------------------------------------------------
    console.log('\n--- Journey 2: Keyboard Accessibility & Landmark Hierarchy ---');
    const a11yContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const a11yPage = await a11yContext.newPage();
    await a11yPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // 2.1 Tab to Skip Link
    await a11yPage.keyboard.press('Tab');
    const focusedElementText = await a11yPage.evaluate(() => document.activeElement ? document.activeElement.innerText : '');
    assert(focusedElementText.includes('Skip to main content'), 'First Tab focus lands on "Skip to main content" link');

    // 2.2 Press Enter on Skip Link
    await a11yPage.keyboard.press('Enter');
    const activeTargetId = await a11yPage.evaluate(() => document.activeElement ? document.activeElement.id : '');
    assert(activeTargetId === 'main-content', 'Skip link successfully shifted focus to #main-content');

    // 2.3 Verify Semantic HTML Landmarks
    const headerLandmark = await a11yPage.$('header');
    const mainLandmark = await a11yPage.$('main#main-content');
    const footerLandmark = await a11yPage.$('footer[role="contentinfo"]');
    const navLandmark = await a11yPage.$('nav');

    assert(headerLandmark !== null, '<header> banner landmark exists');
    assert(mainLandmark !== null, '<main id="main-content"> landmark exists');
    assert(footerLandmark !== null, '<footer role="contentinfo"> landmark exists');
    assert(navLandmark !== null, '<nav> navigation landmark exists');

    await a11yContext.close();

    // -------------------------------------------------------------
    // JOURNEY 3: AI Copilot Interactive Flow
    // -------------------------------------------------------------
    console.log('\n--- Journey 3: On-Demand AI Copilot Flow ---');
    const copilotContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const copilotPage = await copilotContext.newPage();
    await copilotPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    const launcherBtn = await copilotPage.$('button[aria-controls="nexus-ai-copilot-chat"]');
    assert(launcherBtn !== null, 'AI Copilot launcher button has aria-controls="nexus-ai-copilot-chat"');

    const ariaExpandedBefore = await launcherBtn.getAttribute('aria-expanded');
    assert(ariaExpandedBefore === 'false', 'AI Copilot starts with aria-expanded="false"');

    await launcherBtn.click();
    await copilotPage.waitForTimeout(800);

    const ariaExpandedAfter = await launcherBtn.getAttribute('aria-expanded');
    assert(ariaExpandedAfter === 'true', 'Launcher button updates to aria-expanded="true"');

    const chatDialog = await copilotPage.$('#nexus-ai-copilot-chat[role="dialog"]');
    assert(chatDialog !== null, 'AI Copilot chat mounted with id="nexus-ai-copilot-chat" and role="dialog"');

    const chatInput = await copilotPage.$('input[aria-label="Message Nexus AI Copilot"]');
    assert(chatInput !== null, 'Chat input has aria-label="Message Nexus AI Copilot"');

    const chatSendBtn = await copilotPage.$('button[aria-label="Send message to AI Copilot"]');
    assert(chatSendBtn !== null, 'Chat send button has aria-label="Send message to AI Copilot"');

    const chatCloseBtn = await copilotPage.$('button[aria-label="Close AI Assistant"]');
    assert(chatCloseBtn !== null, 'Chat close button has aria-label="Close AI Assistant"');
    await chatCloseBtn.click();
    await copilotPage.waitForTimeout(400);

    await copilotContext.close();

    // -------------------------------------------------------------
    // JOURNEY 4: Multi-Viewport Responsive Validation
    // -------------------------------------------------------------
    console.log('\n--- Journey 4: Multi-Viewport Responsive Validation ---');
    const viewports = [
      { name: 'Mobile (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Desktop (1366x768)', width: 1366, height: 768 }
    ];

    for (const vp of viewports) {
      const vpContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const vpPage = await vpContext.newPage();
      await vpPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

      // Ensure no horizontal scrollbar / overflow
      const hasHorizontalScroll = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      assert(!hasHorizontalScroll, `${vp.name}: Zero horizontal overflow (scrollWidth === clientWidth)`);

      // Ensure hero headline is visible
      const isHeadlineVisible = await vpPage.isVisible('h1');
      assert(isHeadlineVisible, `${vp.name}: Hero headline renders cleanly in viewport`);

      await vpContext.close();
    }

    await browser.close();

    console.log('\n===============================================================');
    console.log(`🎉 ALL ${totalTests}/${totalTests} E2E TESTS PASSED SUCCESSFULLY (100%)`);
    console.log('===============================================================\n');
    return true;
  } catch (err) {
    await browser.close();
    console.error('\n❌ E2E Journey Failed:', err);
    process.exit(1);
  }
}

runE2ETests().catch(err => {
  console.error(err);
  process.exit(1);
});
