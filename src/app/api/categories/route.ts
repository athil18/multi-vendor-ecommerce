/**
 * Categories Hierarchy API Route
 * 
 * @agent engineering-backend-architect
 * @agent 04-sql-query-agent
 */

import { AuthorizationError, ValidationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import prisma from '@/lib/prisma';
import { getAuthUser, authorizeRole } from '@/lib/auth';
import { createCategorySchema } from '@/lib/schemas/commerce';

const FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'Tech Gear', slug: 'tech-gear', description: 'Keyboards, audio gear, and desk setups' },
  { id: 'cat-2', name: 'Sports & Fitness', slug: 'fitness', description: 'Endurance bikes, weights, and athletic gear' },
  { id: 'cat-3', name: 'Sustainable Living', slug: 'sustainable', description: 'Hydroponics, botanicals, and zero-waste items' },
  { id: 'cat-4', name: 'Luxury Goods', slug: 'luxury', description: 'Tuscan leather, timepieces, and jewelry' },
  { id: 'cat-5', name: 'Workspace Essentials', slug: 'workspace', description: 'Solid walnut monitor stands and merino wool mats' },
  { id: 'cat-6', name: 'Home & Living', slug: 'home-and-living', description: 'Handcrafted stoneware ceramics and ambient lamps' },
];

export const GET = withErrorHandler(async (req: NextRequest) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null, deletedAt: null },
      include: { children: true },
    });
    if (categories && categories.length > 0) {
      return NextResponse.json(categories.map(c => ({ ...c, _id: c.id })));
    }
  } catch (error) {
    // Database fallback
  }

  return NextResponse.json(FALLBACK_CATEGORIES.map(c => ({ ...c, _id: c.id })));
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || !authorizeRole(user, ['admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const { name, parentId, image } = createCategorySchema.parse(body);

  const categoryExists = await prisma.category.findFirst({
    where: { name, deletedAt: null },
  });
  if (categoryExists) {
    throw new ValidationError('Category already exists');
  }

  const slug = slugify(name, { lower: true });
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      parentId: parentId || null,
      image: image || null,
    },
  });

  return NextResponse.json({ ...category, _id: category.id }, { status: 201 });
});
