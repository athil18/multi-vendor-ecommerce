import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, slug, "createdAt" FROM products ORDER BY "createdAt" ASC LIMIT 5;');
    console.log('OLDEST 5 PRODUCTS:');
    res.rows.forEach(r => console.log(` - ID: ${r.id}, Name: ${r.name}, Slug: ${r.slug}, Created: ${r.createdAt}`));

    const countRes = await client.query('SELECT count(*) FROM products WHERE "deletedAt" IS NULL;');
    console.log(`TOTAL_PRODUCTS_COUNT: ${countRes.rows[0].count}`);

    const latestRes = await client.query('SELECT id, name, slug, "createdAt" FROM products ORDER BY "createdAt" DESC LIMIT 5;');
    console.log('LATEST 5 PRODUCTS:');
    latestRes.rows.forEach(r => console.log(` - ID: ${r.id}, Name: ${r.name}, Slug: ${r.slug}, Created: ${r.createdAt}`));
  } finally {
    client.release();
    await pool.end();
  }
}

main();
