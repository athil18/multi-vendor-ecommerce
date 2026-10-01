import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const tables = ['users', 'stores', 'categories', 'products', 'reviews', 'file_assets', 'variants'];
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT * FROM ${table} WHERE CAST("${table}" AS text) LIKE '%delacruz%' LIMIT 5;`);
        if (res.rows.length > 0) {
          console.log(`FOUND in table ${table}:`, res.rows);
        }
      } catch (e) {
        // Table or column name might differ
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
