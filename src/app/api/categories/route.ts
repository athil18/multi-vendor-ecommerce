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

let cachedCategories: { data: any; expiresAt: number } | null = null;
const CATEGORIES_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const GET = withErrorHandler(async (_req: NextRequest) => {
  if (cachedCategories && cachedCategories.expiresAt > Date.now()) {
    return NextResponse.json(cachedCategories.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        'X-Cache-Lookup': 'HIT',
      },
    });
  }

  try {
    const queryPromise = prisma.category.findMany({
      where: { parentId: null, deletedAt: null },
      include: { children: true },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 1500)
    );

    const categories = await Promise.race([queryPromise, timeoutPromise]);

    if (categories && categories.length > 0) {
      const data = categories.map(c => ({ ...c, _id: c.id }));
      cachedCategories = { data, expiresAt: Date.now() + CATEGORIES_CACHE_TTL_MS };
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
          'X-Cache-Lookup': 'MISS',
        },
      });
    }
  } catch {
    // Database fallback
  }

  const fallbackData = FALLBACK_CATEGORIES.map(c => ({ ...c, _id: c.id }));
  return NextResponse.json(fallbackData, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'X-Cache-Lookup': 'FALLBACK',
    },
  });
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

  // Invalidate in-memory categories cache
  cachedCategories = null;

  return NextResponse.json({ ...category, _id: category.id }, { status: 201 });
});
