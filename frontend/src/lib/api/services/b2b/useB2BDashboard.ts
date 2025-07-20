'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../client/apiClient';

// ===== TYPES =====

export interface B2BDashboardStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
  monthlySpent: number;
  averageOrderValue: number;
  currentMonthOrders: number;
  previousMonthOrders: number;
  growthPercentage: number;
}

export interface B2BRecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  supplier: string;
}

export interface B2BSubscriptionInfo {
  plan: {
    name: string;
    commissionRate: number;
  };
  status: string;
  endDate: string;
  isActive: boolean;
}

export interface B2BDashboardData {
  stats: B2BDashboardStats;
  recentOrders: B2BRecentOrder[];
  subscription: B2BSubscriptionInfo | null;
}

// ===== QUERY KEYS =====

export const B2B_DASHBOARD_QUERY_KEYS = {
  dashboard: ['b2b', 'dashboard'] as const,
  stats: ['b2b', 'dashboard', 'stats'] as const,
  recentOrders: ['b2b', 'dashboard', 'recent-orders'] as const,
  subscription: ['b2b', 'dashboard', 'subscription'] as const,
};

// ===== API ENDPOINTS =====

const B2B_DASHBOARD_ENDPOINTS = {
  STATS: '/api/laravel/business/dashboard/stats',
  RECENT_ORDERS: '/api/laravel/business/dashboard/recent-orders',
  SUBSCRIPTION: '/api/laravel/business/dashboard/subscription',
};

// ===== HOOKS =====

/**
 * Hook to fetch B2B dashboard statistics
 */
export function useB2BDashboardStats() {
  return useQuery({
    queryKey: B2B_DASHBOARD_QUERY_KEYS.stats,
    queryFn: async (): Promise<B2BDashboardStats> => {
      try {
        const response = await fetch(B2B_DASHBOARD_ENDPOINTS.STATS);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API response to frontend format
        const stats: B2BDashboardStats = {
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || 0,
          pendingOrders: data.pendingOrders || 0,
          completedOrders: data.totalOrders - data.pendingOrders || 0,
          monthlySpent: data.totalSpent || 0,
          averageOrderValue: data.averageOrderValue || 0,
          currentMonthOrders: data.totalOrders || 0,
          previousMonthOrders: 0,
          growthPercentage: 0,
        };

        return stats;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch B2B recent orders
 */
export function useB2BRecentOrders(limit: number = 5) {
  return useQuery({
    queryKey: [...B2B_DASHBOARD_QUERY_KEYS.recentOrders, limit],
    queryFn: async (): Promise<B2BRecentOrder[]> => {
      try {
        const response = await fetch(B2B_DASHBOARD_ENDPOINTS.STATS);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API response to frontend format
        const recentOrders: B2BRecentOrder[] = data?.recentOrders?.map((order: any) => ({
          id: order.id,
          orderNumber: order.id,
          date: order.date,
          status: order.status as B2BRecentOrder['status'],
          total: order.total,
          items: order.items || 0,
          supplier: order.supplier || 'Unknown Supplier',
        })) || [];

        return recentOrders;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch B2B subscription information
 */
export function useB2BSubscription() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: B2B_DASHBOARD_QUERY_KEYS.subscription,
    queryFn: async (): Promise<B2BSubscriptionInfo | null> => {
      try {
        const response = await apiClient.get<{
          subscription: {
            plan: {
              name: string;
              commission_rate: number;
            };
            status: string;
            end_date: string;
          } | null;
        }>(B2B_DASHBOARD_ENDPOINTS.SUBSCRIPTION);

        if (!response.data.subscription) {
          return null;
        }

        // Transform Laravel response to frontend format
        const subscription: B2BSubscriptionInfo = {
          plan: {
            name: response.data.subscription.plan.name,
            commissionRate: response.data.subscription.plan.commission_rate,
          },
          status: response.data.subscription.status,
          endDate: response.data.subscription.end_date,
          isActive: response.data.subscription.status === 'active',
        };

        return subscription;
      } catch (error) {
        return null; // Return null instead of throwing for subscription info
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Combined hook to fetch all B2B dashboard data
 */
export function useB2BDashboard() {
  const statsQuery = useB2BDashboardStats();
  const recentOrdersQuery = useB2BRecentOrders();
  const subscriptionQuery = useB2BSubscription();

  return {
    data: {
      stats: statsQuery.data,
      recentOrders: recentOrdersQuery.data,
      subscription: subscriptionQuery.data,
    },
    isLoading: statsQuery.isLoading || recentOrdersQuery.isLoading || subscriptionQuery.isLoading,
    isError: statsQuery.isError || recentOrdersQuery.isError,
    error: statsQuery.error || recentOrdersQuery.error,
    refetch: () => {
      statsQuery.refetch();
      recentOrdersQuery.refetch();
      subscriptionQuery.refetch();
    },
  };
}

/**
 * Hook to refresh dashboard data
 */
export function useRefreshB2BDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all B2B dashboard queries
      await queryClient.invalidateQueries({
        queryKey: B2B_DASHBOARD_QUERY_KEYS.dashboard,
      });
    },
  });
}
