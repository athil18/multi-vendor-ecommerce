const fs = require('fs');

const filePath = './src/data/products.json';
const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const imageUpdates = {
  'flagship-eames-lounge-chair': [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80&w=1200'
  ],
  'flagship-tuscan-duffle': [
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1200'
  ],
  'flagship-cashmere-overcoat': [
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=1200'
  ],
  'flagship-nike-dunk-panda': [
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=1200'
  ],
  'flagship-la-mer-cream': [
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1200'
  ],
  'flagship-augustinus-bader': [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1200'
  ],
  'flagship-le-labo-santal': [
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200'
  ],
  'flagship-tom-ford-vanille': [
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200'
  ]
};

let updatedCount = 0;
products.forEach(p => {
  if (imageUpdates[p.id]) {
    p.images = imageUpdates[p.id];
    updatedCount++;
    console.log(`Updated images for: ${p.id} (${p.name})`);
  }
});

fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
console.log(`\nSuccessfully updated ${updatedCount} products in ${filePath}`);
