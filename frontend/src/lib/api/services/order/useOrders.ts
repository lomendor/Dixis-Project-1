'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../client/apiClient';
import { 
  Order,
  CreateOrderData,
  UpdateOrderData,
  OrderFilters,
  OrderStats,
  CheckoutSession,
  OrderStatus,
  PaymentStatus,
  OrderNotification
} from '../../models/order/types';
import { useOfflineSupport } from '../useOfflineSupport';
import { tokenUtils } from '../auth/useAuth';
import toast from 'react-hot-toast';

// Query keys for order operations
export const ORDER_QUERY_KEYS = {
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  userOrders: (userId: string) => ['orders', 'user', userId] as const,
  orderStats: ['orders', 'stats'] as const,
  checkout: ['checkout'] as const,
  notifications: ['orders', 'notifications'] as const,
};

// API endpoints
const ORDER_ENDPOINTS = {
  ORDERS: '/api/orders',
  ORDER: (id: string) => `/api/orders/${id}`,
  USER_ORDERS: (userId: string) => `/api/users/${userId}/orders`,
  ORDER_STATS: '/api/orders/stats',
  CHECKOUT: '/api/checkout',
  CHECKOUT_SESSION: (id: string) => `/api/checkout/${id}`,
  PROCESS_PAYMENT: (orderId: string) => `/api/orders/${orderId}/payment`,
  CANCEL_ORDER: (orderId: string) => `/api/orders/${orderId}/cancel`,
  UPDATE_STATUS: (orderId: string) => `/api/orders/${orderId}/status`,
  TRACKING: (orderId: string) => `/api/orders/${orderId}/tracking`,
  INVOICE: (orderId: string) => `/api/orders/${orderId}/invoice`,
  NOTIFICATIONS: '/api/orders/notifications',
};

/**
 * Mock order data for offline support
 */
const createMockOrder = (): Order => ({
  id: 'mock-order-1',
  orderNumber: 'ORD-2024-001',
  userId: 'mock-user-1',
  items: [
    {
      id: 'mock-item-1',
      orderId: 'mock-order-1',
      productId: 'mock-product-1',
      quantity: 2,
      unitPrice: 15.50,
      totalPrice: 31.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  shippingAddress: {
    firstName: 'Δοκιμαστικός',
    lastName: 'Χρήστης',
    addressLine1: 'Δοκιμαστική Διεύθυνση 123',
    city: 'Αθήνα',
    postalCode: '12345',
    country: 'Ελλάδα',
    phone: '+30 210 1234567',
  },
  billingAddress: {
    firstName: 'Δοκιμαστικός',
    lastName: 'Χρήστης',
    addressLine1: 'Δοκιμαστική Διεύθυνση 123',
    city: 'Αθήνα',
    postalCode: '12345',
    country: 'Ελλάδα',
    phone: '+30 210 1234567',
    isBusinessAddress: false,
  },
  shippingMethod: 'standard' as any,
  shippingCost: 5.00,
  paymentMethod: 'credit_card' as any,
  paymentStatus: 'completed' as any,
  totals: {
    subtotal: 31.00,
    shippingCost: 5.00,
    taxAmount: 7.44,
    discountAmount: 0,
    total: 43.44,
    currency: 'EUR',
  },
  status: 'confirmed' as any,
  placedAt: new Date().toISOString(),
  confirmedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Hook for getting user orders
 */
export function useGetUserOrders(userId?: string, filters?: OrderFilters) {
  const apiClient = useApiClient();
  
  const query = useQuery({
    queryKey: [...ORDER_QUERY_KEYS.userOrders(userId || ''), filters],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const token = tokenUtils.getAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient.get<Order[]>(ORDER_ENDPOINTS.USER_ORDERS(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filters,
      });
      
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId && !!tokenUtils.getAccessToken(),
  });

  const { isOffline, modifiedData } = useOfflineSupport({
    data: query.data,
    mockData: [createMockOrder()],
    status: query.status,
  });

  return {
    orders: modifiedData,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

/**
 * Hook for getting a single order
 */
export function useGetOrder(orderId: string) {
  const apiClient = useApiClient();
  
  const query = useQuery({
    queryKey: ORDER_QUERY_KEYS.order(orderId),
    queryFn: async () => {
      const token = tokenUtils.getAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient.get<Order>(ORDER_ENDPOINTS.ORDER(orderId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!orderId && !!tokenUtils.getAccessToken(),
  });

  const { isOffline, modifiedData } = useOfflineSupport({
    data: query.data,
    mockData: createMockOrder(),
    status: query.status,
  });

  return {
    order: modifiedData,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

/**
 * Hook for creating an order
 */
export function useCreateOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const token = tokenUtils.getAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient.post<Order>(ORDER_ENDPOINTS.ORDERS, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    },
    onSuccess: (newOrder) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.userOrders(String(newOrder.userId)) });
      
      toast.success(`Η παραγγελία ${newOrder.orderNumber} δημιουργήθηκε επιτυχώς!`);
    },
    onError: (error: any) => {
      logger.error('Create order error:', toError(error), errorToContext(error));
      
      if (error.status === 400) {
        toast.error('Παρακαλώ ελέγξτε τα στοιχεία της παραγγελίας');
      } else if (error.status === 402) {
        toast.error('Πρόβλημα με την πληρωμή');
      } else {
        toast.error('Σφάλμα κατά τη δημιουργία παραγγελίας');
      }
    },
  });
}

/**
 * Hook for updating order status
 */
export function useUpdateOrderStatus() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const token = tokenUtils.getAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient.patch<Order>(
        ORDER_ENDPOINTS.UPDATE_STATUS(orderId),
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    },
    onSuccess: (updatedOrder) => {
      // Update cache
      queryClient.setQueryData(ORDER_QUERY_KEYS.order(String(updatedOrder.id)), updatedOrder);
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.userOrders(String(updatedOrder.userId)) });
      
      toast.success('Η κατάσταση της παραγγελίας ενημερώθηκε');
    },
    onError: (error: any) => {
      logger.error('Update order status error:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά την ενημέρωση της παραγγελίας');
    },
  });
}

