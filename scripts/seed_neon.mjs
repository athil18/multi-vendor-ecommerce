import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function main() {
  console.log('Connecting to Neon PostgreSQL for initial seed...');
  const client = await pool.connect();
  console.log('Connected! Seeding initial marketplace data...');

  try {
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Users (users table)
    const adminRes = await client.query(`
      INSERT INTO "users" ("id", "email", "password", "name", "role", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'admin@marketplace.local', $1, 'Super Admin', 'admin', 'active', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name"
      RETURNING "id";
    `, [hashedPassword]);
    const adminId = adminRes.rows[0].id;

    const sellerRes = await client.query(`
      INSERT INTO "users" ("id", "email", "password", "name", "role", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'seller1@marketplace.local', $1, 'Tech Seller Pro', 'seller', 'active', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name"
      RETURNING "id";
    `, [hashedPassword]);
    const sellerId = sellerRes.rows[0].id;

    await client.query(`
      INSERT INTO "users" ("id", "email", "password", "name", "role", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'customer1@marketplace.local', $1, 'Jane Customer', 'customer', 'active', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name";
    `, [hashedPassword]);

    // 2. Stores (stores table)
    await client.query(`
      INSERT INTO "stores" ("id", "sellerId", "name", "slug", "description", "governanceStatus", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, 'Tech Haven Pro', 'tech-haven-pro', 'Premier destination for premium electronics', 'good_standing', NOW(), NOW())
      ON CONFLICT ("sellerId") DO NOTHING;
    `, [sellerId]);

    // 3. Categories (categories table)
    const catElectronics = await client.query(`
      INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'Electronics', 'electronics', NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
      RETURNING "id";
    `);

    const catApparel = await client.query(`
      INSERT INTO "categories" ("id", "name", "slug", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'Apparel', 'apparel', NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name"
      RETURNING "id";
    `);

    // 4. Products (products table)
    await client.query(`
      INSERT INTO "products" (
        "id", "sellerId", "categoryId", "name", "slug", "description", "basePrice",
        "status", "inStock", "images", "tags", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text, $1, $2, 'Aura ANC Studio Headphones', 'aura-anc-studio-headphones',
        'Reference-grade studio monitoring headphones with active noise cancellation and titanium drivers.',
        299.99, 'published', true, ARRAY['/images/products/headphones.webp']::text[],
        ARRAY['audio', 'headphones', 'premium', 'wireless']::text[], NOW(), NOW()
      )
      ON CONFLICT ("slug") DO NOTHING;
    `, [sellerId, catElectronics.rows[0].id]);

    await client.query(`
      INSERT INTO "products" (
        "id", "sellerId", "categoryId", "name", "slug", "description", "basePrice",
        "status", "inStock", "images", "tags", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text, $1, $2, 'Veloce Carbon Chronograph', 'veloce-carbon-chronograph',
        'Precision Swiss-engineered titanium chronograph with sapphire crystal and quick-release strap.',
        449.00, 'published', true, ARRAY['/images/products/watch.webp']::text[],
        ARRAY['accessories', 'luxury', 'watch']::text[], NOW(), NOW()
      )
      ON CONFLICT ("slug") DO NOTHING;
    `, [sellerId, catApparel.rows[0].id]);

    await client.query('COMMIT');
    console.log('SUCCESS: Seed data (users, stores, categories, products) successfully inserted into Neon!');
    
    // Verify count
    const users = await client.query('SELECT count(*) FROM "users"');
    const products = await client.query('SELECT count(*) FROM "products"');
    console.log(`Neon Database now has ${users.rows[0].count} users and ${products.rows[0].count} products.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
