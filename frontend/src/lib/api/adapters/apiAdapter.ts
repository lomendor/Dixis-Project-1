import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

/**
 * API Adapter - Simplified Real-First Strategy
 * Always tries real Laravel API first, automatic fallback to mock data
 */

import { apiConfig } from '@/config/features';
import { mockProducts } from '@/lib/api/models/product/mockData';
import { mockCategories } from '@/lib/api/models/category/mockData';
import { mockProducers } from '@/lib/api/models/producer/mockData';
import type { Product, Category } from '@/lib/api/models/product/types';

// Temporary Producer type until proper export is available
interface Producer {
  id: number;
  business_name: string;
  description?: string;
  region?: string;
  rating?: number;
  is_verified?: boolean;
  is_featured?: boolean;
}

// Laravel API Response Types
interface LaravelPaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Laravel Product Type (from API response)
interface LaravelProduct {
  id: number;
  producer_id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  sku: string | null;
  weight_grams: number | null;
  main_image: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_seasonal: boolean;
  producer: {
    id: number;
    business_name: string;
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attribute_values: Array<{
    id: number;
    product_id: number;
    attribute_id: number;
    value: string;
    attribute: {
      id: number;
      name: string;
      slug: string;
      type: string;
    };
  }>;
}

class APIAdapter {
  private baseUrl = apiConfig.baseUrl;

  // Generic API call with error handling
  private async apiCall<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API call failed for ${endpoint}:', { error: toError(error), context: errorToContext(error) });
      throw error;
    }
  }

  // Transform Laravel product to our Product type
  private transformProduct(laravelProduct: LaravelProduct): Product {
    return {
      id: laravelProduct.id.toString(),
      name: laravelProduct.name,
      slug: laravelProduct.slug,
      description: laravelProduct.description,
      shortDescription: laravelProduct.short_description || '',
      price: laravelProduct.price,
      originalPrice: laravelProduct.discount_price ? laravelProduct.price : undefined,
      currency: 'EUR',
      image: laravelProduct.main_image || undefined,
      stock: laravelProduct.stock,
      sku: laravelProduct.sku || '',
      // isActive: laravelProduct.is_active, // Removed - not in Product interface
      isFeatured: laravelProduct.is_featured,
      producer: {
        id: laravelProduct.producer.id.toString(),
        name: laravelProduct.producer.business_name,
        slug: laravelProduct.producer.business_name.toLowerCase().replace(/\s+/g, '-'),
      },
      categories: laravelProduct.categories.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
      })),
      attributes: laravelProduct.attribute_values.map(attr => ({
        id: attr.attribute.id.toString(),
        name: attr.attribute.name,
        value: attr.value,
        type: attr.attribute.type,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Products API - Always try real API first, automatic fallback
  async getProducts(): Promise<Product[]> {
    try {
      logger.info('🌐 Fetching products from Laravel API', {});
      const response = await this.apiCall<LaravelPaginatedResponse<LaravelProduct>>('/api/v1/products?per_page=100');
      return response.data.map(product => this.transformProduct(product));
    } catch (error) {
      logger.warn('⚠️ Laravel API failed, falling back to mock data:', { error: toError(error), context: errorToContext(error) });
      return mockProducts;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const laravelProduct = await this.apiCall<LaravelProduct>(`/api/v1/products/${id}`);
      return this.transformProduct(laravelProduct);
    } catch (error) {
      logger.warn(`⚠️ Laravel API failed for product ${id}, falling back to mock data:`, { error: toError(error), context: errorToContext(error) });
      return mockProducts.find(p => p.id === id) || null;
    }
  }

  // Categories API - Always try real API first, automatic fallback
  async getCategories(): Promise<Category[]> {
    try {
      logger.info('🌐 Fetching categories from Laravel API');
      const response = await this.apiCall<any[]>('/api/v1/categories');
      return response.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image: cat.image || '',
        productCount: 0, // Laravel doesn't return product count in this endpoint
      }));
    } catch (error) {
      logger.warn('⚠️ Laravel API failed, falling back to mock categories:', { error: toError(error), context: errorToContext(error) });
      // Transform mock categories to match our interface
      return mockCategories.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image: cat.image || '',
        productCount: cat.product_count || 0,
      }));
    }
  }

  // Producers API - Always try real API first, automatic fallback
  async getProducers(): Promise<Producer[]> {
    try {
      logger.info('🌐 Fetching producers from Laravel API');
      const response = await this.apiCall<any[]>('/api/v1/producers');
      return response.map((producer: any) => ({
        id: producer.id.toString(),
        name: producer.business_name,
        slug: producer.business_name.toLowerCase().replace(/\s+/g, '-'),
        description: producer.description || '',
        location: `${producer.city || ''}${producer.region ? `, ${producer.region}` : ''}`.trim(),
        image: producer.logo || '',
        verified: true, // Laravel doesn't have verification status in this endpoint
        rating: producer.rating || 0,
        productCount: 0, // Laravel doesn't return product count in this endpoint
      }));
    } catch (error) {
      logger.warn('⚠️ Laravel API failed, falling back to mock producers:', { error: toError(error), context: errorToContext(error) });
      // Transform mock producers to match our interface
      return mockProducers.map(producer => ({
        id: producer.id.toString(),
        name: producer.business_name,
        slug: producer.slug,
        description: producer.bio || '',
        location: producer.location || '',
        image: producer.profile_image || '',
        verified: producer.verification_status === 'verified',
        rating: 0, // Mock data doesn't have ratings
        productCount: 0, // Mock data doesn't have product counts
      }));
    }
  }

  // Health check - use products endpoint as health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.apiCall('/api/v1/products?per_page=1');
      return true;
    } catch (error) {
      logger.warn('⚠️ Laravel API health check failed:', { error: toError(error), context: errorToContext(error) });
      return false;
    }
  }
}

// Singleton instance
export const apiAdapter = new APIAdapter();
export default apiAdapter;
