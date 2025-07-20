import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: any = {};

  try {
    body = await request.json();
    
    const backendUrl = `http://localhost:8000/api/v1/orders`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add authorization header if available
    const authHeader = request.headers.get('authorization');
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
    logger.error('Orders API proxy error:', error instanceof Error ? error : new Error(String(error)));
    
    // Return mock success response for development
    const mockOrder = {
      id: `ORD-${Date.now()}`,
      status: 'confirmed',
      total: body?.totals?.total || 0,
      items: body.items || [],
      shipping: body.shipping || {},
      payment: body.payment || {},
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    };
    
    return NextResponse.json(mockOrder);
  }
}