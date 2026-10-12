/**
 * Local File Asset Upload Route
 * 
 * @agent engineering-developer-tooling-engineer
 * @agent security-appsec-engineer
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { validateSafeKey } from '@/lib/storage';
import { logger } from '@/lib/logger';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);

export const POST = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const expires = searchParams.get('expires');
    const sig = searchParams.get('sig');

    if (!key || !expires || !sig) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let filepath: string;
    try {
      filepath = validateSafeKey(key);
    } catch {
      return NextResponse.json({ error: 'Invalid storage key' }, { status: 400 });
    }

    const ext = path.extname(filepath).toLowerCase().replace('.', '');
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Unsupported file extension' }, { status: 400 });
    }

    const expiresTime = parseInt(expires, 10);
    if (isNaN(expiresTime) || Date.now() > expiresTime) {
      return NextResponse.json({ error: 'URL expired' }, { status: 403 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${key}:${expires}`)
      .digest('hex');

    const sigBuf = Buffer.from(sig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // ── Early Payload Size Guard (5MB Max Asset Upload) ─────────────────
    const MAX_LOCAL_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_LOCAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload Too Large', message: 'File size exceeds maximum permitted limit of 5MB' },
        { status: 413 }
      );
    }

    if (!req.body) {
      return NextResponse.json({ error: 'No body' }, { status: 400 });
    }

    const buffer = await req.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    if (buffer.byteLength > MAX_LOCAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload Too Large', message: 'File size exceeds maximum permitted limit of 5MB' },
        { status: 413 }
      );
    }

    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, Buffer.from(buffer));

    return NextResponse.json({ success: true, message: 'File uploaded locally' });
  } catch (error: any) {
    logger.error('Local upload error', { error: String(error.message || error) });
    return NextResponse.json({ error: 'Internal Server Error', message: 'Failed to process asset upload' }, { status: 500 });
  }
};

export const PUT = POST;
