import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL is missing from environment.');
  process.exit(1);
}

const isRemoteDb = connectionString.includes('sslmode=') || connectionString.includes('neon.tech');
const pool = new pg.Pool({
  connectionString,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});

async function verify() {
  const client = await pool.connect();
  try {
    console.log('=== DATABASE VERIFICATION REPORT ===');
    
    // 1. Product count
    const countRes = await client.query('SELECT count(*) FROM products WHERE "deletedAt" IS NULL;');
    const totalCount = parseInt(countRes.rows[0].count, 10);
    console.log(`TOTAL_ACTIVE_PRODUCTS: ${totalCount}`);

    // 2. Category count and breakdown
    const catRes = await client.query(`
      SELECT c.name as category, count(p.id) as count
      FROM categories c
      LEFT JOIN products p ON p."categoryId" = c.id AND p."deletedAt" IS NULL
      GROUP BY c.name
      ORDER BY count DESC;
    `);
    console.log('CATEGORY_DISTRIBUTION:');
    catRes.rows.forEach(r => console.log(`  - ${r.category}: ${r.count}`));

    // 3. Duplicate slug check
    const dupSlugRes = await client.query(`
      SELECT slug, count(*) FROM products GROUP BY slug HAVING count(*) > 1;
    `);
    console.log(`DUPLICATE_SLUGS: ${dupSlugRes.rowCount}`);

    // 4. Variant verification
    const varRes = await client.query('SELECT count(*) FROM variants;');
    console.log(`TOTAL_VARIANTS: ${varRes.rows[0].count}`);

    // 5. Check integrity (null checks on required fields)
    const invalidRes = await client.query(`
      SELECT count(*) FROM products 
      WHERE name IS NULL 
         OR "basePrice" IS NULL 
         OR "basePrice" <= 0 
         OR "categoryId" IS NULL 
         OR "sellerId" IS NULL;
    `);
    console.log(`INVALID_INTEGRITY_PRODUCTS: ${invalidRes.rows[0].count}`);

    // 6. Check sellers/stores
    const storeRes = await client.query('SELECT id, name FROM stores WHERE "deletedAt" IS NULL;');
    console.log(`ACTIVE_STORES: ${storeRes.rowCount}`);

    // 7. Check image references
    const imgRes = await client.query(`
      SELECT count(*) FROM products 
      WHERE images IS NULL OR array_length(images, 1) = 0;
    `);
    console.log(`PRODUCTS_MISSING_IMAGES: ${imgRes.rows[0].count}`);

    // 8. Breakdown of legacy vs batch seeded products
    const seedBatchRes = await client.query(`
      SELECT count(*) FROM products WHERE id LIKE 'prod-seed-%';
    `);
    console.log(`BATCH_SEEDED_PRODUCTS (deterministic prod-seed-*): ${seedBatchRes.rows[0].count}`);

    const otherRes = await client.query(`
      SELECT id, name, slug, "createdAt" FROM products WHERE id NOT LIKE 'prod-seed-%';
    `);
    console.log(`PRE_EXISTING_LEGACY_PRODUCTS: ${otherRes.rowCount}`);
    otherRes.rows.forEach(p => console.log(`  - [${p.id}] ${p.name} (${p.slug})`));

  } catch (err) {
    console.error('VERIFICATION_ERROR:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verify();
