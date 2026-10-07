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
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (Date.now() > parseInt(expires, 10)) {
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

    const dir = path.dirname(filepath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = req.body ? await req.arrayBuffer() : null;
    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    if (buffer.byteLength > MAX_LOCAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload Too Large', message: 'File size exceeds maximum permitted limit of 5MB' },
        { status: 413 }
      );
    }

    fs.writeFileSync(filepath, Buffer.from(buffer));

    return NextResponse.json({ success: true, message: 'File uploaded locally' });
  } catch (error: any) {
    logger.error('Local upload error', { error: String(error.message || error) });
    return NextResponse.json({ error: 'Internal Server Error', message: 'Failed to process asset upload' }, { status: 500 });
  }
};

export const PUT = POST;
