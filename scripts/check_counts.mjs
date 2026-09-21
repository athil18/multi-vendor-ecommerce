import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const p = await client.query('SELECT count(*) FROM "products"');
    const cat = await client.query('SELECT count(*) FROM "categories"');
    const u = await client.query('SELECT count(*) FROM "users"');
    const s = await client.query('SELECT count(*) FROM "stores"');
    console.log(`Current DB Counts: Users=${u.rows[0].count}, Stores=${s.rows[0].count}, Categories=${cat.rows[0].count}, Products=${p.rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
