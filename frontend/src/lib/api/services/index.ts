/**
 * Unified API Service Layer
 * 
 * This consolidates all API endpoints into a single, consistent interface
 * using the enhanced fetch-based apiClient with production features.
 */

import { apiClient } from '../client/apiClient';
import { ApiResponse } from '../client/apiTypes';

/**
 * API configuration
 */
const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

/**
 * Products API Service
 */
export const productsService = {
  getAll: (params?: any): Promise<ApiResponse<any[]>> => 
    apiClient.get(`${API_PREFIX}/products`, { params }),
    
  getOne: (id: string): Promise<ApiResponse<any>> => 
    apiClient.get(`${API_PREFIX}/products/${id}`),
    
  search: (query: string): Promise<ApiResponse<any[]>> => 
    apiClient.get(`${API_PREFIX}/products`, { params: { search: query } }),
};

/**
 * Cart API Service  
 */
export const cartService = {
  createGuest: (): Promise<ApiResponse<any>> => 
    apiClient.post(`${API_PREFIX}/cart/guest`),
    
  get: (cartId: string): Promise<ApiResponse<any>> => 
    apiClient.get(`${API_PREFIX}/cart/${cartId}`),
    
  addItem: (cartId: string, productId: string | number, quantity: number): Promise<ApiResponse<any>> => 
    apiClient.post(`${API_PREFIX}/cart/${cartId}/items`, { product_id: productId, quantity }),
    
  updateItem: (cartId: string, itemId: string, quantity: number): Promise<ApiResponse<any>> =>
    apiClient.put(`${API_PREFIX}/cart/${cartId}/items/${itemId}`, { quantity }),
    
  removeItem: (cartId: string, itemId: string): Promise<ApiResponse<any>> =>
    apiClient.delete(`${API_PREFIX}/cart/${cartId}/items/${itemId}`),
    
  clear: (cartId: string): Promise<ApiResponse<any>> => 
    apiClient.delete(`${API_PREFIX}/cart/${cartId}/clear`),
};

/**
 * Authentication API Service
 */
export const authService = {
  login: (email: string, password: string): Promise<ApiResponse<any>> => 
    apiClient.post(`${API_PREFIX}/auth/login`, { email, password }),
    
  register: (data: any): Promise<ApiResponse<any>> => 
    apiClient.post(`${API_PREFIX}/auth/register`, data),
    
  logout: (): Promise<ApiResponse<any>> => 
    apiClient.post(`${API_PREFIX}/auth/logout`),
    
  getUser: (): Promise<ApiResponse<any>> => 
    apiClient.get(`${API_PREFIX}/user`),
};

/**
 * Categories API Service
 */
export const categoriesService = {
  getAll: (): Promise<ApiResponse<any[]>> => 
    apiClient.get(`${API_PREFIX}/categories`),
    
  getOne: (id: string): Promise<ApiResponse<any>> => 
    apiClient.get(`${API_PREFIX}/categories/${id}`),
};

/**
 * Producers API Service
 */
export const producersService = {
  getAll: (): Promise<ApiResponse<any[]>> => 
    apiClient.get(`${API_PREFIX}/producers`),
    
  getOne: (id: string): Promise<ApiResponse<any>> => 
    apiClient.get(`${API_PREFIX}/producers/${id}`),
};

/**
 * Orders API Service (protected)
 */
export const ordersService = {
  create: (data: any): Promise<ApiResponse<any>> => 
    apiClient.post(`${API_PREFIX}/orders`, data),
    
  getAll: (): Promise<ApiResponse<any[]>> => 
    apiClient.get(`${API_PREFIX}/orders`),
    
  getOne: (id: string): Promise<ApiResponse<any>> => 
    apiClient.get(`${API_PREFIX}/orders/${id}`),
};

/**
 * Unified API interface - matches the structure from axios-based index.ts
 * This ensures backward compatibility when updating imports
 */
export const api = {
  products: productsService,
  cart: cartService,
  auth: authService,
  categories: categoriesService,
  producers: producersService,
  orders: ordersService,
};

/**
 * Individual service exports for flexibility
 */
export {
  productsService as products,
  cartService as cart,
  authService as auth,
  categoriesService as categories,
  producersService as producers,
  ordersService as orders,
};

/**
 * Default export matches the old API structure
 */
export default api;

/**
 * Legacy compatibility - export the enhanced API client for direct use
 */
export { apiClient };