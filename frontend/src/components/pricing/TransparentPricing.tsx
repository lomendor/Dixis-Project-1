'use client';

import React from 'react';
import { PriceBreakdown, CompactPriceBreakdown } from './PriceBreakdown';
import { InformationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { calculatePrice } from '@/lib/utils/priceCalculator';

interface Product {
  id: number;
  name: string;
  producer_price: number;
  producer?: {
    business_name: string;
    commission_rate?: number;
  };
}

interface TransparentPricingProps {
  product: Product;
  variant?: 'full' | 'compact' | 'card';
  showProducerInfo?: boolean;
  className?: string;
}

export const TransparentPricing: React.FC<TransparentPricingProps> = ({
  product,
  variant = 'full',
  showProducerInfo = true,
  className = ''
}) => {
  const commissionRate = product?.producer?.commission_rate || 12;
  const producerPrice = product.producer_price || 0;

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
        <CompactPriceBreakdown
          producerPrice={producerPrice}
          commissionRate={commissionRate}
        />
      </div>
    );
  }

  if (variant === 'card') {
    const { commission, priceBeforeVat, vat, finalPrice } = calculatePrice({
      producerPrice,
      commissionRate,
      vatRate: 24
    });

    return (
      <div className={`${className}`}>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-green-600">
            €{finalPrice.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            €{(finalPrice * 1.1).toFixed(2)}
          </span>
        </div>
        
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Παραγωγός:</span>
            <span>€{producerPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Προμήθεια:</span>
            <span>€{commission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-800 mt-1 pt-1 border-t">
            <span>Τελική (με ΦΠΑ):</span>
            <span>€{finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Transparency Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <ShieldCheckIcon className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="font-semibold text-green-800 text-lg">
              100% Διαφανής Τιμολόγηση
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Βλέπετε ακριβώς πού πάει κάθε ευρώ - στον παραγωγό, στην πλατφόρμα και στο κράτος.
            </p>
          </div>
        </div>
      </div>

      {/* Producer Information */}
      {showProducerInfo && product.producer && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                {product.producer.business_name}
              </h4>
              <p className="text-blue-700 text-sm">
                Παραγωγός αυτού του προϊόντος
              </p>
            </div>
            <div className="text-right">
              <div className="text-blue-900 font-semibold">
                {commissionRate}% προμήθεια
              </div>
              <div className="text-blue-700 text-xs">
                {commissionRate < 12 ? 'Συνδρομητής' : 'Δωρεάν πλάνο'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <PriceBreakdown
        producerPrice={producerPrice}
        commissionRate={commissionRate}
        showDetails={true}
      />

      {/* Why Transparent Pricing */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h4 className="font-medium text-gray-900 text-sm">
              Γιατί διαφανής τιμολόγηση;
            </h4>
            <ul className="text-gray-700 text-xs mt-2 space-y-1">
              <li>• Υποστηρίζετε άμεσα τους Έλληνες παραγωγούς</li>
              <li>• Γνωρίζετε ακριβώς το κόστος κάθε υπηρεσίας</li>
              <li>• Δεν υπάρχουν κρυφές χρεώσεις ή προμήθειες</li>
              <li>• Βοηθάτε στην ανάπτυξη της τοπικής οικονομίας</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Commission Rate Explanation */}
      {commissionRate > 7 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h4 className="font-medium text-yellow-800 text-sm">
                Πώς λειτουργεί η προμήθεια
              </h4>
              <div className="text-yellow-700 text-xs mt-2 space-y-1">
                <p>Η προμήθεια {commissionRate}% χρησιμοποιείται για:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Συντήρηση και ανάπτυξη της πλατφόρμας</li>
                  <li>Εξυπηρέτηση πελατών και υποστήριξη παραγωγών</li>
                  <li>Ασφαλείς πληρωμές και προστασία δεδομένων</li>
                  <li>Marketing για προώθηση των προϊόντων</li>
                </ul>
                
                {commissionRate === 12 && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
                    <p className="font-medium">💡 Συμβουλή:</p>
                    <p>Οι παραγωγοί με συνδρομή πληρώνουν μόνο 9% ή 7% προμήθεια!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// For use in product lists
export const ProductPriceCard: React.FC<{
  product: Product;
  showQuickBreakdown?: boolean;
}> = ({ product, showQuickBreakdown = false }) => {
  // Safety checks for undefined values
  const commissionRate = product?.producer?.commission_rate || 12;
  const producerPrice = product?.producer_price || 0;
  
  // Calculate all prices safely using centralized calculator
  const { commission, priceBeforeVat, vat, finalPrice } = calculatePrice({
    producerPrice,
    commissionRate,
    vatRate: 24
  });

  return (
    <div className="space-y-2">
      {/* Main Price Display */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold text-gray-900">
            €{finalPrice.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            (τελική τιμή)
          </span>
        </div>
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          100% διαφανής
        </div>
      </div>

      {/* Producer Price Highlight */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Παραγωγός λαμβάνει:</span>
        <span className="font-semibold text-green-700">
          €{producerPrice.toFixed(2)}
        </span>
      </div>

      {/* Quick Breakdown */}
      {showQuickBreakdown && (
        <div className="border-t pt-2 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Προμήθεια ({commissionRate}%):</span>
            <span>€{commission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>ΦΠΑ (24%):</span>
            <span>€{vat.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};