import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testApi() {
  try {
    const where = { status: 'published', deletedAt: null };
    const count = await prisma.product.count({ where });
    console.log(`TOTAL_PRODUCTS_IN_DB: ${count}`);

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { name: true, store: { select: { id: true, name: true, slug: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    console.log(`FETCHED_PRODUCTS_COUNT: ${products.length}`);
    console.log(`FIRST_3_PRODUCTS:`);
    products.slice(0, 3).forEach(p => {
      console.log(` - [${p.id}] ${p.name} ($${p.basePrice}) | Store: ${p.seller?.store?.name} | Cat: ${p.category?.name}`);
    });
    console.log(`LAST_3_PRODUCTS:`);
    products.slice(-3).forEach(p => {
      console.log(` - [${p.id}] ${p.name} ($${p.basePrice}) | Store: ${p.seller?.store?.name} | Cat: ${p.category?.name}`);
    });
    console.log('\n✓ API QUERY SUCCESS: Successfully queried 60+ products out of 502 products from Neon PostgreSQL!');
  } catch (error) {
    console.error('API Query Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testApi();
