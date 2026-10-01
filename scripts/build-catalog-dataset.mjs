import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORES = [
  { id: 'seller-tech-hub', name: 'Tech Hub International', email: 'techhub@nexus.local', slug: 'tech-hub' },
  { id: 'seller-nordic-living', name: 'Nordic Living & Decor', email: 'nordic@nexus.local', slug: 'nordic-living' },
  { id: 'seller-vanguard-apparel', name: 'Vanguard Atelier', email: 'vanguard@nexus.local', slug: 'vanguard-atelier' },
  { id: 'seller-apex-athletics', name: 'Apex Athletics', email: 'apex@nexus.local', slug: 'apex-athletics' },
  { id: 'seller-lumina-optics', name: 'Lumina Studio Gear', email: 'lumina@nexus.local', slug: 'lumina-optics' },
  { id: 'seller-botanical-pure', name: 'Botanical Pure Lab', email: 'botanical@nexus.local', slug: 'botanical-pure' },
  { id: 'seller-aura-jewelry', name: 'Aura Fine Artisans', email: 'aura@nexus.local', slug: 'aura-artisans' },
  { id: 'seller-solaris-home', name: 'Solaris Living Essentials', email: 'solaris@nexus.local', slug: 'solaris-home' },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const DUMMY_DOMAINS = ['placehold.co', 'example.com', 'placeimg.com', 'pravatar.cc', 'delacruz.com', 'veirdo.in'];

const CATEGORY_IMAGE_POOLS = {
  'cat-tech': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=800',
  ],
  'cat-fashion': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
  ],
  'cat-beauty': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608248597359-0021b3693f9e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
  ],
  'cat-home': [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
  ],
  'cat-accessories': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1611591475878-8314e3048594?auto=format&fit=crop&q=80&w=800',
  ],
  'cat-sports': [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800',
  ],
};

function cleanImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let clean = url.trim();
  // Clean stringified JSON arrays often seen in Platzi/EscuelaJS
  if (clean.startsWith('["') && clean.endsWith('"]')) {
    try {
      const parsed = JSON.parse(clean);
      clean = Array.isArray(parsed) ? parsed[0] : clean;
    } catch {}
  }
  clean = clean.replace(/^[\["\s]+|[\]"\s]+$/g, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return null;
  }
  for (const dummy of DUMMY_DOMAINS) {
    if (clean.includes(dummy)) return null;
  }
  return clean;
}

function mapCategory(rawCategory) {
  const cat = (rawCategory || '').toLowerCase();
  if (cat.includes('phone') || cat.includes('laptop') || cat.includes('tech') || cat.includes('electronic') || cat.includes('tv') || cat.includes('audio') || cat.includes('gadget') || cat.includes('computer')) {
    return { id: 'cat-tech', name: 'Tech & Electronics', slug: 'tech-electronics' };
  }
  if (cat.includes('cloth') || cat.includes('shirt') || cat.includes('dress') || cat.includes('top') || cat.includes('fashion') || cat.includes('apparel') || cat.includes('shoe')) {
    return { id: 'cat-fashion', name: 'Fashion & Apparel', slug: 'fashion-apparel' };
  }
  if (cat.includes('beauty') || cat.includes('skin') || cat.includes('fragrance') || cat.includes('wellness') || cat.includes('care')) {
    return { id: 'cat-beauty', name: 'Beauty & Wellness', slug: 'beauty-wellness' };
  }
  if (cat.includes('home') || cat.includes('furniture') || cat.includes('decor') || cat.includes('kitchen') || cat.includes('lighting')) {
    return { id: 'cat-home', name: 'Home & Living', slug: 'home-living' };
  }
  if (cat.includes('jewel') || cat.includes('watch') || cat.includes('bag') || cat.includes('sunglass') || cat.includes('accessor')) {
    return { id: 'cat-accessories', name: 'Jewelry & Accessories', slug: 'jewelry-accessories' };
  }
  if (cat.includes('sport') || cat.includes('fitness') || cat.includes('outdoor')) {
    return { id: 'cat-sports', name: 'Sports & Fitness', slug: 'sports-fitness' };
  }
  return { id: 'cat-lifestyle', name: 'Lifestyle & Design', slug: 'lifestyle-design' };
}

