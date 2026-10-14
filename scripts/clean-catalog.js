const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

// Filter rules for high-quality, authentic marketplace catalog:
// 1. Remove all Algolia low-res search thumbnails (cdn-demo.algolia.com, _sb.jpg, _rb.jpg)
// 2. Remove all kitchen utensils, appliances, and grocery items (DummyJSON kitchen-accessories, groceries)
// 3. Keep only authentic, sharp, properly categorized products in Tech, Fashion, Footwear, Fragrance/Beauty, Horology/Accessories, and Living
const junkKeywords = [
  'spoon', 'knife', 'peeler', 'tongs', 'rolling pin', 'slotted turner', 
  'spice rack', 'chopping board', 'mug tree stand', 'glass', 'plate', 
  'silver pot with glass cap', 'boxed blender', 'carbon steel wok', 
  'hand blender', 'microwave oven', 'electric stove', 'plant pot', 'house showpiece plant'
];

const cleanedProducts = products.filter(p => {
  const img = (p.images?.[0] || '');
  
  // Rule 1: Blurry thumbnails
  if (img.includes('cdn-demo.algolia.com') || img.includes('_sb.jpg') || img.includes('_rb.jpg')) {
    return false;
  }
  
  // Rule 2: Kitchen accessories / groceries
  if (img.includes('kitchen-accessories') || img.includes('groceries')) {
    return false;
  }

  // Rule 3: Junk utensil names
  const nameLower = (p.name || '').toLowerCase();
  if (junkKeywords.some(kw => nameLower === kw || nameLower.includes(kw))) {
    return false;
  }

  // Rule 4: Must have at least 1 valid image URL
  if (!p.images || !p.images.length || !p.images[0].startsWith('http')) {
    return false;
  }

  return true;
});

console.log('Original count:', products.length);
console.log('Cleaned count:', cleanedProducts.length);
console.log('Removed count:', products.length - cleanedProducts.length);

const catCounts = {};
cleanedProducts.forEach(p => {
  const cat = p.category?.name || p.categoryName || 'Unknown';
  catCounts[cat] = (catCounts[cat] || 0) + 1;
});
console.log('\nFinal Clean Product Category Counts:');
console.log(catCounts);

fs.writeFileSync('./src/data/products.json', JSON.stringify(cleanedProducts, null, 2), 'utf8');
console.log('\nSuccessfully saved clean products to ./src/data/products.json!');
