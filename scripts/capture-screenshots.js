const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    // Try launching installed channel msedge or chrome first, or bundled chromium
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch {
      try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
      } catch {
        browser = await chromium.launch({ headless: true });
      }
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the flagship section to be visible
    await page.waitForSelector('#flagship-products', { timeout: 10000 });
    
    // Scroll down to the flagship products
    await page.evaluate(() => {
      const el = document.getElementById('flagship-products');
      if (el) el.scrollIntoView();
    });
    
    await page.waitForTimeout(2000);

    // Capture screenshot of the flagship products section
    const flagshipSection = await page.$('#flagship-products');
    if (flagshipSection) {
      await flagshipSection.screenshot({ path: 'screenshot_flagship_verified.png' });
      console.log('Saved screenshot_flagship_verified.png');
    }

    // Capture full page screenshot
    await page.screenshot({ path: 'screenshot_full_verified.png', fullPage: true });
    console.log('Saved screenshot_full_verified.png');

    // Also navigate to /products
    console.log('Navigating to http://localhost:3000/products...');
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshot_catalog_verified.png' });
    console.log('Saved screenshot_catalog_verified.png');

    console.log('Browser screenshots successfully captured!');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
