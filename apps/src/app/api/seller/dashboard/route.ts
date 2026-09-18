/**
 * Seller Analytics & Performance Dashboard API Route
 * 
 * @agent engineering-backend-architect
 * @agent finance-financial-analyst
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { serializeOrderItem } from '@/lib/order-serialization';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const sellerId = user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Calculate Revenue Metrics
  const shippedItems = await prisma.orderItem.findMany({
    where: { sellerId, status: { in: ['shipped', 'delivered'] } },
    select: { sellerPayout: true, createdAt: true },
  });

  const totalRevenue = shippedItems.reduce((acc, item) => acc + item.sellerPayout, 0);
  const monthlyRevenue = shippedItems
    .filter((item) => item.createdAt >= startOfMonth)
    .reduce((acc, item) => acc + item.sellerPayout, 0);

  // 2. Order Counts
  const pendingOrdersCount = await prisma.orderItem.count({
    where: {
      sellerId,
      status: { in: ['pending', 'processing'] },
    },
  });

  const deliveredOrdersCount = await prisma.orderItem.count({
    where: {
      sellerId,
      status: 'delivered',
    },
  });

  // 3. Active Products Count
  const activeProductsCount = await prisma.product.count({
    where: {
      sellerId,
      status: 'published',
      deletedAt: null,
    },
  });

  // 4. Recent Activity
  const recentActivity = await prisma.orderItem.findMany({
    where: { sellerId },
    include: { product: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  const serializedActivity = recentActivity.map((activity) => serializeOrderItem(activity));

  // 5. Revenue Trends (Last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const trendItems = await prisma.orderItem.findMany({
    where: {
      sellerId,
      status: { in: ['shipped', 'delivered'] },
      createdAt: { gte: sixMonthsAgo },
    },
    select: { sellerPayout: true, createdAt: true },
  });

  const monthTrendMap = new Map<string, { revenue: number; orders: number }>();
  trendItems.forEach((item) => {
    const key = `${item.createdAt.getMonth() + 1}/${item.createdAt.getFullYear()}`;
    const existing = monthTrendMap.get(key) || { revenue: 0, orders: 0 };
    monthTrendMap.set(key, {
      revenue: existing.revenue + item.sellerPayout,
      orders: existing.orders + 1,
    });
  });

  const formattedTrends = Array.from(monthTrendMap.entries()).map(([month, val]) => ({
    month,
    revenue: val.revenue,
    orders: val.orders,
  }));

  // 6. Top Performing Products
  const validItemsForTop = await prisma.orderItem.findMany({
    where: { sellerId, status: { not: 'cancelled' } },
    include: { product: { select: { name: true, images: true } } },
  });

  const productPerformanceMap = new Map<string, { name: string; image: string; totalSold: number; totalRevenue: number }>();
  validItemsForTop.forEach((item) => {
    const pId = item.productId;
    const existing = productPerformanceMap.get(pId) || {
      name: item.product?.name || 'Product',
      image: item.product?.images?.[0] || '',
      totalSold: 0,
      totalRevenue: 0,
    };
    productPerformanceMap.set(pId, {
      ...existing,
      totalSold: existing.totalSold + item.quantity,
      totalRevenue: existing.totalRevenue + item.sellerPayout,
    });
  });

  const topProducts = Array.from(productPerformanceMap.entries())
    .map(([id, perf]) => ({ _id: id, id, ...perf }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  return NextResponse.json({
    totalRevenue,
    monthlyRevenue,
    pendingOrdersCount,
    deliveredOrdersCount,
    activeProductsCount,
    recentActivity: serializedActivity,
    revenueTrends: formattedTrends,
    topProducts,
  });
});

