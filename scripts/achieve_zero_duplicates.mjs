import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, slug FROM products WHERE "deletedAt" IS NULL ORDER BY "createdAt" ASC;');
    const products = res.rows;

    const seenConcepts = new Map();
    const toRemoveIds = [];

    for (const p of products) {
      let norm = p.name.toLowerCase();
      norm = norm.replace(/^(artisan atelier|bespoke studio|heritage crafted|signature edition|cyber|carbon|sylvan|walnut|quantum|summit|prism|focus|aura|vigor|gaia|forma|terra|endurance)\s+/i, '');
      norm = norm.replace(/\s+(no\.?\s*\d+|\d+)$/i, '').trim();

      if (!seenConcepts.has(norm)) {
        seenConcepts.set(norm, p);
      } else {
        toRemoveIds.push(p.id);
      }
    }

    console.log(`Concepts identified: ${seenConcepts.size}`);
    console.log(`Remaining redundant concept duplicates to remove: ${toRemoveIds.length}`);

    if (toRemoveIds.length > 0) {
      await client.query('DELETE FROM variants WHERE "productId" = ANY($1::text[]);', [toRemoveIds]);
      await client.query('DELETE FROM products WHERE id = ANY($1::text[]);', [toRemoveIds]);
      console.log(`Successfully removed ${toRemoveIds.length} redundant concept clones.`);
    }

    // Final verification
    const finalRes = await client.query('SELECT count(*) FROM products WHERE "deletedAt" IS NULL;');
    console.log(`Total Pristine Products Remaining in DB: ${finalRes.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
