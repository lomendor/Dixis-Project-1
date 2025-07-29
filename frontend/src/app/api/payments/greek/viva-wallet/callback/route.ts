import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Viva Wallet webhook received', { body });

    // Get Laravel backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Forward webhook to Laravel backend
    const response = await fetch(`${backendUrl}/api/v1/payments/greek/viva-wallet/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Webhook-Source': 'viva-wallet',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('Laravel Viva Wallet webhook processing failed', {
        status: response.status,
        error: errorData,
        webhook: body
      });
      
      return NextResponse.json(
        { message: 'Webhook processing failed' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    logger.info('Viva Wallet webhook processed successfully', {
      orderCode: body.OrderCode,
      eventType: body.EventTypeId
    });

    return NextResponse.json(result);

  } catch (error) {
    logger.error('Viva Wallet webhook error', toError(error), errorToContext(error));
    
    return NextResponse.json(
      { message: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle return URL from Viva Wallet (user redirected back)
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get('orderCode');
    const success = searchParams.get('success');
    
    if (!orderCode) {
      return NextResponse.redirect(new URL('/checkout?error=missing_order_code', request.url));
    }

    // Get Laravel backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Verify payment status with Laravel backend
    const response = await fetch(`${backendUrl}/api/v1/payments/greek/viva-wallet/verify/${orderCode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error('Payment verification failed', {
        orderCode,
        status: response.status
      });
      return NextResponse.redirect(new URL('/checkout?error=verification_failed', request.url));
    }

    const verificationResult = await response.json();
    
    if (verificationResult.data.status === 'succeeded') {
      // Payment successful - redirect to success page
      const orderId = verificationResult.data.order_id;
      return NextResponse.redirect(new URL(`/orders/${orderId}/confirmation?payment=success`, request.url));
    } else {
      // Payment failed or pending
      return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url));
    }

  } catch (error) {
    logger.error('Viva Wallet return URL error', toError(error), errorToContext(error));
    return NextResponse.redirect(new URL('/checkout?error=return_error', request.url));
  }
}