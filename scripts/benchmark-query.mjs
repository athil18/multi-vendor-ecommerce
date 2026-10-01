import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('====================================================');
    console.log('📊 POSTGRESQL QUERY EXECUTION PLAN: EXPLAIN ANALYZE');
    console.log('====================================================\n');

    // 1. Catalog Search & Filter Query
    const catalogSql = `
      EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)
      SELECT 
        p.id, p.name, p."basePrice", p.rating, p."numReviews", p."inStock",
        c.name as category_name, c.slug as category_slug,
        s.name as store_name, s.slug as store_slug
      FROM "products" p
      INNER JOIN "categories" c ON p."categoryId" = c.id
      INNER JOIN "users" u ON p."sellerId" = u.id
      INNER JOIN "stores" s ON s."sellerId" = u.id
      WHERE p.status = 'published' AND p."deletedAt" IS NULL
      ORDER BY p."createdAt" DESC
      LIMIT 20;
    `;

    const start = performance.now();
    const catalogPlan = await client.query(catalogSql);
    const duration = (performance.now() - start).toFixed(2);

    console.log(`--- Query 1: Top 20 Published Products with Store & Category (Roundtrip: ${duration}ms) ---`);
    catalogPlan.rows.forEach(r => console.log(r['QUERY PLAN']));

    // 2. Inventory Aggregation by Store
    console.log('\n--- Query 2: Multi-Store Variant Stock Rollup ---');
    const stockSql = `
      EXPLAIN (ANALYZE, BUFFERS, COSTS)
      SELECT 
        s.name as store_name,
        count(distinct p.id) as total_products,
        sum(v.stock) as total_stock_units,
        round(avg(v.price)::numeric, 2) as avg_variant_price
      FROM "stores" s
      JOIN "users" u ON s."sellerId" = u.id
      JOIN "products" p ON p."sellerId" = u.id
      JOIN "variants" v ON v."productId" = p.id
      WHERE p."deletedAt" IS NULL AND v."isActive" = true
      GROUP BY s.name
      ORDER BY total_stock_units DESC;
    `;

    const stockPlan = await client.query(stockSql);
    stockPlan.rows.forEach(r => console.log(r['QUERY PLAN']));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
