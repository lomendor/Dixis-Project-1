'use client';

import React, { useState } from 'react';
import { CommissionBreakdown } from './CommissionBreakdown';
import { usePricingComparison } from '../../lib/api/hooks/useSubscription';
import { useProducerAnalytics } from '../../stores/producerStore';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

interface PricingCalculatorProps {
  userId: string;
  initialPrice?: number;
  className?: string;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  userId,
  initialPrice = 100,
  className = ''
}) => {
  const [price, setPrice] = useState(initialPrice);
  const [showComparison, setShowComparison] = useState(false);
  
  const { data: pricingComparison } = usePricingComparison(price);
  const analytics = useProducerAnalytics();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setPrice(newPrice);
  };

  const calculateMonthlySavings = (commissionRate: number) => {
    if (!analytics?.monthlyRevenue) return 0;
    const freeRate = 12.00;
    return (analytics.monthlyRevenue * (freeRate - commissionRate)) / 100;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Price input */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Υπολογιστής Τιμολόγησης</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Τιμή Προϊόντος (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                min="0"
                step="0.01"
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Εισάγετε τιμή"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {showComparison ? 'Απλή Προβολή' : 'Σύγκριση Πλάνων'}
            </button>
          </div>
        </div>

        {/* Commission breakdown */}
        <CommissionBreakdown
          price={price}
          userId={userId}
          showAllTiers={showComparison}
        />
      </div>

      {/* Monthly projections */}
      {analytics?.monthlyRevenue && pricingComparison && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Μηνιαίες Προβολές</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current tier savings */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Τρέχουσα Εξοικονόμηση</div>
              <div className="text-2xl font-bold text-blue-900">
                €{calculateMonthlySavings(analytics.commissionRate || 12).toFixed(2)}
              </div>
              <div className="text-xs text-blue-600">
                ανά μήνα vs δωρεάν πλάνο
              </div>
            </div>

            {/* Pro tier potential */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Με Pro Πλάνο (9%)</div>
              <div className="text-2xl font-bold text-green-900">
                €{calculateMonthlySavings(9).toFixed(2)}
              </div>
              <div className="text-xs text-green-600">
                εξοικονόμηση/μήνα
              </div>
            </div>

            {/* Premium tier potential */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">Με Premium Πλάνο (7%)</div>
              <div className="text-2xl font-bold text-purple-900">
                €{calculateMonthlySavings(7).toFixed(2)}
              </div>
              <div className="text-xs text-purple-600">
                εξοικονόμηση/μήνα
              </div>
            </div>
          </div>

          {/* ROI indicators */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Προτάσεις Βελτιστοποίησης</h4>
            <div className="space-y-2 text-sm">
              {calculateMonthlySavings(9) > 29.99 && (
                <div className="text-green-700">
                  ✅ Το Pro πλάνο (€29.99/μήνα) θα σας εξοικονομήσει €{(calculateMonthlySavings(9) - 29.99).toFixed(2)} μηνιαίως
                </div>
              )}
              {calculateMonthlySavings(7) > 59.99 && (
                <div className="text-purple-700">
                  ✅ Το Premium πλάνο (€59.99/μήνα) θα σας εξοικονομήσει €{(calculateMonthlySavings(7) - 59.99).toFixed(2)} μηνιαίως
                </div>
              )}
              {calculateMonthlySavings(9) <= 29.99 && calculateMonthlySavings(7) <= 59.99 && (
                <div className="text-gray-700">
                  ℹ️ Με τα τρέχοντα έσοδά σας, το δωρεάν πλάνο είναι η καλύτερη επιλογή
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing tips */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Συμβουλές Τιμολόγησης
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Ανταγωνιστική Τιμολόγηση</h4>
            <p className="text-sm text-blue-700">
              Συμπεριλάβετε την προμήθεια στην τιμή σας για να διατηρήσετε τα περιθώρια κέρδους.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Διαφάνεια</h4>
            <p className="text-sm text-green-700">
              Οι πελάτες εκτιμούν τη διαφανή ανάλυση κόστους που βλέπουν στο checkout.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Όγκος Πωλήσεων</h4>
            <p className="text-sm text-yellow-700">
              Με αύξηση του όγκου, μια συνδρομή μπορεί να εξοικονομήσει σημαντικά ποσά.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Προσαρμογή</h4>
            <p className="text-sm text-purple-700">
              Προσαρμόστε τις τιμές βάσει εποχικότητας και διαθεσιμότητας προϊόντων.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};