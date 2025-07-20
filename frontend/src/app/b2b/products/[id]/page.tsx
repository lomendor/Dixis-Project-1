'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import AdvancedWholesalePricing, { BusinessTier, VolumeDiscount } from '@/components/b2b/pricing/AdvancedWholesalePricing';
import { SkeletonCard } from '@/components/mobile/ProgressiveLoading';
import { ArrowLeftIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface B2BProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesale_price: number;
  main_image: string;
  images: string[];
  producer: {
    id: string;
    business_name: string;
    city: string;
    region: string;
  };
  category: {
    id: string;
    name: string;
  };
  min_order_quantity: number;
  bulk_discount_threshold: number;
  bulk_discount_percentage: number;
  stock: number;
  sku: string;
  weight: number;
  unit: string;
  is_organic: boolean;
  is_seasonal: boolean;
  is_featured: boolean;
}

export default function B2BProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<B2BProduct | null>(null);
  const [currentTier, setCurrentTier] = useState<BusinessTier>(BusinessTier.BRONZE);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock volume discounts - in real implementation, this would come from API
  const volumeDiscounts: VolumeDiscount[] = [
    {
      min_quantity: 50,
      max_quantity: 99,
      discount_percentage: 5,
      price_per_unit: product?.wholesale_price ? product.wholesale_price * 0.95 : 0,
      tier_required: BusinessTier.BRONZE
    },
    {
      min_quantity: 100,
      max_quantity: 199,
      discount_percentage: 8,
      price_per_unit: product?.wholesale_price ? product.wholesale_price * 0.92 : 0,
      tier_required: BusinessTier.BRONZE
    },
    {
      min_quantity: 200,
      max_quantity: 499,
      discount_percentage: 12,
      price_per_unit: product?.wholesale_price ? product.wholesale_price * 0.88 : 0,
      tier_required: BusinessTier.SILVER
    },
    {
      min_quantity: 500,
      discount_percentage: 18,
      price_per_unit: product?.wholesale_price ? product.wholesale_price * 0.82 : 0,
      tier_required: BusinessTier.GOLD
    }
  ];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/b2b/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      setProduct(data);
      setQuantity(data.min_order_quantity || 1);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Add to B2B cart logic here
      console.log('Adding to cart:', { productId, quantity, tier: currentTier });
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SkeletonCard className="h-96" />
            <div className="space-y-4">
              <SkeletonCard className="h-8 w-3/4" />
              <SkeletonCard className="h-6 w-1/2" />
              <SkeletonCard className="h-32" />
              <SkeletonCard className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Product Not Found</h2>
            <p className="text-red-600 mb-4">{error || 'The requested product could not be found.'}</p>
            <Link
              href="/b2b/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/b2b/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              {isFavorite ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <ShareIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={product.images?.[selectedImage] || product.main_image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md border-2 overflow-hidden ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>by {product.producer.business_name}</span>
                <span>•</span>
                <span>{product.producer.city}, {product.producer.region}</span>
                <span>•</span>
                <span>SKU: {product.sku}</span>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                {product.is_organic && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Organic
                  </span>
                )}
                {product.is_seasonal && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Seasonal
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Product Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <div className="font-medium">{product.category.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Stock:</span>
                  <div className="font-medium">{product.stock.toLocaleString()} units</div>
                </div>
                <div>
                  <span className="text-gray-600">Weight:</span>
                  <div className="font-medium">{product.weight} {product.unit}</div>
                </div>
                <div>
                  <span className="text-gray-600">Min. Order:</span>
                  <div className="font-medium">{product.min_order_quantity} units</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Add to Cart Section */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Quick Order</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Retail Price</div>
                  <div className="text-lg text-gray-400 line-through">€{product.price.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={product.min_order_quantity}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || product.min_order_quantity)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Wholesale Pricing */}
        <div className="mt-8">
          <ErrorBoundary fallback={
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Pricing Error</h3>
              <p className="text-red-600">Unable to load wholesale pricing information.</p>
            </div>
          }>
            <AdvancedWholesalePricing
              productId={product.id}
              retailPrice={product.price}
              baseWholesalePrice={product.wholesale_price}
              volumeDiscounts={volumeDiscounts}
              currentTier={currentTier}
              currentQuantity={quantity}
              showTierProgression={true}
              showVolumeCalculator={true}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}