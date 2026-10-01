import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM products WHERE "deletedAt" IS NULL;');
    const dbProducts = res.rows;
    console.log(`Current DB Products: ${dbProducts.length}`);

    // Deduplicate DB products:
    // Normalize names by removing "No. \d+" and trailing numbers
    const cleanDbMap = new Map();
    const dbToPurgeIds = [];

    for (const p of dbProducts) {
      let cleanName = p.name.replace(/\s+(no\.?\s*\d+|\d+)$/i, '').trim();
      let normKey = cleanName.toLowerCase().replace(/^(artisan atelier|bespoke studio|heritage crafted|signature edition)\s+/i, '').trim();

      if (!cleanDbMap.has(normKey)) {
        // Keep this instance as the canonical one, clean its name
        cleanDbMap.set(normKey, { ...p, cleanName });
      } else {
        // Duplicate/repeat instance to purge
        dbToPurgeIds.push(p.id);
      }
    }

    console.log(`Canonical unique DB products retained: ${cleanDbMap.size}`);
    console.log(`Repeated / duplicate DB products to purge: ${dbToPurgeIds.length}`);

    // Read multi-source products
    const openSourceProducts = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
    console.log(`Available diverse open-source products: ${openSourceProducts.length}`);

    // Check how many open-source products we can add to reach 500+ without any overlap
    const existingKeys = new Set(Array.from(cleanDbMap.keys()));
    const toAdd = [];

    for (const op of openSourceProducts) {
      const norm = op.name.toLowerCase().trim();
      if (!existingKeys.has(norm)) {
        existingKeys.add(norm);
        toAdd.push(op);
      }
    }

    console.log(`Non-overlapping open-source products available to add: ${toAdd.length}`);
    const totalAfterSync = cleanDbMap.size + toAdd.length;
    console.log(`Total catalog after deduplication & enrichment: ${totalAfterSync}`);

    // Verify duplicate ratio
    const allTitles = [
      ...Array.from(cleanDbMap.values()).map(p => p.cleanName.toLowerCase()),
      ...toAdd.map(p => p.name.toLowerCase())
    ];
    const uniqueTitleCount = new Set(allTitles).size;
    const dupRatio = ((allTitles.length - uniqueTitleCount) / allTitles.length) * 100;

    console.log(`\n=== DEDUPLICATION SIMULATION METRICS ===`);
    console.log(`Total Products: ${allTitles.length}`);
    console.log(`Unique Titles:  ${uniqueTitleCount}`);
    console.log(`Duplicate Ratio: ${dupRatio.toFixed(2)}% (Target: 0.00%)`);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
