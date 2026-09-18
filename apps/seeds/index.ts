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
          description: 'The best gadgets in town.',
          stripeOnboardingComplete: true,
          payoutsEnabled: true,
        },
      });
    }

    // 3. Seed Categories
    logger.info('Seeding Categories...');
    let catElectronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
    if (!catElectronics) {
      catElectronics = await prisma.category.create({
        data: {
          name: 'Electronics',
          slug: 'electronics',
        }
      });
    }

    let catFashion = await prisma.category.findUnique({ where: { slug: 'fashion' } });
    if (!catFashion) {
      catFashion = await prisma.category.create({
        data: {
          name: 'Fashion',
          slug: 'fashion',
        }
      });
    }

    // 4. Seed Products
    logger.info('Seeding Products...');
    let prod1 = await prisma.product.findUnique({ where: { slug: 'smartphone-x' } });
    if (!prod1) {
      prod1 = await prisma.product.create({
        data: {
          sellerId: seller1.id,
          name: 'Smartphone X',
          slug: 'smartphone-x',
          description: 'Latest flagship smartphone with amazing features.',
          categoryId: catElectronics.id,
          basePrice: 999.00,
          images: [],
          status: 'published',
          tags: ['tech', 'smartphone', 'gadget'],
          rating: 0,
          numReviews: 0,
          inStock: true
        }
      });
    }

    let prod2 = await prisma.product.findUnique({ where: { slug: 'wireless-earbuds' } });
    if (!prod2) {
      prod2 = await prisma.product.create({
        data: {
          sellerId: seller1.id,
          name: 'Wireless Earbuds Pro',
          slug: 'wireless-earbuds',
          description: 'Noise cancelling true wireless earbuds.',
          categoryId: catElectronics.id,
          basePrice: 199.00,
          images: [],
          status: 'published',
          tags: ['audio', 'earbuds', 'music'],
          rating: 0,
          numReviews: 0,
          inStock: true
        }
      });
    }

    logger.info('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', { error });
    process.exit(1);
  }
};

runSeeds();

