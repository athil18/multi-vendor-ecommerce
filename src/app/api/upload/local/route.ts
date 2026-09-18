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

    const secret = process.env.JWT_SECRET || 'local-dev-secret';
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${key}:${expires}`)
      .digest('hex');

    if (sig !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    if (!req.body) {
      return NextResponse.json({ error: 'No body' }, { status: 400 });
    }

    const dir = path.dirname(filepath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = req.body ? await req.arrayBuffer() : null;
    if (!buffer) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }
    fs.writeFileSync(filepath, Buffer.from(buffer));

    return NextResponse.json({ success: true, message: 'File uploaded locally' });
  } catch (error: any) {
    logger.error('Local upload error', { error: String(error.message || error) });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const PUT = POST;
