import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const statusRes = await client.query('SELECT status, count(*) FROM products GROUP BY status;');
    console.log('STATUS DISTRIBUTION:');
    statusRes.rows.forEach(r => console.log(`  ${r.status}: ${r.count}`));

    const delRes = await client.query('SELECT count(*) FROM products WHERE "deletedAt" IS NOT NULL;');
    console.log('DELETED PRODUCTS:', delRes.rows[0].count);

    const sampleRes = await client.query('SELECT id, name, slug, status, "basePrice", images, "categoryId", "sellerId" FROM products LIMIT 3;');
    console.log('SAMPLE PRODUCTS:', JSON.stringify(sampleRes.rows, null, 2));

    // Check sellers & stores
    const sellerRes = await client.query(`
      SELECT p.id, p.name, u.name as seller_name, s.name as store_name
      FROM products p
      JOIN users u ON p."sellerId" = u.id
      LEFT JOIN stores s ON s."ownerId" = u.id
      LIMIT 3;
    `);
    console.log('SAMPLE SELLER/STORE JOIN:', JSON.stringify(sellerRes.rows, null, 2));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
