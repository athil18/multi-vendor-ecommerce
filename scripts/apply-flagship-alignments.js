const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));

const updates = {
  'spotlight-1': {
    name: 'Masterwork Monolith CNC Mechanical Keyboard',
    description: 'Milled from a solid billet of aerospace-grade 6063 aluminum with bespoke brass weight dampeners, poron gasket mount acoustic isolation, and hand-lubricated mechanical switches.',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1200'],
  },
  'flagship-eames-lounge-chair': {
    name: 'Nordic Atelier Ochre Velvet Accent Chair',
    description: 'Designed by Scandinavian guild artisans with tailored ochre velvet upholstery, ergonomic posture support, and black timber legs. Accompanied by a minimalist architectural brass reading lamp.',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 1250,
    price: 1250,
  },
  'flagship-tuscan-duffle': {
    name: 'Atelier Veloce Tuscan Waxed Canvas & Vacchetta Rucksack',
    description: 'Handcrafted in Florence pairing water-resistant forest-green waxed canvas with full-grain Vacchetta bridle leather straps, antiqued brass hardware, and dual quick-release compartments.',
    images: ['https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 480,
    price: 480,
  },
  'flagship-cashmere-overcoat': {
    name: 'Sartoria Milano Bespoke Midnight Navy Wool Suit',
    description: 'Cut by master Milanese tailors from Super 150s Australian merino wool with hand-stitched canvassing, natural horn buttons, and high-armhole silhouette. Designed for commanding presence.',
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 1450,
    price: 1450,
  },
  'flagship-tuscan-chelsea-boots': {
    name: 'Handcrafted Tuscan Goodyear-Welted Leather Service Boots',
    description: 'Sculpted by master cordwainers in Florence using vegetable-tanned French box calfskin and traditional 360-degree Goodyear welt construction. Finished with burnished brogue toe caps and durable studded rubber soles.',
    images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 520,
    price: 520,
  },
  'flagship-nike-dunk-panda': {
    name: "Nike Air Force 1 '07 Triple White Monochrome",
    description: 'The definitive monochrome court icon. Created for hardwood and adopted by street culture, featuring crisp full-grain leather, perforated toe box, and encapsulated Air-Sole cushioning.',
    images: ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 140,
    price: 140,
  },
  'flagship-la-mer-cream': {
    name: 'Maison Oriel Botanical Elixir Cell-Renewal Facial Oil',
    description: 'Crafted in Grasse workshops through cold-press botanical extraction. Infused with organic squalane, cold-pressed rosehip seed oil, and botanical extracts to restore lipid barrier radiance.',
    images: ['https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 240,
    price: 240,
  },
  'flagship-augustinus-bader': {
    name: 'Maison Oriel Peptide Renewal Cellular Face Cream',
    description: 'An intensely luxurious, deeply hydrating cellular renewal cream powered by multi-peptides and squalane. Clinically formulated to soothe dry skin and lock in all-day moisture.',
    images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 290,
    price: 290,
  },
  'flagship-le-labo-santal': {
    name: 'Chanel Coco Mademoiselle Eau de Parfum Grand Flacon',
    description: 'An intensely feminine oriental fragrance with a surprisingly fresh, audacious character. Sparkling orange and bergamot awaken the senses, revealing clear accords of May rose and Grasse jasmine.',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 195,
    price: 195,
  },
  'flagship-tom-ford-vanille': {
    name: "Chanel Gabrielle L'Eau de Parfum Flacon d'Or",
    description: 'A luminous golden solar fragrance composed of four flowers: exotic jasmine, radiant ylang-ylang, sparkling orange blossom, and intensely feminine Grasse tuberose.',
    images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200'],
    basePrice: 215,
    price: 215,
  }
};

let updatedCount = 0;
const finalCatalog = products.map(p => {
  if (updates[p.id]) {
    updatedCount++;
    return {
      ...p,
      ...updates[p.id]
    };
  }
  return p;
});

console.log(`Updated ${updatedCount} flagship items with exact visual and metadata matches.`);
fs.writeFileSync('./src/data/products.json', JSON.stringify(finalCatalog, null, 2));
console.log('Saved updated catalog to src/data/products.json!');
