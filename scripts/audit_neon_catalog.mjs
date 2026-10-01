import 'dotenv/config';
import pg from 'pg';
import { analyzeProduct, analyzeAndApproveCatalog } from '../src/lib/product-analyzer.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Fetching all products and related store info from Neon PostgreSQL...');
    const res = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p."basePrice",
        p.images,
        p.status,
        p."inStock",
        p.rating,
        p."numReviews",
        p."createdAt",
        c.name as "categoryName",
        u.name as "sellerName",
        s.name as "storeName"
      FROM products p
      LEFT JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN users u ON p."sellerId" = u.id
      LEFT JOIN stores s ON s."sellerId" = u.id
      WHERE p."deletedAt" IS NULL
      ORDER BY p."createdAt" DESC;
    `);

    console.log(`Retrieved ${res.rows.length} products from Neon.`);
    
    // Map to normalized input for analyzer
    const productsToAudit = res.rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      basePrice: r.basePrice,
      images: r.images,
      stock: r.inStock ? 50 : 0,
      storeName: r.storeName || r.sellerName,
      status: r.status,
    }));

    const auditSummary = analyzeAndApproveCatalog(productsToAudit);

    console.log('\n=== NEON DATABASE CATALOG AUDIT REPORT ===');
    console.log(`Total Products Audited: ${auditSummary.totalAudited}`);
    console.log(`Total Approved:         ${auditSummary.totalApproved}`);
    console.log(`Total Rejected:         ${auditSummary.totalRejected}`);
    console.log(`Average Quality Score:  ${auditSummary.averageQualityScore} / 100`);
    console.log(`Approval Rate:          ${auditSummary.approvalRatePercent}%`);

    if (auditSummary.totalRejected > 0) {
      console.log('\nSample Rejections:');
      auditSummary.rejectedProducts.slice(0, 5).forEach(r => {
        console.log(` - [${r.id}] ${r.name}: ${r.rejectionReasons?.join(', ')}`);
      });
    } else {
      console.log('\n100% of products in Neon passed all quality, safety, and brand compliance checks!');
    }

    console.log('\nSample Approved Products:');
    auditSummary.approvedProducts.slice(0, 3).forEach(p => {
      console.log(` - [Score ${p.governanceScore}/100] "${p.name}" | Store: ${p.storeName} | Images: ${p.images?.length} | Price: $${p.basePrice}`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
