import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '6';
    
    // Forward request to Laravel backend
    const response = await fetch(`${BACKEND_URL}/api/producers?is_featured=1&per_page=${limit}`, {
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
    return NextResponse.json(data);
    
  } catch (error) {
    logger.error('Featured Producers API Error:', error instanceof Error ? error : new Error(String(error)));
    
    // Return mock featured producers as fallback
    const mockData = {
      data: [
        {
          id: 1,
          business_name: "Ελαιώνες Καλαμάτας",
          description: "Παραδοσιακή παραγωγή εξαιρετικού ελαιολάδου από την Καλαμάτα",
          city: "Καλαμάτα",
          region: "Μεσσηνία",
          logo: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop",
          cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
          verified: true,
          rating: 4.8,
          products_count: 12
        },
        {
          id: 2,
          business_name: "Μελισσοκομείο Βλάχος",
          description: "Αγνό μέλι από τα βουνά της Εύβοιας, τρίτη γενιά μελισσοκόμων",
          city: "Χαλκίδα",
          region: "Εύβοια",
          logo: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop",
          cover_image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=400&fit=crop",
          verified: true,
          rating: 4.9,
          products_count: 8
        },
        {
          id: 3,
          business_name: "Τυροκομείο Ζήση",
          description: "Παραδοσιακά τυριά από αιγοπρόβειο γάλα, οικογενειακή επιχείρηση",
          city: "Μέτσοβο",
          region: "Ήπειρος",
          logo: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop",
          cover_image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&h=400&fit=crop",
          verified: true,
          rating: 4.7,
          products_count: 15
        }
      ],
      total: 3,
      current_page: 1,
      last_page: 1,
      per_page: 6
    };
    
    return NextResponse.json(mockData);
  }
}