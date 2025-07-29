import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

interface CreateVivaWalletPaymentRequest {
  orderId: number;
  amount: number;
  installments?: number;
  options?: {
    language?: string;
    returnUrl?: string;
    cancelUrl?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateVivaWalletPaymentRequest = await request.json();
    
    if (!body.orderId || !body.amount) {
      return NextResponse.json(
        { message: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    // Get Laravel backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Forward request to Laravel backend
    const response = await fetch(`${backendUrl}/api/v1/payments/greek/viva-wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        order_id: body.orderId,
        amount: body.amount,
        installments: body.installments || 0,
        options: {
          language: body.options?.language || 'el',
          return_url: body.options?.returnUrl || `${request.nextUrl.origin}/checkout/viva-wallet/return`,
          cancel_url: body.options?.cancelUrl || `${request.nextUrl.origin}/checkout`,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('Laravel Viva Wallet payment creation failed', {
        orderId: body.orderId,
        status: response.status,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          message: errorData.message || 'Failed to create Viva Wallet payment',
          details: errorData
        },
        { status: response.status }
      );
    }

    const paymentData = await response.json();
    
    logger.info('Viva Wallet payment created successfully', {
      orderId: body.orderId,
      orderCode: paymentData.data?.orderCode,
      amount: body.amount
    });

    return NextResponse.json(paymentData);

  } catch (error) {
    logger.error('Viva Wallet payment creation error', toError(error), errorToContext(error));
    
    return NextResponse.json(
      { message: 'Internal server error while creating Viva Wallet payment' },
      { status: 500 }
    );
  }
}