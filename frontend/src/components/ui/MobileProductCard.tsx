'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { ProductImage } from '@/components/ui/OptimizedImage';
import { QuickAddButton } from '@/components/cart/ModernCartButton';
import { formatPrice } from '@/lib/utils';

interface MobileProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount_price?: number;
    main_image?: string;
    short_description?: string;
    stock?: number;
    producer?: {
      business_name: string;
    };
  };
  onFavoriteToggle?: (productId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export default function MobileProductCard({ 
  product, 
  onFavoriteToggle, 
  isFavorite = false,
  className = "" 
}: MobileProductCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Quick add to cart on left swipe
      // This would trigger the quick add functionality
    } else if (isRightSwipe) {
      // Add to favorites on right swipe
      onFavoriteToggle?.(product.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(product.id);
  };

  return (
    <div 
      className={`mobile-card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 touch-feedback ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden mobile-card-image">
        <Link href={`/products/${product.slug}`}>
          {product.main_image ? (
            <div className="relative">
              <ProductImage
                src={product.main_image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Χωρίς εικόνα</span>
            </div>
          )}
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercentage}%
          </div>
        )}

        {/* Stock Status */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Λίγα τεμάχια
          </div>
        )}

        {/* Out of Stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Εξαντλημένο</span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex space-x-2">
            <Link
              href={`/products/${product.slug}`}
              className="mobile-btn-icon bg-white text-gray-700 hover:text-green-600 shadow-lg"
              aria-label="Προβολή προϊόντος"
            >
              <EyeIcon className="w-5 h-5" />
            </Link>
            
            <button
              onClick={handleFavoriteClick}
              className="mobile-btn-icon bg-white text-gray-700 hover:text-red-500 shadow-lg"
              aria-label={isFavorite ? "Αφαίρεση από αγαπημένα" : "Προσθήκη στα αγαπημένα"}
            >
              {isFavorite ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mobile-card-content">
        {/* Producer */}
        {product?.producer?.business_name && (
          <p className="text-xs text-gray-500 mb-1 truncate">
            {product.producer.business_name}
          </p>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mobile-card-title hover:text-green-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.short_description && (
          <p className="mobile-card-description line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="mobile-card-price">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {product.stock !== undefined && product.stock > 0 && (
            <span className="text-xs text-gray-500">
              {product.stock} διαθέσιμα
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <QuickAddButton
          productId={product.id}
          size="sm"
          disabled={product.stock === 0}
          className="mobile-btn mobile-btn-primary w-full"
          onAddSuccess={() => {
            // Optional: Add haptic feedback or animation
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
          }}
        />
      </div>

      {/* Swipe Indicators */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-400 opacity-0 hover:opacity-100 transition-opacity">
        <span>← Αγαπημένα</span>
        <span>Καλάθι →</span>
      </div>
    </div>
  );
}
