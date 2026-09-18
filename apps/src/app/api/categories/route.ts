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

export const GET = withErrorHandler(async (req: NextRequest) => {
  const categories = await prisma.category.findMany({
    where: { parentId: null, deletedAt: null },
    include: { children: true },
  });
  return NextResponse.json(categories.map(c => ({ ...c, _id: c.id })));
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
