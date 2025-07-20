'use client';

import React from 'react';
import { SubscriptionPlan, BillingCycle, SubscriptionTier } from '../../lib/api/models/subscription/types';
import { idToString } from '../../lib/api/client/apiTypes';
import { Check, Star } from 'lucide-react';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: (planId: string, billingCycle: BillingCycle) => void;
  isLoading?: boolean;
  currentMonthlyRevenue?: number;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  billingCycle,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  isLoading = false,
  currentMonthlyRevenue = 0
}) => {
  const price = billingCycle === BillingCycle.MONTHLY ? plan.monthlyPrice : plan.yearlyPrice;
  const monthlyPrice = billingCycle === BillingCycle.YEARLY ? plan.yearlyPrice / 12 : plan.monthlyPrice;
  
  // Calculate potential commission savings
  const freeCommissionRate = 12.00;
  const potentialMonthlySavings = currentMonthlyRevenue > 0 
    ? (currentMonthlyRevenue * (freeCommissionRate - plan.commissionRate)) / 100
    : 0;
  const yearlyPotentialSavings = potentialMonthlySavings * 12;
  
  const getCardClasses = () => {
    let classes = "relative rounded-lg border p-6 transition-all duration-200 ";
    
    if (isCurrentPlan) {
      classes += "border-blue-500 bg-blue-50 shadow-md ";
    } else if (isPopular) {
      classes += "border-green-500 bg-green-50 shadow-lg transform scale-105 ";
    } else {
      classes += "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md ";
    }
    
    return classes;
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return "text-gray-600";
      case SubscriptionTier.TIER_1:
        return "text-blue-600";
      case SubscriptionTier.TIER_2:
        return "text-purple-600";
      case SubscriptionTier.BUSINESS:
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={getCardClasses()}>
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" />
            Δημοφιλής επιλογή
          </div>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            Τρέχον πλάνο
          </div>
        </div>
      )}

      {/* Plan header */}
      <div className="text-center mb-6">
        <h3 className={`text-xl font-bold mb-2 ${getTierColor(plan.tier)}`}>
          {plan.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {plan.description}
        </p>
        
        {/* Commission rate highlight */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-3 mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {plan.commissionRate}%
          </div>
          <div className="text-sm text-gray-600">
            προμήθεια
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          {plan.tier === SubscriptionTier.FREE ? (
            <div className="text-3xl font-bold text-gray-900">
              Δωρεάν
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900">
                €{monthlyPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                {billingCycle === BillingCycle.YEARLY ? 'μηνιαίως (ετήσια πληρωμή)' : 'μηνιαίως'}
              </div>
              {billingCycle === BillingCycle.YEARLY && (
                <div className="text-xs text-green-600 font-medium mt-1">
                  Εξοικονόμηση {(((plan.monthlyPrice * 12) - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100).toFixed(0)}%
                </div>
              )}
            </>
          )}
        </div>

        {/* Potential savings display */}
        {potentialMonthlySavings > 0 && plan.tier !== SubscriptionTier.FREE && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-yellow-800">
              Δυνητική εξοικονόμηση
            </div>
            <div className="text-lg font-bold text-yellow-900">
              €{potentialMonthlySavings.toFixed(2)}/μήνα
            </div>
            <div className="text-xs text-yellow-700">
              €{yearlyPotentialSavings.toFixed(2)}/έτος σε προμήθειες
            </div>
          </div>
        )}
      </div>

      {/* Features list */}
      <div className="mb-6">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action button */}
      <div className="mt-auto">
        {isCurrentPlan ? (
          <button 
            disabled 
            className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            Ενεργό πλάνο
          </button>
        ) : (
          <button
            onClick={() => onSelect(idToString(plan.id), billingCycle)}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            {isLoading ? 'Επεξεργασία...' : `Επιλογή ${plan.name}`}
          </button>
        )}
      </div>

      {/* ROI indicator for paid plans */}
      {potentialMonthlySavings > monthlyPrice && plan.tier !== SubscriptionTier.FREE && (
        <div className="mt-3 text-center">
          <div className="text-xs text-green-600 font-medium">
            ROI: {(((potentialMonthlySavings - monthlyPrice) / monthlyPrice) * 100).toFixed(0)}% μηνιαίως
          </div>
        </div>
      )}
    </div>
  );
};