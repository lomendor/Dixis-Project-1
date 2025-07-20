/**
 * Subscription Service for Dixis Fresh Marketplace
 */

import { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionAnalytics,
  CommissionBreakdown,
  SubscriptionTier,
  BillingCycle,
  SubscriptionStatus,
  SubscriptionChangeOptions,
  SubscriptionPayment,
  COMMISSION_RATES,
  PricingCalculation
} from '../../models/subscription/types';
import { ID } from '../../client/apiTypes';
import { UserRole } from '../../models/auth/types';

/**
 * Mock data for subscription plans
 */
const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Δωρεάν',
    description: 'Ιδανικό για νέους παραγωγούς που ξεκινούν',
    tier: SubscriptionTier.FREE,
    userType: UserRole.PRODUCER,
    monthlyPrice: 0,
    yearlyPrice: 0,
    commissionRate: 12.00,
    features: [
      'Έως 10 προϊόντα',
      'Βασική υποστήριξη',
      'Στατιστικά πωλήσεων',
      'Διαχείριση παραγγελιών'
    ],
    maxProducts: 10,
    isActive: true,
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Παραγωγός Pro',
    description: 'Για παραγωγούς που θέλουν να αναπτύξουν την επιχείρησή τους',
    tier: SubscriptionTier.TIER_1,
    userType: UserRole.PRODUCER,
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    commissionRate: 9.00,
    features: [
      'Έως 50 προϊόντα',
      'Προτεραιότητα στην υποστήριξη',
      'Αναλυτικά στατιστικά',
      'Μαζική μεταφόρτωση προϊόντων',
      'Εξαγωγή δεδομένων'
    ],
    maxProducts: 50,
    isActive: true,
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Παραγωγός Premium',
    description: 'Για επαγγελματίες παραγωγούς με υψηλές πωλήσεις',
    tier: SubscriptionTier.TIER_2,
    userType: UserRole.PRODUCER,
    monthlyPrice: 59.99,
    yearlyPrice: 599.99,
    commissionRate: 7.00,
    features: [
      'Απεριόριστα προϊόντα',
      'VIP υποστήριξη',
      'Προχωρημένα αναλυτικά',
      'Προσαρμοσμένο branding',
      'API πρόσβαση',
      'Προσωπικός σύμβουλος'
    ],
    isActive: true,
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Επιχείρηση',
    description: 'Για εστιατόρια, ξενοδοχεία και λιανικές επιχειρήσεις',
    tier: SubscriptionTier.BUSINESS,
    userType: UserRole.BUSINESS,
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    commissionRate: 0.00,
    features: [
      '0% προμήθεια',
      'Προτεραιότητα στις παραγγελίες',
      'Ειδικές τιμές χονδρικής',
      'Πιστωτικοί όροι πληρωμής',
      'Προσωπικός account manager',
      'Συμβόλαια με παραγωγούς'
    ],
    isActive: true,
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * Subscription service implementation
 */
