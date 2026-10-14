const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

const audit = {
  total: products.length,
  blurryLowResCount: 0,
  blurryLowResProducts: [],
  mismatchedCategoryCount: 0,
  mismatchedProducts: [],
  cleanVerifiedCount: 0,
  cleanVerifiedProducts: [],
  byDomain: {},
  byCategory: {}
};

products.forEach(p => {
  const img = p.images?.[0] || '';
  let domain = 'none';
  try { domain = new URL(img).hostname; } catch (e) {}

  audit.byDomain[domain] = (audit.byDomain[domain] || 0) + 1;
  const cat = (p.category?.name || p.categoryName || 'Uncategorized');
  audit.byCategory[cat] = (audit.byCategory[cat] || 0) + 1;

  const name = (p.name || '').toLowerCase();
  const catLower = cat.toLowerCase();
  const desc = (p.description || '').toLowerCase();
  const store = (p.storeName || p.seller?.name || '').toLowerCase();

  // 1. Check for blurry low-res images:
  // cdn-demo.algolia.com uses tiny 160x160 to 220x89 Best Buy search thumbnails (_sb.jpg, _rb.jpg)
  const isBlurryThumb = domain === 'cdn-demo.algolia.com' || img.includes('_sb.jpg') || img.includes('_rb.jpg');

  // 2. Check for semantic / category / store mismatches:
  const isMismatched = 
    (catLower.includes('fashion') && (name.includes('speaker') || name.includes('audio') || name.includes('headphone') || name.includes('bluetooth') || name.includes('adapter') || name.includes('cable') || name.includes('case for apple') || name.includes('tv'))) ||
    (catLower.includes('tech') && (name.includes('mug') || name.includes('plant') || name.includes('dress') || name.includes('shoes') || name.includes('shirt') || (name.includes('stand') && desc.includes('kitchen')))) ||
    (store.includes('sartoria milano') && (name.includes('speaker') || name.includes('altec') || name.includes('bluetooth'))) ||
    (store.includes('techgear pro') && (name.includes('mug') || name.includes('kitchen')));

  if (isBlurryThumb) {
    audit.blurryLowResCount++;
    audit.blurryLowResProducts.push({ id: p.id, name: p.name, domain, cat });
  }

  if (isMismatched) {
    audit.mismatchedCategoryCount++;
    audit.mismatchedProducts.push({ id: p.id, name: p.name, cat, store, reason: 'Semantic mismatch' });
  }

  if (!isBlurryThumb && !isMismatched) {
    audit.cleanVerifiedCount++;
    audit.cleanVerifiedProducts.push({ id: p.id, name: p.name, domain, cat });
  }
});

console.log('AUDIT SUMMARY:');
console.log('Total Products in Database:', audit.total);
console.log('1. Blurry / Low-Res Thumbnail Products:', audit.blurryLowResCount);
console.log('2. Semantic / Category Mismatched Products:', audit.mismatchedCategoryCount);
console.log('3. Clean & Sharp Verified Products:', audit.cleanVerifiedCount);
console.log('\nBreakdown by Image Domain:', audit.byDomain);
console.log('\nBreakdown by Category:', audit.byCategory);
