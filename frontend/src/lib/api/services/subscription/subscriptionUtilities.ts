/**
 * Subscription utility functions for Dixis Fresh Marketplace
 */

import { 
  SubscriptionStatus, 
  SubscriptionTier, 
  UserSubscription,
  BillingCycle,
  GracePeriodConfig,
  TrialConfig,
  COMMISSION_RATES
} from '../../models/subscription/types';

/**
 * Grace period configuration
 */
export const GRACE_PERIOD_CONFIG: GracePeriodConfig = {
  enabled: true,
  durationDays: 7, // 7 days grace period
  allowNewOrders: true, // Allow orders during grace period
  showWarnings: true // Show warnings to user
};

/**
 * Trial configuration
 */
export const TRIAL_CONFIG: TrialConfig = {
  enabled: true,
  durationDays: 14, // 14-day trial
  tier: SubscriptionTier.TIER_1, // Give Tier 1 benefits during trial
  autoConvertToPaid: false // Require explicit conversion
};

/**
 * Subscription utilities class
 */
export class SubscriptionUtilities {
  /**
   * Check if subscription is in grace period
   */
  static isInGracePeriod(subscription: UserSubscription): boolean {
    if (!subscription.gracePeriodEnd) return false;
    
    const now = new Date();
    const gracePeriodEnd = new Date(subscription.gracePeriodEnd);
    
    return now <= gracePeriodEnd;
  }

  /**
   * Check if subscription is expiring soon
   */
  static isExpiringSoon(subscription: UserSubscription, daysThreshold: number = 7): boolean {
    if (!subscription.currentPeriodEnd) return false;
    
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const daysUntilExpiry = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
  }

  /**
   * Check if trial is expiring soon
   */
  static isTrialExpiringSoon(subscription: UserSubscription, daysThreshold: number = 3): boolean {
    if (subscription.status !== SubscriptionStatus.TRIAL || !subscription.trialEnd) return false;
    
    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const daysUntilExpiry = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
  }

  /**
   * Calculate days remaining in current period
   */
  static getDaysRemainingInPeriod(subscription: UserSubscription): number {
    if (!subscription.currentPeriodEnd) return 0;
    
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    
    return Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  /**
   * Calculate days remaining in grace period
   */
  static getDaysRemainingInGracePeriod(subscription: UserSubscription): number {
    if (!subscription.gracePeriodEnd) return 0;
    
    const now = new Date();
    const gracePeriodEnd = new Date(subscription.gracePeriodEnd);
    
    return Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  /**
   * Get effective commission rate considering grace periods and trials
   */
  static getEffectiveCommissionRate(subscription: UserSubscription | null): number {
    if (!subscription) return COMMISSION_RATES[SubscriptionTier.FREE];
    
    // During grace period, maintain current tier benefits
    if (this.isInGracePeriod(subscription)) {
      return subscription.plan.commissionRate;
    }
    
    // During trial, use trial tier benefits
    if (subscription.status === SubscriptionStatus.TRIAL) {
      return COMMISSION_RATES[TRIAL_CONFIG.tier];
    }
    
    // For expired or cancelled subscriptions, revert to free tier
    if ([SubscriptionStatus.EXPIRED, SubscriptionStatus.CANCELLED].includes(subscription.status)) {
      return COMMISSION_RATES[SubscriptionTier.FREE];
    }
    
    // For past due subscriptions, check grace period
    if (subscription.status === SubscriptionStatus.PAST_DUE) {
      if (GRACE_PERIOD_CONFIG.enabled && this.isInGracePeriod(subscription)) {
        return subscription.plan.commissionRate;
      }
      return COMMISSION_RATES[SubscriptionTier.FREE];
    }
    
    return subscription.plan.commissionRate;
  }

  /**
   * Check if user can place orders (considering grace periods)
   */
  static canPlaceOrders(subscription: UserSubscription | null): boolean {
    if (!subscription) return true; // Free tier can always place orders
    
    if (subscription.status === SubscriptionStatus.ACTIVE) return true;
    
    if (subscription.status === SubscriptionStatus.TRIAL) return true;
    
    // During grace period, allow orders if configured
    if (subscription.status === SubscriptionStatus.PAST_DUE) {
      return GRACE_PERIOD_CONFIG.enabled && 
             GRACE_PERIOD_CONFIG.allowNewOrders && 
             this.isInGracePeriod(subscription);
    }
    
    return false; // Expired or cancelled subscriptions cannot place orders
  }

  /**
   * Get subscription status display text
   */
  static getStatusDisplayText(subscription: UserSubscription): string {
    switch (subscription.status) {
      case SubscriptionStatus.ACTIVE:
        if (subscription.cancelAtPeriodEnd) {
          return `Ακυρώνεται στο τέλος της περιόδου (${this.getDaysRemainingInPeriod(subscription)} ημέρες)`;
        }
        return 'Ενεργό';
      
      case SubscriptionStatus.TRIAL:
        const trialDaysLeft = subscription.trialEnd 
          ? Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0;
        return `Δοκιμαστικό (${trialDaysLeft} ημέρες απομένουν)`;
      
      case SubscriptionStatus.PAST_DUE:
        if (this.isInGracePeriod(subscription)) {
          return `Εκπρόθεσμο - Περίοδος χάριτος (${this.getDaysRemainingInGracePeriod(subscription)} ημέρες)`;
        }
        return 'Εκπρόθεσμο';
      
      case SubscriptionStatus.CANCELLED:
        return 'Ακυρωμένο';
      
      case SubscriptionStatus.EXPIRED:
        return 'Ληγμένο';
      
      default:
        return 'Άγνωστο';
    }
  }

  /**
   * Calculate next billing date based on current period and cycle
   */
  static calculateNextBillingDate(currentPeriodEnd: string, billingCycle: BillingCycle): Date {
    const periodEnd = new Date(currentPeriodEnd);
    
    if (billingCycle === BillingCycle.MONTHLY) {
      return new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, periodEnd.getDate());
    } else {
      return new Date(periodEnd.getFullYear() + 1, periodEnd.getMonth(), periodEnd.getDate());
    }
  }

  /**
   * Calculate grace period end date
   */
  static calculateGracePeriodEnd(lastBillingDate: string): Date {
    const lastBilling = new Date(lastBillingDate);
    const gracePeriodEnd = new Date(lastBilling);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_CONFIG.durationDays);
    
    return gracePeriodEnd;
  }

