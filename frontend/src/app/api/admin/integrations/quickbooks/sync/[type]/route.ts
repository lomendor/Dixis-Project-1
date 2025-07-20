import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    // Validate sync type
    const validTypes = ['customers', 'orders', 'products', 'all'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid sync type' },
        { status: 400 }
      );
    }

    // Call backend API to perform sync
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008';
    
    const response = await fetch(`${backendUrl}/api/v1/admin/integrations/quickbooks/sync/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to sync ${type}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('QuickBooks sync error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
