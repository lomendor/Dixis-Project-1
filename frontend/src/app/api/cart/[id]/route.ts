import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cart/[id]
 * Retrieves cart by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartId } = await params;
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/${cartId}`;
    
    console.log('🛒 Fetching cart via backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Cart not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with ${response.status}`);
    }

    const cartData = await response.json();
    console.log('✅ Cart fetched:', cartId);
    
    return NextResponse.json(cartData);
  } catch (error) {
    console.error('Cart get API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/[id]
 * Clears/deletes cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartId } = await params;
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/${cartId}/clear`;
    
    console.log('🛒 Clearing cart via backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Cart cleared:', cartId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cart clear API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}