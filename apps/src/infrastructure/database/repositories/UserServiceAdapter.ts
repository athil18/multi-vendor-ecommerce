/**
 * User Service Infrastructure Adapter
 * 
 * @agent engineering-backend-architect
 * @agent engineering-identity-access-engineer
 */

import prisma from '@/lib/prisma';

export const userServiceAdapter = {
  async getUserEmail(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email || null;
  }
};
