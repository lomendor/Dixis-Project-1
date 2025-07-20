import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { loadStripe } from '@stripe/stripe-js';

// Your Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey);

// Create checkout session
export async function createCheckoutSession(cartId: string) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartId }),
    });

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    logger.error('Error creating checkout session:', toError(error), errorToContext(error));
    throw error;
  }
}