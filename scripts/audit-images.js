const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

console.log('Total products:', products.length);
products.slice(0, 20).forEach((p, i) => {
  console.log(`\n--- [${i + 1}] ID: ${p.id} ---`);
  console.log('Name:', p.name);
  console.log('Category:', p.category?.name || p.categoryName);
  console.log('Brand:', p.brand || p.storeName);
  console.log('Images:', p.images);
});
