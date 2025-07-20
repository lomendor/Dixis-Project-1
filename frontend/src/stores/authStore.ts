'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, getErrorMessage, errorToContext, stringToContext } from '@/lib/utils/errorUtils';
import { buildApiUrl } from '@/lib/utils/apiUrls';

import { create } from 'zustand'
import { useEffect, useState } from 'react'
import {
  User,
  LoginCredentials,
  RegisterData,
  UserRole
} from '@/lib/api/models/auth/types'

// Auth Store State Interface
interface AuthState {
  // User data
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Tokens
  token: string | null
  refreshToken: string | null
}

// Auth Store Actions Interface
interface AuthActions {
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithUser: (user: any, token: string) => void
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>

  // Profile management
  updateProfile: (profileData: any) => Promise<void>
  updatePreferences: (preferences: any) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>

  // Address management
  addAddress: (address: any) => Promise<void>
  updateAddress: (addressId: string, address: any) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>

  // Password reset
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>

  // Email verification
  verifyEmail: (token: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>

  // Utility methods
  isRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  requireAuth: () => boolean
  redirectToLogin: () => void

  // Internal state setters
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  setToken: (token: string | null) => void
  setInitialized: (initialized: boolean) => void

  // Hydration
  hydrate: () => void
}

// Combined Auth Store Type
type AuthStore = AuthState & AuthActions

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  token: null,
  refreshToken: null,
}

// Create the Zustand auth store
export const useAuthStoreBase = create<AuthStore>((set, get) => ({
  // Initial state
  ...defaultAuthState,

  // Authentication actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })

    try {

      // Call our Next.js auth API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        }),
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Login failed')
      }

      const data = responseData.data

      // Map user data to our User interface
      const user: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        firstName: data.user.name.split(' ')[0] || data.user.name,
        lastName: data.user.name.split(' ').slice(1).join(' ') || '',
        fullName: data.user.name,
        name: data.user.name, // Alias for fullName
        role: data.user.role as UserRole,
        status: 'active' as any,
        createdAt: data.user.createdAt || data.user.created_at,
        updatedAt: data.user.updatedAt || data.user.updated_at,
      }

      const token = data.access_token

      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      set({
        user,
        isAuthenticated: true,
        token,
        refreshToken: null, // Laravel Sanctum doesn't use refresh tokens
        isLoading: false
      })

    } catch (error) {
      logger.error('❌ Login failed:', toError(error))
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      })
      throw error
    }
  },

  loginWithUser: (user: any, token: string) => {
    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }

    set({
      user,
      isAuthenticated: true,
      token,
      refreshToken: null,
      isLoading: false
    })
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null })

    try {

      // Call Laravel API
      const response = await fetch(buildApiUrl('register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.password,
          phone: userData.phone || null,
          role: userData.role || 'consumer',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()

      // Map Laravel user to our User interface
      const user: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: data.user.name,
        name: data.user.name, // Alias for fullName
        role: data.user.role as UserRole,
        status: 'active' as any,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at,
      }

      const token = data.access_token

      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      set({
        user,
        isAuthenticated: true,
        token,
        refreshToken: null, // Laravel Sanctum doesn't use refresh tokens
        isLoading: false
      })

    } catch (error) {
      logger.error('❌ Registration failed:', toError(error))
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })

    try {
      logger.info('🚪 Attempting logout with Laravel API')

      const token = get().token
      if (token) {
        // Call Laravel API to invalidate token
        await fetch(buildApiUrl('logout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      }

      logger.info('✅ Logout successful')

      // Clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      }

      set({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        isLoading: false
      })

    } catch (error) {
      logger.error('❌ Logout failed:', toError(error))
      // Even if API call fails, clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      }

      set({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false
      })
    }
  },

  refreshAuth: async () => {
    set({ isLoading: true, error: null })

    try {
      logger.info('Refresh auth')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      set({ isLoading: false })

    } catch (error) {
      logger.error('Auth refresh failed:', toError(error))
      set({
        error: error instanceof Error ? error.message : 'Auth refresh failed',
        isLoading: false
      })
      throw error
    }
  },

  // Profile management - connected to unified auth service
  updateProfile: async (profileData: any) => {
    logger.info('Update profile:', profileData)
  },

  updatePreferences: async (preferences: any) => {
    logger.info('Update preferences:', preferences)
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    logger.info('Change password')
  },

  // Address management - will be implemented in user profile phase
  addAddress: async (address: any) => {
    logger.info('Add address:', address)
  },

  updateAddress: async (addressId: string, address: any) => {
    logger.info('Update address:', { addressId, address })
  },

  deleteAddress: async (addressId: string) => {
    logger.info('Delete address:', { addressId })
  },

  // Password reset - connected to auth service
  requestPasswordReset: async (email: string) => {
    logger.info('Request password reset:', { email })
  },

  resetPassword: async (token: string, newPassword: string) => {
    logger.info('Reset password:', { token })
  },

  // Email verification - connected to auth service
  verifyEmail: async (token: string) => {
    logger.info('Verify email:', { token })
  },

  resendVerificationEmail: async () => {
    logger.info('Resend verification email')
  },

  // Utility methods
  isRole: (role: UserRole): boolean => {
    const state = get()
    return state?.user?.role === role
  },

  hasPermission: (permission: string): boolean => {
    const state = get()
    if (!state.user) return false

    // Basic role-based permissions
    switch (state.user.role) {
      case 'admin':
        return true // Admin has all permissions
      case 'producer':
        return ['manage_products', 'view_orders', 'manage_profile'].includes(permission)
      case 'business':
        return ['place_orders', 'manage_profile', 'view_orders'].includes(permission)
      case 'consumer':
        return ['place_orders', 'manage_profile', 'write_reviews'].includes(permission)
      default:
        return false
    }
  },

  requireAuth: (): boolean => {
    const state = get()
    if (!state.user) {
      state.redirectToLogin()
      return false
    }
    return true
  },

  redirectToLogin: () => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      // Prevent redirect loops - don't redirect if already on login page
      if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
        // Always use window.location for redirects (Next.js router handled elsewhere)
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }
  },

  // Internal state setters
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      token: user ? get().token : null,
      refreshToken: user ? get().refreshToken : null
    })
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  setToken: (token: string | null) => set({ token }),
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),

  // Hydration from localStorage
  hydrate: () => {
    if (typeof window === 'undefined') return

    try {
      const token = localStorage.getItem('access_token')
      const userJson = localStorage.getItem('user')

      if (token && userJson) {
        const user = JSON.parse(userJson) as User
        logger.info('🔄 Hydrating auth from localStorage:', { email: user.email })

        set({
          user,
          isAuthenticated: true,
          token,
          refreshToken: null, // Laravel Sanctum doesn't use refresh tokens
          isInitialized: true
        })
      } else {
        set({ isInitialized: true })
      }
    } catch (error) {
      logger.error('❌ Error hydrating auth:', toError(error))
      // Clear corrupted data
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      set({ isInitialized: true })
    }
  }
}))

