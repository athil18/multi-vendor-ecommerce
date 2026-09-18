/**
 * Zero-Leak PII & Credential Sanitizer
 * 
 * @agent 21-pii-sanitization-agent
 * @agent security-appsec-engineer
 * @agent engineering-privacy-engineer
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'jwt',
  'authorization',
  'cookie',
  'cardNumber',
  'cvv',
  'cvc',
  'stripeSecretKey',
  'stripeWebhookSecret',
]);

const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const EMAIL_REGEX = /\b([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/g;
const JWT_REGEX = /\beyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\b/g;

/**
 * Mask a string to hide credit card numbers, JWTs, and email addresses.
 */
export function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return value;

  return value
    .replace(CREDIT_CARD_REGEX, '****-****-****-****')
    .replace(JWT_REGEX, '[REDACTED_JWT]')
    .replace(EMAIL_REGEX, '$1***@$2');
}

export const sanitizeText = sanitizeString;

/**
 * Deep-sanitize any JavaScript object or primitive before logging or serializing.
 */
export function sanitizeObject<T>(obj: T, depth = 0): T {
  if (depth > 8) return '[MAX_DEPTH]' as unknown as T;
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value, depth + 1);
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized as T;
  }

  return obj;
}

export default sanitizeObject;
