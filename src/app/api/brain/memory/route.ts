/**
 * Nexus Brain Memory Graph API
 * 
 * Inspect and record permissions-scoped memories.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-handler';
import { getAuthUser } from '@/lib/auth';
import { memoryGraph } from '@/lib/brain/memory/graph';
import { ValidationError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const role = (user?.role as 'customer' | 'seller' | 'admin') || 'customer';

  if (query) {
    const recalled = memoryGraph.recall(query, {
      userId: user?.id,
      role,
      limit,
    });
    return NextResponse.json({ success: true, count: recalled.length, data: recalled });
  }

  // Return all authorized memories
  const all = memoryGraph.getAll().filter((mem) => {
    if (mem.scope === 'platform') return true;
    if (role === 'admin') return true;
    if (mem.scope === 'store' && role === 'seller') return true;
    if (mem.scope === 'user' && user?.id && mem.scopeId === user.id) return true;
    return false;
  });

  return NextResponse.json({
    success: true,
    count: all.length,
    data: all,
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const body = await req.json();

  if (!body.key || !body.content || !body.scope) {
    throw new ValidationError('Memory key, content, and scope are required');
  }

  const role = (user?.role as 'customer' | 'seller' | 'admin') || (body.simulatedRole as any) || 'customer';

  const res = memoryGraph.record(
    {
      userId: user?.id,
      role,
      storeId: body.storeId,
    },
    {
      scope: body.scope,
      category: body.category || 'preference',
      key: body.key,
      content: body.content,
      tags: body.tags || [],
      confidence: body.confidence,
    }
  );

  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: res.memory,
  });
});
