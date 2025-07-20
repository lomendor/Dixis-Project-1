/**
 * Subscription System Types for Dixis Fresh Marketplace
 */

import { ID } from '../../client/apiTypes';
import { UserRole } from '../auth/types';

/**
 * Subscription tier enumeration based on commission structure
 */
export enum SubscriptionTier {
  FREE = 'free',       // 12% commission
  TIER_1 = 'tier_1',   // 9% commission
  TIER_2 = 'tier_2',   // 7% commission
  BUSINESS = 'business' // 0% commission for business buyers
}

/**
 * Billing cycle options
 */
export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

/**
 * Subscription status
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
  PENDING = 'pending',
  PAST_DUE = 'past_due'
}

/**
 * Commission rates for each tier
 */
export const COMMISSION_RATES = {
  [SubscriptionTier.FREE]: 12.00,
  [SubscriptionTier.TIER_1]: 9.00,
  [SubscriptionTier.TIER_2]: 7.00,
  [SubscriptionTier.BUSINESS]: 0.00
} as const;

/**
 * Subscription plan interface
 */
export interface SubscriptionPlan {
  id: ID;
  name: string;
  description: string;
  tier: SubscriptionTier;
  userType: UserRole;
  monthlyPrice: number;
  yearlyPrice: number;
  commissionRate: number;
  features: string[];
  maxProducts?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * User subscription interface
 */
export interface UserSubscription {
  id: ID;
  userId: ID;
  planId: ID;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  trialEnd?: string;
  stripeSubscriptionId?: string;
  lastPaymentAt?: string;
  nextBillingDate?: string;
  gracePeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscription analytics interface
 */
export interface SubscriptionAnalytics {
  userId: ID;
  currentTier: SubscriptionTier;
  commissionRate: number;
  monthlyCommissionSaved: number;
  yearlyCommissionSaved: number;
  totalCommissionPaid: number;
  totalCommissionSaved: number;
  subscriptionValue: number;
  roi: number; // Return on investment percentage
  monthlyRevenue: number;
  projectedYearlyRevenue: number;
}

/**
 * Commission breakdown for transparent pricing
 */
export interface CommissionBreakdown {
  producerPrice: number;
  commissionAmount: number;
  commissionRate: number;
  vatAmount: number;
  totalPrice: number;
  producerEarnings: number;
}

/**
 * Subscription upgrade/downgrade options
 */
export interface SubscriptionChangeOptions {
  fromPlanId: ID;
  toPlanId: ID;
  billingCycle: BillingCycle;
  effectiveDate: 'immediate' | 'next_billing_cycle';
  prorationAmount?: number;
}

/**
 * Subscription payment history
 */
export interface SubscriptionPayment {
  id: ID;
  subscriptionId: ID;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paidAt?: string;
  createdAt: string;
}

/**
 * Subscription benefits for each tier
 */
export interface SubscriptionBenefits {
  tier: SubscriptionTier;
  commissionRate: number;
  features: {
    prioritySupport: boolean;
    analytics: boolean;
    bulkUpload: boolean;
    customBranding: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    dedicatedManager: boolean;
  };
  limits: {
    maxProducts?: number;
    maxOrdersPerMonth?: number;
    storageLimit?: number; // in GB
  };
}

/**
 * Default subscription benefits configuration
 */
export const SUBSCRIPTION_BENEFITS: Record<SubscriptionTier, SubscriptionBenefits> = {
  [SubscriptionTier.FREE]: {
    tier: SubscriptionTier.FREE,
    commissionRate: 12.00,
    features: {
      prioritySupport: false,
      analytics: false,
      bulkUpload: false,
      customBranding: false,
      advancedReporting: false,
      apiAccess: false,
      dedicatedManager: false
    },
    limits: {
      maxProducts: 10,
      maxOrdersPerMonth: 50,
      storageLimit: 1
    }
  },
  [SubscriptionTier.TIER_1]: {
    tier: SubscriptionTier.TIER_1,
    commissionRate: 9.00,
    features: {
      prioritySupport: true,
      analytics: true,
      bulkUpload: true,
      customBranding: false,
      advancedReporting: false,
      apiAccess: false,
      dedicatedManager: false
    },
    limits: {
      maxProducts: 50,
      maxOrdersPerMonth: 200,
      storageLimit: 5
    }
  },
  [SubscriptionTier.TIER_2]: {
    tier: SubscriptionTier.TIER_2,
    commissionRate: 7.00,
    features: {
      prioritySupport: true,
      analytics: true,
      bulkUpload: true,
      customBranding: true,
      advancedReporting: true,
      apiAccess: true,
      dedicatedManager: false
    },
    limits: {
      storageLimit: 20
    }
  },
  [SubscriptionTier.BUSINESS]: {
    tier: SubscriptionTier.BUSINESS,
    commissionRate: 0.00,
    features: {
      prioritySupport: true,
      analytics: true,
      bulkUpload: true,
      customBranding: true,
      advancedReporting: true,
      apiAccess: true,
      dedicatedManager: true
    },
    limits: {
      storageLimit: 100
    }
  }
};

/**
 * Subscription API endpoints
 */
export interface SubscriptionEndpoints {
  getPlans: () => Promise<SubscriptionPlan[]>;
  getUserSubscription: (userId: ID) => Promise<UserSubscription | null>;
  createSubscription: (planId: ID, billingCycle: BillingCycle) => Promise<UserSubscription>;
  updateSubscription: (subscriptionId: ID, options: SubscriptionChangeOptions) => Promise<UserSubscription>;
  cancelSubscription: (subscriptionId: ID, cancelAtPeriodEnd: boolean) => Promise<UserSubscription>;
  getSubscriptionAnalytics: (userId: ID) => Promise<SubscriptionAnalytics>;
  getPaymentHistory: (subscriptionId: ID) => Promise<SubscriptionPayment[]>;
  calculateCommission: (price: number, userId: ID) => Promise<CommissionBreakdown>;
}

/**
 * Subscription pricing calculation utilities
 */
export interface PricingCalculation {
  basePrice: number;
  tier: SubscriptionTier;
  commissionRate: number;
  commissionAmount: number;
  netEarnings: number;
  potentialSavings: {
    monthly: number;
    yearly: number;
  };
}

/**
 * Subscription trial configuration
 */
export interface TrialConfig {
  enabled: boolean;
  durationDays: number;
  tier: SubscriptionTier;
  autoConvertToPaid: boolean;
}

/**
 * Grace period configuration
 */
export interface GracePeriodConfig {
  enabled: boolean;
  durationDays: number;
  allowNewOrders: boolean;
  showWarnings: boolean;
}

/**
 * Subscription notification preferences
 */
export interface SubscriptionNotifications {
  billingReminders: boolean;
  planExpiration: boolean;
  upgradeSuggestions: boolean;
  commissionSavings: boolean;
  paymentFailed: boolean;
}