export class SubscriptionService {
  /**
   * Get all available subscription plans
   */
  static async getPlans(userType?: UserRole): Promise<SubscriptionPlan[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const plans = MOCK_SUBSCRIPTION_PLANS.filter(plan => 
      userType ? plan.userType === userType : true
    );
    
    return plans.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: ID): Promise<UserSubscription | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data - in real implementation, this would fetch from database
    const mockSubscription: UserSubscription = {
      id: '1',
      userId,
      planId: '1', // Free plan by default
      plan: MOCK_SUBSCRIPTION_PLANS[0],
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.MONTHLY,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return mockSubscription;
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(
    userId: ID,
    planId: ID,
    billingCycle: BillingCycle
  ): Promise<UserSubscription> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const plan = MOCK_SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    
    const now = new Date();
    const endDate = new Date(now);
    if (billingCycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    const subscription: UserSubscription = {
      id: Date.now().toString(),
      userId,
      planId,
      plan,
      status: SubscriptionStatus.ACTIVE,
      billingCycle,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: endDate.toISOString(),
      cancelAtPeriodEnd: false,
      nextBillingDate: endDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    return subscription;
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  static async updateSubscription(
    subscriptionId: ID,
    options: SubscriptionChangeOptions
  ): Promise<UserSubscription> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPlan = MOCK_SUBSCRIPTION_PLANS.find(p => p.id === options.toPlanId);
    if (!newPlan) {
      throw new Error('Target subscription plan not found');
    }
    
    // Mock updated subscription
    const updatedSubscription: UserSubscription = {
      id: subscriptionId,
      userId: '1', // Mock user ID
      planId: options.toPlanId,
      plan: newPlan,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: options.billingCycle,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    subscriptionId: ID,
    cancelAtPeriodEnd: boolean = true
  ): Promise<UserSubscription> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock cancelled subscription
    const cancelledSubscription: UserSubscription = {
      id: subscriptionId,
      userId: '1',
      planId: '1',
      plan: MOCK_SUBSCRIPTION_PLANS[0],
      status: cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELLED,
      billingCycle: BillingCycle.MONTHLY,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd,
      cancelledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return cancelledSubscription;
  }

  /**
   * Calculate commission breakdown for transparent pricing
   */
  static async calculateCommission(
    price: number,
    userId: ID,
    userRole: UserRole = UserRole.CONSUMER
  ): Promise<CommissionBreakdown> {
    // Get user's subscription to determine commission rate
    const subscription = await this.getUserSubscription(userId);
    
    let commissionRate = COMMISSION_RATES[SubscriptionTier.FREE]; // Default rate
    
    if (subscription && subscription.status === 'active') {
      commissionRate = Number(subscription.plan.commissionRate);
    }
    
    // Business users with subscription get 0% commission
    if (userRole === UserRole.BUSINESS && subscription) {
      commissionRate = 0;
    }
    
    const commissionAmount = (price * commissionRate) / 100;
    const vatRate = 24; // Greece VAT rate
    const vatAmount = (price * vatRate) / 100;
    const totalPrice = price + commissionAmount + vatAmount;
    const producerEarnings = price - commissionAmount;
    
    return {
      producerPrice: price,
      commissionAmount,
      commissionRate,
      vatAmount,
      totalPrice,
      producerEarnings
    };
  }

  /**
   * Get subscription analytics for a user
   */
  static async getSubscriptionAnalytics(userId: ID): Promise<SubscriptionAnalytics> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subscription = await this.getUserSubscription(userId);
    const currentTier = subscription?.plan.tier || SubscriptionTier.FREE;
    const commissionRate = subscription?.plan.commissionRate || COMMISSION_RATES[SubscriptionTier.FREE];
    
    // Mock analytics data
    const monthlyRevenue = 2500;
    const freeCommissionRate = COMMISSION_RATES[SubscriptionTier.FREE];
    const monthlyCommissionSaved = (monthlyRevenue * (freeCommissionRate - commissionRate)) / 100;
    const yearlyCommissionSaved = monthlyCommissionSaved * 12;
    const subscriptionCost = subscription?.billingCycle === BillingCycle.YEARLY 
      ? subscription.plan.yearlyPrice 
      : (subscription?.plan.monthlyPrice || 0) * 12;
    
    const analytics: SubscriptionAnalytics = {
      userId,
      currentTier,
      commissionRate,
      monthlyCommissionSaved,
      yearlyCommissionSaved,
      totalCommissionPaid: monthlyRevenue * commissionRate / 100,
      totalCommissionSaved: yearlyCommissionSaved,
      subscriptionValue: yearlyCommissionSaved - subscriptionCost,
      roi: subscriptionCost > 0 ? ((yearlyCommissionSaved - subscriptionCost) / subscriptionCost) * 100 : 0,
      monthlyRevenue,
      projectedYearlyRevenue: monthlyRevenue * 12
    };
    
    return analytics;
  }

  /**
   * Calculate pricing with different subscription tiers
   */
  static calculatePricingForAllTiers(basePrice: number): Record<SubscriptionTier, PricingCalculation> {
    const calculations: Record<SubscriptionTier, PricingCalculation> = {} as any;
    
    Object.entries(COMMISSION_RATES).forEach(([tier, rate]) => {
      const commissionAmount = (basePrice * rate) / 100;
      const netEarnings = basePrice - commissionAmount;
      
      // Calculate potential savings compared to free tier
      const freeCommissionAmount = (basePrice * COMMISSION_RATES[SubscriptionTier.FREE]) / 100;
      const monthlySavings = freeCommissionAmount - commissionAmount;
      
      calculations[tier as SubscriptionTier] = {
        basePrice,
        tier: tier as SubscriptionTier,
        commissionRate: rate,
        commissionAmount,
        netEarnings,
        potentialSavings: {
          monthly: monthlySavings,
          yearly: monthlySavings * 12
        }
      };
    });
    
    return calculations;
  }

  /**
   * Get payment history for a subscription
   */
  static async getPaymentHistory(subscriptionId: ID): Promise<SubscriptionPayment[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock payment history
    const payments: SubscriptionPayment[] = [
      {
        id: '1',
        subscriptionId,
        amount: 29.99,
        currency: 'EUR',
        status: 'completed',
        paymentMethod: 'card',
        billingPeriodStart: '2024-01-01',
        billingPeriodEnd: '2024-02-01',
        paidAt: '2024-01-01T10:00:00Z',
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        subscriptionId,
        amount: 29.99,
        currency: 'EUR',
        status: 'completed',
        paymentMethod: 'card',
        billingPeriodStart: '2024-02-01',
        billingPeriodEnd: '2024-03-01',
        paidAt: '2024-02-01T10:00:00Z',
        createdAt: '2024-02-01T10:00:00Z'
      }
    ];
    
    return payments;
  }

  /**
   * Check if user is eligible for upgrade suggestions
   */
  static async getUpgradeSuggestions(userId: ID): Promise<{
    shouldSuggestUpgrade: boolean;
    suggestedPlan?: SubscriptionPlan;
    potentialSavings?: number;
    reasoning?: string;
  }> {
    const analytics = await this.getSubscriptionAnalytics(userId);
    const subscription = await this.getUserSubscription(userId);
    
    // Don't suggest upgrade if already on highest tier
    if (subscription?.plan.tier === SubscriptionTier.TIER_2) {
      return { shouldSuggestUpgrade: false };
    }
    
    // Suggest upgrade if monthly commission savings would exceed subscription cost
    const nextTierPlan = MOCK_SUBSCRIPTION_PLANS.find(plan => 
      plan.userType === UserRole.PRODUCER && 
      plan.tier === (subscription?.plan.tier === SubscriptionTier.FREE ? SubscriptionTier.TIER_1 : SubscriptionTier.TIER_2)
    );
    
    if (!nextTierPlan) {
      return { shouldSuggestUpgrade: false };
    }
    
    const monthlySubscriptionCost = nextTierPlan.monthlyPrice;
    const potentialMonthlySavings = analytics.monthlyCommissionSaved;
    
    if (potentialMonthlySavings > monthlySubscriptionCost) {
      return {
        shouldSuggestUpgrade: true,
        suggestedPlan: nextTierPlan,
        potentialSavings: potentialMonthlySavings - monthlySubscriptionCost,
        reasoning: `Θα εξοικονομήσετε €${(potentialMonthlySavings - monthlySubscriptionCost).toFixed(2)} μηνιαίως`
      };
    }
    
    return { shouldSuggestUpgrade: false };
  }
}