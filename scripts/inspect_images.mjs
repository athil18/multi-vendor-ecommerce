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
    const res = await client.query('SELECT id, name, slug, images FROM products LIMIT 10;');
    res.rows.forEach(r => {
      console.log(`Product: "${r.name}" (${r.slug})`);
      console.log(`  images:`, r.images);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

main();
