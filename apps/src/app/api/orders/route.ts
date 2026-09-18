import { AuthenticationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { serializeOrder } from '@/lib/order-serialization';
import { createOrderSchema } from '@/lib/schemas/commerce';

// Dependency Injection Composition Root
import { OrderService } from '@/services/OrderService';
import { PrismaTransactionManager } from '@/infrastructure/database/PrismaTransactionManager';
import { PrismaOrderRepository } from '@/infrastructure/database/repositories/PrismaOrderRepository';
import { PrismaCatalogRepository } from '@/infrastructure/database/repositories/PrismaCatalogRepository';
import { BullMQProvider } from '@/infrastructure/queue/BullMQProvider';
import { userServiceAdapter } from '@/infrastructure/database/repositories/UserServiceAdapter';

const txManager = new PrismaTransactionManager();
const orderRepo = new PrismaOrderRepository();
const catalogRepo = new PrismaCatalogRepository();
const queueProvider = new BullMQProvider();

// Instantiate the decoupled service
const orderService = new OrderService(txManager, orderRepo, catalogRepo, queueProvider, userServiceAdapter);

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const queryObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  const pagination = parsePagination(queryObj);

  const { orders, total, countMap } = await orderService.getOrdersForCustomer(
    user.id,
    { status, search },
    pagination
  );

  const ordersWithCounts = orders.map((order: any) => {
    const orderIdStr = order._id ? order._id.toString() : order.id;
    const serialized = serializeOrder(order);
    return {
      ...serialized,
      itemCount: countMap.get(orderIdStr) || 0,
    };
  });

  return NextResponse.json({
    data: ordersWithCounts,
    meta: { 
      page: pagination.page, 
      limit: pagination.limit, 
      total, 
      totalPages: Math.ceil(total / pagination.limit) 
    },
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const body = await req.json();
  const data = createOrderSchema.parse(body);

  const createdOrder = await orderService.createOrder({
    customerId: user.id,
    ...data
  });

  const serializedOrder = serializeOrder(createdOrder);
  return NextResponse.json(serializedOrder, { status: 201 });
});

