/**
 * Product Catalog & Creation API Route
 * 
 * @agent engineering-backend-architect
 * @agent 04-sql-query-agent
 * @agent security-appsec-engineer
 * @agent 21-pii-sanitization-agent
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getAuthUser, authorizeRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { createProductSchema } from '@/lib/schemas/commerce';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const keyword = searchParams.get('keyword');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');
  const sort = searchParams.get('sort');
  const cursor = searchParams.get('cursor');

  const queryObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  const { page, limit, skip } = parsePagination(queryObj);

  const where: any = { status: 'published', deletedAt: null };

  if (cursor) {
    where.id = { lt: cursor };
  }

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (brand) {
    where.brandId = brand;
  }

  if (inStock === 'true') {
    where.inStock = true;
  }

  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice.gte = Number(minPrice);
    if (maxPrice) where.basePrice.lte = Number(maxPrice);
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort) {
    switch (sort) {
      case 'price_asc': orderBy = { basePrice: 'asc' }; break;
      case 'price_desc': orderBy = { basePrice: 'desc' }; break;
      case 'popular': orderBy = { numReviews: 'desc' }; break;
      case 'top_rated': orderBy = { rating: 'desc' }; break;
      case 'newest': orderBy = { createdAt: 'desc' }; break;
      default: orderBy = { createdAt: 'desc' }; break;
    }
  }

  const count = cursor ? 0 : await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { name: true, store: { select: { id: true, name: true, slug: true } } } },
    },
    orderBy,
    take: limit,
    skip: cursor ? undefined : skip,
  });

  const nextCursor = products.length === limit ? products[products.length - 1].id : null;

  return NextResponse.json({
    data: products.map(p => ({
      ...p,
      _id: p.id,
      storeName: p.seller?.store?.name || p.seller?.name || 'Nexus Atelier',
      categoryId: p.category,
    })),
    meta: {
      page: cursor ? undefined : page,
      limit,
      total: cursor ? undefined : count,
      totalPages: cursor ? undefined : Math.ceil(count / limit),
      nextCursor,
    },
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || !authorizeRole(user, ['seller', 'admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const { name, description, categoryId, brandId, basePrice, images, options, tags } = createProductSchema.parse(body);

  const slug = slugify(name, { lower: true }) + '-' + Date.now();

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || '',
      categoryId: categoryId || '',
      brandId: brandId || null,
      basePrice,
      images: images || [],
      options: options ? (options as any) : [],
      tags: tags || [],
      sellerId: user.id,
      status: 'draft',
    },
  });

  return NextResponse.json({ ...product, _id: product.id }, { status: 201 });
});
