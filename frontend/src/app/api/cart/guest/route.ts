import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/cart/guest
 * Creates a new guest cart
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/guest`;
    
    console.log('🛒 Creating guest cart via backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const cartData = await response.json();
    console.log('✅ Guest cart created:', cartData);
    
    return NextResponse.json(cartData);
  } catch (error) {
    console.error('Cart guest API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to create guest cart' },
      { status: 500 }
    );
  }
}