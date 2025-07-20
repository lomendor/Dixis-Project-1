'use client';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  BuildingOfficeIcon,
  EyeIcon,
  TruckIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import B2BQuoteRequest from './B2BQuoteRequest';

// B2B Product Types
interface VolumeDiscount {
  min_quantity: number;
  discount_percentage: number;
  price_per_unit: number;
}

interface B2BProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  producer: {
    id: string;
    name: string;
    location: string;
  };
  pricing: {
    retail_price: number;
    wholesale_price: number;
    bulk_price: number;
    minimum_quantity: number;    volume_discounts: VolumeDiscount[];
  };
  availability: {
    in_stock: boolean;
    stock_quantity: number;
    lead_time_days: number;
  };
  b2b_features: {
    bulk_available: boolean;
    custom_pricing: boolean;
    credit_terms: boolean;
  };
}

interface B2BProductCardProps {
  product: B2BProduct;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: B2BProduct, quantity: number) => void;
  onViewDetails?: (product: B2BProduct) => void;
  onRequestQuote?: (product: B2BProduct) => void;
}

export default function B2BProductCard({
  product,
  viewMode = 'grid',
  onAddToCart,
  onViewDetails,
  onRequestQuote
}: B2BProductCardProps) {
  const [quantity, setQuantity] = React.useState(product.pricing.minimum_quantity);
  const [showVolumeDiscounts, setShowVolumeDiscounts] = React.useState(false);
  const [showQuoteRequest, setShowQuoteRequest] = useState(false);  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const handleRequestQuote = () => {
    setShowQuoteRequest(true);
    if (onRequestQuote) {
      onRequestQuote(product);
    }
  };

  const calculateSavings = () => {
    const savings = product.pricing.retail_price - product.pricing.wholesale_price;
    const percentage = (savings / product.pricing.retail_price) * 100;
    return { amount: savings, percentage };
  };

  const savings = calculateSavings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300"
    >      <div className={`${viewMode === 'list' ? 'flex' : ''}`}>
        {/* Product Image */}
        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg overflow-hidden">
            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative">
              <span className="text-gray-500 text-sm">Εικόνα προϊόντος</span>
              
              {/* B2B Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.b2b_features.bulk_available && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    BULK
                  </span>
                )}
                {product.b2b_features.custom_pricing && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    CUSTOM
                  </span>
                )}
                {product.b2b_features.credit_terms && (
                  <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    CREDIT
                  </span>
                )}
              </div>

              {/* Savings Badge */}
              <div className="absolute top-2 right-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{savings.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>        {/* Product Info */}
        <div className="p-6 flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 cursor-pointer">
                {product.name}
              </h3>
              <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full mt-1">
                {product.category}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Producer Info */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">{product.producer.name}</span>
              <span className="text-xs text-gray-500 block">{product.producer.location}</span>
            </div>
          </div>          {/* Pricing Section */}
          <div className="space-y-3 mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Λιανική τιμή:</span>
              <span className="text-sm line-through text-gray-400">
                €{product.pricing.retail_price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Χονδρική τιμή:</span>
              <span className="text-xl font-bold text-blue-600">
                €{product.pricing.wholesale_price.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Εξοικονόμηση:</span>
              <span className="text-green-600 font-semibold">
                €{savings.amount.toFixed(2)} ({savings.percentage.toFixed(0)}%)
              </span>
            </div>

            <div className="text-xs text-gray-500 border-t pt-2">
              Ελάχιστη ποσότητα: {product.pricing.minimum_quantity} τεμ.
            </div>
          </div>          {/* Volume Discounts */}
          <div className="mb-4">
            <button
              onClick={() => setShowVolumeDiscounts(!showVolumeDiscounts)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <span>Εκπτώσεις όγκου ({product.pricing.volume_discounts.length})</span>
              <span className={`transform transition-transform ${showVolumeDiscounts ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showVolumeDiscounts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1 bg-gray-50 p-3 rounded-lg"
              >
                {product.pricing.volume_discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {discount.min_quantity}+ τεμ.
                    </span>
                    <span className="text-green-600 font-medium">
                      -{discount.discount_percentage}% → €{discount.price_per_unit.toFixed(2)}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              product.availability.in_stock ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600 flex-1">
              {product.availability.in_stock 
                ? `Διαθέσιμο (${product.availability.stock_quantity} τεμ.)` 
                : 'Μη διαθέσιμο'
              }
            </span>
            {product.availability.in_stock && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TruckIcon className="h-3 w-3" />
                {product.availability.lead_time_days} ημέρες
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ποσότητα:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(product.pricing.minimum_quantity, quantity - 1))}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                disabled={quantity <= product.pricing.minimum_quantity}
              >
                -
              </button>              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.pricing.minimum_quantity, parseInt(e.target.value) || 0))}
                min={product.pricing.minimum_quantity}
                className="w-20 px-3 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
              <span className="text-sm text-gray-500 ml-2">
                Σύνολο: €{(product.pricing.wholesale_price * quantity).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.availability.in_stock}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Προσθήκη στο καλάθι
            </button>            
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <EyeIcon className="h-4 w-4" />
            </button>

            {product.b2b_features.custom_pricing && (
              <button
                onClick={handleRequestQuote}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <CurrencyEuroIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Κωδικός: {product.id}</span>
              {product.b2b_features.credit_terms && (
                <span className="text-green-600 font-medium">Πιστωτικοί όροι διαθέσιμοι</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      <B2BQuoteRequest
        product={product}
        isOpen={showQuoteRequest}
        onClose={() => setShowQuoteRequest(false)}
        onSubmit={(data) => {
          logger.info('Quote request submitted:', data);    // Quote request submission ready
        }}
      />
    </motion.div>
  );
}