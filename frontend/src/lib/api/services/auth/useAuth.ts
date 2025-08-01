'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../client/apiClient';
import { 
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetData,
  ChangePasswordData,
  EmailVerificationData,
  UserProfile,
  Address,
  UserPreferences,
  TokenRefreshResponse
} from '../../models/auth/types';
import { useOfflineSupport } from '../useOfflineSupport';
import toast from 'react-hot-toast';

// Query keys for auth operations
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const,
  addresses: ['auth', 'addresses'] as const,
  preferences: ['auth', 'preferences'] as const,
  sessions: ['auth', 'sessions'] as const,
};

// API endpoints - Updated to use working Next.js auth API
const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  UPDATE_PROFILE: '/api/v1/user/profile',
  CHANGE_PASSWORD: '/api/v1/user/password',
  FORGOT_PASSWORD: '/api/v1/forgot-password',
  RESET_PASSWORD: '/api/v1/reset-password',
  VERIFY_EMAIL: '/api/v1/verify-email',
  RESEND_VERIFICATION: '/api/v1/resend-verification-email',
  ADDRESSES: '/api/v1/user/addresses',
  ADDRESS: (id: string) => `/api/v1/user/addresses/${id}`,
  PREFERENCES: '/api/v1/user/preferences',
  SESSIONS: '/api/v1/user/sessions',
  REVOKE_SESSION: (id: string) => `/api/v1/user/sessions/${id}/revoke`,
  GOOGLE_AUTH: '/api/v1/auth/google',
  GOOGLE_CALLBACK: '/api/v1/auth/google/callback',
};

// Token storage keys
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'dixis_access_token',
  REFRESH_TOKEN: 'dixis_refresh_token',
  USER_DATA: 'dixis_user_data',
  EXPIRES_AT: 'dixis_token_expires_at',
};

/**
 * Mock user data for offline support
 */
const createMockUser = (): User => ({
  id: 'mock-user-1',
  email: 'user@example.com',
  firstName: 'Δοκιμαστικός',
  lastName: 'Χρήστης',
  fullName: 'Δοκιμαστικός Χρήστης',
  name: 'Δοκιμαστικός Χρήστης',
  role: 'consumer' as any,
  status: 'active' as any,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Token management utilities
 */
export const tokenUtils = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  },

  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
    if (typeof window === 'undefined') return;
    
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(TOKEN_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
  },

  clearTokens: () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.EXPIRES_AT);
  },

  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    
    const expiresAt = localStorage.getItem(TOKEN_STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAt) return true;
    
    return Date.now() > parseInt(expiresAt);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
  },
};

/**
 * Hook for getting current user
 */
export function useGetUser() {
  const apiClient = useApiClient();
  
  const query = useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: async () => {
      const token = tokenUtils.getAccessToken();
      if (!token || tokenUtils.isTokenExpired()) {
        throw new Error('No valid token');
      }

      const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    enabled: !!tokenUtils.getAccessToken() && !tokenUtils.isTokenExpired(),
  });

  const { isOffline, modifiedData } = useOfflineSupport({
    data: query.data,
    mockData: createMockUser(),
    status: query.status,
  });

  return {
    user: modifiedData,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isOffline,
    refetch: query.refetch,
  };
}

/**
 * Hook for user login
 */
export function useLogin() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
      return response.data;
    },
    onSuccess: (authResponse) => {
      // Store tokens
      tokenUtils.setTokens(
        authResponse.token,
        authResponse.refreshToken,
        authResponse.expiresIn
      );

      // Store user data in cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, authResponse.user);

      toast.success(`Καλώς ήρθατε, ${authResponse.user.firstName}!`);
    },
    onError: (error: any) => {
      logger.error('Login error:', toError(error), errorToContext(error));
      
      if (error.status === 401) {
        toast.error('Λάθος email ή κωδικός πρόσβασης');
      } else if (error.status === 403) {
        toast.error('Ο λογαριασμός σας δεν έχει επιβεβαιωθεί');
      } else {
        toast.error('Σφάλμα κατά τη σύνδεση. Δοκιμάστε ξανά.');
      }
    },
  });
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, userData);
      return response.data;
    },
    onSuccess: (authResponse) => {
      // Store tokens
      tokenUtils.setTokens(
        authResponse.token,
        authResponse.refreshToken,
        authResponse.expiresIn
      );

      // Store user data in cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, authResponse.user);

      toast.success('Ο λογαριασμός σας δημιουργήθηκε επιτυχώς!');
    },
    onError: (error: any) => {
      logger.error('Registration error:', toError(error), errorToContext(error));
      
      if (error.status === 422) {
        toast.error('Παρακαλώ ελέγξτε τα στοιχεία που εισάγατε');
      } else if (error?.message?.includes('email')) {
        toast.error('Το email χρησιμοποιείται ήδη');
      } else {
        toast.error('Σφάλμα κατά τη δημιουργία λογαριασμού');
      }
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = tokenUtils.getAccessToken();
      if (token) {
        try {
          await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          // Continue with logout even if API call fails
          logger.warn('Logout API call failed:', error);
        }
      }
    },
    onSuccess: () => {
      // Clear tokens and cache
      tokenUtils.clearTokens();
      queryClient.clear();
      
      toast.success('Αποσυνδεθήκατε επιτυχώς');
    },
    onError: (error) => {
      logger.error('Logout error:', toError(error), errorToContext(error));
      
      // Clear tokens anyway
      tokenUtils.clearTokens();
      queryClient.clear();
      
      toast.success('Αποσυνδεθήκατε');
    },
  });
}

