/**
 * Prisma User Repository Implementation
 * 
 * @agent engineering-backend-architect
 * @agent engineering-identity-access-engineer
 */

import prisma from '@/lib/prisma';
import { IUserRepository, UserEntity } from '@/core/ports/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return (user as UserEntity) || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return (user as UserEntity) || null;
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const created = await prisma.user.create({
      data: {
        name: data.name!,
        email: data.email!.toLowerCase().trim(),
        password: data.password!,
        role: data.role || 'customer',
        status: data.status || 'active',
        avatar: data.avatar,
        stripeCustomerId: data.stripeCustomerId,
      },
    });
    return created as UserEntity;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.status && { status: data.status }),
        ...(data.role && { role: data.role }),
      },
    });
    return updated as UserEntity;
  }

  async updateRefreshTokens(userId: string, tokens: string[]): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokens: tokens },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'suspended' },
    });
  }
}

export const prismaUserRepository = new PrismaUserRepository();
