import 'dotenv/config';
import prisma from '../src/lib/prisma.ts';

async function main() {
  console.log('Testing prisma.product.count()...');
  const count = await prisma.product.count({
    where: { status: 'published', deletedAt: null }
  });
  console.log('Product count:', count);

  console.log('Testing prisma.product.findMany()...');
  const products = await prisma.product.findMany({
    where: { status: 'published', deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { name: true, store: { select: { id: true, name: true, slug: true } } } },
    },
    take: 5,
  });

  console.log(`Retrieved ${products.length} products successfully!`);
  products.forEach(p => {
    console.log(`[${p.id}] ${p.name} | Category: ${p.category?.name} | Store: ${p.seller?.store?.name || p.seller?.name} | Price: $${p.basePrice}`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Prisma query test failed:', err);
  process.exit(1);
});
