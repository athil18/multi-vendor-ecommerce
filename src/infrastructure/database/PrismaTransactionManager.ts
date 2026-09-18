import prisma from '@/lib/prisma';
import { ITransactionManager, ITransactionContext } from '@/core/ports/ITransactionManager';

export class PrismaTransactionManager implements ITransactionManager {
  async executeInTransaction<T>(work: (ctx: ITransactionContext) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return work({ tx });
    });
  }
}
