'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, getErrorMessage, errorToContext, stringToContext } from '@/lib/utils/errorUtils';

import { create } from 'zustand';
import { authService, AuthUser, LoginCredentials, RegisterData } from '@/lib/auth/authService';
import { useCartStoreBase } from './cartStore';

interface UnifiedAuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface UnifiedAuthActions {
  // Core auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // State management
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Initialization
  initialize: () => Promise<void>;
  
  // Role checks
  hasRole: (role: string | string[]) => boolean;
  isBusinessUser: () => boolean;
  isProducer: () => boolean;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  
  // Navigation helpers
  redirectAfterLogin: () => string;
  requireAuth: (redirectTo?: string) => boolean;
}

type UnifiedAuthStore = UnifiedAuthState & UnifiedAuthActions;

const defaultState: UnifiedAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null
};

export const useUnifiedAuthStore = create<UnifiedAuthStore>((set, get) => ({
  ...defaultState,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const { user, tokens } = await authService.login(credentials);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Handle cart migration for B2B users
      if (user.role === 'business') {
        try {
          const cartStore = useCartStoreBase.getState();
          await cartStore.migrateGuestCartToBusinessUser(user.id);
        } catch (error) {
          logger.error('Cart migration failed:', toError(error));
        }
      }

      // Redirect based on role
      const redirectPath = get().redirectAfterLogin();
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Σφάλμα σύνδεσης',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const { user, tokens } = await authService.register(data);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Handle cart migration for B2B users
      if (user.role === 'business') {
        try {
          const cartStore = useCartStoreBase.getState();
          await cartStore.migrateGuestCartToBusinessUser(user.id);
        } catch (error) {
          logger.error('Cart migration failed:', toError(error));
        }
      }

      // Redirect based on role and verification status
      let redirectPath = '/';
      if (user.role === 'business' && !user.businessVerified) {
        redirectPath = '/b2b/verify-email';
      } else if (user.role === 'producer' && !user.producerVerified) {
        redirectPath = '/producer/verification-pending';
      } else {
        redirectPath = get().redirectAfterLogin();
      }

      if (typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Σφάλμα εγγραφής',
        isLoading: false
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
      
      set({
        ...defaultState,
        isInitialized: true
      });

      // Clear cart data
      const cartStore = useCartStoreBase.getState();
      await cartStore.clearCart();

      // Redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      logger.error('Logout error:', toError(error));
      // Even if API fails, clear local state
      set({
        ...defaultState,
        isInitialized: true
      });
    }
  },

  refreshAuth: async () => {
    try {
      await authService.refreshToken();
      const user = await authService.getCurrentUser();
      
      if (user) {
        set({
          user,
          isAuthenticated: true,
          error: null
        });
      } else {
        set({
          ...defaultState,
          isInitialized: true
        });
      }
    } catch (error) {
      logger.error('Auth refresh failed:', toError(error));
      set({
        ...defaultState,
        isInitialized: true
      });
    }
  },

  initialize: async () => {
    const state = get();
    if (state.isInitialized) return;

    set({ isLoading: true });

    try {
      // Check if we have a token
      const token = authService.getAccessToken();
      if (!token) {
        set({
          ...defaultState,
          isInitialized: true
        });
        return;
      }

      // Try to get current user
      const user = await authService.getCurrentUser();
      
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null
        });
      } else {
        set({
          ...defaultState,
          isInitialized: true
        });
      }
    } catch (error) {
      logger.error('Auth initialization failed:', toError(error));
      set({
        ...defaultState,
        isInitialized: true
      });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  },

  isBusinessUser: () => get().hasRole('business'),
  isProducer: () => get().hasRole('producer'),
  isAdmin: () => get().hasRole('admin'),
  isCustomer: () => get().hasRole('customer'),

  redirectAfterLogin: () => {
    const { user } = get();
    if (!user) return '/';

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'business':
        return '/b2b/dashboard';
      case 'producer':
        return '/producer/dashboard';
      case 'customer':
      default:
        return '/dashboard';
    }
  },

  requireAuth: (redirectTo = '/') => {
    const { isAuthenticated, isInitialized } = get();
    
    if (!isInitialized) {
      // Still loading
      return false;
    }

    if (!isAuthenticated && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(redirectTo || currentPath)}`;
      return false;
    }

    return isAuthenticated;
  }
}));

// Auth initialization will be handled by providers to prevent conflicts
// Auto-initialization removed to fix rendering issues