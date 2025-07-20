'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { memo, useMemo, useCallback, useDeferredValue } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api/models/product/types';
import { useCartActions } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils/formatters';
import { idToString } from '@/lib/api/client/apiTypes';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface OptimizedProductCardProps {
  product: Product;
  priority?: boolean;
  showQuickAdd?: boolean;
  onFavoriteToggle?: (productId: string) => void;
  className?: string;
}

/**
 * Optimized Product Card using React 19 patterns
 * - Uses React.memo for preventing unnecessary re-renders
 * - Uses useMemo for expensive calculations
 * - Uses useCallback for stable function references
 * - Uses useDeferredValue for non-urgent updates
 */
const OptimizedProductCard = memo(function OptimizedProductCard({
  product,
  priority = false,
  showQuickAdd = true,
  onFavoriteToggle,
  className = '',
}: OptimizedProductCardProps) {
  const { addToCart, isInCart, getItemQuantity } = useCartActions();

  // Use useDeferredValue for non-urgent state updates
  const deferredProduct = useDeferredValue(product);

  // Memoize expensive calculations
  const productData = useMemo(() => {
    const isProductInCart = isInCart(deferredProduct.id);
    const quantity = getItemQuantity(deferredProduct.id);
    const discountPercentage = deferredProduct.originalPrice && deferredProduct.price
      ? Math.round(((deferredProduct.originalPrice - deferredProduct.price) / deferredProduct.originalPrice) * 100)
      : 0;

    return {
      isProductInCart,
      quantity,
      discountPercentage,
      hasDiscount: discountPercentage > 0,
      formattedPrice: formatPrice(deferredProduct.price, deferredProduct.currency),
      formattedOriginalPrice: deferredProduct.originalPrice
        ? formatPrice(deferredProduct.originalPrice, deferredProduct.currency)
        : null,
      averageRating: deferredProduct.rating || 0,
      reviewCount: deferredProduct.reviewCount || 0,
    };
  }, [deferredProduct, isInCart, getItemQuantity]);

  // Memoize event handlers with useCallback
  const handleAddToCart = useCallback(async () => {
    try {
      await addToCart(deferredProduct.id, 1);
    } catch (error) {
      logger.error('Failed to add to cart:', toError(error), errorToContext(error));
    }
  }, [addToCart, deferredProduct.id]);

  const handleFavoriteToggle = useCallback(() => {
    onFavoriteToggle?.(idToString(deferredProduct.id));
  }, [onFavoriteToggle, deferredProduct.id]);

  // Memoize the image component to prevent unnecessary re-renders
  const productImage = useMemo(() => (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
      <Image
        src={deferredProduct.image || deferredProduct.imageUrl || '/placeholder-product.jpg'}
        alt={deferredProduct.name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Discount badge */}
      {productData.hasDiscount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{productData.discountPercentage}%
        </div>
      )}

      {/* Favorite button */}
      {onFavoriteToggle && (
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
          aria-label="Toggle favorite"
        >
          <Heart className="w-4 h-4" />
        </button>
      )}

      {/* Quick add overlay */}
      {showQuickAdd && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={handleAddToCart}
            className="bg-white text-black hover:bg-gray-100"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {productData.isProductInCart ? `In Cart (${productData.quantity})` : 'Add to Cart'}
          </Button>
        </div>
      )}
    </div>
  ), [
    deferredProduct.image,
    deferredProduct.imageUrl,
    deferredProduct.name,
    priority,
    productData.hasDiscount,
    productData.discountPercentage,
    productData.isProductInCart,
    productData.quantity,
    onFavoriteToggle,
    showQuickAdd,
    handleFavoriteToggle,
    handleAddToCart,
  ]);

  // Memoize the rating component
  const ratingComponent = useMemo(() => {
    if (productData.averageRating === 0) return null;

    return (
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span>{productData.averageRating.toFixed(1)}</span>
        <span>({productData.reviewCount})</span>
      </div>
    );
  }, [productData.averageRating, productData.reviewCount]);

  return (
    <div className={`group ${className}`}>
      <Link href={`/products/${deferredProduct.slug}`} className="block">
        {productImage}

        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {deferredProduct.name}
          </h3>

          {ratingComponent}

          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">
              {productData.formattedPrice}
            </span>
            {productData.formattedOriginalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {productData.formattedOriginalPrice}
              </span>
            )}
          </div>

          {deferredProduct.producerName && (
            <p className="text-sm text-gray-600">
              by {deferredProduct.producerName}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
});

export default OptimizedProductCard;
