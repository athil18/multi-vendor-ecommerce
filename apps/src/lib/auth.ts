import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export interface AuthenticatedUser {
  id: string;
  role: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  let token = req.cookies.get('auth_token')?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return null;
  }
  
  try {
    const decoded = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { status: true },
    });
    if (!user || user.status !== 'active') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

export function authorizeRole(user: AuthenticatedUser | null, allowedRoles: string[]): boolean {
  if (!user || !allowedRoles.includes(user.role)) {
    return false;
  }
  return true;
}
