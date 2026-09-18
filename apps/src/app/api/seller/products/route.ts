/**
 * Seller Product Catalog Listing Route
 * 
 * @agent engineering-backend-architect
 * @agent 04-sql-query-agent
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort');

  const queryObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  const { page, limit, skip } = parsePagination(queryObj);

  const where: any = { sellerId: user.id, deletedAt: null };

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort) {
    switch (sort) {
      case 'name_asc': orderBy = { name: 'asc' }; break;
      case 'name_desc': orderBy = { name: 'desc' }; break;
      case 'price_asc': orderBy = { basePrice: 'asc' }; break;
      case 'price_desc': orderBy = { basePrice: 'desc' }; break;
      case 'newest': orderBy = { createdAt: 'desc' }; break;
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'updated': orderBy = { updatedAt: 'desc' }; break;
      default: orderBy = { createdAt: 'desc' }; break;
    }
  }

  const count = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: true,
    },
    orderBy,
    take: limit,
    skip,
  });

  const enrichedProducts = products.map((p) => {
    const variants = p.variants || [];
    const variantCount = variants.length;
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const prices = variants.map(v => v.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : p.basePrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : p.basePrice;
    const lowStockCount = variants.filter(v => v.stock <= v.lowStockThreshold).length;

    return {
      ...p,
      _id: p.id,
      categoryId: p.category,
      variantCount,
      totalStock,
      priceRange: { min: minPrice, max: maxPrice },
      lowStockCount,
    };
  });

  return NextResponse.json({
    data: enrichedProducts,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
});
