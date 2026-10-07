/**
 * Unit Test Suite for Cryptographic Hardening, Argon2id & Timing-Safe Primitives
 * 
 * @agent security-appsec-engineer
 * @agent engineering-identity-access-engineer
 * @agent 15-unit-test-generator
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, needsRehash, ARGON2_CONFIG } from '@/lib/password';
import { getSecureDummyPasswordHash } from '@/models/prisma-wrap';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

describe('Cryptographic Hardening & Password Security', () => {
  describe('Argon2id Password Hashing Engine', () => {
    it('should hash password using Argon2id with OWASP-compliant parameters', async () => {
      const password = 'StrongP@ssword2026!';
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
      expect(ARGON2_CONFIG.memoryCost).toBe(19456);
      expect(ARGON2_CONFIG.timeCost).toBe(2);
      expect(ARGON2_CONFIG.parallelism).toBe(1);
    });

    it('should successfully verify correct password against Argon2id hash', async () => {
      const password = 'CorrectPassword#456';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password against Argon2id hash', async () => {
      const password = 'CorrectPassword#456';
      const hash = await hashPassword(password);

      const isInvalid = await verifyPassword('WrongPassword#789', hash);
      expect(isInvalid).toBe(false);
    });

    it('should gracefully handle empty or invalid inputs', async () => {
      expect(await verifyPassword('', '$argon2id$invalid')).toBe(false);
      expect(await verifyPassword('test', '')).toBe(false);
      await expect(hashPassword('')).rejects.toThrow('Password must be a non-empty string');
    });

    it('should correctly identify Argon2id hash does not need rehash', async () => {
      const hash = await hashPassword('ValidPassword123!');
      expect(needsRehash(hash)).toBe(false);
    });
  });

  describe('Legacy Bcrypt Backward Compatibility & Migration', () => {
    it('should verify legacy bcrypt hashes seamlessly', async () => {
      const legacyPassword = 'LegacyUserPassword99!';
      const legacyBcryptHash = await bcrypt.hash(legacyPassword, 10);

      const verified = await verifyPassword(legacyPassword, legacyBcryptHash);
      expect(verified).toBe(true);

      const wrongVerified = await verifyPassword('IncorrectPassword', legacyBcryptHash);
      expect(wrongVerified).toBe(false);
    });

    it('should flag legacy bcrypt hashes as needing rehash to Argon2id', async () => {
      const legacyBcryptHash = await bcrypt.hash('OldPassword', 10);
      expect(needsRehash(legacyBcryptHash)).toBe(true);
    });
  });

  describe('Hardcoded Secret & Credential Elimination', () => {
    it('should generate unique, high-entropy, locked dummy password tokens', () => {
      const token1 = getSecureDummyPasswordHash();
      const token2 = getSecureDummyPasswordHash();

      expect(token1).toMatch(/^\$locked\$argon2id\$[a-f0-9]{48}/);
      expect(token2).toMatch(/^\$locked\$argon2id\$[a-f0-9]{48}/);
      expect(token1).not.toBe(token2);
    });

    it('should ensure dummy tokens cannot be verified as passwords', async () => {
      const dummyToken = getSecureDummyPasswordHash();
      const canVerify = await verifyPassword('Password123!', dummyToken);
      expect(canVerify).toBe(false);
    });
  });

  describe('Timing-Attack Resistant Constant-Time Comparisons', () => {
    it('should execute crypto.timingSafeEqual on HMAC signatures safely', () => {
      const key = 'secure-hmac-key';
      const data = 'test-file.png:1700000000';
      const sig1 = crypto.createHmac('sha256', key).update(data).digest('hex');
      const sig2 = crypto.createHmac('sha256', key).update(data).digest('hex');
      const fakeSig = crypto.createHmac('sha256', key).update('tampered-data').digest('hex');

      const buf1 = Buffer.from(sig1, 'utf8');
      const buf2 = Buffer.from(sig2, 'utf8');
      const bufFake = Buffer.from(fakeSig, 'utf8');

      expect(buf1.length === buf2.length && crypto.timingSafeEqual(buf1, buf2)).toBe(true);
      expect(buf1.length === bufFake.length && crypto.timingSafeEqual(buf1, bufFake)).toBe(false);
    });
  });
});
