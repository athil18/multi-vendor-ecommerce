/**
 * Uploadthing File Router & Permission Constraints
 * 
 * @agent engineering-backend-architect
 * @agent security-appsec-engineer
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

const f = createUploadthing();

export const ourFileRouter = {
  // Product image upload route
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      const user = await getAuthUser(req as any);
      if (!user) throw new UploadThingError('Unauthorized');
      if (user.role !== 'seller' && user.role !== 'admin') {
        throw new UploadThingError('Seller privileges required');
      }
      return { userId: user.id, role: user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info('Uploadthing Product Image Upload Complete', { url: file.url, metadata });
      return { uploadedBy: metadata.userId, url: file.url, key: file.key };
    }),

  // User avatar upload route
  avatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await getAuthUser(req as any);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info('Uploadthing Avatar Upload Complete', { url: file.url, metadata });
      return { uploadedBy: metadata.userId, url: file.url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
