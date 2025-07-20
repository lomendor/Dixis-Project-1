'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyEuroIcon,
  TruckIcon,
  TagIcon,
  ChartBarIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Business tier definitions based on B2B marketplace implementation
export enum BusinessTier {
  BRONZE = 'bronze',
  SILVER = 'silver', 
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export interface TierBenefits {
  tier: BusinessTier;
  name: string;
  color: string;
  bgColor: string;
  discountPercentage: number;
  minimumOrder: number;
  freeShipping: boolean;
  creditTerms: number;
  priority: string;
  icon: React.ReactNode;
}

export interface VolumeDiscount {
  min_quantity: number;
  max_quantity?: number;
  discount_percentage: number;
  price_per_unit: number;
  tier_required?: BusinessTier;
}

interface AdvancedWholesalePricingProps {
  productId: string;
  retailPrice: number;
  baseWholesalePrice: number;
  volumeDiscounts: VolumeDiscount[];
  currentTier: BusinessTier;
  currentQuantity?: number;
  currency?: string;
  showTierProgression?: boolean;
  showVolumeCalculator?: boolean;
}

export default function AdvancedWholesalePricing({
  productId,
  retailPrice,
  baseWholesalePrice,
  volumeDiscounts,
  currentTier,
  currentQuantity = 1,
  currency = '€',
  showTierProgression = true,
  showVolumeCalculator = true
}: AdvancedWholesalePricingProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(currentQuantity);

  // Tier definitions with enhanced benefits
  const tierBenefits: Record<BusinessTier, TierBenefits> = {
    [BusinessTier.BRONZE]: {
      tier: BusinessTier.BRONZE,
      name: 'Bronze Partner',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      discountPercentage: 5,
      minimumOrder: 100,
      freeShipping: false,
      creditTerms: 15,
      priority: 'Standard',
      icon: <StarIcon className="w-5 h-5" />
    },
    [BusinessTier.SILVER]: {
      tier: BusinessTier.SILVER,
      name: 'Silver Partner',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 border-gray-200',
      discountPercentage: 10,
      minimumOrder: 75,
      freeShipping: true,
      creditTerms: 30,
      priority: 'High',
      icon: <StarIconSolid className="w-5 h-5" />
    },
    [BusinessTier.GOLD]: {
      tier: BusinessTier.GOLD,
      name: 'Gold Partner',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      discountPercentage: 15,
      minimumOrder: 50,
      freeShipping: true,
      creditTerms: 45,
      priority: 'Priority',
      icon: <StarIconSolid className="w-5 h-5" />
    },
    [BusinessTier.PLATINUM]: {
      tier: BusinessTier.PLATINUM,
      name: 'Platinum Partner',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      discountPercentage: 20,
      minimumOrder: 25,
      freeShipping: true,
      creditTerms: 60,
      priority: 'VIP',
      icon: <StarIconSolid className="w-5 h-5" />
    }
  };

  // Calculate pricing based on tier and volume
  const calculatePrice = useMemo(() => {
    const tierDiscount = tierBenefits[currentTier].discountPercentage;
    let basePrice = baseWholesalePrice * (1 - tierDiscount / 100);

    // Apply volume discounts
    const applicableVolume = volumeDiscounts
      .filter(v => selectedQuantity >= v.min_quantity && (!v.max_quantity || selectedQuantity <= v.max_quantity))
      .sort((a, b) => b.discount_percentage - a.discount_percentage)[0];

    if (applicableVolume) {
      basePrice = applicableVolume.price_per_unit;
    }

    return {
      unitPrice: basePrice,
      totalPrice: basePrice * selectedQuantity,
      tierDiscount: tierDiscount,
      volumeDiscount: applicableVolume?.discount_percentage || 0,
      retailSavings: (retailPrice - basePrice) * selectedQuantity,
      retailSavingsPercentage: ((retailPrice - basePrice) / retailPrice) * 100
    };
  }, [selectedQuantity, currentTier, baseWholesalePrice, volumeDiscounts, retailPrice, tierBenefits]);

  const currentTierInfo = tierBenefits[currentTier];
  const nextTier = Object.values(BusinessTier)[Object.values(BusinessTier).indexOf(currentTier) + 1];
  const nextTierInfo = nextTier ? tierBenefits[nextTier] : null;

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <div className={`p-4 rounded-lg border-2 ${currentTierInfo.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={currentTierInfo.color}>
              {currentTierInfo.icon}
            </div>
            <div>
              <h3 className={`font-semibold ${currentTierInfo.color}`}>
                {currentTierInfo.name}
              </h3>
              <p className="text-sm text-gray-600">
                {currentTierInfo.discountPercentage}% tier discount • {currentTierInfo.creditTerms} days credit
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${currentTierInfo.color}`}>
              {currentTierInfo.priority} Priority
            </div>
            {currentTierInfo.freeShipping && (
              <div className="flex items-center text-green-600 text-sm">
                <TruckIcon className="w-4 h-4 mr-1" />
                Free Shipping
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volume Calculator */}
      {showVolumeCalculator && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Volume Pricing Calculator
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum order: {currentTierInfo.minimumOrder} units
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unit Price:</span>
                <span className="font-medium">{currency}{calculatePrice.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Price:</span>
                <span className="font-semibold text-lg">{currency}{calculatePrice.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="text-sm">Savings vs Retail:</span>
                <span className="font-medium">
                  {currency}{calculatePrice.retailSavings.toFixed(2)} 
                  ({calculatePrice.retailSavingsPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Volume Discount Tiers */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Volume Discounts Available:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {volumeDiscounts.map((discount, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded border ${
                    selectedQuantity >= discount.min_quantity
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {discount.min_quantity}+ units
                  </div>
                  <div className="text-xs">
                    {discount.discount_percentage}% off • {currency}{discount.price_per_unit.toFixed(2)}/unit
                  </div>
                  {selectedQuantity >= discount.min_quantity && (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mt-1" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tier Progression */}
      {showTierProgression && nextTierInfo && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Upgrade to {nextTierInfo.name}</h4>
              <p className="text-sm text-blue-700 mt-1">
                Get {nextTierInfo.discountPercentage}% tier discount and save an additional{' '}
                {currency}{((nextTierInfo.discountPercentage - currentTierInfo.discountPercentage) / 100 * baseWholesalePrice * selectedQuantity).toFixed(2)}
                {' '}on this order.
              </p>
              <div className="mt-2 text-xs text-blue-600">
                <span className="font-medium">Benefits: </span>
                {nextTierInfo.freeShipping && 'Free shipping • '}
                {nextTierInfo.creditTerms} days credit • 
                {nextTierInfo.priority} priority support
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Requirements */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Order Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Minimum Order:</span>
            <div className="font-medium">{currentTierInfo.minimumOrder} units</div>
          </div>
          <div>
            <span className="text-gray-600">Payment Terms:</span>
            <div className="font-medium">{currentTierInfo.creditTerms} days</div>
          </div>
          <div>
            <span className="text-gray-600">Shipping:</span>
            <div className="font-medium">
              {currentTierInfo.freeShipping ? 'Free' : 'Standard rates apply'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}