/**
 * Hook for cancelling an order
 */
export function useCancelOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const token = tokenUtils.getAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient.post<Order>(
        ORDER_ENDPOINTS.CANCEL_ORDER(orderId),
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    },
    onSuccess: (cancelledOrder) => {
      // Update cache
      queryClient.setQueryData(ORDER_QUERY_KEYS.order(String(cancelledOrder.id)), cancelledOrder);
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.userOrders(String(cancelledOrder.userId)) });
      
      toast.success('Η παραγγελία ακυρώθηκε επιτυχώς');
    },
    onError: (error: any) => {
      logger.error('Cancel order error:', toError(error), errorToContext(error));
      
      if (error.status === 400) {
        toast.error('Η παραγγελία δεν μπορεί να ακυρωθεί');
      } else {
        toast.error('Σφάλμα κατά την ακύρωση της παραγγελίας');
      }
    },
  });
}

/**
 * Hook for getting order statistics
 */
export function useGetOrderStats() {
  const apiClient = useApiClient();
  
  const query = useQuery({
    queryKey: ORDER_QUERY_KEYS.orderStats,
    queryFn: async () => {
      const token = tokenUtils.getAccessToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient.get<OrderStats>(ORDER_ENDPOINTS.ORDER_STATS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!tokenUtils.getAccessToken(),
  });

  const mockStats: OrderStats = {
    totalOrders: 5,
    totalRevenue: 217.20,
    averageOrderValue: 43.44,
    ordersByStatus: {
      pending: 1,
      confirmed: 2,
      processing: 1,
      shipped: 1,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    } as any,
    ordersByPaymentStatus: {
      pending: 1,
      processing: 0,
      completed: 4,
      failed: 0,
      cancelled: 0,
      refunded: 0,
    } as any,
    recentOrders: [createMockOrder()],
    topProducts: [],
  };

  const { isOffline, modifiedData } = useOfflineSupport({
    data: query.data,
    mockData: mockStats,
    status: query.status,
  });

  return {
    stats: modifiedData,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

// Alias for backward compatibility
export const useOrder = useGetOrder;

/**
 * Hook for creating checkout session
 */
export function useCreateCheckoutSession() {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (checkoutData: Partial<CheckoutSession>) => {
      const token = tokenUtils.getAccessToken();
      
      const response = await apiClient.post<CheckoutSession>(
        ORDER_ENDPOINTS.CHECKOUT,
        checkoutData,
        token ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } : {}
      );
      
      return response.data;
    },
    onSuccess: (session) => {
      toast.success('Checkout session δημιουργήθηκε');
    },
    onError: (error: any) => {
      logger.error('Create checkout session error:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά τη δημιουργία checkout session');
    },
  });
}