  /**
   * Calculate trial end date
   */
  static calculateTrialEnd(startDate: string): Date {
    const start = new Date(startDate);
    const trialEnd = new Date(start);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_CONFIG.durationDays);
    
    return trialEnd;
  }

  /**
   * Get upgrade suggestions based on usage
   */
  static getUpgradeSuggestions(
    currentTier: SubscriptionTier,
    monthlyRevenue: number,
    currentSubscriptionCost: number
  ): {
    shouldUpgrade: boolean;
    suggestedTier?: SubscriptionTier;
    potentialSavings?: number;
    reason?: string;
  } {
    const freeCommissionRate = COMMISSION_RATES[SubscriptionTier.FREE];
    
    // Calculate potential savings for each tier
    const tier1Rate = COMMISSION_RATES[SubscriptionTier.TIER_1];
    const tier2Rate = COMMISSION_RATES[SubscriptionTier.TIER_2];
    
    const tier1MonthlySavings = (monthlyRevenue * (freeCommissionRate - tier1Rate)) / 100;
    const tier2MonthlySavings = (monthlyRevenue * (freeCommissionRate - tier2Rate)) / 100;
    
    // Tier 1 subscription costs
    const tier1MonthlyCost = 29.99;
    const tier2MonthlyCost = 59.99;
    
    if (currentTier === SubscriptionTier.FREE) {
      if (tier1MonthlySavings > tier1MonthlyCost) {
        return {
          shouldUpgrade: true,
          suggestedTier: SubscriptionTier.TIER_1,
          potentialSavings: tier1MonthlySavings - tier1MonthlyCost,
          reason: `Εξοικονομήστε €${(tier1MonthlySavings - tier1MonthlyCost).toFixed(2)} μηνιαίως`
        };
      }
    } else if (currentTier === SubscriptionTier.TIER_1) {
      const additionalSavings = tier2MonthlySavings - tier1MonthlySavings;
      const additionalCost = tier2MonthlyCost - tier1MonthlyCost;
      
      if (additionalSavings > additionalCost) {
        return {
          shouldUpgrade: true,
          suggestedTier: SubscriptionTier.TIER_2,
          potentialSavings: additionalSavings - additionalCost,
          reason: `Εξοικονομήστε επιπλέον €${(additionalSavings - additionalCost).toFixed(2)} μηνιαίως`
        };
      }
    }
    
    return { shouldUpgrade: false };
  }

  /**
   * Validate subscription change
   */
  static validateSubscriptionChange(
    currentSubscription: UserSubscription,
    newTier: SubscriptionTier
  ): { isValid: boolean; error?: string } {
    // Cannot downgrade during trial
    if (currentSubscription.status === SubscriptionStatus.TRIAL) {
      return {
        isValid: false,
        error: 'Δεν μπορείτε να αλλάξετε πλάνο κατά τη διάρκεια της δοκιμαστικής περιόδου'
      };
    }
    
    // Cannot change to same tier
    if (currentSubscription.plan.tier === newTier) {
      return {
        isValid: false,
        error: 'Το επιλεγμένο πλάνο είναι το ίδιο με το τρέχον'
      };
    }
    
    return { isValid: true };
  }
}