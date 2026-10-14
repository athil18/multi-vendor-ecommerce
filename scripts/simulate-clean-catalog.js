const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

// Define the exact list of unwanted / incorrect / misaligned / low-aesthetic product IDs
const idsToRemove = new Set([
  // 1. Plumbing / Swing / Odd Home items
  'prod-15',  // Wooden Bathroom Sink With Mirror
  'prod-43',  // Decoration Swing
  'prod-44',  // Family Tree Photo Frame
  'prod-109', // Selfie Lamp with iPhone

  // 2. Sports equipment in Jewelry & Accessories / Chronos
  'prod-146', // Football
  'prod-147', // Golf Ball
  'prod-148', // Iron Golf
  'prod-149', // Metal Baseball Bat
  'prod-150', // Tennis Ball
  'prod-151', // Tennis Racket
  'prod-152', // Volleyball

  // 3. Tech gadgets / cameras / accessories in Chronos Haute Horlogerie
  'prod-98',  // Amazon Echo Plus
  'prod-101', // Apple Airpower Wireless Charger
  'prod-102', // Apple HomePod Mini Cosmic Grey
  'prod-104', // Apple MagSafe Battery Pack
  'prod-106', // Beats Flex Wireless Earphones
  'prod-108', // Monopod
  'prod-110', // Selfie Stick Monopod
  'prod-111', // TV Studio Camera Pedestal
  'prod-107', // iPhone 12 Silicone Case with MagSafe Plum

  // 4. Handbags & Joggers with Swiss Watch specs in Chronos
  'prod-171', // Blue Women's Handbag
  'prod-172', // Heshe Women's Leather Bag
  'prod-173', // Prada Women Bag
  'prod-174', // White Faux Leather Backpack
  'prod-175', // Women Handbag Black
  'prod-181', // Green Crystal Earring
  'prod-182', // Green Oval Earring
  'prod-183', // Tropical Earring
  'prod-199', // Classic Comfort Drawstring Joggers

  // 5. Non-tech vehicles/furniture/luggage in Tech & Electronics
  'prod-225', // Modern Minimalist Workstation Setup
  'prod-237', // Sleek Futuristic Electric Bicycle
  'prod-238', // Sleek All-Terrain Go-Kart
  'prod-240', // Sleek Olive Green Hardshell Carry-On Luggage
  'prod-241', // Chic Transparent Fashion Handbag

  // 6. Low quality / uncapitalized / weird dress names in Fashion
  'prod-326', // tshirt (uncapitalized, wrong watch image)
  'prod-84',  // Gigabyte Aorus Men Tshirt (gamer merch in Italian atelier)
  'prod-161', // Blue Frock
  'prod-162', // Girl Summer Dress
  'prod-164', // Short Frock
  'prod-179', // Dress Pea

  // 7. Repetitive duplicate Platzi stock clothing
  'prod-194', // Classic Red Pullover Hoodie
  'prod-196', // Classic Grey Hooded Sweatshirt
  'prod-197', // Classic Black Hooded Sweatshirt
  'prod-200', // Classic Red Jogger Sweatpants
  'prod-202', // Classic Blue Baseball Cap
  'prod-203', // Classic Red Baseball Cap
  'prod-204', // Classic Black Baseball Cap
  'prod-205', // Classic Olive Chino Shorts
  'prod-208', // Classic White Tee (duplicate of prod-207)
  'prod-209', // Classic Black T-Shirt

  // 8. Low-aesthetic footwear / slippers / glitter heels
  'prod-184', // Black & Brown Slipper
  'prod-186', // Golden Shoes Woman
  'prod-187', // Pampi Shoes
  'prod-227', // Futuristic Holographic Soccer Cleats
  'prod-228', // Rainbow Glitter High Heels
  'prod-229', // Chic Summer Denim Espadrille Sandals

  // 9. Cheap drugstore cosmetics in luxury atelier
  'prod-1',   // Essence Mascara Lash Princess
  'prod-2',   // Eyeshadow Palette with Mirror
  'prod-3',   // Powder Canister
  'prod-4',   // Red Lipstick
  'prod-5',   // Red Nail Polish
  'prod-6',   // Calvin Klein CK One (failed fetch)
  'prod-117', // Attitude Super Leaves Hand Soap
  'prod-118', // Olay Ultra Moisture Shea Butter Body Wash
  'prod-119', // Vaseline Men Body and Face Lotion
]);

const cleanCatalog = products.filter(p => !idsToRemove.has(p.id));

console.log(`Original count: ${products.length}`);
console.log(`Removed count: ${idsToRemove.size}`);
console.log(`Cleaned count: ${cleanCatalog.length}\n`);

const byCat = {};
const byStore = {};

cleanCatalog.forEach(p => {
  const cat = p.category?.name || 'Uncategorized';
  const store = p.storeName || p.seller?.name || 'Unknown';
  byCat[cat] = (byCat[cat] || 0) + 1;
  byStore[store] = (byStore[store] || 0) + 1;
});

console.log('Categories breakdown:');
console.log(byCat);

console.log('\nStores breakdown:');
console.log(byStore);

console.log('\n--- CLEAN CATALOG SAMPLES BY CATEGORY ---');
for (const cat of Object.keys(byCat)) {
  console.log(`\nCategory: [${cat}] (${byCat[cat]} items):`);
  cleanCatalog.filter(p => (p.category?.name === cat)).slice(0, 8).forEach(p => {
    console.log(`  - ${p.id.padEnd(28)} | ${p.name.slice(0, 42).padEnd(42)} | $${p.basePrice}`);
  });
}
