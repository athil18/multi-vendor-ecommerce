import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, name, slug 
      FROM products 
      WHERE name LIKE 'title-%' 
         OR name LIKE 'New Product%' 
         OR name LIKE 'test%'
         OR name ILIKE '%asdf%';
    `);
    console.log(`Found ${res.rows.length} suspicious title products:`);
    res.rows.forEach(r => console.log(`  - [${r.id}] ${r.name}`));

    if (res.rows.length > 0) {
      const ids = res.rows.map(r => r.id);
      await client.query('DELETE FROM variants WHERE "productId" = ANY($1::text[]);', [ids]);
      await client.query('DELETE FROM products WHERE id = ANY($1::text[]);', [ids]);
      console.log(`Cleaned up ${res.rows.length} suspicious products.`);
    }

    const totalRes = await client.query('SELECT count(*) FROM products WHERE "deletedAt" IS NULL;');
    console.log(`Final Active Clean Products in DB: ${totalRes.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
