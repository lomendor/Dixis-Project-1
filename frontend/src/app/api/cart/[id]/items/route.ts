import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/cart/[id]/items
 * Adds item to cart
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartId } = await params;
    const body = await request.json();
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/${cartId}/items`;
    
    console.log('🛒 Adding item to cart via backend:', backendUrl, body);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', response.status, errorData);
      throw new Error(`Backend responded with ${response.status}`);
    }

    const itemData = await response.json();
    console.log('✅ Item added to cart:', cartId);
    
    return NextResponse.json(itemData);
  } catch (error) {
    console.error('Cart add item API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart/[id]/items
 * Updates item in cart (quantity, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartId } = await params;
    const body = await request.json();
    const { item_id, ...updateData } = body;
    
    // Use item-specific endpoint
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/${cartId}/items/${item_id}`;
    
    console.log('🛒 Updating cart item via backend:', backendUrl, updateData);

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', response.status, errorData);
      throw new Error(`Backend responded with ${response.status}`);
    }

    const itemData = await response.json();
    console.log('✅ Cart item updated:', cartId, item_id);
    
    return NextResponse.json(itemData);
  } catch (error) {
    console.error('Cart update item API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/[id]/items
 * Removes item from cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'item_id parameter is required' },
        { status: 400 }
      );
    }

    // Use item-specific endpoint 
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cart/${cartId}/items/${itemId}`;
    
    console.log('🛒 Removing cart item via backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', response.status, errorData);
      throw new Error(`Backend responded with ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Cart item removed:', cartId, itemId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cart remove item API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}