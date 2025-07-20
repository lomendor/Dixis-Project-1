import { logger } from '@/lib/logging/productionLogger';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get search query
    const query = searchParams.get('q') || searchParams.get('query');
    if (!query || query.length < 2) {
      return NextResponse.json({
        data: [],
        total: 0
      });
    }

    // Build query parameters for Laravel API
    const params = new URLSearchParams();
    params.set('q', query);
    
    // Add pagination
    params.set('per_page', searchParams.get('per_page') || '10');
    params.set('page', searchParams.get('page') || '1');
    
    // Add location filter if provided
    if (searchParams.get('location')) {
      params.set('location', searchParams.get('location')!);
    }

    // Try search endpoint first, fallback to regular producers endpoint with filtering
    let backendUrl = `${BACKEND_URL}/api/producers/search?${params.toString()}`;
    let response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    let data;
    
    // If search endpoint doesn't exist, fallback to regular producers with filtering
    if (!response.ok) {
      // Fallback: get all producers and filter client-side
      const fallbackParams = new URLSearchParams();
      fallbackParams.set('per_page', '50'); // Get producers for filtering
      
      backendUrl = `${BACKEND_URL}/api/producers?${fallbackParams.toString()}`;
      response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const allProducersData = await response.json();
      
      // Filter producers based on search query
      const filteredProducers = (allProducersData.data || []).filter((producer: any) => {
        const searchableText = [
          producer.business_name,
          producer.description,
          producer.bio,
          producer.city,
          producer.region,
        ].join(' ').toLowerCase();
        
        return searchableText.includes(query.toLowerCase());
      });

      data = {
        data: filteredProducers,
        total: filteredProducers.length,
        current_page: 1,
        last_page: 1,
        per_page: filteredProducers.length
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
      per_page: data.per_page || data?.meta?.per_page || 10
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    logger.error('Producers search API proxy error:', error instanceof Error ? error : new Error(String(error)));
    
    // Return empty response on error
    return NextResponse.json({
      data: [],
      total: 0,
      current_page: 1,
      last_page: 1,
      per_page: 10
    });
  }
}