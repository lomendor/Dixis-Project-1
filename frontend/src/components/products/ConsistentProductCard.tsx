'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  ShoppingCart, 
  Eye,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  main_image: string;
  short_description: string;
  stock_quantity: number;
  producer: {
    business_name: string;
    slug: string;
  };
  rating?: number;
  reviews_count?: number;
}

interface ConsistentProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
}

export default function ConsistentProductCard({ 
  product, 
  onQuickView, 
  className = '' 
}: ConsistentProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { addToCart } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity < 1) return;
    
    setIsLoading(true);
    
    try {
      await addToCart(product.id, quantity, {
        productName: product.name,
        price: product.discount_price || product.price,
        image: product.main_image && product.main_image.trim() !== '' ? product.main_image : '/images/placeholder-product.svg',
        producer: product.producer.business_name
      });
      
      logger.info('Product added to cart successfully');
    } catch (error) {
      logger.error('Failed to add product to cart:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return { text: 'Εξαντλημένο', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (product.stock_quantity <= 5) {
      return { text: `Μόνο ${product.stock_quantity} διαθέσιμα`, color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { text: 'Διαθέσιμο', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const stockStatus = getStockStatus();
  const finalPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  return (
    <div className={`group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 ${className}`}>
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
        <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'}`} />
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

          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors">
                <Eye className="w-6 h-6 text-gray-700" />
              </div>
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Producer */}
          <p className="text-sm text-gray-500 mb-1 truncate">
            από {product.producer.business_name}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.short_description}
          </p>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
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

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-green-600">
              €{finalPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                €{product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Section */}
      <div className="p-4 pt-0 space-y-3">
        {/* Quantity Selector */}
        {product.stock_quantity > 0 && (
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
                setQuantity(Math.min(product.stock_quantity, quantity + 1));
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
          disabled={product.stock_quantity < 1 || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            product.stock_quantity < 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {product.stock_quantity < 1 ? 'Μη Διαθέσιμο' : 'Προσθήκη στο Καλάθι'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}