'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyEuroIcon,
  TruckIcon,
  TagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface VolumeDiscount {
  min_quantity: number;
  discount_percentage: number;
  price_per_unit: number;
}

interface WholesalePricingProps {
  retailPrice: number;
  wholesalePrice: number;
  bulkPrice: number;
  minimumQuantity: number;
  volumeDiscounts: VolumeDiscount[];
  currency?: string;
  showComparison?: boolean;
}

export default function WholesalePricingDisplay({
  retailPrice,
  wholesalePrice,
  bulkPrice,
  minimumQuantity,
  volumeDiscounts,
  currency = '€',
  showComparison = true
}: WholesalePricingProps) {
  const calculateSavings = (comparePrice: number, currentPrice: number) => {
    const savings = comparePrice - currentPrice;
    const percentage = (savings / comparePrice) * 100;    return { amount: savings, percentage };
  };

  const wholesaleSavings = calculateSavings(retailPrice, wholesalePrice);
  const bulkSavings = calculateSavings(retailPrice, bulkPrice);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CurrencyEuroIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Τιμολόγιο B2B</h3>
      </div>

      {/* Price Comparison */}
      {showComparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Retail Price */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Λιανική Τιμή</div>
            <div className="text-lg font-medium text-gray-400 line-through">
              {currency}{retailPrice.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Για αναφορά</div>
          </div>

          {/* Wholesale Price */}
          <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Χονδρική Τιμή</div>
            <div className="text-2xl font-bold text-blue-600">
              {currency}{wholesalePrice.toFixed(2)}
            </div>
            <div className="text-xs text-green-600 font-medium mt-1">
              Εξοικονόμηση {wholesaleSavings.percentage.toFixed(0)}%
            </div>
          </div>          {/* Bulk Price */}
          <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Bulk Τιμή</div>
            <div className="text-2xl font-bold text-green-600">
              {currency}{bulkPrice.toFixed(2)}
            </div>
            <div className="text-xs text-green-600 font-medium mt-1">
              Εξοικονόμηση {bulkSavings.percentage.toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Minimum Quantity */}
      <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
        <div className="flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">
            Ελάχιστη Παραγγελία: {minimumQuantity} τεμάχια
          </span>
        </div>
      </div>

      {/* Volume Discounts */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="h-5 w-5 text-purple-600" />
          <h4 className="text-md font-semibold text-gray-900">Εκπτώσεις Όγκου</h4>
        </div>
        
        <div className="space-y-3">
          {volumeDiscounts.map((discount, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200"
            >              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <span className="text-purple-600 font-bold text-sm">
                      {discount.min_quantity}+
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {discount.min_quantity} τεμάχια και άνω
                    </div>
                    <div className="text-xs text-gray-500">
                      Έκπτωση {discount.discount_percentage}%
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {currency}{discount.price_per_unit.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    -{discount.discount_percentage}% έκπτωση
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Savings Calculator */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-gray-900 mb-3">Υπολογιστής Εξοικονόμησης</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Χονδρική vs Λιανική:</span>
            <div className="font-semibold text-green-600">
              {currency}{wholesaleSavings.amount.toFixed(2)} ({wholesaleSavings.percentage.toFixed(1)}%)
            </div>
          </div>
          <div>
            <span className="text-gray-600">Bulk vs Λιανική:</span>
            <div className="font-semibold text-green-600">
              {currency}{bulkSavings.amount.toFixed(2)} ({bulkSavings.percentage.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}