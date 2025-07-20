'use client';

// Adoption Plan Selector Component
// Allows users to compare and select adoption plans

import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Euro, 
  Star,
  Calendar,
  Gift
} from 'lucide-react';
import { AdoptionPlan } from '@/lib/api/models/adoption/types';

interface AdoptionPlanSelectorProps {
  plans: AdoptionPlan[];
  selectedPlan?: AdoptionPlan;
  onPlanSelect: (plan: AdoptionPlan) => void;
  className?: string;
}

export const AdoptionPlanSelector: React.FC<AdoptionPlanSelectorProps> = ({
  plans,
  selectedPlan,
  onPlanSelect,
  className = ''
}) => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Δεν υπάρχουν διαθέσιμα πλάνα υιοθεσίας</p>
      </div>
    );
  }

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

  // Find the most popular plan (middle price or marked as featured)
  const popularPlanIndex = Math.floor(sortedPlans.length / 2);

  return (
    <div className={`space-y-4 ${className}`}>
      {sortedPlans.map((plan, index) => {
        const isSelected = selectedPlan?.id === plan.id;
        const isHovered = hoveredPlan === plan.id;
        const isPopular = index === popularPlanIndex && sortedPlans.length > 2;
        const pricePerMonth = plan.price / plan.duration_months;

        return (
          <div
            key={plan.id}
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'border-green-500 bg-green-50'
                : isHovered
                ? 'border-green-300 bg-green-25'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onPlanSelect(plan)}
            onMouseEnter={() => setHoveredPlan(plan.id)}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            {/* Popular Badge */}
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Δημοφιλές
                </div>
              </div>
            )}

            {/* Selection Indicator */}
            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300'
            }`}>
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>

            <div className="pr-8">
              {/* Plan Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {plan.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {plan.description}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    €{plan.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    συνολικά
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    <span>€{pricePerMonth.toFixed(2)}/μήνα</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{plan.duration_months} μήνες</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              {plan.benefits && plan.benefits.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                    Τι περιλαμβάνεται:
                  </h5>
                  <ul className="space-y-1">
                    {plan.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Value Indicators */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Διάρκεια: {plan.duration_months} μήνες</span>
                  {plan.duration_months >= 12 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Gift className="w-3 h-3" />
                      <span>Μακροχρόνια δέσμευση</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Plan Comparison Note */}
      {sortedPlans.length > 1 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Σύγκριση πλάνων</p>
              <p>
                Τα μακροχρόνια πλάνα προσφέρουν καλύτερη αξία και περισσότερα οφέλη. 
                Μπορείτε να ακυρώσετε ανά πάσα στιγμή με πλήρη επιστροφή χρημάτων.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdoptionPlanSelector;
