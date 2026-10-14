const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

const storeMap = {};
products.forEach(p => {
  const store = p.storeName || p.seller?.name || 'Unknown';
  if (!storeMap[store]) storeMap[store] = [];
  storeMap[store].push({ id: p.id, name: p.name, cat: p.category?.name, desc: p.description?.slice(0, 50) });
});

for (const [store, items] of Object.entries(storeMap)) {
  console.log(`\nSTORE: "${store}" (${items.length} items)`);
  items.slice(0, 15).forEach(it => console.log(`  - [${it.cat}] ${it.id}: ${it.name}`));
  if (items.length > 15) {
    console.log(`  ... and ${items.length - 15} more`);
  }
}
