'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  EyeIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  UserIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCartActions } from '@/hooks/useCartWithNotifications';

import CertificationBadges, { ProductCardBadges } from '@/components/ui/CertificationBadges';
import SustainabilityCard, { CompactSustainabilityCard } from '@/components/ui/SustainabilityCard';
import TraceabilityTimeline, { CompactTraceabilityTimeline } from '@/components/ui/TraceabilityTimeline';

interface Producer {
  id?: number;
  business_name: string;
  slug: string;
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
  main_image: string;
  short_description: string;
  description?: string;
  stock: number;
  producer: Producer;
  rating?: number;
  reviews_count?: number;
  category?: string;
  unit?: string;
  
  // Certification fields
  pdo_certification?: string;
  pgi_certification?: string;
  tsg_certification?: string;
  is_organic?: boolean;
  organic_certification_body?: string;
  quality_grade?: string;
  
  // Traceability fields
  batch_number?: string;
  harvest_date?: string;
  processing_method?: string;
  production_facility?: string;
  expiry_date?: string;
  
  // Sustainability fields
  carbon_footprint?: number;
  water_usage?: number;
  pesticide_free_days?: number;
  soil_health_score?: number;
  renewable_energy_percentage?: number;
  
  // Additional data
  created_at?: string;
  updated_at?: string;
}

interface EnhancedProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
  showProducerInfo?: boolean;
  showEnhancedFeatures?: boolean;
  compact?: boolean;
  listView?: boolean;
  className?: string;
}

