'use client';

import { useEffect } from 'react';
import { useUnifiedAuthStore } from '@/stores/unifiedAuthStore';
import { useRouter } from 'next/navigation';

// Main auth hook
export const useAuth = () => {
  const store = useUnifiedAuthStore();
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    hasRole: store.hasRole,
    isBusinessUser: store.isBusinessUser,
    isProducer: store.isProducer,
    isAdmin: store.isAdmin,
    isCustomer: store.isCustomer,
    clearError: store.clearError
  };
};

// Hook for protected routes
export const useRequireAuth = (requiredRole?: string | string[], redirectTo?: string) => {
  const router = useRouter();
  const { isAuthenticated, isInitialized, hasRole } = useUnifiedAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(redirectTo || currentPath)}`);
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      // User doesn't have required role
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isInitialized, requiredRole, redirectTo, router, hasRole]);

  return {
    isAuthorized: isAuthenticated && (!requiredRole || hasRole(requiredRole)),
    isLoading: !isInitialized
  };
};

// Hook for guest-only routes (login, register)
export const useRequireGuest = (redirectTo?: string) => {
  const router = useRouter();
  const { isAuthenticated, isInitialized, redirectAfterLogin } = useUnifiedAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      router.push(redirectTo || redirectAfterLogin());
    }
  }, [isAuthenticated, isInitialized, redirectTo, router, redirectAfterLogin]);

  return {
    isGuest: !isAuthenticated,
    isLoading: !isInitialized
  };
};

// Hook for B2B protected routes
export const useRequireB2B = () => {
  return useRequireAuth('business', '/b2b/login');
};

// Hook for producer protected routes
export const useRequireProducer = () => {
  return useRequireAuth('producer', '/producer/login');
};

// Hook for admin protected routes
export const useRequireAdmin = () => {
  return useRequireAuth('admin', '/admin/login');
};

export default useAuth;
