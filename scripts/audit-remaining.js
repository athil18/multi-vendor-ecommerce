const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
console.log('Original product count:', products.length);

// Audit remaining non-Algolia products
const nonAlgolia = products.filter(p => {
  const img = p.images?.[0] || '';
  return !img.includes('cdn-demo.algolia.com') && !img.includes('_sb.jpg') && !img.includes('_rb.jpg');
});

console.log('Non-Algolia count:', nonAlgolia.length);

// Check each of the non-Algolia products for category correctness
const flagged = [];
nonAlgolia.forEach(p => {
  const name = (p.name || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();
  const cat = (p.category?.name || p.categoryName || '').toLowerCase();

  // Obvious mismatches:
  if (cat.includes('tech') && (
    name.includes('mug') || name.includes('plant') || name.includes('flower') ||
    name.includes('dress') || name.includes('suit') || name.includes('shoe') ||
    name.includes('cream') || name.includes('perfume') || name.includes('sofa')
  )) {
    flagged.push({ id: p.id, name: p.name, cat: p.category?.name, reason: 'Non-tech in Tech category' });
  }

  if (cat.includes('fashion') && (
    name.includes('speaker') || name.includes('headphone') || name.includes('cable') ||
    name.includes('laptop') || name.includes('phone')
  )) {
    flagged.push({ id: p.id, name: p.name, cat: p.category?.name, reason: 'Tech in Fashion category' });
  }

  if (cat.includes('beauty') && (
    name.includes('chair') || name.includes('speaker') || name.includes('laptop')
  )) {
    flagged.push({ id: p.id, name: p.name, cat: p.category?.name, reason: 'Hardware in Beauty category' });
  }
});

console.log('Flagged mismatched among non-Algolia:', flagged);
