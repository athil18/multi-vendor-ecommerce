const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

console.log(`=== STARTING FULL CATALOG AUDIT (${products.length} PRODUCTS) ===\n`);

// 1. Audit image sources & resolution characteristics
const domains = {};
const algoliaThumbnailProducts = [];
const imgurProducts = [];
const dummyJsonProducts = [];
const unsplashProducts = [];

products.forEach(p => {
  const primaryImg = p.images?.[0] || '';
  let hostname = 'unknown';
  try {
    hostname = new URL(primaryImg).hostname;
  } catch (e) {}

  domains[hostname] = (domains[hostname] || 0) + 1;

  if (hostname === 'cdn-demo.algolia.com') {
    algoliaThumbnailProducts.push(p);
  } else if (hostname === 'i.imgur.com') {
    imgurProducts.push(p);
  } else if (hostname === 'cdn.dummyjson.com') {
    dummyJsonProducts.push(p);
  } else if (hostname === 'images.unsplash.com') {
    unsplashProducts.push(p);
  }
});

console.log('1. Distribution of Image Providers:');
console.log(domains);

// 2. Identify Semantic Mismatches (Category vs Product Name & Type)
const semanticMismatches = [];
products.forEach(p => {
  const cat = (p.category?.name || p.categoryName || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();
  const store = (p.storeName || p.seller?.name || '').toLowerCase();

  let reason = '';

  // Bluetooth speakers / tech gear in Fashion & Apparel
  if (cat.includes('fashion') || cat.includes('apparel')) {
    if (name.includes('speaker') || name.includes('bluetooth') || name.includes('audio') || name.includes('headphone') || name.includes('case for apple') || name.includes('tv') || name.includes('cable') || name.includes('adapter')) {
      reason = 'Tech audio/accessory miscategorized under Fashion & Apparel';
    }
  }

  // Kitchen / non-tech items in Tech & Electronics
  if (cat.includes('tech') || cat.includes('electronic')) {
    if (name.includes('mug tree') || name.includes('stand') && desc.includes('kitchen') || name.includes('plant') || name.includes('dress') || name.includes('shoes') || name.includes('t-shirt') || name.includes('perfume') || name.includes('fragrance')) {
      reason = 'Kitchenware/non-tech miscategorized under Tech & Electronics';
    }
  }

  // Sartoria Milano Studio (haute fashion atelier) selling electronics
  if (store.includes('sartoria milano') && (name.includes('speaker') || name.includes('altec') || name.includes('bluetooth'))) {
    reason = 'Tailored apparel atelier assigned to cheap electronics';
  }

  // TechGear Pro Laboratories selling kitchen items or dresses
  if (store.includes('techgear pro') && (name.includes('mug') || name.includes('kitchen') || name.includes('dress'))) {
    reason = 'Tech laboratory assigned to kitchenware/apparel';
  }

  if (reason) {
    semanticMismatches.push({
      id: p.id,
      name: p.name,
      category: p.category?.name || p.categoryName,
      store: p.storeName || p.seller?.name,
      imageDomain: new URL(p.images?.[0] || 'http://localhost').hostname,
      reason
    });
  }
});

console.log(`\n2. Semantic / Category Mismatches Identified: ${semanticMismatches.length}`);
console.log('Sample Mismatches (First 10):');
console.log(semanticMismatches.slice(0, 10));

// 3. Inspect Algolia Thumbnail images: why they are blurry
console.log(`\n3. Algolia Low-Res Thumbnail Images Count: ${algoliaThumbnailProducts.length}`);
console.log('Sample Algolia URLs:');
console.log(algoliaThumbnailProducts.slice(0, 5).map(p => ({ id: p.id, name: p.name, img: p.images[0] })));
