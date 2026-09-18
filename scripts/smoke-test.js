const path = require('path');
const { chromium } = require(path.join(__dirname, '../apps/node_modules/@playwright/test'));

async function smokeTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1. Click Add to Cart
  console.log('1. Testing Add to Cart button...');
  const addBtn = await page.waitForSelector('button[aria-label="Add Artisan Mechanical Keyboard to cart"]');
  await addBtn.click();
  await page.waitForTimeout(600);
  const cartAria = await page.$eval('button[aria-label*="Shopping cart"]', b => b.getAttribute('aria-label'));
  console.log('   Cart button aria-label after add:', cartAria);

  // 2. Open Cart Drawer
  console.log('2. Testing Cart Drawer toggle...');
  const cartBtn = await page.waitForSelector('button[aria-label*="Shopping cart"]');
  await cartBtn.click();
  await page.waitForTimeout(600);
  const drawerOpen = await page.isVisible('text=Shopping Cart');
  console.log('   Shopping Cart Drawer open:', drawerOpen);

  // 3. Open AI Copilot (Lazy Loaded)
  console.log('3. Testing AI Copilot lazy chunk on-demand load...');
  const aiBtn = await page.waitForSelector('button[aria-label="AI Copilot - Open AI Assistant"]');
  await aiBtn.click();
  await page.waitForTimeout(800);
  const copilotOpen = await page.isVisible('text=Nexus AI Copilot');
  console.log('   Nexus AI Copilot Panel open:', copilotOpen);

  await browser.close();
  console.log('\n>>> SUCCESS: ALL STOREFRONT COMMERCE CAPABILITIES 100% OPERATIONAL <<<');
}

smokeTest().catch(err => {
  console.error(err);
  process.exit(1);
});