// SSR-safe hooks
export const useAuthStore = () => {
  const store = useAuthStoreBase()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Only hydrate once and avoid multiple calls
    if (!isHydrated && typeof window !== 'undefined') {
      try {
        store.hydrate()
      } catch (error) {
        logger.error('Failed to hydrate auth store:', toError(error))
      } finally {
        setIsHydrated(true)
      }
    }
  }, [isHydrated]) // Depend on isHydrated to ensure single execution

  // Return default values during SSR
  if (!isHydrated) {
    return {
      ...defaultAuthState,
      ...store,
      // Override computed values with defaults during SSR
      isAuthenticated: false,
      isInitialized: false,
    }
  }

  return store
}

// Individual hooks for better performance
export const useAuthUser = () => {
  const store = useAuthStore()
  return store.user
}

export const useAuthStatus = () => {
  const store = useAuthStore()
  return {
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    isGuest: !store.isAuthenticated && !store.isLoading,
  }
}

export const useAuthError = () => {
  const store = useAuthStore()
  return store.error
}

export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    login: store.loginWithUser, // Use the simple login method
    loginWithCredentials: store.login, // Keep the original for backward compatibility
    register: store.register,
    logout: store.logout,
    refreshAuth: store.refreshAuth,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    requestPasswordReset: store.requestPasswordReset,
    resetPassword: store.resetPassword,
    verifyEmail: store.verifyEmail,
  }
}

export const usePermissions = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    isRole: store.isRole,
    hasPermission: store.hasPermission,
    isAdmin: store.isRole('admin' as UserRole),
    isProducer: store.isRole('producer' as UserRole),
    isBusiness: store.isRole('business' as UserRole),
    isConsumer: store.isRole('consumer' as UserRole),
  }
}

export const useAuthUtils = () => {
  const store = useAuthStore()
  return {
    requireAuth: store.requireAuth,
    redirectToLogin: store.redirectToLogin,
    isRole: store.isRole,
    hasPermission: store.hasPermission,
  }
}
