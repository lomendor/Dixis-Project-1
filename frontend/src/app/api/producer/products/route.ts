import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `http://localhost:8000/api/v1/producer/products${queryString ? `?${queryString}` : ''}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, { headers });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Producer products API proxy error:', error instanceof Error ? error : new Error(String(error)));
    
    // Development fallback - return some mock producer products
    if (process.env.NODE_ENV === 'development') {
      const mockProducerProducts = {
        data: [
          {
            id: 1,
            name: 'Εξτραπάρθενο Ελαιόλαδο Κορωνέικη',
            price: 12.50,
            stock: 45,
            status: 'active',
            category: 'Ελαιόλαδο',
            image: '/images/products/olive-oil.jpg',
            created_at: '2024-01-15T10:00:00Z',
            sales_this_month: 23,
            revenue_this_month: 287.50
          },
          {
            id: 2,
            name: 'Βιολογικό Μέλι Θυμαριού',
            price: 8.90,
            stock: 32,
            status: 'active',
            category: 'Μέλι',
            image: '/images/products/honey.jpg',
            created_at: '2024-01-20T14:30:00Z',
            sales_this_month: 15,
            revenue_this_month: 133.50
          }
        ],
        total: 2,
        current_page: 1,
        last_page: 1,
        per_page: 10
      };
      
      return NextResponse.json(mockProducerProducts);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch producer products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    const backendUrl = `http://localhost:8000/api/v1/producer/products`;
    
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
    logger.error('Create producer product API proxy error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}