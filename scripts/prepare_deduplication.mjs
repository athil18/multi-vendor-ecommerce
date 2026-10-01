import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const catRes = await client.query('SELECT id, name, slug FROM categories;');
    console.log('EXISTING CATEGORIES:');
    catRes.rows.forEach(c => console.log(`  - [${c.id}] ${c.name} (${c.slug})`));

    const storeRes = await client.query(`
      SELECT s.id, s.name, s.slug, s."sellerId", u.name as "ownerName"
      FROM stores s
      JOIN users u ON s."sellerId" = u.id;
    `);
    console.log('\nEXISTING STORES & SELLERS:');
    storeRes.rows.forEach(s => console.log(`  - Store: "${s.name}" (ID: ${s.id}) | Seller ID: ${s.sellerId} (${s.ownerName})`));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
