import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api/config/unified';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = buildApiUrl('api/v1/payments');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Backend error:', new Error(errorData));
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Payment API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}