import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import crypto from 'crypto';
import slugify from 'slugify';
import { analyzeProduct } from '../src/lib/product-analyzer.ts';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function createSlug(name, id) {
  const base = slugify(name, { lower: true, strict: true });
  return `${base}-${id.slice(0, 8)}`;
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('=== STARTING NEON DATABASE DEDUPLICATION & CATALOG ENRICHMENT ===');
    
    // 1. Fetch current categories & stores
    const catRows = (await client.query('SELECT id, name, slug FROM categories;')).rows;
    const catMap = new Map();
    catRows.forEach(c => {
      catMap.set(c.slug, c.id);
      catMap.set(c.name.toLowerCase(), c.id);
    });

    // Ensure Beauty & Wellness category exists
    let beautyCatId = catMap.get('beauty-wellness');
    if (!beautyCatId) {
      const newCatId = crypto.randomUUID();
      await client.query(
        'INSERT INTO categories (id, name, slug, "updatedAt") VALUES ($1, $2, $3, NOW());',
        [newCatId, 'Beauty & Wellness', 'beauty-wellness']
      );
      catMap.set('beauty-wellness', newCatId);
      catMap.set('beauty & wellness', newCatId);
      console.log(`Created Category: Beauty & Wellness [${newCatId}]`);
    }

    const storeRows = (await client.query('SELECT id, "sellerId", name FROM stores;')).rows;
    console.log(`Available Stores: ${storeRows.length}`);

    // Category mapping helper
    function resolveCategoryId(catName) {
      const lower = (catName || '').toLowerCase();
      if (lower.includes('beauty') || lower.includes('wellness') || lower.includes('fragrance') || lower.includes('skincare')) {
        return catMap.get('beauty-wellness') || catRows[0].id;
      }
      if (lower.includes('tech') || lower.includes('electronic') || lower.includes('laptop') || lower.includes('smart') || lower.includes('audio')) {
        return catMap.get('tech-gear') || catMap.get('audio') || catRows[0].id;
      }
      if (lower.includes('home') || lower.includes('living') || lower.includes('furniture') || lower.includes('kitchen') || lower.includes('ceramic')) {
        return catMap.get('home-and-living') || catRows[0].id;
      }
      if (lower.includes('fashion') || lower.includes('apparel') || lower.includes('clothing') || lower.includes('shirt') || lower.includes('dress')) {
        return catMap.get('apparel') || catRows[0].id;
      }
      if (lower.includes('luxury') || lower.includes('jewel') || lower.includes('watch') || lower.includes('bag')) {
        return catMap.get('luxury') || catRows[0].id;
      }
      if (lower.includes('sport') || lower.includes('fitness')) {
        return catMap.get('fitness') || catRows[0].id;
      }
      if (lower.includes('sustain') || lower.includes('eco')) {
        return catMap.get('sustainable') || catRows[0].id;
      }
      return catMap.get('workspace') || catRows[0].id;
    }

    // 2. Fetch current DB products & identify duplicates/repeats
    const currentProducts = (await client.query('SELECT * FROM products WHERE "deletedAt" IS NULL ORDER BY "createdAt" ASC;')).rows;
    console.log(`Current DB Products: ${currentProducts.length}`);

    const canonicalMap = new Map();
    const purgeIds = [];
    const updateRecords = [];

    for (const p of currentProducts) {
      // Clean name of repeated numbering: "Merino Knit Sweater No. 1" -> "Merino Knit Sweater"
      let cleanName = p.name.replace(/\s+(no\.?\s*\d+|\d+)$/i, '').trim();
      let normKey = cleanName.toLowerCase().replace(/^(artisan atelier|bespoke studio|heritage crafted|signature edition)\s+/i, '').trim();

      if (!canonicalMap.has(normKey)) {
        canonicalMap.set(normKey, p.id);
        if (cleanName !== p.name) {
          updateRecords.push({ id: p.id, name: cleanName });
        }
      } else {
        // Redundant duplicate instance
        purgeIds.push(p.id);
      }
    }

    console.log(`Duplicates / repeated concept instances to purge: ${purgeIds.length}`);
    console.log(`Unique DB products to retain & update: ${currentProducts.length - purgeIds.length}`);

    // Begin atomic transaction
    await client.query('BEGIN;');

    // 3. Purge duplicate variants & products
    if (purgeIds.length > 0) {
      // Delete variants first (or cascade)
      await client.query('DELETE FROM variants WHERE "productId" = ANY($1::text[]);', [purgeIds]);
      await client.query('DELETE FROM products WHERE id = ANY($1::text[]);', [purgeIds]);
      console.log(`Successfully purged ${purgeIds.length} duplicate products from database.`);
    }

    // 4. Update retained products with cleaned names
    for (const item of updateRecords) {
      await client.query('UPDATE products SET name = $1, "updatedAt" = NOW() WHERE id = $2;', [item.name, item.id]);
    }
    console.log(`Updated ${updateRecords.length} retained products with cleaned titles.`);

    // 5. Add diverse open-source products from dataset
    const openSourceData = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
    console.log(`Loaded ${openSourceData.length} open-source products.`);

    const existingKeys = new Set(Array.from(canonicalMap.keys()));
    let insertedCount = 0;

    for (let i = 0; i < openSourceData.length; i++) {
      const item = openSourceData[i];
      const normKey = item.name.toLowerCase().trim();

      if (existingKeys.has(normKey)) {
        continue; // Prevent any overlap
      }
      existingKeys.add(normKey);

      const assignedStore = storeRows[i % storeRows.length];
      const targetCatId = resolveCategoryId(item.categoryName || item.category?.name);
      const prodId = crypto.randomUUID();
      const slug = createSlug(item.name, prodId);
      const price = Number(item.basePrice || item.price || 49.99);
      const images = Array.isArray(item.images) && item.images.length > 0 
        ? item.images.filter(img => typeof img === 'string' && img.startsWith('http') && !img.includes('placehold.co'))
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'];

      const options = JSON.stringify([
        { name: 'Finish', values: ['Standard', 'Matte Black', 'Brushed Silver'] },
        { name: 'Edition', values: ['Production Run', 'Curated Batch'] }
      ]);

      const tags = ['verified-catalog', item.source || 'curated', (item.categoryName || 'lifestyle').toLowerCase().replace(/\s+/g, '-')];

      // Insert product
      await client.query(`
        INSERT INTO products (
          id, "sellerId", name, slug, description, "categoryId", "basePrice",
          images, status, options, tags, rating, "numReviews", "inStock", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'published', $9, $10, $11, $12, true, NOW(), NOW()
        );
      `, [
        prodId,
        assignedStore.sellerId,
        item.name,
        slug,
        item.description || 'High quality precision crafted product designed with uncompromised aesthetics and durable construction.',
        targetCatId,
        price,
        images,
        options,
        tags,
        Number(item.rating || 4.8),
        Number(item.numReviews || 35)
      ]);

      // Insert 2 standard variants for the product
      const var1Id = crypto.randomUUID();
      const var2Id = crypto.randomUUID();
      await client.query(`
        INSERT INTO variants (id, "productId", "sellerId", sku, price, stock, "isActive", "createdAt", "updatedAt")
        VALUES 
          ($1, $2, $3, $4, $5, 50, true, NOW(), NOW()),
          ($6, $2, $3, $7, $8, 25, true, NOW(), NOW());
      `, [
        var1Id, prodId, assignedStore.sellerId, `SKU-${slug.slice(0, 15)}-STD`, price,
        var2Id, `SKU-${slug.slice(0, 15)}-LTD`, Number((price * 1.15).toFixed(2))
      ]);

      insertedCount++;
    }

    await client.query('COMMIT;');
    console.log(`Successfully inserted ${insertedCount} unique, diverse products into Neon DB!`);

    // 6. Post-migration verification
    const finalProducts = (await client.query(`
      SELECT p.id, p.name, p.slug, p."basePrice", c.name as "categoryName", s.name as "storeName"
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN stores s ON s."sellerId" = p."sellerId"
      WHERE p."deletedAt" IS NULL;
    `)).rows;

    const finalTitles = finalProducts.map(p => p.name.toLowerCase());
    const uniqueFinalTitles = new Set(finalTitles);
    const dupCount = finalTitles.length - uniqueFinalTitles.size;
    const dupRatio = (dupCount / finalTitles.length) * 100;

    console.log('\n=== FINAL CATALOG AUDIT METRICS ===');
    console.log(`Total Products in DB:       ${finalProducts.length}`);
    console.log(`Unique Product Titles:     ${uniqueFinalTitles.size}`);
    console.log(`Duplicate Title Count:     ${dupCount}`);
    console.log(`Duplicate Ratio:           ${dupRatio.toFixed(2)}%`);
    console.log(`All 100% Unique:           ${dupCount === 0 ? 'YES' : 'NO'}`);

  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('Migration failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
