import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api/core/config';

// Import mock data for fallback
async function getMockProducts() {
  const { mockProducts } = await import('@/lib/api/models/product/mockData');
  
  // Transform mock data to match API format
  const transformedProducts = mockProducts.map(product => ({
    id: parseInt(String(product.id)),
    name: product.name,
    slug: product.slug,
    price: product.price,
    discount_price: product.salePrice,
    main_image: product.image,
    short_description: product.shortDescription,
    stock: product.stock || 50,
    producer: {
      business_name: product.producerName,
      slug: product.producerSlug
    },
    categories: product.categories || [],
    is_organic: product.isOrganic,
    is_local: product.isLocal,
    rating: product.rating,
    review_count: product.reviewCount
  }));
  
  return {
    data: transformedProducts,
    total: transformedProducts.length,
    current_page: 1,
    last_page: 1,
    per_page: transformedProducts.length
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Ensure we get all products by default (per_page=100)
    if (!searchParams.has('per_page')) {
      searchParams.set('per_page', '100');
    }

    const queryString = searchParams.toString();
    const backendUrl = `${buildApiUrl('api/v1/products')}?${queryString}`;

    console.log('🔍 Fetching from backend:', backendUrl);

    // Try to fetch from backend with shorter timeout
    try {
      const response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend response received, products count:', data.data?.length || 0);
        return NextResponse.json(data);
      }
      
      console.warn('⚠️ Backend returned non-OK status:', response.status);
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable, using mock data:', backendError);
    }

    // Fallback to mock data
    const mockData = await getMockProducts();
    console.log('✅ Returning mock products, count:', mockData.data.length);
    
    return NextResponse.json(mockData);
    
  } catch (error) {
    console.error('❌ Products API error:', error);
    
    // Even if everything fails, try to return mock data
    try {
      const mockData = await getMockProducts();
      return NextResponse.json(mockData);
    } catch (mockError) {
      console.error('❌ Failed to load mock data:', mockError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch products',
          data: [],
          total: 0,
          current_page: 1,
          last_page: 1,
          per_page: 0
        },
        { status: 500 }
      );
    }
  }
}