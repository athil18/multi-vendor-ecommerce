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
    const res = await client.query('SELECT id, name, slug, images, "categoryId" FROM products WHERE "deletedAt" IS NULL;');
    const products = res.rows;
    console.log('Total active products:', products.length);

    const nameCounts = {};
    const primaryImgCounts = {};
    const allImgs = new Set();
    let duplicateNames = 0;
    let duplicateImages = 0;

    for (const p of products) {
      nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
      if (nameCounts[p.name] > 1) duplicateNames++;

      const primaryImg = p.images && p.images[0];
      if (primaryImg) {
        primaryImgCounts[primaryImg] = (primaryImgCounts[primaryImg] || 0) + 1;
        if (primaryImgCounts[primaryImg] > 1) duplicateImages++;
        allImgs.add(primaryImg);
      }
    }

    const uniquePrimary = Object.keys(primaryImgCounts).length;
    const uniquenessPercent = (uniquePrimary / products.length) * 100;
    const repetitionPercent = 100 - uniquenessPercent;

    console.log('Unique product names:', Object.keys(nameCounts).length);
    console.log('Duplicate name occurrences:', duplicateNames);
    console.log('Unique primary images:', uniquePrimary);
    console.log('Duplicate primary image occurrences:', duplicateImages);
    console.log('Total unique images in all sets:', allImgs.size);
    console.log('Uniqueness Ratio:', uniquenessPercent.toFixed(2) + '%');
    console.log('Repetition Ratio:', repetitionPercent.toFixed(2) + '%');

    // Show image hosts breakdown
    const hostCounts = {};
    for (const img of allImgs) {
      try {
        const host = new URL(img).hostname;
        hostCounts[host] = (hostCounts[host] || 0) + 1;
      } catch {}
    }
    console.log('Image Providers / Hosts breakdown:', hostCounts);

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
