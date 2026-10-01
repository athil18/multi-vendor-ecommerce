import { logger } from '../src/lib/logger';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Database Seed Execution
 * Separated explicitly from migrations. Use this ONLY for populating
 * initial/dummy data in development or staging, NEVER in production.
 */
const runSeeds = async () => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Seeding blocked: Cannot run seeds in production environment!');
    process.exit(1);
  }

  try {
    logger.info('Connecting to PostgreSQL database for seeding...');

    // 1. Seed Users (Admin, Sellers, Customers)
    logger.info('Seeding Users (Admin, Sellers, Customers)...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    let admin = await prisma.user.findUnique({ where: { email: 'admin@marketplace.local' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: 'admin@marketplace.local',
          password: hashedPassword,
          role: 'admin',
          status: 'active'
        }
      });
    }

    let seller1 = await prisma.user.findUnique({ where: { email: 'seller1@marketplace.local' } });
    if (!seller1) {
      seller1 = await prisma.user.create({
        data: {
          name: 'Tech Seller',
          email: 'seller1@marketplace.local',
          password: hashedPassword,
          role: 'seller',
          status: 'active'
        }
      });
    }

    let customer1 = await prisma.user.findUnique({ where: { email: 'customer1@marketplace.local' } });
    if (!customer1) {
      customer1 = await prisma.user.create({
        data: {
          name: 'Jane Customer',
          email: 'customer1@marketplace.local',
          password: hashedPassword,
          role: 'customer',
          status: 'active'
        }
      });
    }

    // 2. Seed Stores
    logger.info('Seeding Stores...');
    let store1 = await prisma.store.findUnique({ where: { sellerId: seller1.id } });
    if (!store1) {
      store1 = await prisma.store.create({
        data: {
          sellerId: seller1.id,
          name: 'Tech Hub',
          slug: 'tech-hub',
          description: 'The best gadgets and lifestyle goods in town.',
          stripeOnboardingComplete: true,
          payoutsEnabled: true,
        },
      });
    }

    // Load full open source catalog dataset (520+ products)
    const { default: rawCatalog } = await import('../src/data/products.json');
    logger.info(`Loaded ${rawCatalog.length} open-source products from dataset.`);

    // 3. Seed Categories
    logger.info('Seeding Categories...');
    const catMap = new Map<string, string>();
    for (const item of rawCatalog) {
      const catSlug = item.category?.slug || 'general';
      const catName = item.category?.name || 'General';
      if (!catMap.has(catSlug)) {
        let cat = await prisma.category.findUnique({ where: { slug: catSlug } });
        if (!cat) {
          cat = await prisma.category.create({
            data: { name: catName, slug: catSlug }
          });
        }
        catMap.set(catSlug, cat.id);
      }
    }

    // 4. Seed Products
    logger.info(`Seeding ${rawCatalog.length} Products into database...`);
    let seededCount = 0;
    for (const item of rawCatalog) {
      const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
      if (!existing) {
        const catSlug = item.category?.slug || 'general';
        const categoryId = catMap.get(catSlug) || Array.from(catMap.values())[0]!;
        await prisma.product.create({
          data: {
            sellerId: seller1.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            categoryId,
            basePrice: item.basePrice,
            images: item.images || [],
            status: 'published',
            tags: [item.category?.slug || 'catalog', item.source || 'opensource'],
            rating: item.rating || 4.5,
            numReviews: item.numReviews || 25,
            inStock: item.stock > 0,
          }
        });
        seededCount++;
      }
    }

    logger.info(`Seeding completed successfully! Added ${seededCount} new products (Total catalog size: ${rawCatalog.length}).`);
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', { error });
    process.exit(1);
  }
};

runSeeds();

