/**
 * End-to-End Storefront Verification Script
 * Validates HTTP status, server components rendering, and key HTML accessibility markers.
 */

async function verifyStorefront() {
  const routes = [
    { url: 'http://localhost:3000', label: 'Homepage', checks: ['Crafted with Intent', 'Featured Categories', 'Featured Creations'] },
    { url: 'http://localhost:3000/products', label: 'Catalog', checks: ['Curated Collection', 'aria-label="Search products"', 'aria-label="Sort products by"'] },
    { url: 'http://localhost:3000/products?search=keyboard', label: 'Catalog Search', checks: ['Curated Collection'] },
    { url: 'http://localhost:3000/checkout', label: 'Checkout Shell', checks: ['id="main-content"'] },
    { url: 'http://localhost:3000/api/health/live', label: 'API Live Health', checks: ['"status":"live"'] },
    { url: 'http://localhost:3000/api/products', label: 'API Products', checks: ['"data"'] }
  ];

  console.log('\n===============================================================');
  console.log('🌐 RE-ENGINEERED STOREFRONT VERIFICATION SUITE');
  console.log('===============================================================');
  
  let allPass = true;
  for (const r of routes) {
    try {
      const res = await fetch(r.url);
      const text = await res.text();
      const statusOk = res.status === 200;
      const failedChecks = r.checks.filter(c => !text.includes(c));
      
      if (statusOk && failedChecks.length === 0) {
        console.log(`✅ [PASS] ${r.label.padEnd(20)}: 200 OK - All ${r.checks.length} assertions verified`);
      } else {
        console.log(`❌ [FAIL] ${r.label.padEnd(20)}: HTTP ${res.status}, Missing: ${JSON.stringify(failedChecks)}`);
        allPass = false;
      }
    } catch (e) {
      console.log(`❌ [FAIL] ${r.label.padEnd(20)}: Network error - ${e.message}`);
      allPass = false;
    }
  }

  console.log('===============================================================');
  if (allPass) {
    console.log('🎉 ALL STOREFRONT JOURNEYS VERIFIED 100% OPERATIONAL');
  } else {
    console.log('⚠️ STOREFRONT VERIFICATION REPORTED DEFECTS');
    process.exit(1);
  }
}

verifyStorefront();
