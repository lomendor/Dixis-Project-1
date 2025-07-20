'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState } from 'react';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { 
  useSubscriptionPlans, 
  useUserSubscription, 
  useCreateSubscription,
  useUpdateSubscription 
} from '../../lib/api/hooks/useSubscription';
import { BillingCycle, SubscriptionTier, SubscriptionPlan } from '../../lib/api/models/subscription/types';
import { UserRole } from '../../lib/api/models/auth/types';
import { idToString } from '../../lib/api/client/apiTypes';
import { useProducerAnalytics } from '../../stores/producerStore';
import { ToggleGroup, ToggleGroupItem } from '../ui/ToggleGroup';
import { Loader2 } from 'lucide-react';

interface SubscriptionPlansGridProps {
  userId: string;
  userRole: UserRole;
  onPlanSelected?: (planId: string) => void;
}

export const SubscriptionPlansGrid: React.FC<SubscriptionPlansGridProps> = ({
  userId,
  userRole,
  onPlanSelected
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  
  const { data: plans = [] as SubscriptionPlan[], isLoading: plansLoading } = useSubscriptionPlans(userRole);
  const { data: currentSubscription } = useUserSubscription(userId);
  const analytics = useProducerAnalytics();
  
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();

  const handlePlanSelect = async (planId: string, selectedBillingCycle: BillingCycle) => {
    try {
      if (currentSubscription) {
        // Update existing subscription
        await updateSubscription.mutateAsync({
          subscriptionId: currentSubscription.id,
          options: {
            fromPlanId: currentSubscription.planId,
            toPlanId: planId,
            billingCycle: selectedBillingCycle,
            effectiveDate: 'immediate'
          }
        });
      } else {
        // Create new subscription
        await createSubscription.mutateAsync({
          userId,
          planId,
          billingCycle: selectedBillingCycle
        });
      }
      
      onPlanSelected?.(planId);
    } catch (error) {
      logger.error('Failed to select plan:', toError(error), errorToContext(error));
    }
  };

  const getPopularPlan = () => {
    // Tier 1 is typically the most popular for producers
    const planList = plans as SubscriptionPlan[];
    return planList.find((plan) => plan.tier === SubscriptionTier.TIER_1)?.id;
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId;
  };

  if (plansLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Φόρτωση πλάνων...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Επιλέξτε το Κατάλληλο Πλάνο
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Εξοικονομήστε σε προμήθειες και αναπτύξτε την επιχείρησή σας
        </p>
        
        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-8">
          <ToggleGroup 
            value={billingCycle} 
            onValueChange={(value) => value && setBillingCycle(value as BillingCycle)}
            className="bg-gray-100 p-1 rounded-lg"
          >
            <ToggleGroupItem 
              value={BillingCycle.MONTHLY}
              className="px-6 py-2 rounded-md font-medium transition-all duration-200"
            >
              Μηνιαία πληρωμή
            </ToggleGroupItem>
            <ToggleGroupItem 
              value={BillingCycle.YEARLY}
              className="px-6 py-2 rounded-md font-medium transition-all duration-200 relative"
            >
              Ετήσια πληρωμή
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                -20%
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Commission savings notice */}
      {analytics && analytics.monthlyRevenue > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💰 Υπολογισμός Εξοικονόμησης
            </h3>
            <p className="text-gray-700 mb-4">
              Με βάση τα τρέχοντα έσοδά σας των €{analytics.monthlyRevenue.toFixed(2)}/μήνα:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  €{((analytics.monthlyRevenue * 12) / 100).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Τρέχουσες προμήθειες/έτος
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  €{((analytics.monthlyRevenue * 9) / 100).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Με Tier 1 (9%)/έτος
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  €{((analytics.monthlyRevenue * 7) / 100).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Με Tier 2 (7%)/έτος
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(plans as SubscriptionPlan[]).map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isCurrentPlan={isCurrentPlan(idToString(plan.id))}
            isPopular={plan.id === getPopularPlan()}
            onSelect={handlePlanSelect}
            isLoading={createSubscription.isPending || updateSubscription.isPending}
            currentMonthlyRevenue={analytics?.monthlyRevenue || 0}
          />
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">Συχνές Ερωτήσεις</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 border">
            <h4 className="font-semibold mb-2">Πότε χρεώνομαι;</h4>
            <p className="text-gray-600 text-sm">
              Χρεώνεστε στην αρχή κάθε περιόδου χρέωσης. Μπορείτε να ακυρώσετε ανά πάσα στιγμή.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h4 className="font-semibold mb-2">Μπορώ να αλλάξω πλάνο;</h4>
            <p className="text-gray-600 text-sm">
              Ναι, μπορείτε να αναβαθμίσετε ή να υποβαθμίσετε ανά πάσα στιγμή με άμεση εφαρμογή.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h4 className="font-semibold mb-2">Τι συμβαίνει αν ακυρώσω;</h4>
            <p className="text-gray-600 text-sm">
              Θα συνεχίσετε να έχετε πρόσβαση μέχρι το τέλος της περιόδου χρέωσης.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border">
            <h4 className="font-semibold mb-2">Υπάρχει δωρεάν δοκιμή;</h4>
            <p className="text-gray-600 text-sm">
              Όλες οι λειτουργίες είναι διαθέσιμες με το δωρεάν πλάνο για να τις δοκιμάσετε.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};