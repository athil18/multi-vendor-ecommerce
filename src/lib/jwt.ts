/**
 * JWT Token Generation & Cryptographic Verification
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set');
}

if (JWT_SECRET.length < 32 || JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT secrets must be at least 32 characters long');
}

export const generateAccessToken = (userId: any, role?: string) => {
  let id: string;
  let userRole = role || 'customer';
  let email: string | undefined;

  if (typeof userId === 'object' && userId !== null) {
    if ('id' in userId || '_id' in userId) {
      id = (userId.id || userId._id).toString();
      userRole = userId.role || userRole;
      email = userId.email;
    } else {
      id = userId.toString();
    }
  } else {
    id = String(userId);
  }

  const payload: Record<string, any> = { id, role: userRole };
  if (email) payload.email = email;

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m', algorithm: 'HS256' });
};

export const generateToken = generateAccessToken;

export const generateRefreshToken = (userId: any) => {
  let id: string;
  if (typeof userId === 'object' && userId !== null) {
    if ('id' in userId || '_id' in userId) {
      id = (userId.id || userId._id).toString();
    } else {
      id = userId.toString();
    }
  } else {
    id = String(userId);
  }
  return jwt.sign(
    { id, jti: crypto.randomUUID() },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
};

const ID_REGEX = /^(c[a-z0-9]{20,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-f0-9]{24})$/i;

export const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  if (
    typeof payload === 'string' ||
    !payload.id ||
    typeof payload.id !== 'string' ||
    !ID_REGEX.test(payload.id) ||
    !['admin', 'seller', 'customer'].includes(payload.role)
  ) {
    throw new jwt.JsonWebTokenError('Invalid access token claims');
  }
  return payload as { id: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
  if (typeof payload === 'string' || !payload.id) {
    throw new jwt.JsonWebTokenError('Invalid refresh token claims');
  }
  return payload as { id: string };
};

