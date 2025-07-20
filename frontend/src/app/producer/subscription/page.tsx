'use client';

import React, { useEffect, useState } from 'react';
import { SubscriptionDashboard } from '../../../components/subscription/SubscriptionDashboard';
import { PricingCalculator } from '../../../components/pricing/PricingCalculator';
import { UserRole } from '../../../lib/api/models/auth/types';
import { useProducerProfile } from '../../../stores/producerStore';

export default function ProducerSubscriptionPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const profile = mounted ? useProducerProfile() : null;
  
  // Mock user ID - in real app this would come from auth context
  const userId = profile?.id?.toString() || '1';

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Διαχείριση Συνδρομής
          </h1>
          <p className="text-gray-600">
            Παρακολουθήστε και βελτιστοποιήστε τη συνδρομή και τα κέρδη σας
          </p>
        </div>

        {/* Subscription dashboard */}
        <SubscriptionDashboard 
          userId={userId}
          userRole={UserRole.PRODUCER}
        />

        {/* Divider */}
        <div className="my-12 border-t border-gray-200"></div>

        {/* Pricing calculator */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Υπολογιστής Τιμολόγησης
          </h2>
          <p className="text-gray-600 mb-6">
            Υπολογίστε τις προμήθειες και εξοικονομήσεις για διαφορετικές τιμές προϊόντων
          </p>
        </div>

        <PricingCalculator userId={userId} />
      </div>
    </div>
  );
}