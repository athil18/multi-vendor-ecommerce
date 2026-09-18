import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Environment-driven configuration
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || (process.env.NODE_ENV === 'production' ? 's3' : 'local');
const S3_BUCKET = process.env.S3_BUCKET || 'my-bucket';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

// Initialize S3 Client only if configured for S3 to avoid crashes in local dev without keys
const s3Client = STORAGE_PROVIDER === 's3' 
  ? new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
  : null;

/**
 * Validates if the given mime type is allowed.
 */
export const isAllowedMimeType = (mimeType: string, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']) => {
  return allowedTypes.includes(mimeType);
};

/**
 * Validates file size
 */
export const isValidFileSize = (sizeBytes: number, maxSizeMb: number = 5) => {
  return sizeBytes <= maxSizeMb * 1024 * 1024;
};

/**
 * Generates a signed URL for secure direct uploads.
 */
export const generateUploadUrl = async (
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<{ uploadUrl: string; publicUrl: string; provider: 's3' | 'local' }> => {
  // Validate the key format and check for path traversal
  validateSafeKey(key);

  if (STORAGE_PROVIDER === 's3' && s3Client) {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
    
    return { uploadUrl, publicUrl, provider: 's3' };
  } else {
    // Local development implementation
    // We sign the URL with our own secret to prevent arbitrary uploads
    const secret = process.env.JWT_SECRET || 'local-dev-secret';
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${key}:${expiresAt}`)
      .digest('hex');
      
    // Point to our local Next.js API route that handles direct uploads
    const uploadUrl = `/api/upload/local?key=${encodeURIComponent(key)}&expires=${expiresAt}&sig=${signature}`;
    const publicUrl = `/uploads/${key}`; // Assuming we serve /uploads statically
    
    return { uploadUrl, publicUrl, provider: 'local' };
  }
};

/**
 * Validates a key and returns the safe canonical path resolved inside the uploads directory.
 * Throws an Error if path traversal is detected.
 */
export const validateSafeKey = (key: string): string => {
  if (!key) {
    throw new Error('Key is required');
  }

  // 1. Resolve target path
  const uploadRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const targetPath = path.resolve(uploadRoot, key);

  // 2. Prevent path traversal using path.relative
  const relative = path.relative(uploadRoot, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Path traversal detected');
  }

  // Additional defense-in-depth checks
  if (key.includes('..') || key.includes('\0') || path.isAbsolute(key)) {
    throw new Error('Path traversal detected');
  }

  return targetPath;
};

