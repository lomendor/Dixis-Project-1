import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '8';

  try {
    
    // Forward request to Laravel backend with featured filter
    const response = await fetch(`${BACKEND_URL}/api/v1/products?is_featured=1&per_page=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data in the expected format
    return NextResponse.json(data);
    
  } catch (error) {
    logger.error('Featured Products API Error:', error instanceof Error ? error : new Error(String(error)));
    
    // Return mock featured products as fallback
    const mockData = {
      data: [
        {
          id: 56,
          name: "Βιολογικό Έξτρα Παρθένο Ελαιόλαδο",
          slug: "viologiko-extra-partheno-elaiolado",
          price: 12.90,
          discount_price: null,
          main_image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop",
          short_description: "Εξαιρετικής ποιότητας βιολογικό ελαιόλαδο",
          stock: 250,
          is_featured: true,
          status: "active",
          producer: {
            id: 1,
            business_name: "Ελαιώνες Καλαμάτας"
          },
          category: {
            id: 9,
            name: "Ελαιόλαδο"
          }
        }
      ],
      total: 1,
      current_page: 1,
      last_page: 1,
      per_page: parseInt(limit)
    };
    
    return NextResponse.json(mockData);
  }
}