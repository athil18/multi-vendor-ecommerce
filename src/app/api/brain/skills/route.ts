/**
 * Nexus Brain Skills Management API
 * 
 * Lists visible skills and saves new runtime skills.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-handler';
import { getAuthUser } from '@/lib/auth';
import { listVisibleSkills, saveRuntimeSkill, loadVisibleSkillByName } from '@/lib/brain/skills/store';
import { ValidationError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const searchParams = req.nextUrl.searchParams;
  const skillName = searchParams.get('name');

  const role = (user?.role as 'customer' | 'seller' | 'admin') || 'customer';
  const ctx = {
    userId: user?.id,
    role,
  };

  if (skillName) {
    const skill = loadVisibleSkillByName(ctx, skillName);
    if (!skill) {
      return NextResponse.json({ success: false, error: 'Skill not found or access denied' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: skill });
  }

  const skills = listVisibleSkills(ctx);
  return NextResponse.json({
    success: true,
    count: skills.length,
    data: skills,
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  const body = await req.json();

  if (!body.name || !body.description || !body.body) {
    throw new ValidationError('Skill name, description, and markdown body are required');
  }

  const role = (user?.role as 'customer' | 'seller' | 'admin') || (body.simulatedRole as any) || 'customer';

  const res = saveRuntimeSkill(
    {
      userId: user?.id,
      role,
      storeId: body.storeId,
    },
    {
      name: body.name,
      description: body.description,
      body: body.body,
      scope: body.scope,
    }
  );

  if (!res.success) {
    return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: res.skill,
  });
});
