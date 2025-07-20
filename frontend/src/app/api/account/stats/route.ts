import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    // Get user from token (you'll need to implement token verification)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user stats from Laravel backend
    const response = await fetch(`${BACKEND_URL}/api/account/stats`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Account stats API error', toError(error), errorToContext(error));
    
    // Return mock data for development
    const mockStats = {
      totalOrders: 3,
      pendingOrders: 1,
      completedOrders: 2,
      wishlistItems: 5,
      savedAddresses: 2,
      savedPaymentMethods: 1
    };
    
    return NextResponse.json(mockStats);
  }
}