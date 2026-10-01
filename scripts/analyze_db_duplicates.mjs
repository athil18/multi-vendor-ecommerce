import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, slug, "categoryId", "sellerId", "basePrice" FROM products WHERE "deletedAt" IS NULL;');
    const products = res.rows;
    console.log(`Total active products in DB: ${products.length}`);

    // 1. Group by exact name
    const exactNameMap = new Map();
    for (const p of products) {
      const list = exactNameMap.get(p.name) || [];
      list.push(p);
      exactNameMap.set(p.name, list);
    }
    const exactDups = Array.from(exactNameMap.entries()).filter(([_, list]) => list.length > 1);
    console.log(`Exact duplicate titles: ${exactDups.length}`);

    // 2. Normalized base title (stripping vendor prefix and "No. \d+")
    // e.g. "Artisan Atelier Merino Knit Sweater No. 1" -> "merino knit sweater"
    const normalizedMap = new Map();
    for (const p of products) {
      let norm = p.name.toLowerCase();
      // Remove common prefix patterns
      norm = norm.replace(/^(artisan atelier|bespoke studio|heritage crafted|signature edition|cyber|carbon|sylvan|walnut|quantum|summit|prism|focus|aura|vigor|gaia|forma|terra|endurance)\s+/i, '');
      // Remove "no. \d+" or digits at the end
      norm = norm.replace(/\s+(no\.?\s*\d+|\d+)$/i, '').trim();
      
      const list = normalizedMap.get(norm) || [];
      list.push(p);
      normalizedMap.set(norm, list);
    }

    const repeatedBaseProducts = Array.from(normalizedMap.entries()).filter(([_, list]) => list.length > 1);
    console.log(`Unique base product concepts: ${normalizedMap.size}`);
    console.log(`Repeated base product concepts: ${repeatedBaseProducts.length}`);

    console.log('\nTop 15 Repeated Product Concepts:');
    repeatedBaseProducts
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 15)
      .forEach(([norm, list]) => {
        console.log(`  "${norm}" appears ${list.length} times (e.g. "${list[0].name}", "${list[1].name}")`);
      });

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
