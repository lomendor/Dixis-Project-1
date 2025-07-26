import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

// Check if we have real Stripe keys or need to use mock mode
const isStripeLive = process.env.STRIPE_SECRET_KEY && 
                    process.env.STRIPE_SECRET_KEY.startsWith('sk_') && 
                    !process.env.STRIPE_SECRET_KEY.includes('...');

const stripe = isStripeLive ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
}) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'eur', metadata = {} } = body;

    if (!amount || amount < 0.50) { // Minimum 50 cents (in euros)
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Use mock payment intent if Stripe is not configured
    if (!isStripeLive || !stripe) {
      logger.info('Using mock payment intent for development testing', {
        amount,
        currency,
        metadata
      });

      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `pi_mock_${Date.now()}_secret`,
        amount: Math.round(amount * 100),
        currency,
        status: 'requires_payment_method',
        metadata: {
          source: 'dixis-marketplace-mock',
          ...metadata
        }
      };

      return NextResponse.json({
        clientSecret: mockPaymentIntent.client_secret,
        paymentIntentId: mockPaymentIntent.id,
        mockMode: true
      });
    }

    // Create real payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        source: 'dixis-marketplace',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    logger.error('Payment intent creation failed', toError(error), errorToContext(error));
    
    return NextResponse.json(
      { error: 'Payment intent creation failed' },
      { status: 500 }
    );
  }
}