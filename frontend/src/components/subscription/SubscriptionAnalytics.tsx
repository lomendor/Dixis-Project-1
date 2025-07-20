'use client';

import React from 'react';
import { useSubscriptionAnalytics } from '../../lib/api/hooks/useSubscription';
import { SubscriptionTier } from '../../lib/api/models/subscription/types';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  PieChart,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface SubscriptionAnalyticsProps {
  userId: string;
  className?: string;
}

export const SubscriptionAnalytics: React.FC<SubscriptionAnalyticsProps> = ({
  userId,
  className = ''
}) => {
  const { data: analytics, isLoading, error } = useSubscriptionAnalytics(userId);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-red-800">
          Σφάλμα φόρτωσης αναλυτικών δεδομένων
        </div>
      </div>
    );
  }

  const getTierName = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'Δωρεάν';
      case SubscriptionTier.TIER_1:
        return 'Pro';
      case SubscriptionTier.TIER_2:
        return 'Premium';
      case SubscriptionTier.BUSINESS:
        return 'Επιχείρηση';
      default:
        return 'Άγνωστο';
    }
  };

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Current tier */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Τρέχον Πλάνο</div>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {getTierName(analytics.currentTier)}
          </div>
          <div className="text-sm text-gray-600">
            {formatPercentage(analytics.commissionRate)} προμήθεια
          </div>
        </div>

        {/* Monthly savings */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Μηνιαία Εξοικονόμηση</div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(analytics.monthlyCommissionSaved)}
          </div>
          <div className="text-sm text-gray-600">
            vs δωρεάν πλάνο
          </div>
        </div>

        {/* Monthly revenue */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Μηνιαία Έσοδα</div>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(analytics.monthlyRevenue)}
          </div>
          <div className="text-sm text-gray-600">
            τρέχων μήνας
          </div>
        </div>

        {/* ROI */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">ROI Συνδρομής</div>
            {analytics.roi > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className={`text-2xl font-bold ${analytics.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.roi > 0 ? '+' : ''}{formatPercentage(analytics.roi)}
          </div>
          <div className="text-sm text-gray-600">
            απόδοση επένδυσης
          </div>
        </div>
      </div>

      {/* Detailed analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission breakdown */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ανάλυση Προμηθειών</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-red-900">Προμήθειες Πληρωμένες</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(analytics.totalCommissionPaid)}
                </span>
              </div>
              <div className="text-sm text-red-600">
                Με {formatPercentage(analytics.commissionRate)} προμήθεια
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-green-900">Εξοικονομήσεις</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(analytics.totalCommissionSaved)}
                </span>
              </div>
              <div className="text-sm text-green-600">
                Εξοικονόμηση vs δωρεάν πλάνο
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-blue-900">Αξία Συνδρομής</span>
                <span className={`text-lg font-bold ${analytics.subscriptionValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(analytics.subscriptionValue)}
                </span>
              </div>
              <div className="text-sm text-blue-600">
                Καθαρή αξία ετησίως
              </div>
            </div>
          </div>
        </div>

        {/* Revenue projections */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Προβολές Εσόδων</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-blue-900">Ετήσια Πρόβλεψη</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(analytics.projectedYearlyRevenue)}
                </span>
              </div>
              <div className="text-sm text-blue-600">
                Βάσει τρέχοντος ρυθμού
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-yellow-900">Ετήσια Εξοικονόμηση</span>
                <span className="text-lg font-bold text-yellow-600">
                  {formatCurrency(analytics.yearlyCommissionSaved)}
                </span>
              </div>
              <div className="text-sm text-yellow-600">
                Με τρέχον πλάνο
              </div>
            </div>

            {/* Growth indicators */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Δείκτες Ανάπτυξης</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Μέσος ρυθμός ανάπτυξης:</span>
                  <span className="font-medium text-green-600">+15% μηνιαίως</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Στόχος έτους:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(analytics.projectedYearlyRevenue * 1.2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Δυναμική εξοικονόμηση:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(analytics.yearlyCommissionSaved * 1.2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly trends */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Μηνιαίες Τάσεις</h3>
        </div>

        {/* Mock monthly data visualization */}
        <div className="grid grid-cols-6 gap-4">
          {[
            { month: 'Ιαν', revenue: 1800, commission: 180 },
            { month: 'Φεβ', revenue: 2100, commission: 189 },
            { month: 'Μαρ', revenue: 2400, commission: 216 },
            { month: 'Απρ', revenue: 2200, commission: 198 },
            { month: 'Μαϊ', revenue: 2600, commission: 234 },
            { month: 'Ιουν', revenue: 2500, commission: 225 }
          ].map((data, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 mb-2">{data.month}</div>
              <div className="bg-blue-100 rounded-lg p-3 mb-2">
                <div className="text-sm font-semibold text-blue-900">
                  {formatCurrency(data.revenue)}
                </div>
                <div className="text-xs text-blue-600">έσοδα</div>
              </div>
              <div className="bg-red-100 rounded-lg p-2">
                <div className="text-xs font-semibold text-red-900">
                  {formatCurrency(data.commission)}
                </div>
                <div className="text-xs text-red-600">προμήθεια</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700">
            <strong>Παρατηρήσεις:</strong> Σταθερή ανοδική τάση στα έσοδα με 
            μέση αύξηση 8% μηνιαίως. Η εξοικονόμηση από τη συνδρομή αυξάνεται 
            ανάλογα με τον όγκο πωλήσεων.
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎯 Προτάσεις Βελτιστοποίησης
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Αύξηση Εσόδων</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Προσθέστε περισσότερα εποχιακά προϊόντα</li>
              <li>• Δημιουργήστε πακέτα προϊόντων</li>
              <li>• Βελτιστοποιήστε τις τιμές</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Μείωση Κόστους</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Εκμεταλλευτείτε χαμηλότερες προμήθειες</li>
              <li>• Αυτοματοποιήστε τη διαχείριση παραγγελιών</li>
              <li>• Χρησιμοποιήστε bulk uploads</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};