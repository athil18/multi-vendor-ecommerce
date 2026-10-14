const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch {
      try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
      } catch {
        browser = await chromium.launch({ headless: true });
      }
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    console.log('Navigating to http://localhost:3000/products...');
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Dismiss cookie banner if present
    try {
      const acceptBtn = await page.getByRole('button', { name: /Accept All/i });
      if (await acceptBtn.isVisible()) {
        await acceptBtn.click();
      }
    } catch {}

    await page.waitForTimeout(1000);

    // Scroll down to show full product cards
    await page.evaluate(() => window.scrollBy(0, 380));
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshot_catalog_grid_scrolled.png' });
    console.log('Saved screenshot_catalog_grid_scrolled.png');

    // Also take a screenshot of the homepage showcase
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => {
      const el = document.getElementById('flagship-products');
      if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshot_homepage_flagships.png' });
    console.log('Saved screenshot_homepage_flagships.png');

  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
