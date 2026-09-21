import Stripe from 'stripe';

// Lazy-evaluated Stripe client: validated at first use, not at import time.
// This prevents Next.js build-time crashes during static page collection.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('FATAL ERROR: STRIPE_SECRET_KEY is not defined in the environment.');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return _stripe;
}

// Export as a getter so existing code (`stripe.xyz()`) continues to work unchanged.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});
