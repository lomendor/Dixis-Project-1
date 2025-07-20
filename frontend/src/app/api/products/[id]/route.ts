import { NextRequest, NextResponse } from 'next/server';

// Import mock data for fallback
async function getMockProduct(id: string) {
  const { mockProducts } = await import('@/lib/api/models/product/mockData');
  
  // Find product by id or slug
  const product = mockProducts.find(p => 
    p.id.toString() === id || 
    p.slug === id
  );
  
  if (!product) {
    return null;
  }
  
  // Transform to match API format
  return {
    id: parseInt(String(product.id)),
    name: product.name,
    slug: product.slug,
    price: product.price,
    sale_price: product.salePrice,
    discount_price: product.salePrice,
    image: product.image,
    main_image: product.image,
    description: product.description,
    short_description: product.shortDescription,
    stock: product.stock || 50,
    unit: product.unit || 'κιλό',
    weight: product.weight,
    sku: product.sku,
    origin: product.origin,
    producer_id: product.producerId,
    producer_name: product.producerName,
    producer_slug: product.producerSlug,
    producer_price: product.producerPrice,
    commission_rate: product.commissionRate,
    is_organic: product.isOrganic,
    is_local: product.isLocal,
    is_vegan: product.isVegan,
    is_gluten_free: product.isGlutenFree,
    rating: product.rating,
    review_count: product.reviewCount,
    categories: product.categories || [],
    tags: product.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('🔍 Fetching product with ID:', id);
    
    // Try to fetch from backend first
    try {
      const backendUrl = `http://localhost:8000/api/products/${id}`;
      console.log('📡 Attempting to fetch from backend:', backendUrl);
      
      const response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Product fetched from backend successfully');
        return NextResponse.json(data);
      }
      
      console.warn('⚠️ Backend returned non-OK status:', response.status);
    } catch (backendError) {
      console.warn('⚠️ Backend fetch failed, using mock data:', backendError);
    }
    
    // Fallback to mock data
    const mockProduct = await getMockProduct(id);
    
    if (!mockProduct) {
      console.error('❌ Product not found in mock data:', id);
      return NextResponse.json(
        { 
          error: 'Product not found',
          message: `No product found with ID or slug: ${id}`
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Returning mock product data');
    return NextResponse.json(mockProduct);
    
  } catch (error) {
    console.error('❌ Product API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}