/**
 * Hook for password reset request
 */
export function useForgotPassword() {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (data: PasswordResetRequest) => {
      const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Οδηγίες επαναφοράς κωδικού στάλθηκαν στο email σας');
    },
    onError: (error: any) => {
      logger.error('Forgot password error:', toError(error), errorToContext(error));
      
      if (error.status === 404) {
        toast.error('Δεν βρέθηκε λογαριασμός με αυτό το email');
      } else {
        toast.error('Σφάλμα κατά την αποστολή email επαναφοράς');
      }
    },
  });
}

/**
 * Hook for password reset
 */
export function useResetPassword() {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (data: PasswordResetData) => {
      const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Ο κωδικός πρόσβασης άλλαξε επιτυχώς');
    },
    onError: (error: any) => {
      logger.error('Reset password error:', toError(error), errorToContext(error));
      
      if (error.status === 400) {
        toast.error('Μη έγκυρος ή ληγμένος σύνδεσμος επαναφοράς');
      } else {
        toast.error('Σφάλμα κατά την αλλαγή κωδικού');
      }
    },
  });
}

/**
 * Hook for email verification
 */
export function useVerifyEmail() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EmailVerificationData) => {
      const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, data);
      return response.data;
    },
    onSuccess: () => {
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      
      toast.success('Το email σας επιβεβαιώθηκε επιτυχώς!');
    },
    onError: (error: any) => {
      logger.error('Email verification error:', toError(error), errorToContext(error));
      
      if (error.status === 400) {
        toast.error('Μη έγκυρος ή ληγμένος σύνδεσμος επιβεβαίωσης');
      } else {
        toast.error('Σφάλμα κατά την επιβεβαίωση email');
      }
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const token = tokenUtils.getAccessToken();
      const response = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Ο κωδικός πρόσβασης άλλαξε επιτυχώς');
    },
    onError: (error: any) => {
      logger.error('Change password error:', toError(error), errorToContext(error));
      
      if (error.status === 400) {
        toast.error('Λάθος τρέχων κωδικός πρόσβασης');
      } else {
        toast.error('Σφάλμα κατά την αλλαγή κωδικού');
      }
    },
  });
}

/**
 * Hook for Google OAuth login
 */
export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Direct redirect to backend Google OAuth endpoint
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const googleAuthUrl = `${backendUrl}/api/v1/auth/google`;
      
      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
      
      // Return a promise that never resolves since we're redirecting
      return new Promise(() => {});
    },
    onError: (error: any) => {
      logger.error('Google OAuth initiation error:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά τη σύνδεση με Google. Δοκιμάστε ξανά.');
    },
  });
}

/**
 * Hook to handle Google OAuth callback
 */
export function useGoogleCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callbackData: { token: string; is_new_user: boolean }) => {
      // The token comes from the URL parameters after Google redirect
      return callbackData;
    },
    onSuccess: (data) => {
      // Store the token from Google OAuth
      tokenUtils.setTokens(data.token, '', 3600); // 1 hour expiry
      
      // Invalidate user query to fetch fresh user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
      
      const message = data.is_new_user 
        ? 'Καλώς ήρθατε! Ο λογαριασμός σας δημιουργήθηκε με Google.'
        : 'Καλώς ήρθατε πίσω!';
      
      toast.success(message);
    },
    onError: (error: any) => {
      logger.error('Google OAuth callback error:', toError(error), errorToContext(error));
      toast.error('Σφάλμα κατά τη σύνδεση με Google. Δοκιμάστε ξανά.');
    },
  });
}
