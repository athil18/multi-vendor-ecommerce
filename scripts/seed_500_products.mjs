/**
 * Enterprise Database Seeder: 500+ Curated Products Across Respective Categories
 * 
 * @agent engineering-database-reliability-engineer
 * @agent engineering-database-optimizer
 * @agent 04-sql-query-agent
 */

import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is missing!');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

// 1. Categories Definition
const CATEGORIES = [
  { name: 'Tech & Electronics', slug: 'tech-gear', desc: 'Custom mechanical keyboards, high-fidelity DACs, and precision audio gear.' },
  { name: 'Sports & Fitness', slug: 'fitness', desc: 'Aerodynamic road frames, Olympic weights, and endurance athletics gear.' },
  { name: 'Sustainable Living', slug: 'sustainable', desc: 'Hydroponic nurseries, heirloom organic botanicals, and zero-waste home goods.' },
  { name: 'Luxury & Leathercraft', slug: 'luxury', desc: 'Hand-stitched Tuscan leather bags, bespoke cardholders, and luxury timepieces.' },
  { name: 'Workspace Essentials', slug: 'workspace', desc: 'Solid walnut monitor stands, ergonomic seating, and organic merino wool mats.' },
  { name: 'Home & Ceramics', slug: 'home-and-living', desc: 'Handcrafted stoneware ceramic vessels, mineral glazes, and spun brass lamps.' },
  { name: 'Audio & Acoustics', slug: 'audio', desc: 'Planar magnetic studio monitors, tube preamplifiers, and acoustic diffusers.' },
  { name: 'Apparel & Textiles', slug: 'apparel', desc: 'Heavyweight organic loopwheel cotton hoodies and Japanese raw selvedge denim.' },
];

// 2. Stores / Sellers Definition
const SELLERS = [
  { name: 'Marcus Sterling', email: 'marcus@techgearpro.local', storeName: 'TechGear Pro', storeSlug: 'techgear-pro', category: 'tech-gear' },
  { name: 'Elena Rostova', email: 'elena@apexvelocity.local', storeName: 'Apex Velocity Lab', storeSlug: 'apex-velocity', category: 'fitness' },
  { name: 'Liam Thorne', email: 'liam@verdanteco.local', storeName: 'Verdant Eco Living', storeSlug: 'verdant-eco', category: 'sustainable' },
  { name: 'Matteo Veloce', email: 'matteo@atelierveloce.local', storeName: 'Atelier Veloce', storeSlug: 'atelier-veloce', category: 'luxury' },
  { name: 'Astrid Lind', email: 'astrid@minimalistcreators.local', storeName: 'Minimalist Creators', storeSlug: 'minimalist-creators', category: 'workspace' },
  { name: 'Kenji Sato', email: 'kenji@luminastudio.local', storeName: 'Lumina Studio', storeSlug: 'lumina-studio', category: 'home-and-living' },
];

