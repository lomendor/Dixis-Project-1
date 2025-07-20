'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../client/apiClient';
import { 
  Cart, 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest,
  CartValidation 
} from '../../models/cart/types';
import { ID } from '../../client/apiTypes';
import { useOfflineSupport } from '../useOfflineSupport';
import toast from 'react-hot-toast';

// Query keys for cart operations
export const CART_QUERY_KEYS = {
  cart: ['cart'] as const,
  cartItems: ['cart', 'items'] as const,
  cartValidation: ['cart', 'validation'] as const,
};

// API endpoints
const CART_ENDPOINTS = {
  GET_CART: '/api/cart',
  ADD_ITEM: '/api/cart/items',
  UPDATE_ITEM: (itemId: ID) => `/api/cart/items/${itemId}`,
  REMOVE_ITEM: (itemId: ID) => `/api/cart/items/${itemId}`,
  CLEAR_CART: '/api/cart/clear',
  VALIDATE_CART: '/api/cart/validate',
  CREATE_GUEST_CART: '/api/cart/guest',
};

/**
 * Mock cart data for offline support
 */
const createMockCart = (): Cart => ({
  id: 'mock-cart-1',
  sessionId: 'mock-session',
  items: [],
  itemCount: 0,
  subtotal: 0,
  total: 0,
  currency: 'EUR',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Hook for fetching the current cart
 */
export function useGetCart() {
  const apiClient = useApiClient();
  
  const query = useQuery({
    queryKey: CART_QUERY_KEYS.cart,
    queryFn: async () => {
      try {
        const response = await apiClient.get<Cart>(CART_ENDPOINTS.GET_CART);
        return response.data;
      } catch (error) {
        // If cart doesn't exist, create a guest cart
        if (error instanceof Error && error.message.includes('404')) {
          const guestResponse = await apiClient.post<Cart>(CART_ENDPOINTS.CREATE_GUEST_CART);
          return guestResponse.data;
        }
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const { isOffline, modifiedData } = useOfflineSupport({
    data: query.data,
    mockData: createMockCart(),
    status: query.status,
  });

  return {
    cart: modifiedData,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

/**
 * Hook for adding items to cart
 */
export function useAddToCart() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddToCartRequest) => {
      const response = await apiClient.post<Cart>(CART_ENDPOINTS.ADD_ITEM, request);
      return response.data;
    },
    onSuccess: (updatedCart, variables) => {
      // Update cart cache
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
      
      // Show success toast
      const addedItem = updatedCart.items.find(item => (item as any).productId === variables.productId);
      if ((addedItem as any)?.product) {
        toast.success(`${(addedItem as any).product.name} προστέθηκε στο καλάθι!`);
      } else {
        toast.success('Το προϊόν προστέθηκε στο καλάθι!');
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
    onError: (error) => {
      logger.error('Error adding to cart:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά την προσθήκη στο καλάθι');
    },
  });
}

/**
 * Hook for removing items from cart
 */
export function useRemoveFromCart() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: ID) => {
      const response = await apiClient.delete<Cart>(CART_ENDPOINTS.REMOVE_ITEM(itemId));
      return response.data;
    },
    onSuccess: (updatedCart) => {
      // Update cart cache
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
      
      toast.success('Το προϊόν αφαιρέθηκε από το καλάθι');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
    onError: (error) => {
      logger.error('Error removing from cart:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά την αφαίρεση από το καλάθι');
    },
  });
}

/**
 * Hook for updating cart item quantity
 */
export function useUpdateCartItem() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, request }: { itemId: ID; request: UpdateCartItemRequest }) => {
      const response = await apiClient.put<Cart>(CART_ENDPOINTS.UPDATE_ITEM(itemId), request);
      return response.data;
    },
    onSuccess: (updatedCart) => {
      // Update cart cache
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
    onError: (error) => {
      logger.error('Error updating cart item:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά την ενημέρωση του καλαθιού');
    },
  });
}

/**
 * Hook for clearing the entire cart
 */
export function useClearCart() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<Cart>(CART_ENDPOINTS.CLEAR_CART);
      return response.data;
    },
    onSuccess: (updatedCart) => {
      // Update cart cache
      queryClient.setQueryData(CART_QUERY_KEYS.cart, updatedCart);
      
      toast.success('Το καλάθι αδειάστηκε');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
    onError: (error) => {
      logger.error('Error clearing cart:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά το άδειασμα του καλαθιού');
    },
  });
}

/**
 * Hook for validating cart items (stock, prices, etc.)
 */
export function useValidateCart() {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<CartValidation>(CART_ENDPOINTS.VALIDATE_CART);
      return response.data;
    },
    onSuccess: (validation) => {
      if (!validation.isValid) {
        // Show validation errors
        validation.errors.forEach(error => {
          toast.error(error.message);
        });
        
        // Show validation warnings
        validation.warnings.forEach(warning => {
          toast(warning.message, { icon: '⚠️' });
        });
      }
    },
    onError: (error) => {
      logger.error('Error validating cart:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά την επικύρωση του καλαθιού');
    },
  });
}

/**
 * Utility functions for cart operations
 */
export const cartUtils = {
  /**
   * Get item quantity for a specific product
   */
  getItemQuantity: (cart: Cart | null, productId: ID): number => {
    if (!cart) return 0;
    const item = cart.items.find(item => (item as any).productId === productId);
    return item?.quantity || 0;
  },

  /**
   * Check if a product is in the cart
   */
  isInCart: (cart: Cart | null, productId: ID): boolean => {
    if (!cart) return false;
    return cart.items.some(item => (item as any).productId === productId);
  },

  /**
   * Calculate cart totals
   */
  calculateTotals: (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      itemCount,
      total: subtotal, // Add shipping, tax calculations here if needed
    };
  },

  /**
   * Format price for display
   */
  formatPrice: (price: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency,
    }).format(price);
  },
};
