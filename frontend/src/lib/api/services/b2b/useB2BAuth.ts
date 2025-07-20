'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStoreBase } from '@/stores/cartStore';

interface B2BLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface B2BLoginResponse {
  success: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    business_name?: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
  };
  access_token: string;
  token_type: string;
  expires_in: number;
}

// B2B Login API call
const b2bLoginAPI = async (credentials: B2BLoginCredentials): Promise<B2BLoginResponse> => {
  const response = await fetch('/api/auth/b2b/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Σφάλμα κατά τη σύνδεση');
  }

  return response.json();
};

// B2B Login Hook
export const useB2BLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: b2bLoginAPI,
    onSuccess: async (data) => {
      // Store authentication data
      if (typeof window !== 'undefined') {
        localStorage.setItem('b2b_access_token', data.access_token);
        localStorage.setItem('b2b_user', JSON.stringify(data.user));
        localStorage.setItem('b2b_token_type', data.token_type);
        localStorage.setItem('b2b_expires_in', data.expires_in.toString());
      }

      // Migrate guest cart to business user cart
      try {
        const cartStore = useCartStoreBase.getState();
        if (cartStore?.migrateGuestCartToBusinessUser) {
          await cartStore.migrateGuestCartToBusinessUser(data.user.id);
        }
      } catch (cartError) {
        logger.error('Cart migration failed during B2B login:', toError(cartError), errorToContext(cartError));
        // Don't fail the login for cart migration issues
      }

      toast.success(`Καλώς ήρθατε, ${data.user.name}!`);
      
      // Redirect to B2B dashboard
      router.push('/b2b/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Σφάλμα κατά τη σύνδεση');
    },
  });
};

// B2B Logout Hook
export const useB2BLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Call logout API if needed
      const token = localStorage.getItem('b2b_access_token');
      if (token) {
        try {
          await fetch('/api/auth/b2b/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          logger.error('Logout API error:', toError(error), errorToContext(error));
        }
      }
    },
    onSuccess: () => {
      // Clear authentication data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('b2b_access_token');
        localStorage.removeItem('b2b_user');
        localStorage.removeItem('b2b_token_type');
        localStorage.removeItem('b2b_expires_in');
      }

      toast.success('Αποσυνδεθήκατε επιτυχώς');
      router.push('/b2b/login');
    },
    onError: (error: Error) => {
      // Even if API fails, clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('b2b_access_token');
        localStorage.removeItem('b2b_user');
        localStorage.removeItem('b2b_token_type');
        localStorage.removeItem('b2b_expires_in');
      }
      
      toast.error('Σφάλμα κατά την αποσύνδεση');
      router.push('/b2b/login');
    },
  });
};

// Check if user is authenticated
export const useB2BAuth = () => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }

  const token = localStorage.getItem('b2b_access_token');
  const userJson = localStorage.getItem('b2b_user');
  
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    logger.error('Error parsing B2B user data:', toError(error), errorToContext(error));
  }

  return {
    isAuthenticated: !!token && !!user,
    user,
    token,
  };
};

// B2B Registration Interface
interface B2BRegistrationData {
  businessName: string;
  contactName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  taxId: string;
  businessType: string;
  agreeToTerms: boolean;
}

interface B2BRegistrationResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    business_name: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
  };
  access_token: string;
  token_type: string;
  expires_in: number;
  email_verification_required: boolean;
}

// B2B Registration API call
const b2bRegisterAPI = async (data: B2BRegistrationData): Promise<B2BRegistrationResponse> => {
  const response = await fetch('/api/auth/b2b/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Σφάλμα κατά την εγγραφή');
  }

  return response.json();
};

// B2B Registration Hook
export const useB2BRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: b2bRegisterAPI,
    onSuccess: async (data) => {
      // Store authentication data
      if (typeof window !== 'undefined') {
        localStorage.setItem('b2b_access_token', data.access_token);
        localStorage.setItem('b2b_user', JSON.stringify(data.user));
        localStorage.setItem('b2b_token_type', data.token_type);
        localStorage.setItem('b2b_expires_in', data.expires_in.toString());
      }

      // Migrate guest cart to business user cart
      try {
        const cartStore = useCartStoreBase.getState();
        if (cartStore?.migrateGuestCartToBusinessUser) {
          await cartStore.migrateGuestCartToBusinessUser(data.user.id);
        }
      } catch (cartError) {
        logger.error('Cart migration failed during B2B registration:', toError(cartError), errorToContext(cartError));
        // Don't fail the registration for cart migration issues
      }

      toast.success(data.message);

      // Redirect based on email verification requirement
      if (data.email_verification_required) {
        router.push('/b2b/verify-email');
      } else {
        router.push('/b2b/dashboard');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Σφάλμα κατά την εγγραφή');
    },
  });
};

// B2B Protected Route Hook
export const useB2BProtectedRoute = () => {
  const router = useRouter();
  const { isAuthenticated } = useB2BAuth();

  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push('/b2b/login');
    return false;
  }

  return isAuthenticated;
};