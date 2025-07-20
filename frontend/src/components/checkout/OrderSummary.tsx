'use client';

import React from 'react';
import { CartItem, isProductCartItem, isAdoptionCartItem } from '@/lib/api/models/cart/types';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  currency: string;
  couponDiscount?: number;
  className?: string;
}

export default function OrderSummary({
  items,
  subtotal,
  shippingCost,
  taxAmount,
  total,
  currency,
  couponDiscount = 0,
  className = ''
}: OrderSummaryProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Σύνοψη Παραγγελίας</h3>
      
      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="relative">
              {isProductCartItem(item) ? (
                <img
                  src={item?.product?.imageUrl || item?.product?.image || item.image || '/placeholder-product.jpg'}
                  alt={item?.product?.name || item.productName || 'Product'}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : isAdoptionCartItem(item) ? (
                <img
                  src={item.image || '/placeholder-adoption.jpg'}
                  alt={item.productName || 'Adoption'}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <img
                  src={(item as any).image || '/placeholder-product.jpg'}
                  alt={(item as any).productName || 'Item'}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {isProductCartItem(item) 
                  ? (item?.product?.name || item.productName || 'Product')
                  : isAdoptionCartItem(item)
                  ? item.productName || 'Adoption'
                  : (item as any).productName || 'Item'
                }
              </p>
              {isProductCartItem(item) && (
                <p className="text-sm text-gray-500">
                  {item?.product?.producerName || item.producer || ''}
                </p>
              )}
              {isAdoptionCartItem(item) && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    {item.producer || ''}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Υιοθεσία {item.duration} μήνες
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-600">
                €{item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            
            <div className="text-sm font-medium text-gray-900">
              €{item.subtotal.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Υποσύνολο</span>
          <span className="text-sm font-medium text-gray-900">
            €{subtotal.toFixed(2)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Μεταφορικά</span>
          <span className="text-sm font-medium text-gray-900">
            {shippingCost === 0 ? 'Δωρεάν' : `€${shippingCost.toFixed(2)}`}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">ΦΠΑ (24%)</span>
          <span className="text-sm font-medium text-gray-900">
            €{taxAmount.toFixed(2)}
          </span>
        </div>

        {/* Coupon Discount */}
        {couponDiscount > 0 && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-green-600">Έκπτωση</span>
            <span className="text-sm font-medium text-green-600">
              -€{couponDiscount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900">Σύνολο</span>
            <span className="text-lg font-bold text-gray-900">
              €{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-gray-600">
            Ασφαλής πληρωμή με SSL κρυπτογράφηση
          </span>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-xs font-medium text-blue-900">Εκτιμώμενη παράδοση</p>
            <p className="text-xs text-blue-700">
              {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('el-GR')}
            </p>
          </div>
        </div>
      </div>

      {/* Return Policy */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Δωρεάν επιστροφές εντός 14 ημερών
        </p>
      </div>
    </div>
  );
}
