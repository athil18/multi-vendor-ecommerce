// @ts-nocheck
import { describe, it, expect, afterEach, vi } from 'vitest';
import { POST as localUploadRoute } from '@/app/api/upload/local/route';
import { GET as urlGenerateRoute } from '@/app/api/upload/url/route';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Mock getAuthUser to return a mock admin or user
vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({ id: '6a33a189d2a68a8de497dcb4', role: 'admin' }),
}));

describe('Path Traversal Security Tests', () => {
  const secret = process.env.JWT_SECRET || 'local-dev-secret';

  const generateSignature = (key: string, expires: string) => {
    return crypto
      .createHmac('sha256', secret)
      .update(`${key}:${expires}`)
      .digest('hex');
  };

  afterEach(() => {
    // Clean up any files created outside target upload directory in case of successful traversal write
    const pathsToClean = [
      path.resolve(process.cwd(), 'public', 'traversal-root.txt'),
      path.resolve(process.cwd(), 'traversal-app.txt'),
    ];
    for (const p of pathsToClean) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }
  });

  describe('Local Upload Endpoint Path Traversal', () => {
    it('should fail or block when traversal key attempts to write outside upload directory', async () => {
      const key = '../../public/traversal-root.txt';
      const expires = String(Date.now() + 300000);
      const sig = generateSignature(key, expires);

      const req = new NextRequest(
        new URL(`/api/upload/local?key=${encodeURIComponent(key)}&expires=${expires}&sig=${sig}`, 'http://localhost'),
        {
          method: 'POST',
          body: Buffer.from('malicious traversal payload'),
        }
      );

      const res = await localUploadRoute(req, { params: Promise.resolve({}) });
      
      // Initially, before path traversal fix, this might return 200 and write the file!
      // After fix, it must return 400 or throw error
      expect(res.status).toBe(400);
      expect(fs.existsSync(path.resolve(process.cwd(), 'public', 'traversal-root.txt'))).toBe(false);
    });

    it('should block absolute path traversal attempt', async () => {
      const absoluteKey = path.resolve(process.cwd(), 'traversal-app.txt');
      const expires = String(Date.now() + 300000);
      const sig = generateSignature(absoluteKey, expires);

      const req = new NextRequest(
        new URL(`/api/upload/local?key=${encodeURIComponent(absoluteKey)}&expires=${expires}&sig=${sig}`, 'http://localhost'),
        {
          method: 'POST',
          body: Buffer.from('malicious absolute payload'),
        }
      );

      const res = await localUploadRoute(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(400);
      expect(fs.existsSync(absoluteKey)).toBe(false);
    });

    it('should block nested path traversal (nested ..)', async () => {
      const key = 'category/....//....//traversal-app.txt';
      const expires = String(Date.now() + 300000);
      const sig = generateSignature(key, expires);

      const req = new NextRequest(
        new URL(`/api/upload/local?key=${encodeURIComponent(key)}&expires=${expires}&sig=${sig}`, 'http://localhost'),
        {
          method: 'POST',
          body: Buffer.from('malicious nested payload'),
        }
      );

      const res = await localUploadRoute(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(400);
    });
  });

  describe('URL Upload Endpoint Category Confinement', () => {
    it('should reject category containing path traversal characters', async () => {
      const req = new NextRequest(
        new URL('/api/upload/url?category=../avatars&fileName=test.png&fileSize=1024&contentType=image/png', 'http://localhost'),
        {
          method: 'GET',
        }
      );

      const res = await urlGenerateRoute(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(400);
    });
  });

  describe('Valid File Upload', () => {
    it('should succeed with valid key under upload root', async () => {
      const key = 'avatars/valid-user/profile.png';
      const expires = String(Date.now() + 300000);
      const sig = generateSignature(key, expires);

      const req = new NextRequest(
        new URL(`/api/upload/local?key=${encodeURIComponent(key)}&expires=${expires}&sig=${sig}`, 'http://localhost'),
        {
          method: 'POST',
          body: Buffer.from('valid payload'),
        }
      );

      const res = await localUploadRoute(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);

      // Verify the file was indeed written to the correct path
      const destPath = path.resolve(process.cwd(), 'public', 'uploads', key);
      expect(fs.existsSync(destPath)).toBe(true);
      
      // Cleanup
      fs.unlinkSync(destPath);
    });
  });
});
