import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

/**
 * Subscription management hooks for Dixis Fresh
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionAnalytics,
  BillingCycle,
  SubscriptionChangeOptions,
  SubscriptionTier
} from '../models/subscription/types';
import { SubscriptionService } from '../services/subscription/subscriptionService';
import { ID } from '../client/apiTypes';
import { UserRole } from '../models/auth/types';
import { useProducerStore } from '../../../stores/producerStore';

/**
 * Hook to fetch all subscription plans
 */
export const useSubscriptionPlans = (userType?: UserRole) => {
  return useQuery({
    queryKey: ['subscription-plans', userType],
    queryFn: () => SubscriptionService.getPlans(userType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch user's current subscription
 */
export const useUserSubscription = (userId: ID) => {
  const { setAnalytics } = useProducerStore();
  
  return useQuery({
    queryKey: ['user-subscription', userId],
    queryFn: async () => {
      const subscription = await SubscriptionService.getUserSubscription(userId);
      
      // Also fetch analytics when getting subscription
      if (subscription) {
        try {
          const analytics = await SubscriptionService.getSubscriptionAnalytics(userId);
          setAnalytics(analytics);
        } catch (error) {
          logger.warn('Failed to fetch subscription analytics:', error);
        }
      }
      
      return subscription;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch subscription analytics
 */
export const useSubscriptionAnalytics = (userId: ID) => {
  return useQuery({
    queryKey: ['subscription-analytics', userId],
    queryFn: () => SubscriptionService.getSubscriptionAnalytics(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a new subscription
 */
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useProducerStore();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      planId, 
      billingCycle 
    }: { 
      userId: ID; 
      planId: ID; 
      billingCycle: BillingCycle; 
    }) => {
      return SubscriptionService.createSubscription(userId, planId, billingCycle);
    },
    onSuccess: (subscription, { userId }) => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({ queryKey: ['user-subscription', userId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-analytics', userId] });
      
      // Update producer profile with new subscription info
      const currentProfile = useProducerStore.getState().profile;
      if (currentProfile) {
        setProfile({
          ...currentProfile,
          subscription_tier: subscription.plan.tier,
          commission_rate: subscription.plan.commissionRate,
          subscription
        });
      }
    },
    onError: (error) => {
      logger.error('Failed to create subscription:', toError(error), errorToContext(error));
    }
  });
};

/**
 * Hook to update/change subscription
 */
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useProducerStore();
  
  return useMutation({
    mutationFn: ({ 
      subscriptionId, 
      options 
    }: { 
      subscriptionId: ID; 
      options: SubscriptionChangeOptions; 
    }) => {
      return SubscriptionService.updateSubscription(subscriptionId, options);
    },
    onSuccess: (subscription) => {
      // Invalidate subscription queries
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-analytics'] });
      
      // Update producer profile
      const currentProfile = useProducerStore.getState().profile;
      if (currentProfile) {
        setProfile({
          ...currentProfile,
          subscription_tier: subscription.plan.tier,
          commission_rate: subscription.plan.commissionRate,
          subscription
        });
      }
    },
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useProducerStore();
  
  return useMutation({
    mutationFn: ({ 
      subscriptionId, 
      cancelAtPeriodEnd = true 
    }: { 
      subscriptionId: ID; 
      cancelAtPeriodEnd?: boolean; 
    }) => {
      return SubscriptionService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
    },
    onSuccess: (subscription) => {
      // Invalidate subscription queries
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-analytics'] });
      
      // Update producer profile if cancelled immediately
      if (subscription.status === 'cancelled') {
        const currentProfile = useProducerStore.getState().profile;
        if (currentProfile) {
          setProfile({
            ...currentProfile,
            subscription_tier: SubscriptionTier.FREE,
            commission_rate: 12.00,
            subscription
          });
        }
      }
    },
  });
};

/**
 * Hook to get upgrade suggestions
 */
export const useUpgradeSuggestions = (userId: ID) => {
  return useQuery({
    queryKey: ['upgrade-suggestions', userId],
    queryFn: () => SubscriptionService.getUpgradeSuggestions(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to calculate commission breakdown
 */
export const useCommissionCalculation = (price: number, userId: ID, userRole: UserRole = UserRole.CONSUMER) => {
  return useQuery({
    queryKey: ['commission-calculation', price, userId, userRole],
    queryFn: () => SubscriptionService.calculateCommission(price, userId, userRole),
    enabled: !!price && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get payment history
 */
export const usePaymentHistory = (subscriptionId: ID) => {
  return useQuery({
    queryKey: ['payment-history', subscriptionId],
    queryFn: () => SubscriptionService.getPaymentHistory(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to calculate pricing for all tiers (for comparison)
 */
export const usePricingComparison = (basePrice: number) => {
  return useQuery({
    queryKey: ['pricing-comparison', basePrice],
    queryFn: () => SubscriptionService.calculatePricingForAllTiers(basePrice),
    enabled: !!basePrice,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Combined hook for complete subscription state
 */
export const useSubscriptionState = (userId: ID) => {
  const subscription = useUserSubscription(userId);
  const analytics = useSubscriptionAnalytics(userId);
  const upgradeSuggestions = useUpgradeSuggestions(userId);
  
  return {
    subscription: subscription.data,
    analytics: analytics.data,
    upgradeSuggestions: upgradeSuggestions.data,
    isLoading: subscription.isLoading || analytics.isLoading,
    error: subscription.error || analytics.error,
    refetch: () => {
      subscription.refetch();
      analytics.refetch();
      upgradeSuggestions.refetch();
    }
  };
};