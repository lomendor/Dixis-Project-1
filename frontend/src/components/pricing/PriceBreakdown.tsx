'use client';

import React from 'react';
import { InformationCircleIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { calculatePrice, formatPrice } from '@/lib/utils/priceCalculator';

interface PriceBreakdownProps {
  producerPrice: number;
  commissionRate: number;
  vatRate?: number;
  showDetails?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  producerPrice,
  commissionRate,
  vatRate = 24, // Standard Greek VAT rate
  showDetails = true,
  className = '',
  size = 'md'
}) => {
  // Calculate all price components using centralized calculator
  const priceBreakdown = calculatePrice({
    producerPrice,
    commissionRate,
    vatRate
  });
  
  const {
    commission,
    priceBeforeVat,
    vat,
    finalPrice,
    producerPrice: producerEarnings
  } = priceBreakdown;

  const sizeClasses = {
    sm: {
      text: 'text-sm',
      price: 'text-lg',
      icon: 'h-4 w-4'
    },
    md: {
      text: 'text-base',
      price: 'text-xl',
      icon: 'h-5 w-5'
    },
    lg: {
      text: 'text-lg',
      price: 'text-2xl',
      icon: 'h-6 w-6'
    }
  };

  const classes = sizeClasses[size];

  if (!showDetails) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-2">
          <CurrencyEuroIcon className={`${classes.icon} text-green-600`} />
          <span className={`font-bold text-gray-900 ${classes.price}`}>
            {finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-gray-900 ${classes.text}`}>
          Ανάλυση Τιμής
        </h3>
        <div className="flex items-center text-green-600">
          <CurrencyEuroIcon className={`${classes.icon} mr-1`} />
          <span className={`font-bold ${classes.price}`}>
            {finalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        {/* Producer Price */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className={`text-gray-700 ${classes.text}`}>
              Τιμή Παραγωγού
            </span>
          </div>
          <span className={`font-medium text-gray-900 ${classes.text}`}>
            €{producerPrice.toFixed(2)}
          </span>
        </div>

        {/* Commission */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className={`text-gray-700 ${classes.text}`}>
              Προμήθεια Πλατφόρμας ({commissionRate}%)
            </span>
            <div className="ml-2 relative group">
              <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-800 rounded-lg shadow-lg -left-32">
                Η προμήθεια βοηθά στη συντήρηση της πλατφόρμας και την υποστήριξη των παραγωγών
              </div>
            </div>
          </div>
          <span className={`font-medium text-gray-700 ${classes.text}`}>
            €{commission.toFixed(2)}
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className={`text-gray-700 ${classes.text}`}>
            Υποσύνολο
          </span>
          <span className={`font-medium text-gray-900 ${classes.text}`}>
            €{priceBeforeVat.toFixed(2)}
          </span>
        </div>

        {/* VAT */}
        <div className="flex justify-between items-center">
          <span className={`text-gray-700 ${classes.text}`}>
            ΦΠΑ ({vatRate}%)
          </span>
          <span className={`font-medium text-gray-700 ${classes.text}`}>
            €{vat.toFixed(2)}
          </span>
        </div>

        {/* Final Price */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className={`font-semibold text-gray-900 ${classes.text}`}>
            Τελική Τιμή
          </span>
          <span className={`font-bold text-green-600 ${classes.price}`}>
            €{finalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Producer Earnings Highlight */}
      <div className="mt-4 bg-green-50 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <span className={`text-green-800 font-medium ${classes.text}`}>
            Καθαρά Κέρδη Παραγωγού
          </span>
          <span className={`font-bold text-green-700 ${classes.text}`}>
            €{producerEarnings.toFixed(2)}
          </span>
        </div>
        <p className="text-green-700 text-xs mt-1">
          Αυτό το ποσό λαμβάνει ο παραγωγός από κάθε πώληση
        </p>
      </div>

      {/* Commission Rate Info */}
      {commissionRate > 7 && (
        <div className="mt-3 bg-blue-50 rounded-lg p-3">
          <div className="flex items-start">
            <InformationCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="ml-2">
              <p className="text-blue-800 text-xs">
                <strong>Μάθατε ότι:</strong> Με συνδρομή μπορείτε να μειώσετε την προμήθεια στο 9% ή 7%
              </p>
              {commissionRate === 12 && (
                <p className="text-blue-700 text-xs mt-1">
                  Οικονομία: έως €{(commission - calculatePrice({ producerPrice, commissionRate: 7, vatRate }).commission).toFixed(2)} ανά προϊόν!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for product cards
export const CompactPriceBreakdown: React.FC<{
  producerPrice: number;
  commissionRate: number;
  vatRate?: number;
}> = ({ producerPrice, commissionRate, vatRate = 24 }) => {
  const { commission, priceBeforeVat, vat, finalPrice } = calculatePrice({
    producerPrice,
    commissionRate,
    vatRate
  });

  return (
    <div className="text-sm space-y-1">
      <div className="flex justify-between">
        <span className="text-gray-600">Παραγωγός:</span>
        <span className="font-medium">€{producerPrice.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Προμήθεια ({commissionRate}%):</span>
        <span className="text-gray-700">€{commission.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">ΦΠΑ ({vatRate}%):</span>
        <span className="text-gray-700">€{vat.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold text-green-600 pt-1 border-t">
        <span>Σύνολο:</span>
        <span>€{finalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Price calculator component for producers
export const PriceCalculator: React.FC<{
  onPriceChange?: (breakdown: {
    producerPrice: number;
    commission: number;
    vat: number;
    finalPrice: number;
  }) => void;
  initialPrice?: number;
  commissionRate: number;
}> = ({ onPriceChange, initialPrice = 0, commissionRate }) => {
  const [producerPrice, setProducerPrice] = React.useState(initialPrice);

  const handlePriceChange = (value: number) => {
    setProducerPrice(value);
    
    const { commission, priceBeforeVat, vat, finalPrice } = calculatePrice({
      producerPrice: value,
      commissionRate,
      vatRate: 24
    });

    onPriceChange?.({
      producerPrice: value,
      commission,
      vat,
      finalPrice
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Η Τιμή σας (χωρίς ΦΠΑ)
        </label>
        <div className="relative">
          <CurrencyEuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="number"
            min="0"
            step="0.01"
            value={producerPrice}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {producerPrice > 0 && (
        <PriceBreakdown
          producerPrice={producerPrice}
          commissionRate={commissionRate}
          size="sm"
        />
      )}
    </div>
  );
};