import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT c.id, c.name, c.slug, count(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p."categoryId" = c.id
      GROUP BY c.id, c.name, c.slug
      ORDER BY product_count DESC;
    `);
    console.table(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
