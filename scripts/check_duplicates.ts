import prisma from '../src/lib/prisma';

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, slug: true, name: true } });
  const counts: Record<string, number> = {};
  const duplicates = [];
  products.forEach(p => {
    if (!counts[p.slug]) counts[p.slug] = 0;
    counts[p.slug]++;
    if (counts[p.slug] == 2) duplicates.push(p);
  });
  console.log('Total Products:', products.length);
  console.log('Duplicates in Database:', duplicates);
}

main().catch(console.error).finally(() => process.exit(0));
