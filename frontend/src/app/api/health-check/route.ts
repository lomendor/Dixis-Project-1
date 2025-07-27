import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health-check
 * Checks if the Laravel backend is available
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/health`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(2000), // 2 second timeout for health check
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const healthData = await response.json();
    
    return NextResponse.json({
      status: 'healthy',
      backend: 'available',
      timestamp: new Date().toISOString(),
      ...healthData
    });
  } catch (error) {
    console.log('Backend health check failed:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        status: 'degraded',
        backend: 'unavailable',
        timestamp: new Date().toISOString(),
        message: 'Cart will use local storage mode'
      },
      { status: 200 } // Return 200 so frontend knows endpoint works
    );
  }
}