// 3. Product Vocabulary Engine
const VOCABULARY = {
  'tech-gear': {
    prefixes: ['Aura', 'Apex', 'Cyber', 'Titanium', 'Spectre', 'Vanguard', 'Matrix', 'Zenith', 'Quantum', 'Nebula', 'Vortex', 'Pulse', 'Hyperion', 'Chrono', 'Krypton', 'Solaris'],
    items: ['CNC Mechanical Keyboard', 'Wireless Macro Pad', 'PBT Dye-Sub Keycap Set', 'Planar Magnetic DAC', 'Aviator USB-C Coiled Cable', 'Artisan Brass Keycap', 'Low-Profile Typing Deck', 'Titanium Switch Puller', 'Silicone Gasket Plate Kit', 'Braided Balanced Audio Cable', 'Desktop Headphone Stand', 'OLED Stream Controller'],
    materials: ['CNC 6063 Aluminum', 'Titanium PVD Coated', 'Polycarbonate Frosted', 'Brass Weighted Core', 'Carbon Fiber Inlay'],
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [45, 480],
    tags: ['mechanical-keyboard', 'custom-cables', 'audiophile', 'cnc-machined', 'rgb-lighting']
  },
  'fitness': {
    prefixes: ['Velox', 'Aero', 'Endurance', 'Kevlar', 'Olympic', 'Pro-Form', 'Summit', 'Apex', 'Stealth', 'Dynamo', 'Kinetic', 'Carbon', 'Ironclad', 'Titan', 'Vigor', 'Atlas'],
    items: ['Carbon Fiber Road Frame', 'Precision Hex Dumbbell Set', 'Olympic Cerakote Barbell', 'Ergonomic Speed Jump Rope', 'Cast Iron Kettlebell', 'Competition Weightlifting Belt', 'Recovery Massage Gun', 'Aerodynamic Cycling Helmet', 'Adjustable Dumbbell Stand', 'High-Density Foam Roller', 'Titanium Cycling Pedals', 'Billet Aluminum Pulley Wheel'],
    materials: ['Toray T800 Carbon Fiber', 'Solid Cast Iron', 'Electrophoretic Cerakote Coating', 'Multi-Layer Top-Grain Leather'],
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [35, 1250],
    tags: ['fitness', 'olympic-weights', 'carbon-fiber', 'cycling', 'recovery']
  },
  'sustainable': {
    prefixes: ['Verdant', 'Terra', 'Eco', 'Botanical', 'Solstice', 'Arbor', 'Prism', 'Gaia', 'Biolume', 'Organic', 'Heirloom', 'Sylvan', 'Eden', 'Living', 'Rooted', 'Sprout'],
    items: ['Vertical Hydroponic Tower', 'Self-Watering Ceramic Planter', 'Heirloom Microgreens Growing Kit', 'Cold-Pressed Botanical Serum', 'Mycelium Acoustic Wall Panel', 'Reclaimed Teak Garden Trowel', 'Compost Aerator System', 'Organic Cotton Canvas Tote', 'Beeswax Food Preservation Wraps', 'Bamboo Fiber Cutlery Set', 'Indoor Mushroom Fruiting Chamber', 'Solar-Distilled Plant Nutrient'],
    materials: ['100% Recycled Ocean Polymers', 'Glazed Terracotta', 'Organic Heirloom Seeds', 'FSC-Certified Solid Teak'],
    images: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [22, 340],
    tags: ['hydroponics', 'sustainable', 'organic', 'zero-waste', 'heirloom']
  },
  'luxury': {
    prefixes: ['Atelier', 'Veloce', 'Monaco', 'Sovereign', 'Heritage', 'Regal', 'Palazzo', 'Tuscan', 'Chrono', 'Luxe', 'Imperial', 'Aurelius', 'Grand', 'Noble', 'Vintage', 'Signet'],
    items: ['Full-Grain Weekender Duffel', 'Bespoke Cardholder Wallet', 'Automatic Horology Watch', 'Vegetable-Tanned Watch Roll', 'Hand-Forged Damascus Pocket Knife', 'Brass Aviator Sunglasses', 'Monogrammed Passport Cover', 'Hand-Stitched Leather Belt', 'Sterling Silver Signet Ring', 'Minimalist Bi-Fold Wallet', 'Solid Brass Key Shackle', 'Travel Watch Travel Folio'],
    materials: ['Full-Grain Tuscan Vachetta Leather', '316L Surgical Grade Stainless Steel', 'Japanese Miyota Automatic Caliber', 'Solid Hand-Turned Brass'],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [65, 890],
    tags: ['luxury', 'leather-goods', 'handcrafted', 'horology', 'italian-leather']
  },
  'workspace': {
    prefixes: ['Nordic', 'Ergo', 'Walnut', 'Linear', 'Artisan', 'Studio', 'Forma', 'Focus', 'Cortex', 'Haven', 'Element', 'Nexus', 'Kanso', 'Balance', 'Craft', 'Minimal'],
    items: ['Solid Walnut Dual Monitor Stand', 'Merino Wool Felt Desk Mat', 'MagSafe Wooden Charging Dock', 'Magnetic Aluminum Cable Organizer', 'Ergonomic Active Lumbar Chair', 'Adjustable Walnut Laptop Riser', 'Architectural Acrylic Desk Blotter', 'Bespoke Oak Pencil Tray', 'Desktop Audio Shelf Organizer', 'Solid Brass Desk Weight', 'Pegboard Modular Storage Kit', 'Under-Desk Steel Cable Tray'],
    materials: ['Kiln-Dried American Black Walnut', '100% German Merino Wool Felt', 'Anodized Aircraft Aluminum', 'Solid White Oak'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [38, 560],
    tags: ['workspace', 'desk-setup', 'ergonomics', 'solid-walnut', 'minimalist']
  },
  'home-and-living': {
    prefixes: ['Lumina', 'Komorebi', 'Sumi', 'Stoneware', 'Artisan', 'Kyoto', 'Ember', 'Celadon', 'Wabi', 'Mineral', 'Earthen', 'Brass', 'Aura', 'Glow', 'Horizon', 'Terra'],
    items: ['Stoneware Ceramic Coffee Dripper', 'Volcanic Ash Glazed Matcha Bowl', 'Spun Brass Ambient Desk Lamp', 'Hand-Carved Hinoki Bath Tray', 'Linen Woven Table Runner', 'Textured Ceramic Espresso Cup Set', 'Cast Iron Japanese Teapot', 'Soy Wax Botanical Amber Candle', 'Mouth-Blown Fluted Glass Carafe', 'Hand-Dyed Indigo Throw Blanket', 'Minimalist Ceramic Incense Holder', 'Terracotta Pour-Over Carafe'],
    materials: ['Wheel-Thrown Shigaraki Stoneware', 'Spun Solid Unlacquered Brass', '100% Belgian Washed Linen', 'Japanese Hinoki Cypress'],
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [28, 420],
    tags: ['ceramics', 'ambient-lighting', 'home-decor', 'japanese-craft', 'handcrafted']
  },
  'audio': {
    prefixes: ['Sonic', 'Resonance', 'Planar', 'Acoustic', 'Valhalla', 'Symphony', 'Harmonic', 'Ohm', 'Valve', 'Fidelity', 'Aether', 'Decibel', 'Soundstage', 'Zenith', 'Echo', 'Frequency'],
    items: ['Open-Back Planar Magnetic Headphones', 'Desktop Tube Headphone Amplifier', 'High-Res Lossless Audio Streamer', 'Acoustic Hardwood Diffuser Panel', 'Solid Copper Interconnect Cable', 'In-Ear Monitor with Beryllium Drivers', 'Isolation Pad Set for Studio Monitors', 'Aluminum Volume Control Knob', 'Balanced XLR Microphone Preamp', 'Solid Billet Headphone Amplifier Chassis'],
    materials: ['Solid Walnut Wood Rings', 'Oxygen-Free Pure Copper', 'CNC Machined Anodized Aluminum', 'Titanium Driver Diaphragm'],
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [85, 1450],
    tags: ['audiophile', 'planar-magnetic', 'studio-monitors', 'dac-amp', 'hifi']
  },
  'apparel': {
    prefixes: ['Kuro', 'Loopwheel', 'Atelier', 'Selvedge', 'Artisan', 'Tenue', 'Denim', 'Heritage', 'Indigo', 'Mercer', 'Standard', 'Raw', 'Tailored', 'Minimal', 'Canvas', 'Weave'],
    items: ['Heavyweight 500GSM Loopwheel Hoodie', '15oz Japanese Raw Selvedge Denim', 'Supima Long-Staple Cotton T-Shirt', 'Merino Wool Thermal Crewneck', 'Waxed Canvas Utility Overshirt', 'Hand-Dyed Natural Indigo Workshirt', 'Tailored Chino with Horn Buttons', 'Cashmere Wool Waffle Beanie', 'French Terry Sweatshorts', 'Ripstop Field Anorak Jacket'],
    materials: ['100% Organic Loopwheel Cotton', 'Kuroki Mills 15oz Selvedge Denim', 'Grade-A Mongolian Cashmere', 'American Supima Cotton'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    ],
    priceRange: [45, 380],
    tags: ['selvedge-denim', 'loopwheel-hoodie', 'organic-cotton', 'japanese-denim', 'artisan-apparel']
  },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('=== NEXUS 500+ PRODUCT DATABASE SEEDER ===');
  const client = await pool.connect();
  console.log('Connected to Neon PostgreSQL database.');

  try {
    await client.query('BEGIN');

    // Step 1: Provision Categories
    console.log('Step 1: Upserting Categories...');
    const categoryMap = {}; // slug -> id
    for (const cat of CATEGORIES) {
      const res = await client.query(`
        INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW())
        ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
        RETURNING "id", "slug";
      `, [cat.name, cat.slug]);
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }
    console.log(`✓ ${Object.keys(categoryMap).length} Categories initialized.`);

    // Step 2: Provision Sellers & Stores
    console.log('Step 2: Upserting Sellers & Stores...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const sellerList = []; // [{ userId, storeId, categorySlug }]

    for (const s of SELLERS) {
      const userRes = await client.query(`
        INSERT INTO "users" ("id", "email", "password", "name", "role", "status", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, 'seller', 'active', NOW(), NOW())
        ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name"
        RETURNING "id";
      `, [s.email, hashedPassword, s.name]);
      const userId = userRes.rows[0].id;

      const storeRes = await client.query(`
        INSERT INTO "stores" ("id", "sellerId", "name", "slug", "description", "governanceStatus", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'good_standing', NOW(), NOW())
        ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
        RETURNING "id";
      `, [userId, s.storeName, s.storeSlug, `Independent atelier for ${s.storeName}`]);
      const storeId = storeRes.rows[0].id;

      sellerList.push({ userId, storeId, categorySlug: s.category });
    }
    console.log(`✓ ${sellerList.length} Sellers & Stores initialized.`);

    // Step 3: Synthesize 500 Curated Products Across Categories
    console.log('Step 3: Generating 500 Unique Products Across Respective Categories...');
    const TARGET_PRODUCTS = 500;
    const catKeys = Object.keys(VOCABULARY);
    const productsToInsert = [];
    const usedSlugs = new Set();

    let serial = 1;
    while (productsToInsert.length < TARGET_PRODUCTS) {
      const catKey = catKeys[productsToInsert.length % catKeys.length];
      const vocab = VOCABULARY[catKey];
      const categoryId = categoryMap[catKey] || Object.values(categoryMap)[0];
      const seller = sellerList[productsToInsert.length % sellerList.length];

      const prefix = vocab.prefixes[Math.floor(Math.random() * vocab.prefixes.length)];
      const item = vocab.items[Math.floor(Math.random() * vocab.items.length)];
      const material = vocab.materials[Math.floor(Math.random() * vocab.materials.length)];

      const title = `${prefix} ${item}`;
      let baseSlug = slugify(title);
      let uniqueSlug = `${baseSlug}-${serial}`;
      while (usedSlugs.has(uniqueSlug)) {
        serial++;
        uniqueSlug = `${baseSlug}-${serial}`;
      }
      usedSlugs.add(uniqueSlug);

      const minPrice = vocab.priceRange[0];
      const maxPrice = vocab.priceRange[1];
      const basePrice = parseFloat((minPrice + Math.random() * (maxPrice - minPrice)).toFixed(2));
      const rating = parseFloat((4.6 + Math.random() * 0.4).toFixed(2));
      const numReviews = Math.floor(12 + Math.random() * 180);
      const image = vocab.images[Math.floor(Math.random() * vocab.images.length)];

      const description = `Precision handcrafted ${item.toLowerCase()} engineered from ${material.toLowerCase()}. Meticulously fabricated in small studio batches to deliver uncompromised tactile feedback, structural rigidity, and enduring aesthetics. Backed by the Nexus 100% escrow buyer protection guarantee.`;

      productsToInsert.push({
        name: title,
        slug: uniqueSlug,
        description,
        categoryId,
        sellerId: seller.userId,
        basePrice,
        rating,
        numReviews,
        image,
        tags: vocab.tags,
        options: JSON.stringify([
          { name: 'Finish', values: ['Raw Matte', 'Anodized Slate', 'Burnished Brass'] },
          { name: 'Batch Edition', values: ['Standard Edition', 'Founder Serialized Run'] }
        ])
      });
      serial++;
    }

    console.log(`Generated ${productsToInsert.length} product records in memory. Inserting in batches of 50...`);

    // Step 4: Batch Insert Products & Respective Variants
    const BATCH_SIZE = 50;
    let totalInserted = 0;

    for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + BATCH_SIZE);
      
      for (const p of batch) {
        // Insert product
        const prodRes = await client.query(`
          INSERT INTO "products" (
            "id", "sellerId", "categoryId", "name", "slug", "description",
            "basePrice", "status", "inStock", "images", "tags", "options",
            "rating", "numReviews", "createdAt", "updatedAt"
          )
          VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5,
            $6, 'published', true, ARRAY[$7]::text[], $8, $9::jsonb,
            $10, $11, NOW(), NOW()
          )
          ON CONFLICT ("slug") DO NOTHING
          RETURNING "id", "sellerId", "basePrice";
        `, [
          p.sellerId, p.categoryId, p.name, p.slug, p.description,
          p.basePrice, p.image, p.tags, p.options,
          p.rating, p.numReviews
        ]);

        if (prodRes.rows.length > 0) {
          const insertedProduct = prodRes.rows[0];
          
          // Insert 2 variants for each product
          await client.query(`
            INSERT INTO "variants" (
              "id", "productId", "sellerId", "sku", "price", "stock",
              "lowStockThreshold", "isActive", "attributes", "createdAt", "updatedAt"
            )
            VALUES 
              (gen_random_uuid()::text, $1, $2, $3, $4, 45, 5, true, '{"finish": "Raw Matte"}'::jsonb, NOW(), NOW()),
              (gen_random_uuid()::text, $1, $2, $5, $6, 20, 5, true, '{"finish": "Anodized Slate"}'::jsonb, NOW(), NOW())
            ON CONFLICT ("productId", "sku") DO NOTHING;
          `, [
            insertedProduct.id,
            insertedProduct.sellerId,
            `SKU-${p.slug}-STD`,
            insertedProduct.basePrice,
            `SKU-${p.slug}-EDN`,
            parseFloat((insertedProduct.basePrice * 1.15).toFixed(2))
          ]);
        }
      }

      totalInserted += batch.length;
      process.stdout.write(`\rProgress: ${totalInserted} / ${productsToInsert.length} products committed...`);
    }

    await client.query('COMMIT');
    console.log('\n\n=== TRANSACTION COMMITTED SUCCESSFULLY ===');

    // Step 5: Verification & Distribution Count
    const totalProdCount = await client.query('SELECT count(*) FROM "products"');
    const totalVariantCount = await client.query('SELECT count(*) FROM "variants"');
    const catDistribution = await client.query(`
      SELECT c.name as category, count(p.id) as count
      FROM "categories" c
      LEFT JOIN "products" p ON p."categoryId" = c.id
      GROUP BY c.name
      ORDER BY count DESC;
    `);

    console.log(`\n🎉 Neon Database Now Contains:`);
    console.log(` - Total Products: ${totalProdCount.rows[0].count}`);
    console.log(` - Total Variants: ${totalVariantCount.rows[0].count}`);
    console.log(`\nDistribution by Category:`);
    console.table(catDistribution.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\nDatabase seeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
