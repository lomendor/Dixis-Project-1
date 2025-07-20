'use client';

import React from 'react';
import { useCurrencyConversion } from '@/stores/currencyStore';

interface PriceProps {
  amount: number;
  originalCurrency?: string;
  className?: string;
  showOriginal?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'discount' | 'original' | 'muted';
}

export default function Price({
  amount,
  originalCurrency = 'EUR',
  className = '',
  showOriginal = false,
  size = 'md',
  variant = 'default'
}: PriceProps) {
  const { convertAndFormat, selectedCurrency, convertPrice } = useCurrencyConversion();

  // Convert price to selected currency
  const convertedAmount = convertPrice(amount, originalCurrency);
  const formattedPrice = convertAndFormat(amount, originalCurrency);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Variant classes
  const variantClasses = {
    default: 'text-gray-900 font-semibold',
    discount: 'text-green-600 font-bold',
    original: 'text-gray-500 line-through',
    muted: 'text-gray-600'
  };

  const baseClasses = `${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  // Show conversion info if currency changed and amount is different
  const showConversion = originalCurrency !== selectedCurrency.code && 
                        Math.abs(amount - convertedAmount) > 0.01;

  return (
    <span className={baseClasses}>
      {formattedPrice}
      
      {/* Show original price if requested and currency was converted */}
      {showOriginal && showConversion && (
        <span className="ml-2 text-xs text-gray-400">
          (από {amount.toFixed(2)} {originalCurrency})
        </span>
      )}
    </span>
  );
}

// Specialized price components for common use cases
export function ProductPrice({ 
  price, 
  discountPrice, 
  originalCurrency = 'EUR',
  className = '',
  size = 'lg'
}: {
  price: number;
  discountPrice?: number;
  originalCurrency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {discountPrice ? (
        <>
          <Price 
            amount={discountPrice} 
            originalCurrency={originalCurrency}
            variant="discount"
            size={size}
          />
          <Price 
            amount={price} 
            originalCurrency={originalCurrency}
            variant="original"
            size="sm"
          />
        </>
      ) : (
        <Price 
          amount={price} 
          originalCurrency={originalCurrency}
          variant="default"
          size={size}
        />
      )}
    </div>
  );
}

export function CartItemPrice({ 
  price, 
  quantity = 1,
  originalCurrency = 'EUR',
  className = ''
}: {
  price: number;
  quantity?: number;
  originalCurrency?: string;
  className?: string;
}) {
  const totalPrice = price * quantity;

  return (
    <div className={`text-right ${className}`}>
      {quantity > 1 && (
        <div className="text-sm text-gray-500">
          <Price 
            amount={price} 
            originalCurrency={originalCurrency}
            size="sm"
            variant="muted"
          /> × {quantity}
        </div>
      )}
      <Price 
        amount={totalPrice} 
        originalCurrency={originalCurrency}
        variant="default"
        size="md"
      />
    </div>
  );
}

export function OrderTotalPrice({ 
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  originalCurrency = 'EUR',
  className = ''
}: {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  originalCurrency?: string;
  className?: string;
}) {
  const total = subtotal + shipping + tax - discount;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Υποσύνολο:</span>
        <Price 
          amount={subtotal} 
          originalCurrency={originalCurrency}
          variant="muted"
          size="sm"
        />
      </div>

      {/* Shipping */}
      {shipping > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Μεταφορικά:</span>
          <Price 
            amount={shipping} 
            originalCurrency={originalCurrency}
            variant="muted"
            size="sm"
          />
        </div>
      )}

      {/* Tax */}
      {tax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">ΦΠΑ:</span>
          <Price 
            amount={tax} 
            originalCurrency={originalCurrency}
            variant="muted"
            size="sm"
          />
        </div>
      )}

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-green-600">Έκπτωση:</span>
          <Price 
            amount={-discount} 
            originalCurrency={originalCurrency}
            variant="discount"
            size="sm"
          />
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between text-lg font-bold border-t pt-2">
        <span>Σύνολο:</span>
        <Price 
          amount={total} 
          originalCurrency={originalCurrency}
          variant="default"
          size="lg"
          showOriginal={true}
        />
      </div>
    </div>
  );
}
