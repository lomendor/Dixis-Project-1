'use client';

import React from 'react';
import { useCommissionCalculation } from '../../lib/api/hooks/useSubscription';
import { SubscriptionTier } from '../../lib/api/models/subscription/types';
import { UserRole } from '../../lib/api/models/auth/types';
import { Calculator, TrendingDown, Info } from 'lucide-react';

interface CommissionBreakdownProps {
  price: number;
  userId: string;
  userRole?: UserRole;
  showAllTiers?: boolean;
  className?: string;
}

export const CommissionBreakdown: React.FC<CommissionBreakdownProps> = ({
  price,
  userId,
  userRole = UserRole.CONSUMER,
  showAllTiers = false,
  className = ''
}) => {
  const { data: breakdown, isLoading } = useCommissionCalculation(price, userId, userRole);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!breakdown) {
    return null;
  }

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;

  if (showAllTiers) {
    // Show comparison across all tiers
    const tiers = [
      { tier: SubscriptionTier.FREE, rate: 12.00, name: 'Δωρεάν' },
      { tier: SubscriptionTier.TIER_1, rate: 9.00, name: 'Pro' },
      { tier: SubscriptionTier.TIER_2, rate: 7.00, name: 'Premium' },
      { tier: SubscriptionTier.BUSINESS, rate: 0.00, name: 'Επιχείρηση' }
    ];

    return (
      <div className={`bg-white border rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Σύγκριση Προμηθειών</h3>
        </div>

        <div className="space-y-3">
          {tiers.map((tier) => {
            const commissionAmount = (price * tier.rate) / 100;
            const netEarnings = price - commissionAmount;
            const isCurrentTier = tier.rate === breakdown.commissionRate;

            return (
              <div 
                key={tier.tier}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isCurrentTier 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {tier.name}
                      {isCurrentTier && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Τρέχον
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {tier.rate}% προμήθεια
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(netEarnings)}
                    </div>
                    <div className="text-sm text-red-600">
                      -{formatCurrency(commissionAmount)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Τιμή βάσης:</strong> {formatCurrency(price)} | 
              <strong> ΦΠΑ (24%):</strong> {formatCurrency(breakdown.vatAmount)} | 
              <strong> Συνολική τιμή:</strong> {formatCurrency(breakdown.totalPrice)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single tier breakdown
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Ανάλυση Τιμής</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-sm text-gray-600">Τιμή Παραγωγού</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(breakdown.producerPrice)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Καθαρά Κέρδη</div>
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(breakdown.producerEarnings)}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm border-t pt-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Προμήθεια ({breakdown.commissionRate}%):</span>
          <span className="text-red-600">-{formatCurrency(breakdown.commissionAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ΦΠΑ (24%):</span>
          <span className="text-gray-800">{formatCurrency(breakdown.vatAmount)}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2">
          <span className="text-gray-900">Τελική Τιμή Πελάτη:</span>
          <span className="text-gray-900">{formatCurrency(breakdown.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};