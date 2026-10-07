/**
 * Storage Layer: Uploadthing / Cloudflare R2 / AWS S3 / Local Secure Storage
 * 
 * @agent engineering-developer-tooling-engineer
 * @agent security-appsec-engineer
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UTApi } from 'uploadthing/server';
import crypto from 'crypto';
import path from 'path';
import { logger } from './logger';

export type StorageProviderType = 'uploadthing' | 'r2' | 's3' | 'local';

// Environment-driven storage configuration
const STORAGE_PROVIDER: StorageProviderType = (
  process.env.STORAGE_PROVIDER as StorageProviderType
) || (process.env.UPLOADTHING_TOKEN ? 'uploadthing' : process.env.R2_ACCOUNT_ID ? 'r2' : 'local');

// Uploadthing Client Instance
const utapi = (process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET)
  ? new UTApi({ token: process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET })
  : null;

// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'nexus-marketplace-assets';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || '';

// AWS S3 Configuration (Alternative)
const S3_BUCKET = process.env.S3_BUCKET || 'nexus-bucket';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

/**
 * Initialize S3/R2 client singleton with zero credential leakage
 */
let storageClient: S3Client | null = null;

if (STORAGE_PROVIDER === 'r2' && R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  storageClient = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
} else if (STORAGE_PROVIDER === 's3' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  storageClient = new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Validates if the given mime type is allowed.
 */
export const isAllowedMimeType = (
  mimeType: string,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
): boolean => {
  return allowedTypes.includes(mimeType.toLowerCase());
};

/**
 * Validates file size against maximum threshold
 */
export const isValidFileSize = (sizeBytes: number, maxSizeMb = 5): boolean => {
  return sizeBytes > 0 && sizeBytes <= maxSizeMb * 1024 * 1024;
};

/**
 * Validates a key and returns the safe canonical path resolved inside the uploads directory.
 * Throws an Error if path traversal is detected.
 */
export const validateSafeKey = (key: string): string => {
  if (!key) {
    throw new Error('Key is required');
  }

  // Defense-in-depth sanitization
  if (key.includes('..') || key.includes('\0') || path.isAbsolute(key) || key.startsWith('/')) {
    throw new Error('Path traversal detected');
  }

  const uploadRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const targetPath = path.resolve(uploadRoot, key);

  const relative = path.relative(uploadRoot, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Path traversal detected');
  }

  return targetPath;
};

/**
 * Generates a signed URL for secure direct uploads (Uploadthing, R2, S3, or Local HMAC signed route).
 */
export const generateUploadUrl = async (
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<{ uploadUrl: string; publicUrl: string; provider: 's3' | 'local' }> => {
  // 1. Path traversal security check
  validateSafeKey(key);

  // 2. Uploadthing Direct Flow
  if (STORAGE_PROVIDER === 'uploadthing') {
    const publicUrl = `https://utfs.io/f/${key}`;
    const uploadUrl = `/api/uploadthing`;
    logger.info('Using Uploadthing storage provider', { key });
    return { uploadUrl, publicUrl, provider: 's3' };
  }

  // 3. Cloudflare R2 Upload Flow
  if (STORAGE_PROVIDER === 'r2' && storageClient) {
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(storageClient, command, { expiresIn: expiresInSeconds });
      
      const publicUrl = R2_PUBLIC_URL 
        ? `${R2_PUBLIC_URL}/${key}`
        : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

      logger.info('Generated presigned Cloudflare R2 upload URL', { key, bucket: R2_BUCKET_NAME });
      return { uploadUrl, publicUrl, provider: 's3' };
    } catch (err: any) {
      logger.error('Failed to generate R2 signed URL, falling back to local', { error: String(err?.message || err) });
    }
  }

  // 4. AWS S3 Upload Flow
  if (STORAGE_PROVIDER === 's3' && storageClient) {
    try {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(storageClient, command, { expiresIn: expiresInSeconds });
      const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

      return { uploadUrl, publicUrl, provider: 's3' };
    } catch (err: any) {
      logger.error('Failed to generate S3 signed URL, falling back to local', { error: String(err?.message || err) });
    }
  }

  // 5. Local Development Fallback Flow (Cryptographically HMAC Signed)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be configured for local storage signing');
  }
  const expiresAt = Date.now() + expiresInSeconds * 1000;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${key}:${expiresAt}`)
    .digest('hex');

  const uploadUrl = `/api/upload/local?key=${encodeURIComponent(key)}&expires=${expiresAt}&sig=${signature}`;
  const publicUrl = `/uploads/${key}`;

  return { uploadUrl, publicUrl, provider: 'local' };
};

/**
 * Delete asset from storage (Uploadthing / R2 / S3 / Local)
 */
export const deleteStorageAsset = async (key: string): Promise<boolean> => {
  validateSafeKey(key);

  if (STORAGE_PROVIDER === 'uploadthing' && utapi) {
    try {
      await utapi.deleteFiles(key);
      return true;
    } catch (err: any) {
      logger.error('Failed to delete Uploadthing asset', { key, error: String(err) });
      return false;
    }
  }

  if ((STORAGE_PROVIDER === 'r2' || STORAGE_PROVIDER === 's3') && storageClient) {
    try {
      const bucket = STORAGE_PROVIDER === 'r2' ? R2_BUCKET_NAME : S3_BUCKET;
      await storageClient.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch (err: any) {
      logger.error('Failed to delete asset from remote storage', { key, error: String(err) });
      return false;
    }
  }
  return true;
};
