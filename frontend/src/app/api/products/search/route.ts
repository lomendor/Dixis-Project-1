import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get search query
  const query = searchParams.get('q') || searchParams.get('query');
  
  try {
    if (!query || query.length < 2) {
      return NextResponse.json({
        data: [],
        total: 0,
        suggestions: []
      });
    }

    // Log search request for monitoring
    if (process.env.NODE_ENV === 'development') {
      logger.info('Search query:', { query });
      logger.info('Backend URL:', { url: BACKEND_URL });
    }

    // Build query parameters for Laravel API
    const params = new URLSearchParams();
    params.set('q', query);
    
    // Add pagination
    params.set('per_page', searchParams.get('per_page') || '20');
    params.set('page', searchParams.get('page') || '1');
    
    // Add filters if provided
    if (searchParams.get('category')) {
      params.set('category', searchParams.get('category')!);
    }
    if (searchParams.get('location')) {
      params.set('location', searchParams.get('location')!);
    }
    if (searchParams.get('min_price')) {
      params.set('min_price', searchParams.get('min_price')!);
    }
    if (searchParams.get('max_price')) {
      params.set('max_price', searchParams.get('max_price')!);
    }
    if (searchParams.get('rating')) {
      params.set('rating', searchParams.get('rating')!);
    }
    if (searchParams.get('in_stock')) {
      params.set('in_stock', searchParams.get('in_stock')!);
    }
    if (searchParams.get('sort_by')) {
      params.set('sort_by', searchParams.get('sort_by')!);
    }

    // Try search endpoint first, fallback to regular products endpoint with filtering
    let backendUrl = `${BACKEND_URL}/api/products/search?${params.toString()}`;
    let response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    let data;
    
    // If search endpoint doesn't exist, fallback to regular products with filtering
    if (!response.ok) {
      // Fallback: get all products and filter client-side
      const fallbackParams = new URLSearchParams();
      fallbackParams.set('per_page', '100'); // Get more products for better search
      
      backendUrl = `${BACKEND_URL}/api/products?${fallbackParams.toString()}`;
      response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const allProductsData = await response.json();
      
      // Filter products based on search query
      const filteredProducts = (allProductsData.data || []).filter((product: any) => {
        const searchableText = [
          product.name,
          product.description,
          product.short_description,
          product?.category?.name,
          product?.producer?.business_name,
        ].join(' ').toLowerCase();
        
        return searchableText.includes(query.toLowerCase());
      });

      data = {
        data: filteredProducts,
        total: filteredProducts.length,
        current_page: 1,
        last_page: 1,
        per_page: filteredProducts.length
      };
    } else {
      data = await response.json();
    }
    
    // Transform response to ensure consistent format
    const transformedData = {
      data: data.data || [],
      total: data.total || data?.meta?.total || 0,
      current_page: data.current_page || data?.meta?.current_page || 1,
      last_page: data.last_page || data?.meta?.last_page || 1,
      per_page: data.per_page || data?.meta?.per_page || 20,
      suggestions: data.suggestions || [],
      facets: data.facets || {}
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    logger.error('Search API proxy error:', error instanceof Error ? error : new Error(String(error)));
    
    // Return fallback response for development
    return NextResponse.json({
      data: [],
      total: 0,
      current_page: 1,
      last_page: 1,
      per_page: 20,
      suggestions: [
        'ελαιόλαδο',
        'μέλι',
        'τυρί',
        'κρασί',
        'βιολογικά προϊόντα'
      ].filter(s => s.includes(query || '')),
      facets: {
        categories: [],
        locations: [],
        price_ranges: []
      }
    });
  }
}