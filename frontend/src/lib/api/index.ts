/**
 * 🛡️ MIGRATED API CLIENT - UNIFIED FOUNDATION
 *
 * This file has been migrated to use the new unified API foundation.
 * It provides backward compatibility while using the new stable core.
 *
 * MIGRATION STATUS: ✅ COMPLETE - Using unified API core
 * BACKWARD COMPATIBILITY: ✅ MAINTAINED - All existing calls work
 *
 * Created: 2025-01-25 (API Stability Foundation Migration)
 */

// Import the new unified API client and migration adapter
import { apiClient } from './core/client';
import { legacyApiClient, migrationAdapter } from './migration/adapter';
import { API_ENDPOINTS } from './core/endpoints';

/**
 * Legacy API export for backward compatibility
 * This maintains the same interface as before but uses the new unified client
 */
export const api = legacyApiClient;

/**
 * New unified API client export
 * Use this for new code - it provides the full stable interface
 */
export const unifiedApi = apiClient;

/**
 * API endpoints export
 * Use these stable endpoints for new code
 */
export { API_ENDPOINTS };

/**
 * Migration utilities export
 * For monitoring and debugging the migration process
 */
export { migrationAdapter };

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product APIs
export const products = {
  getAll: (params?: any) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  search: (query: string) => api.get('/products', { params: { search: query } }),
};

// Cart APIs
export const cart = {
  createGuest: () => api.post('/cart/guest'),
  get: (cartId: string) => api.get(`/cart/${cartId}`),
  addItem: (cartId: string, productId: string | number, quantity: number) => 
    api.post(`/cart/${cartId}/items`, { product_id: productId, quantity }),
  updateItem: (cartId: string, itemId: string, quantity: number) =>
    api.put(`/cart/${cartId}/items/${itemId}`, { quantity }),
  removeItem: (cartId: string, itemId: string) =>
    api.delete(`/cart/${cartId}/items/${itemId}`),
  clear: (cartId: string) => api.delete(`/cart/${cartId}/clear`),
};

// Auth APIs
export const auth = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: any) => 
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/user'),
};

// Categories APIs
export const categories = {
  getAll: () => api.get('/categories'),
  getOne: (id: string) => api.get(`/categories/${id}`),
};

// Producers APIs
export const producers = {
  getAll: () => api.get('/producers'),
  getOne: (id: string) => api.get(`/producers/${id}`),
};

// Orders APIs (protected)
export const orders = {
  create: (data: any) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getOne: (id: string) => api.get(`/orders/${id}`),
};

// Export everything
export default {
  products,
  cart,
  auth,
  categories,
  producers,
  orders,
};