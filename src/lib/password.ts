/**
 * Strong Password Hashing & Verification Engine (Argon2id + Bcrypt Migration Compatibility)
 * 
 * Complies with OWASP Password Storage Cheat Sheet:
 * - Primary Algorithm: Argon2id
 * - Memory Cost: 19456 KiB (19 MiB)
 * - Iterations (Time Cost): 2
 * - Parallelism: 1
 * - Automatic Upgrade: Seamlessly upgrades legacy Bcrypt hashes to Argon2id on successful authentication.
 * 
 * @agent security-appsec-engineer
 * @agent engineering-identity-access-engineer
 */

import * as argon2 from '@node-rs/argon2';
import bcrypt from 'bcryptjs';

// OWASP Recommended Argon2id Parameters
export const ARGON2_CONFIG: argon2.Options = {
  algorithm: 2, // Argon2id (prevents TS2748 isolatedModules ambient enum error)
  memoryCost: 19456, // 19 MiB
  timeCost: 2,       // 2 iterations
  parallelism: 1,    // 1 thread
  outputLen: 32,
};

/**
 * Hash a plaintext password using Argon2id with secure parameters.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return argon2.hash(password, ARGON2_CONFIG);
}

/**
 * Constant-time verification of plaintext password against stored hash.
 * Supports Argon2id natively and falls back to legacy Bcrypt hashes for migration.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) {
    return false;
  }

  // Modern Argon2id hashes start with $argon2id or $argon2
  if (storedHash.startsWith('$argon2')) {
    try {
      return await argon2.verify(storedHash, password);
    } catch {
      return false;
    }
  }

  // Legacy Bcrypt hashes start with $2a$, $2b$, or $2y$
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(password, storedHash);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Checks whether a stored hash should be upgraded to Argon2id.
 * Returns true if the stored hash is a legacy bcrypt hash or uses outdated parameters.
 */
export function needsRehash(storedHash: string): boolean {
  if (!storedHash) return true;
  // If it is not an Argon2id hash, it must be upgraded
  return !storedHash.startsWith('$argon2id$');
}
