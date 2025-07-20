'use client';

import React from 'react';
import { ShippingAddress, BillingAddress, ShippingMethod } from '@/lib/api/models/order/types';

interface ShippingFormProps {
  shippingAddress: Partial<ShippingAddress>;
  billingAddress: Partial<BillingAddress>;
  useSameAddress: boolean;
  shippingMethod: ShippingMethod;
  onShippingAddressChange: (address: Partial<ShippingAddress>) => void;
  onBillingAddressChange: (address: Partial<BillingAddress>) => void;
  onUseSameAddressChange: (useSame: boolean) => void;
  onShippingMethodChange: (method: ShippingMethod) => void;
}

export default function ShippingForm({
  shippingAddress,
  billingAddress,
  useSameAddress,
  shippingMethod,
  onShippingAddressChange,
  onBillingAddressChange,
  onUseSameAddressChange,
  onShippingMethodChange,
}: ShippingFormProps) {
  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    onShippingAddressChange({ ...shippingAddress, [field]: value });
  };

  const handleBillingChange = (field: keyof BillingAddress, value: string | boolean) => {
    onBillingAddressChange({ ...billingAddress, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Διεύθυνση Αποστολής</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Όνομα *
            </label>
            <input
              type="text"
              value={shippingAddress.firstName || ''}
              onChange={(e) => handleShippingChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Επώνυμο *
            </label>
            <input
              type="text"
              value={shippingAddress.lastName || ''}
              onChange={(e) => handleShippingChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Εταιρεία (προαιρετικό)
            </label>
            <input
              type="text"
              value={shippingAddress.company || ''}
              onChange={(e) => handleShippingChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Διεύθυνση *
            </label>
            <input
              type="text"
              value={shippingAddress.addressLine1 || ''}
              onChange={(e) => handleShippingChange('addressLine1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Οδός και αριθμός"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Διεύθυνση 2 (προαιρετικό)
            </label>
            <input
              type="text"
              value={shippingAddress.addressLine2 || ''}
              onChange={(e) => handleShippingChange('addressLine2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Διαμέρισμα, όροφος, κτλ."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Πόλη *
            </label>
            <input
              type="text"
              value={shippingAddress.city || ''}
              onChange={(e) => handleShippingChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ταχυδρομικός Κώδικας *
            </label>
            <input
              type="text"
              value={shippingAddress.postalCode || ''}
              onChange={(e) => handleShippingChange('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Χώρα *
            </label>
            <select
              value={shippingAddress.country || 'Ελλάδα'}
              onChange={(e) => handleShippingChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="Ελλάδα">Ελλάδα</option>
              <option value="Κύπρος">Κύπρος</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Τηλέφωνο
            </label>
            <input
              type="tel"
              value={shippingAddress.phone || ''}
              onChange={(e) => handleShippingChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Shipping Method */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Τρόπος Αποστολής</h3>
        
        <div className="space-y-4">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="shippingMethod"
              value="standard"
              checked={shippingMethod === 'standard'}
              onChange={(e) => onShippingMethodChange(e.target.value as ShippingMethod)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Κανονική Αποστολή</span>
                <span className="text-gray-900">€5.00</span>
              </div>
              <p className="text-sm text-gray-500">3-5 εργάσιμες ημέρες</p>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="shippingMethod"
              value="express"
              checked={shippingMethod === 'express'}
              onChange={(e) => onShippingMethodChange(e.target.value as ShippingMethod)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Ταχεία Αποστολή</span>
                <span className="text-gray-900">€10.00</span>
              </div>
              <p className="text-sm text-gray-500">1-2 εργάσιμες ημέρες</p>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="shippingMethod"
              value="pickup"
              checked={shippingMethod === 'pickup'}
              onChange={(e) => onShippingMethodChange(e.target.value as ShippingMethod)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Παραλαβή από κατάστημα</span>
                <span className="text-green-600 font-medium">Δωρεάν</span>
              </div>
              <p className="text-sm text-gray-500">Διαθέσιμο σε 2-3 ώρες</p>
            </div>
          </label>
        </div>
      </div>

      {/* Billing Address */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Διεύθυνση Χρέωσης</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useSameAddress}
              onChange={(e) => onUseSameAddressChange(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Ίδια με τη διεύθυνση αποστολής
            </span>
          </label>
        </div>

        {!useSameAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Όνομα *
              </label>
              <input
                type="text"
                value={billingAddress.firstName || ''}
                onChange={(e) => handleBillingChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Επώνυμο *
              </label>
              <input
                type="text"
                value={billingAddress.lastName || ''}
                onChange={(e) => handleBillingChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Διεύθυνση *
              </label>
              <input
                type="text"
                value={billingAddress.addressLine1 || ''}
                onChange={(e) => handleBillingChange('addressLine1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Πόλη *
              </label>
              <input
                type="text"
                value={billingAddress.city || ''}
                onChange={(e) => handleBillingChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ταχυδρομικός Κώδικας *
              </label>
              <input
                type="text"
                value={billingAddress.postalCode || ''}
                onChange={(e) => handleBillingChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
