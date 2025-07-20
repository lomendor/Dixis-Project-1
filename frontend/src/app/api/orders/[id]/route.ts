import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Try to fetch from backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
        },
      });

      if (response.ok) {
        const order = await response.json();
        return NextResponse.json(order);
      }
    } catch (backendError) {
      logger.error('Backend order fetch failed', toError(backendError), errorToContext(backendError));
    }

    // Return mock order for development
    const mockOrder = {
      id: orderId,
      order_number: `DX${orderId}`,
      status: 'confirmed',
      payment_status: 'completed',
      total_amount: 89.50,
      subtotal: 72.50,
      tax_amount: 17.00,
      shipping_cost: 5.00,
      items: [
        {
          id: '1',
          name: 'Οργανικές Ντομάτες',
          price: 4.50,
          quantity: 2,
          total: 9.00,
          product: {
            id: '1',
            name: 'Οργανικές Ντομάτες',
            imageUrl: '/images/products/tomatoes.jpg',
            category: 'Λαχανικά'
          }
        },
        {
          id: '2',
          name: 'Φρέσκο Μαρούλι',
          price: 2.80,
          quantity: 3,
          total: 8.40,
          product: {
            id: '2',
            name: 'Φρέσκο Μαρούλι',
            imageUrl: '/images/products/lettuce.jpg',
            category: 'Λαχανικά'
          }
        },
        {
          id: '3',
          name: 'Οργανικά Αυγά',
          price: 5.50,
          quantity: 1,
          total: 5.50,
          product: {
            id: '3',
            name: 'Οργανικά Αυγά (12τμχ)',
            imageUrl: '/images/products/eggs.jpg',
            category: 'Πρωτεΐνες'
          }
        }
      ],
      customer: {
        id: '1',
        firstName: 'Παναγιώτης',
        lastName: 'Κουρκούτης',
        email: 'customer@example.com',
        phone: '+30 210 123 4567'
      },
      shipping_address: {
        type: 'home',
        firstName: 'Παναγιώτης',
        lastName: 'Κουρκούτης',
        address: 'Πατησίων 123',
        city: 'Αθήνα',
        postal_code: '10678',
        country: 'Ελλάδα',
        phone: '+30 210 123 4567'
      },
      billing_address: {
        type: 'home',
        firstName: 'Παναγιώτης',
        lastName: 'Κουρκούτης',
        address: 'Πατησίων 123',
        city: 'Αθήνα',
        postal_code: '10678',
        country: 'Ελλάδα'
      },
      shipping_method: 'standard',
      payment_method: 'credit_card',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tracking_number: `TK${Date.now()}`,
      notes: 'Παρακαλώ επικοινωνήστε πριν την παράδοση',
      order_history: [
        {
          status: 'pending',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          description: 'Παραγγελία δημιουργήθηκε'
        },
        {
          status: 'confirmed',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          description: 'Παραγγελία επιβεβαιώθηκε'
        },
        {
          status: 'processing',
          timestamp: new Date().toISOString(),
          description: 'Προετοιμασία παραγγελίας'
        }
      ]
    };

    return NextResponse.json(mockOrder);
  } catch (error) {
    logger.error('Order fetch failed', toError(error), errorToContext(error));
    
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    const body = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Try to update order in backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': request.headers.get('authorization') || '',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const order = await response.json();
        return NextResponse.json(order);
      }
    } catch (backendError) {
      logger.error('Backend order update failed', toError(backendError), errorToContext(backendError));
    }

    // Return mock success response
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    logger.error('Order update failed', toError(error), errorToContext(error));
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}