async function run() {
  console.log('⚡ Fetching products from multiple open source websites...');

  console.log('1. Fetching from DummyJSON (dummyjson.com)...');
  const dummyRes = await fetch('https://dummyjson.com/products?limit=0').then(r => r.json());
  const dummyProducts = dummyRes.products || [];
  console.log(`   Retrieved ${dummyProducts.length} items from DummyJSON.`);

  console.log('2. Fetching from Platzi / EscuelaJS API (api.escuelajs.co)...');
  const escuelaRes = await fetch('https://api.escuelajs.co/api/v1/products?offset=0&limit=300').then(r => r.json());
  const escuelaProducts = Array.isArray(escuelaRes) ? escuelaRes : [];
  console.log(`   Retrieved ${escuelaProducts.length} items from EscuelaJS.`);

  console.log('3. Fetching from Algolia Open E-Commerce Records (github.com/algolia/datasets)...');
  const algoliaRes = await fetch('https://raw.githubusercontent.com/algolia/datasets/master/ecommerce/records.json').then(r => r.json());
  const algoliaProducts = Array.isArray(algoliaRes) ? algoliaRes : [];
  console.log(`   Retrieved ${algoliaProducts.length} items from Algolia Open Source Dataset.`);

  const seenTitles = new Set();
  const seenSlugs = new Set();
  const finalProducts = [];

  let idCounter = 1;

  function addProduct({ name, description, price, categoryName, rawImages, source, rawRating, stockCount }) {
    if (!name || typeof name !== 'string') return;
    const cleanName = name.trim();
    if (cleanName.length < 3) return;

    const normKey = normalizeTitle(cleanName);
    if (seenTitles.has(normKey)) return;

    let slug = slugify(cleanName);
    if (!slug) slug = `product-${idCounter}`;
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${idCounter}`;
    }

    const validImages = [];
    if (Array.isArray(rawImages)) {
      for (const img of rawImages) {
        const cleaned = cleanImageUrl(img);
        if (cleaned && !validImages.includes(cleaned)) validImages.push(cleaned);
      }
    } else if (typeof rawImages === 'string') {
      const cleaned = cleanImageUrl(rawImages);
      if (cleaned) validImages.push(cleaned);
    }

    const catObj = mapCategory(categoryName);

    // If no valid image found, supply high quality category-matched Unsplash product photography
    if (validImages.length === 0) {
      const pool = CATEGORY_IMAGE_POOLS[catObj.id] || CATEGORY_IMAGE_POOLS['cat-tech'];
      validImages.push(pool[idCounter % pool.length]);
    }
    const store = STORES[idCounter % STORES.length];
    const basePrice = Math.max(9.99, Number((Number(price) || 29.99).toFixed(2)));
    const compareAtPrice = Number((basePrice * (1.15 + (idCounter % 5) * 0.05)).toFixed(2));
    const rating = Math.min(5.0, Math.max(3.8, Number((rawRating || 4.2 + ((idCounter % 9) * 0.08)).toFixed(1))));
    const numReviews = Math.floor(15 + ((idCounter * 17) % 380));
    const stock = stockCount !== undefined ? Number(stockCount) : Math.floor(12 + ((idCounter * 7) % 95));

    seenTitles.add(normKey);
    seenSlugs.add(slug);

    const product = {
      id: `prod-${idCounter}`,
      _id: `prod-${idCounter}`,
      name: cleanName,
      slug,
      description: description && description.trim().length > 10 ? description.trim() : `Premium ${cleanName} engineered for exceptional durability and modern living.`,
      basePrice,
      price: basePrice,
      compareAtPrice,
      stock,
      status: 'published',
      images: validImages,
      category: catObj,
      categoryId: catObj,
      categoryName: catObj.name,
      seller: { id: store.id, name: store.name, email: store.email },
      sellerId: { id: store.id, name: store.name },
      storeName: store.name,
      store: { id: store.id, name: store.name, slug: store.slug },
      rating,
      averageRating: rating,
      numReviews,
      reviewCount: numReviews,
      variants: [],
      source,
    };

    finalProducts.push(product);
    idCounter++;
  }

  // Pass 1: DummyJSON (Diverse beauty, laptops, smartphones, fragrances, watches)
  console.log('\nProcessing DummyJSON products...');
  for (const item of dummyProducts) {
    addProduct({
      name: item.title,
      description: item.description,
      price: item.price,
      categoryName: item.category,
      rawImages: item.images && item.images.length > 0 ? item.images : [item.thumbnail],
      source: 'dummyjson',
      rawRating: item.rating,
      stockCount: item.stock,
    });
  }
  console.log(`Current unique catalog count: ${finalProducts.length}`);

  // Pass 2: EscuelaJS / Platzi Fake Store (Clothes, Shoes, Electronics, Furniture)
  console.log('\nProcessing EscuelaJS products...');
  for (const item of escuelaProducts) {
    addProduct({
      name: item.title,
      description: item.description,
      price: item.price,
      categoryName: item.category?.name || 'General',
      rawImages: item.images,
      source: 'escuelajs',
      rawRating: 4.5,
      stockCount: 45,
    });
  }
  console.log(`Current unique catalog count: ${finalProducts.length}`);

  // Pass 3: Algolia Open E-Commerce Records (High-end audio, electronics, smart home)
  console.log('\nProcessing Algolia E-Commerce products to exceed 500 items...');
  for (const item of algoliaProducts) {
    if (finalProducts.length >= 520) break;
    addProduct({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryName: Array.isArray(item.categories) ? item.categories[0] : (item.categories || 'Tech'),
      rawImages: item.image,
      source: 'algolia',
      rawRating: item.rating ? Number(item.rating) : 4.6,
      stockCount: 50,
    });
  }

  console.log(`\n🎉 Total unique, non-duplicate products collected: ${finalProducts.length}`);

  // Write to src/data/products.json
  const dataDir = path.resolve(__dirname, '../src/data');
  await fs.mkdir(dataDir, { recursive: !0 });
  const jsonPath = path.join(dataDir, 'products.json');
  await fs.writeFile(jsonPath, JSON.stringify(finalProducts, null, 2), 'utf-8');
  console.log(`✅ Saved ${finalProducts.length} products to ${jsonPath}`);

  // Verify breakdown by category and source
  const sourceBreakdown = {};
  const catBreakdown = {};
  for (const p of finalProducts) {
    sourceBreakdown[p.source] = (sourceBreakdown[p.source] || 0) + 1;
    catBreakdown[p.categoryName] = (catBreakdown[p.categoryName] || 0) + 1;
  }
  console.log('\nBreakdown by Source:');
  console.table(sourceBreakdown);
  console.log('\nBreakdown by Category:');
  console.table(catBreakdown);
}

run().catch(err => {
  console.error('Failed to build catalog:', err);
  process.exit(1);
});
