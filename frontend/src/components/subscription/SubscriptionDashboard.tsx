'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState } from 'react';
import { 
  useUserSubscription, 
  useSubscriptionAnalytics,
  useCancelSubscription,
  useUpgradeSuggestions 
} from '../../lib/api/hooks/useSubscription';
import { useProducerAnalytics } from '../../stores/producerStore';
import { 
  SubscriptionTier, 
  SubscriptionStatus,
  BillingCycle 
} from '../../lib/api/models/subscription/types';
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { SubscriptionPlansGrid } from './SubscriptionPlansGrid';
import { UserRole } from '../../lib/api/models/auth/types';

interface SubscriptionDashboardProps {
  userId: string;
  userRole: UserRole;
}

export const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({
  userId,
  userRole
}) => {
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const { data: subscription } = useUserSubscription(userId);
  const { data: analytics } = useSubscriptionAnalytics(userId);
  const { data: upgradeSuggestions } = useUpgradeSuggestions(userId);
  const cancelSubscription = useCancelSubscription();
  const producerAnalytics = useProducerAnalytics();

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'text-green-600 bg-green-100';
      case SubscriptionStatus.CANCELLED:
        return 'text-red-600 bg-red-100';
      case SubscriptionStatus.EXPIRED:
        return 'text-gray-600 bg-gray-100';
      case SubscriptionStatus.TRIAL:
        return 'text-blue-600 bg-blue-100';
      case SubscriptionStatus.PAST_DUE:
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'Ενεργό';
      case SubscriptionStatus.CANCELLED:
        return 'Ακυρωμένο';
      case SubscriptionStatus.EXPIRED:
        return 'Ληγμένο';
      case SubscriptionStatus.TRIAL:
        return 'Δοκιμαστικό';
      case SubscriptionStatus.PAST_DUE:
        return 'Εκπρόθεσμο';
      default:
        return 'Άγνωστο';
    }
  };

  const getTierDisplayName = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'Δωρεάν';
      case SubscriptionTier.TIER_1:
        return 'Παραγωγός Pro';
      case SubscriptionTier.TIER_2:
        return 'Παραγωγός Premium';
      case SubscriptionTier.BUSINESS:
        return 'Επιχείρηση';
      default:
        return 'Άγνωστο';
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    if (!subscription) return;
    
    try {
      await cancelSubscription.mutateAsync({
        subscriptionId: subscription.id,
        cancelAtPeriodEnd
      });
      setShowCancelModal(false);
    } catch (error) {
      logger.error('Failed to cancel subscription:', toError(error), errorToContext(error));
    }
  };

  if (showPlanSelector) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Αλλαγή Πλάνου</h2>
          <button
            onClick={() => setShowPlanSelector(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Επιστροφή
          </button>
        </div>
        <SubscriptionPlansGrid
          userId={userId}
          userRole={userRole}
          onPlanSelected={() => setShowPlanSelector(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Διαχείριση Συνδρομής
        </h1>
        <p className="text-gray-600">
          Παρακολουθήστε τη συνδρομή σας και βελτιστοποιήστε τα κέρδη σας
        </p>
      </div>

      {/* Current subscription overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan info */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Τρέχον Πλάνο</h3>
            {subscription && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                {getStatusText(subscription.status)}
              </span>
            )}
          </div>
          
          {subscription ? (
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {getTierDisplayName(subscription.plan.tier)}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {subscription.plan.commissionRate}% προμήθεια
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Χρέωση:</span>
                  <span>
                    {subscription.billingCycle === BillingCycle.MONTHLY ? 'Μηνιαία' : 'Ετήσια'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Επόμενη πληρωμή:</span>
                  <span>
                    {subscription.nextBillingDate 
                      ? new Date(subscription.nextBillingDate).toLocaleDateString('el-GR')
                      : 'Δωρεάν'
                    }
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                Δωρεάν Πλάνο
              </div>
              <div className="text-sm text-gray-600">
                12% προμήθεια
              </div>
            </div>
          )}
        </div>

        {/* Analytics summary */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Εξοικονόμηση</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          
          {analytics ? (
            <div>
              <div className="text-2xl font-bold text-green-600 mb-2">
                €{analytics.monthlyCommissionSaved.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                εξοικονόμηση/μήνα
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ετήσια εξοικονόμηση:</span>
                  <span className="font-medium">€{analytics.yearlyCommissionSaved.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className="font-medium text-green-600">
                    {analytics.roi > 0 ? `+${analytics.roi.toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Συνδεθείτε για να δείτε τα αναλυτικά
            </div>
          )}
        </div>

        {/* Revenue info */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Έσοδα</h3>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          
          {analytics ? (
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                €{analytics.monthlyRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                μηνιαία έσοδα
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Προβολή ετήσια:</span>
                  <span className="font-medium">€{analytics.projectedYearlyRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Προμήθεια πληρωμένη:</span>
                  <span className="font-medium">€{analytics.totalCommissionPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Δεν υπάρχουν δεδομένα εσόδων
            </div>
          )}
        </div>
      </div>

      {/* Upgrade suggestion */}
      {upgradeSuggestions?.shouldSuggestUpgrade && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <ArrowUp className="w-6 h-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💡 Πρόταση Αναβάθμισης
              </h3>
              <p className="text-gray-700 mb-4">
                {upgradeSuggestions.reasoning}
              </p>
              <button
                onClick={() => setShowPlanSelector(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Δείτε Πλάνα Αναβάθμισης
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ενέργειες</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowPlanSelector(true)}
            className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Αλλαγή Πλάνου</div>
              <div className="text-sm text-gray-600">Αναβάθμιση ή υποβάθμιση</div>
            </div>
          </button>

          <button
            onClick={() => window.open('/billing-history', '_blank')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Ιστορικό Πληρωμών</div>
              <div className="text-sm text-gray-600">Προβολή τιμολογίων</div>
            </div>
          </button>

          {subscription && subscription.plan.tier !== SubscriptionTier.FREE && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Ακύρωση Συνδρομής</div>
                <div className="text-sm text-gray-600">Επιστροφή στο δωρεάν πλάνο</div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Commission breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ανάλυση Προμηθειών
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Πλάνο</th>
                <th className="text-left py-2">Προμήθεια</th>
                <th className="text-left py-2">Μηνιαία Προμήθεια*</th>
                <th className="text-left py-2">Εξοικονόμηση</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Δωρεάν</td>
                <td className="py-2">12%</td>
                <td className="py-2">
                  €{analytics ? (analytics.monthlyRevenue * 0.12).toFixed(2) : '0.00'}
                </td>
                <td className="py-2">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Παραγωγός Pro</td>
                <td className="py-2">9%</td>
                <td className="py-2">
                  €{analytics ? (analytics.monthlyRevenue * 0.09).toFixed(2) : '0.00'}
                </td>
                <td className="py-2 text-green-600">
                  +€{analytics ? (analytics.monthlyRevenue * 0.03).toFixed(2) : '0.00'}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Παραγωγός Premium</td>
                <td className="py-2">7%</td>
                <td className="py-2">
                  €{analytics ? (analytics.monthlyRevenue * 0.07).toFixed(2) : '0.00'}
                </td>
                <td className="py-2 text-green-600">
                  +€{analytics ? (analytics.monthlyRevenue * 0.05).toFixed(2) : '0.00'}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">
            * Βάσει τρεχόντων μηνιαίων εσόδων
          </p>
        </div>
      </div>

      {/* Cancel subscription modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ακύρωση Συνδρομής
            </h3>
            <p className="text-gray-600 mb-6">
              Είστε σίγουροι ότι θέλετε να ακυρώσετε τη συνδρομή σας; 
              Θα επιστρέψετε στο δωρεάν πλάνο με 12% προμήθεια.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleCancelSubscription(true)}
                disabled={cancelSubscription.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:bg-red-400"
              >
                {cancelSubscription.isPending ? 'Επεξεργασία...' : 'Ακύρωση στο τέλος περιόδου'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Άκυρο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};