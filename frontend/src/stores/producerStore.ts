'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SubscriptionTier, UserSubscription, SubscriptionAnalytics } from '../lib/api/models/subscription/types';

interface ProducerProfile {
  id: number;
  business_name: string;
  tax_number: string;
  description: string;
  specialties: string[];
  location_city: string;
  location_region: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  trust_level: 'new' | 'trusted' | 'premium';
  commission_rate: number;
  subscription_tier: SubscriptionTier;
  subscription?: UserSubscription;
}

interface ProducerStats {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  this_month_revenue: number;
  average_rating: number;
  total_reviews: number;
}

interface ProducerState {
  profile: ProducerProfile | null;
  stats: ProducerStats | null;
  analytics: SubscriptionAnalytics | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: ProducerProfile) => void;
  setStats: (stats: ProducerStats) => void;
  setAnalytics: (analytics: SubscriptionAnalytics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProducerData: () => void;
  
  // Commission helpers
  getCurrentCommissionRate: () => number;
  getSubscriptionTier: () => SubscriptionTier;
}

export const useProducerStore = create<ProducerState>()(
  persist(
    (set, get) => ({
      profile: null,
      stats: null,
      analytics: null,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile, error: null }),
      setStats: (stats) => set({ stats, error: null }),
      setAnalytics: (analytics) => set({ analytics, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearProducerData: () => set({ 
        profile: null, 
        stats: null, 
        analytics: null,
        error: null 
      }),

      getCurrentCommissionRate: () => {
        const { profile } = get();
        return profile?.commission_rate || 12.00; // Default to free tier rate
      },

      getSubscriptionTier: () => {
        const { profile } = get();
        return profile?.subscription_tier || SubscriptionTier.FREE;
      },
    }),
    {
      name: 'producer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        profile: state.profile,
        stats: state.stats,
        analytics: state.analytics
      }),
    }
  )
);

// Hooks for easier access
export const useProducerProfile = () => useProducerStore((state) => state.profile);
export const useProducerStats = () => useProducerStore((state) => state.stats);
export const useProducerAnalytics = () => useProducerStore((state) => state.analytics);
export const useProducerLoading = () => useProducerStore((state) => state.isLoading);
export const useProducerError = () => useProducerStore((state) => state.error);
export const useCurrentCommissionRate = () => useProducerStore((state) => state.getCurrentCommissionRate());
export const useSubscriptionTier = () => useProducerStore((state) => state.getSubscriptionTier());