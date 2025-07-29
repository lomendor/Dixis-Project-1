'use client';

import React from 'react';
import EnhancedProductCard from '@/components/products/EnhancedProductCard';
import { useCartStore } from '@/stores/cartStore';

interface Producer {
  id?: number;
  business_name: string;
  slug?: string;
  city?: string;
  location?: string;
  avatar_url?: string;
  rating?: number;
  verified?: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  producer_price?: number;
  discount_price?: number;
  main_image?: string;
  short_description?: string;
  description?: string;
  stock: number;
  producer?: Producer;
  rating?: number;
  reviews_count?: number;
  category?: {
    name: string;
  };
  unit?: string;
  
  // Enhanced fields (may not be present in current data)
  pdo_certification?: string;
  pgi_certification?: string;
  tsg_certification?: string;
  is_organic?: boolean;
  organic_certification_body?: string;
  quality_grade?: string;
  batch_number?: string;
  harvest_date?: string;
  processing_method?: string;
  production_facility?: string;
  expiry_date?: string;
  carbon_footprint?: number;
  water_usage?: number;
  pesticide_free_days?: number;
  soil_health_score?: number;
  renewable_energy_percentage?: number;
  created_at?: string;
  updated_at?: string;
  
  // Legacy compatibility
  is_featured?: boolean;
}

interface ClientProductGridProps {
  products: Product[];
  className?: string;
}

export default function ClientProductGrid({ 
  products, 
  className = '' 
}: ClientProductGridProps) {
  const { addToCart } = useCartStore();

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1, {
        productName: product.name,
        price: product.discount_price || product.price,
        image: product.main_image && product.main_image.trim() !== '' 
          ? product.main_image 
          : '/images/placeholder-product.svg',
        producer: product.producer?.business_name || 'Unknown Producer'
      });
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  // Transform products to match EnhancedProductCard interface - HONEST VERSION
  const transformedProducts = products.map(product => ({
    ...product,
    // Map legacy fields to new structure (ONLY REAL DATA)
    producer: product.producer ? {
      id: product.producer.id,
      business_name: product.producer.business_name,
      slug: product.producer.slug || product.producer.business_name.toLowerCase().replace(/\s+/g, '-'),
      location: product.producer.city || product.producer.location,
      avatar_url: product.producer.avatar_url,
      rating: product.producer.rating,
      verified: product.producer.verified
    } : undefined,
    
    // Ensure main_image is properly formatted
    main_image: product.main_image && product.main_image.trim() !== '' 
      ? product.main_image 
      : '/images/placeholder-product.svg',
      
    // ONLY USE REAL DATA FROM BACKEND - No fake certifications or sample data
    // Enhanced features will only show if real data exists in the API response
    // This maintains "Truth over Hype" principle
  }));

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Δεν βρέθηκαν προϊόντα
        </h3>
        <p className="text-gray-600">
          Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {transformedProducts.map((product) => (
        <EnhancedProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          showProducerInfo={true}
          showEnhancedFeatures={true}
          compact={false}
        />
      ))}
    </div>
  );
}