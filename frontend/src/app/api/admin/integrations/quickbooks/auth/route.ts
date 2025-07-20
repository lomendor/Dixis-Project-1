import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Call backend API to initiate QuickBooks OAuth
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008';
    
    const response = await fetch(`${backendUrl}/api/v1/admin/integrations/quickbooks/auth`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to initiate QuickBooks authentication' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('QuickBooks auth error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
