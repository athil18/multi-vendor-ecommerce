/**
 * Presigned Upload URL Generation & Security Sanitation Route
 * 
 * @agent engineering-developer-tooling-engineer
 * @agent security-appsec-engineer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { apiSuccess } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-handler';
import { AppError } from '@/lib/errors';
import { generateUploadUrl, isAllowedMimeType, isValidFileSize } from '@/lib/storage';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import mime from 'mime-types';

const uploadUrlHandler = async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as string;
  const fileName = searchParams.get('fileName') as string;
  const fileSizeStr = searchParams.get('fileSize');
  const contentType = searchParams.get('contentType');

  if (!category || !fileName || !fileSizeStr || !contentType) {
    throw new AppError('Missing required parameters', 400, 'BAD_REQUEST');
  }

  // Restrict category format
  const categoryRegex = /^[a-zA-Z0-9_-]+$/;
  if (!categoryRegex.test(category)) {
    throw new AppError('Invalid category format', 400, 'BAD_REQUEST');
  }

  const fileSize = parseInt(fileSizeStr, 10);
  if (isNaN(fileSize) || fileSize <= 0) {
    throw new AppError('Invalid file size', 400, 'BAD_REQUEST');
  }

  // Authorize RBAC
  if (user.role === 'customer' && category !== 'avatar') {
    throw new AppError('Customers can only upload avatars', 403, 'FORBIDDEN');
  }
  if (user.role === 'seller' && !['avatar', 'product_image', 'store_banner'].includes(category)) {
    throw new AppError('Sellers cannot upload this asset type', 403, 'FORBIDDEN');
  }

  // Validate File Size & Type
  if (!isAllowedMimeType(contentType)) {
    throw new AppError('Unsupported file type', 400, 'BAD_REQUEST');
  }
  if (!isValidFileSize(fileSize, 5)) {
    throw new AppError('File size exceeds 5MB limit', 400, 'BAD_REQUEST');
  }

  // Generate storage key
  let ext = mime.extension(contentType) || fileName.split('.').pop() || 'bin';
  // Sanitize the file extension
  ext = ext.replace(/[^a-zA-Z0-9]/g, '');
  if (!ext || !/^[a-zA-Z0-9]+$/.test(ext)) {
    throw new AppError('Invalid file extension', 400, 'BAD_REQUEST');
  }
  
  const uuid = crypto.randomUUID();
  const storageKey = `${category}s/${user.id}/${uuid}.${ext}`;

  const { uploadUrl, publicUrl, provider } = await generateUploadUrl(storageKey, contentType);

  // Persist Metadata via Prisma
  const asset = await prisma.fileAsset.create({
    data: {
      url: publicUrl,
      storageKey,
      uploadedById: user.id,
      fileSize,
      fileType: contentType,
      category: category as any,
      provider: provider as any,
    },
  });

  return apiSuccess({
    uploadUrl,
    publicUrl,
    assetId: asset.id,
    storageKey,
    provider
  }, 200, 'Upload URL generated');
};

export const GET = withErrorHandler(uploadUrlHandler);

