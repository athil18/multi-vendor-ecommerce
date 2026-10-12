import { CATEGORY_IMAGE_POOLS } from './enforce_1to1_catalog_uniqueness.mjs';

const seen = new Map();
const duplicates = [];

for (const [category, pool] of Object.entries(CATEGORY_IMAGE_POOLS)) {
  pool.forEach((url, idx) => {
    if (seen.has(url)) {
      duplicates.push({
        url,
        firstSeen: seen.get(url),
        duplicateAt: { category, index: idx }
      });
    } else {
      seen.set(url, { category, index: idx });
    }
  });
}

console.log(`Total unique images in pools: ${seen.size}`);
console.log(`Total duplicates found: ${duplicates.length}`);
if (duplicates.length > 0) {
  console.log(JSON.stringify(duplicates, null, 2));
}
