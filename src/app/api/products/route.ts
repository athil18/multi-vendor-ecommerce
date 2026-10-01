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
import { FALLBACK_PRODUCTS_LIST } from '@/lib/catalog-fallbacks';

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

  let products: any[] = [];
  let count = 0;

  try {
    count = cursor ? 0 : await prisma.product.count({ where });
    if (count > 0) {
      products = await prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { name: true, store: { select: { id: true, name: true, slug: true } } } },
        },
        orderBy,
        take: limit,
        skip: cursor ? undefined : skip,
      });
    }
  } catch (dbErr) {
    logger.warn('Database query skipped or offline, serving fallback catalog', { error: dbErr });
  }

  if (products.length === 0) {
    let filtered = [...FALLBACK_PRODUCTS_LIST];
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw));
    }
    if (category && category !== 'all') {
      const catKey = category.toLowerCase();
      filtered = filtered.filter(p => 
        (p.category?.slug && p.category.slug.toLowerCase().includes(catKey)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(catKey)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(catKey))
      );
    }
    if (minPrice) filtered = filtered.filter(p => p.basePrice >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.basePrice <= Number(maxPrice));
    if (inStock === 'true') filtered = filtered.filter(p => p.stock > 0);

    if (sort === 'price_asc') filtered.sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === 'price_desc') filtered.sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === 'top_rated') filtered.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') filtered.sort((a, b) => b.numReviews - a.numReviews);

    count = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginated.map(p => ({
        ...p,
        _id: p.id,
        storeName: p.storeName || p.seller?.name || 'Nexus Atelier',
        categoryId: p.category,
      })),
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        nextCursor: null,
      },
    });
  }

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
