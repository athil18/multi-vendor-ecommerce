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
      SELECT id, name, images 
      FROM products 
      WHERE array_to_string(images, ',') LIKE '%delacruz%' 
         OR array_to_string(images, ',') LIKE '%placehold%'
         OR array_to_string(images, ',') LIKE '%example.com%'
         OR array_to_string(images, ',') LIKE '%placeimg.com%'
    `);
    console.log(`Found ${res.rows.length} products with banned image domains:`);
    res.rows.forEach(r => {
      console.log(` - [${r.id}] ${r.name}: ${JSON.stringify(r.images)}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
