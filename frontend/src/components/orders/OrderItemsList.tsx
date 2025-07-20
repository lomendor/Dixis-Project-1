'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface OrderItem {
  id?: string | number;
  productId: string | number;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string | number;
    name: string;
    image?: string;
    slug?: string;
  };
}

interface OrderItemsListProps {
  items: OrderItem[];
  showReviewButton?: boolean;
  onReviewClick?: (productId: string | number) => void;
}

export default function OrderItemsList({ 
  items, 
  showReviewButton = false,
  onReviewClick 
}: OrderItemsListProps) {
  
  const getProductImage = (item: OrderItem) => {
    if (item?.product?.image) {
      return item.product.image;
    }
    // Fallback image
    return '/images/placeholder-product.jpg';
  };

  const getProductName = (item: OrderItem) => {
    if (item?.product?.name) {
      return item.product.name;
    }
    return `Προϊόν #${item.productId}`;
  };

  const getProductLink = (item: OrderItem) => {
    if (item?.product?.slug) {
      return `/products/${item.product.slug}`;
    }
    return `/products/${item.productId}`;
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Δεν βρέθηκαν προϊόντα στην παραγγελία.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={item.id || index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={getProductImage(item)}
                alt={getProductName(item)}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-product.jpg';
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  <Link 
                    href={getProductLink(item)}
                    className="hover:text-green-600 transition-colors"
                  >
                    {getProductName(item)}
                  </Link>
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>Ποσότητα: {item.quantity}</span>
                  <span>Τιμή μονάδας: €{item.unitPrice.toFixed(2)}</span>
                </div>

                {/* Product Actions */}
                <div className="flex items-center space-x-4 mt-3">
                  <Link
                    href={getProductLink(item)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Προβολή προϊόντος
                  </Link>
                  
                  <Link
                    href={getProductLink(item)}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Αγορά ξανά
                  </Link>

                  {showReviewButton && onReviewClick && (
                    <button
                      onClick={() => onReviewClick(item.productId)}
                      className="flex items-center space-x-1 text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      <StarIcon className="w-4 h-4" />
                      <span>Αξιολόγηση</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                <p className="text-lg font-semibold text-gray-900">
                  €{(item.unitPrice * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {item.quantity} × €{item.unitPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">
            Σύνολο προϊόντων:
          </span>
          <span className="text-lg font-semibold text-gray-900">
            €{items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {items.reduce((total, item) => total + item.quantity, 0)} προϊόντα συνολικά
        </p>
      </div>

      {/* Bulk Actions */}
      {showReviewButton && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <StarIcon className="w-4 h-4" />
              <span>Αξιολόγηση όλων των προϊόντων</span>
            </button>
            
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Αγορά όλων ξανά
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
