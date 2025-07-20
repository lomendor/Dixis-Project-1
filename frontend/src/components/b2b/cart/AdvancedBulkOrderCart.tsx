'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CurrencyEuroIcon,
  TruckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BusinessTier } from '../pricing/AdvancedWholesalePricing';

interface BulkCartItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  unitPrice: number;
  quantity: number;
  minimumQuantity: number;
  subtotal: number;
  tier: BusinessTier;
  producer: string;
  sku?: string;
}

interface BulkOrderSummary {
  subtotal: number;
  tierDiscount: number;
  volumeDiscount: number;
  shippingCost: number;
  vatAmount: number;
  total: number;
  creditLimit: number;
  creditUsed: number;
  creditAvailable: number;
}

interface AdvancedBulkOrderCartProps {
  items: BulkCartItem[];
  summary: BulkOrderSummary;
  currentTier: BusinessTier;
  currency?: string;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddNote: (note: string) => void;
  onSetPONumber: (poNumber: string) => void;
  onSubmitOrder: () => void;
  isLoading?: boolean;
}

export default function AdvancedBulkOrderCart({
  items,
  summary,
  currentTier,
  currency = '€',
  onUpdateQuantity,
  onRemoveItem,
  onAddNote,
  onSetPONumber,
  onSubmitOrder,
  isLoading = false
}: AdvancedBulkOrderCartProps) {
  const [orderNote, setOrderNote] = useState('');
  const [poNumber, setPONumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'card' | 'bank'>('credit');

  // Check if order meets minimum requirements
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const meetsMinimumOrder = totalQuantity >= getMinimumOrderForTier(currentTier);
  const exceedsCreditLimit = summary.total > summary.creditAvailable;

  function getMinimumOrderForTier(tier: BusinessTier): number {
    switch (tier) {
      case BusinessTier.BRONZE: return 100;
      case BusinessTier.SILVER: return 75;
      case BusinessTier.GOLD: return 50;
      case BusinessTier.PLATINUM: return 25;
      default: return 100;
    }
  }

  function getTierDisplayName(tier: BusinessTier): string {
    switch (tier) {
      case BusinessTier.BRONZE: return 'Bronze Partner';
      case BusinessTier.SILVER: return 'Silver Partner';
      case BusinessTier.GOLD: return 'Gold Partner';
      case BusinessTier.PLATINUM: return 'Platinum Partner';
      default: return 'Partner';
    }
  }

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(item.minimumQuantity, item.quantity + change);
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleNoteSubmit = () => {
    if (orderNote.trim()) {
      onAddNote(orderNote);
    }
  };

  const handlePOSubmit = () => {
    if (poNumber.trim()) {
      onSetPONumber(poNumber);
    }
  };

  const canSubmitOrder = meetsMinimumOrder && !exceedsCreditLimit && items.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ShoppingCartIcon className="w-8 h-8 mr-3" />
          Bulk Order Cart
        </h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">Status: {getTierDisplayName(currentTier)}</div>
          <div className="text-lg font-semibold">{items.length} products • {totalQuantity} units</div>
        </div>
      </div>

      {/* Order Requirements Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border-2 ${
          meetsMinimumOrder ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {meetsMinimumOrder ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            )}
            <div>
              <div className="font-medium">Minimum Order</div>
              <div className="text-sm text-gray-600">
                {totalQuantity} / {getMinimumOrderForTier(currentTier)} units
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          !exceedsCreditLimit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {!exceedsCreditLimit ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            )}
            <div>
              <div className="font-medium">Credit Limit</div>
              <div className="text-sm text-gray-600">
                {currency}{summary.creditAvailable.toFixed(2)} available
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <TruckIcon className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <div className="font-medium">Shipping</div>
              <div className="text-sm text-gray-600">
                {[BusinessTier.SILVER, BusinessTier.GOLD, BusinessTier.PLATINUM].includes(currentTier) 
                  ? 'Free shipping' 
                  : `${currency}${summary.shippingCost.toFixed(2)}`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Order Items</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600">by {item.producer}</p>
                  {item.sku && (
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Min. quantity: {item.minimumQuantity} units
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={item.quantity <= item.minimumQuantity}
                    className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  
                  <div className="w-16 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value) || item.minimumQuantity;
                        onUpdateQuantity(item.id, Math.max(item.minimumQuantity, newQty));
                      }}
                      min={item.minimumQuantity}
                      className="w-full text-center border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-100"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="font-medium">{currency}{item.unitPrice.toFixed(2)}/unit</div>
                  <div className="text-lg font-semibold">{currency}{item.subtotal.toFixed(2)}</div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Order Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Number (Optional)
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  onBlur={handlePOSubmit}
                  placeholder="Enter purchase order number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  onBlur={handleNoteSubmit}
                  placeholder="Special instructions or notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'credit' | 'card' | 'bank')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit">Credit Terms</option>
                  <option value="card">Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <CurrencyEuroIcon className="w-5 h-5 mr-2" />
            Order Summary
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>{currency}{summary.subtotal.toFixed(2)}</span>
            </div>
            
            {summary.tierDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Tier Discount:</span>
                <span>-{currency}{summary.tierDiscount.toFixed(2)}</span>
              </div>
            )}
            
            {summary.volumeDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Volume Discount:</span>
                <span>-{currency}{summary.volumeDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span>
                {summary.shippingCost === 0 ? 'Free' : `${currency}${summary.shippingCost.toFixed(2)}`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">VAT (24%):</span>
              <span>{currency}{summary.vatAmount.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{currency}{summary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Credit Information */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600 mb-1">Credit Status</div>
              <div className="flex justify-between text-sm">
                <span>Limit:</span>
                <span>{currency}{summary.creditLimit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Used:</span>
                <span>{currency}{summary.creditUsed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Available:</span>
                <span className={exceedsCreditLimit ? 'text-red-600' : 'text-green-600'}>
                  {currency}{summary.creditAvailable.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Order Button */}
          <motion.button
            whileHover={{ scale: canSubmitOrder ? 1.02 : 1 }}
            whileTap={{ scale: canSubmitOrder ? 0.98 : 1 }}
            onClick={onSubmitOrder}
            disabled={!canSubmitOrder || isLoading}
            className={`w-full mt-6 py-3 px-4 rounded-md font-medium transition-colors ${
              canSubmitOrder
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Submit Bulk Order'
            )}
          </motion.button>

          {!canSubmitOrder && (
            <div className="mt-2 text-sm text-red-600">
              {!meetsMinimumOrder && `Minimum order: ${getMinimumOrderForTier(currentTier)} units`}
              {exceedsCreditLimit && 'Order exceeds available credit limit'}
              {items.length === 0 && 'Add items to your cart'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}