export default function EnhancedProductCard({ 
  product, 
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  isInWishlist = false,
  showProducerInfo = true,
  showEnhancedFeatures = true,
  compact = false,
  listView = false,
  className = '' 
}: EnhancedProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const { addToCart } = useCartActions();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock < 1) return;
    
    setIsLoading(true);
    
    try {
      await addToCart(product.id, quantity, {
        productName: product.name,
        price: product.discount_price || product.price,
        image: product.main_image && product.main_image.trim() !== '' ? product.main_image : '/images/placeholder-product.svg',
        producer: product.producer.business_name
      });
    } catch (error) {
      // Error handling is done in the useCartActions hook
      logger.error('Failed to add product to cart:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  const toggleDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: 'Εξαντλημένο', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon };
    } else if (product.stock <= 5) {
      return { text: `Μόνο ${product.stock} διαθέσιμα`, color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon };
    } else {
      return { text: 'Διαθέσιμο', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon };
    }
  };

  const stockStatus = getStockStatus();
  const finalPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;
    
  // HONEST CHECK: Only show enhanced features if real data exists from backend
  const hasEnhancedData = showEnhancedFeatures && (
    product.pdo_certification ||
    product.pgi_certification ||
    product.tsg_certification ||
    product.organic_certification_body ||
    product.batch_number ||
    product.harvest_date ||
    product.carbon_footprint ||
    product.water_usage ||
    product.pesticide_free_days
  );
  
  // Use real backend fields that exist
  const hasBasicEnhancements = showEnhancedFeatures && (
    product.is_organic ||
    (product.producer?.verified) ||
    (product.producer?.rating && typeof product.producer.rating === 'string' && parseFloat(product.producer.rating) > 4.0)
  );
  
  const producerEarnings = product.producer_price || (product.price * 0.75);
  const platformFee = product.price - producerEarnings;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 ${compact ? 'max-w-sm' : 'max-w-md'} ${className}`}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          -{discountPercentage}%
        </div>
      )}

      {/* Stock Status Badge */}
      <div className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${stockStatus.color}`}>
        <stockStatus.icon className="w-3 h-3" />
        {stockStatus.text}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-12 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        {isInWishlist ? (
          <HeartIconSolid className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
        )}
      </button>

      <Link href={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!imageError && product.main_image && product.main_image.trim() !== '' ? (
            <Image
              src={product.main_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-gray-400 text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                  📦
                </div>
                <p className="text-sm">Εικόνα μη διαθέσιμη</p>
              </div>
            </div>
          )}

          {/* Real certification badges - only show if data exists */}
          {(hasEnhancedData || hasBasicEnhancements) && (
            <div className="absolute bottom-3 left-3 right-3">
              <ProductCardBadges
                pdoCertification={product.pdo_certification}
                pgiCertification={product.pgi_certification}
                tsgCertification={product.tsg_certification}
                isOrganic={product.is_organic}
                organicCertificationBody={product.organic_certification_body}
                qualityGrade={product.quality_grade}
                carbonFootprint={product.carbon_footprint}
                pesticideFreeDays={product.pesticide_free_days}
                renewableEnergyPercentage={product.renewable_energy_percentage}
              />
            </div>
          )}

          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors">
                <EyeIcon className="w-6 h-6 text-gray-700" />
              </div>
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Producer info */}
          {showProducerInfo && (
            <div className="flex items-center space-x-2 mb-3">
              {product.producer.avatar_url ? (
                <Image
                  src={product.producer.avatar_url}
                  alt={product.producer.business_name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-400" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.producer.business_name}
                </p>
                {product.producer.location && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MapPinIcon className="w-3 h-3" />
                    <span>{product.producer.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Name and Category */}
          <div className="mb-2">
            <h3 className={`font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs text-gray-500 mt-1">{typeof product.category === 'string' ? product.category : product.category.name}</p>
            )}
          </div>

          {/* Description */}
          {!compact && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.short_description}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating!) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviews_count || 0})
              </span>
            </div>
          )}

          {/* Price and earnings breakdown */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`font-bold text-green-600 ${compact ? 'text-lg' : 'text-xl'}`}>
                  €{finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    €{product.price.toFixed(2)}
                  </span>
                )}
                {product.unit && (
                  <span className="text-sm text-gray-500">/ {product.unit}</span>
                )}
              </div>
              
              {(hasEnhancedData || hasBasicEnhancements) && (
                <button
                  onClick={toggleDetails}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                  <span>Λεπτομέρειες</span>
                  {showDetails ? (
                    <ChevronUpIcon className="w-3 h-3" />
                  ) : (
                    <ChevronDownIcon className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {/* Producer earnings transparency */}
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <div className="flex justify-between">
                <span>Στον παραγωγό:</span>
                <span className="font-semibold text-green-600">€{producerEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Πλατφόρμα & μεταφορά:</span>
                <span>€{platformFee.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Section */}
      <div className="p-4 pt-0 space-y-3">
        {/* Quantity Selector */}
        {product.stock > 0 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
            >
              -
            </button>
            <span className="font-medium min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(Math.min(product.stock, quantity + 1));
              }}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors"
            >
              +
            </button>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock < 1 || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            product.stock < 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCartIcon className="w-5 h-5" />
              {product.stock < 1 ? 'Μη Διαθέσιμο' : 'Προσθήκη στο Καλάθι'}
            </>
          )}
        </button>
      </div>

      {/* Honest Details Expandable Section - Only real data */}
      <AnimatePresence>
        {showDetails && (hasEnhancedData || hasBasicEnhancements) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Sustainability metrics - Only if real data exists */}
              {(product.carbon_footprint || product.water_usage || product.pesticide_free_days) && (
                <CompactSustainabilityCard
                  carbonFootprint={product.carbon_footprint}
                  waterUsage={product.water_usage}
                  pesticideFreeDays={product.pesticide_free_days}
                  soilHealthScore={product.soil_health_score}
                  renewableEnergyPercentage={product.renewable_energy_percentage}
                  showComparisons={false}
                  showTrends={false}
                />
              )}

              {/* Traceability info - Only if real data exists */}
              {(product.batch_number || product.harvest_date) && (
                <CompactTraceabilityTimeline
                  batchNumber={product.batch_number}
                  harvestDate={product.harvest_date}
                  processingMethod={product.processing_method}
                  productionFacility={product.production_facility}
                  expiryDate={product.expiry_date}
                  producerName={product.producer?.business_name}
                  farmLocation={product.producer?.location}
                />
              )}

              {/* Real producer information that exists in backend */}
              <div className="grid grid-cols-1 gap-3 text-xs">
                {product.is_organic && (
                  <div className="bg-green-50 p-3 rounded-lg text-green-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">🌱</span>
                      <span className="font-medium">Βιολογικό Προϊόν</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">Πιστοποιημένη βιολογική καλλιέργεια</p>
                  </div>
                )}
                
                {product.producer?.verified && (
                  <div className="bg-blue-50 p-3 rounded-lg text-blue-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">✓</span>
                      <span className="font-medium">Επιβεβαιωμένος Παραγωγός</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">Ελεγμένος και πιστοποιημένος από τη Dixis</p>
                  </div>
                )}

                {product.producer?.rating && typeof product.producer.rating === 'string' && parseFloat(product.producer.rating) > 4.0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg text-yellow-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-600">⭐</span>
                      <span className="font-medium">Υψηλή Αξιολόγηση: {product.producer.rating}/5</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">Εξαιρετικές κριτικές από πελάτες</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Specialized variants
export function CompactProductCard(props: Omit<EnhancedProductCardProps, 'compact'>) {
  return <EnhancedProductCard {...props} compact={true} />;
}

export function SimpleProductCard(props: Omit<EnhancedProductCardProps, 'showEnhancedFeatures'>) {
  return <EnhancedProductCard {...props} showEnhancedFeatures={false} />;
}

export function ProducerProductCard(props: Omit<EnhancedProductCardProps, 'showProducerInfo'>) {
  return <EnhancedProductCard {...props} showProducerInfo={false} />;
}

// Type exports
export type { EnhancedProductCardProps, Product, Producer };
