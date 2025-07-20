'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { apiClient } from '@/lib/api/client/apiClient';

interface LoginResponse {
  user: any;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface RegisterResponse {
  user: any;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'business' | 'producer' | 'admin';
  emailVerified: boolean;
  // B2C fields
  phone?: string;
  // B2B fields
  businessName?: string;
  businessVerified?: boolean;
  vatNumber?: string;
  creditLimit?: number;
  // Producer fields
  producer_id?: number;
  producerName?: string;
  producerVerified?: boolean;
  producerCode?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  password_confirmation: string;
  phone?: string;
  role?: 'customer' | 'business' | 'producer';
  // B2B specific
  businessName?: string;
  vatNumber?: string;
  // Producer specific
  producerName?: string;
  location?: string;
  newsletter?: boolean;
}

class AuthService {
  private static instance: AuthService;
  private readonly TOKEN_KEY = 'dixis_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'dixis_refresh_token';
  private readonly USER_KEY = 'dixis_user';
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Unified login for all user types
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
        remember_me: credentials.rememberMe
      });

      const { user, access_token, refresh_token, expires_in } = response.data;

      const authUser: AuthUser = this.transformUser(user);
      const tokens: AuthTokens = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        tokenType: 'Bearer'
      };

      // Store auth data
      this.setAuthData(authUser, tokens);

      return { user: authUser, tokens };
    } catch (error) {
      logger.error('Login failed:', toError(error), errorToContext(error));
      throw new Error('Σφάλμα σύνδεσης. Ελέγξτε τα στοιχεία σας.');
    }
  }

  // Unified registration
  async register(data: RegisterData): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      const endpoint = this.getRegistrationEndpoint(data.role);
      const payload = this.prepareRegistrationPayload(data);

      const response = await apiClient.post<RegisterResponse>(endpoint, payload);

      const { user, access_token, refresh_token, expires_in } = response.data;

      const authUser: AuthUser = this.transformUser(user);
      const tokens: AuthTokens = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        tokenType: 'Bearer'
      };

      // Store auth data
      this.setAuthData(authUser, tokens);

      return { user: authUser, tokens };
    } catch (error) {
      logger.error('Registration failed:', toError(error), errorToContext(error));
      throw new Error('Σφάλμα εγγραφής. Παρακαλώ δοκιμάστε ξανά.');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await apiClient.post('/api/v1/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      logger.error('Logout API failed:', toError(error), errorToContext(error));
    } finally {
      this.clearAuthData();
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh', {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken, expires_in } = response.data;

      const tokens: AuthTokens = {
        accessToken: access_token || '',
        refreshToken: newRefreshToken || '',
        expiresIn: expires_in || 3600,
        tokenType: 'Bearer'
      };

      // Update stored tokens
      this.setTokens(tokens);

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', toError(error), errorToContext(error));
      this.clearAuthData();
      throw new Error('Session expired. Please login again.');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const response = await apiClient.get('/api/v1/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const authUser = this.transformUser(response.data);
      this.setUser(authUser);

      return authUser;
    } catch (error) {
      logger.error('Failed to get current user:', toError(error), errorToContext(error));
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  // Get stored user
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Get access token
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Check user role
  hasRole(role: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }

  // Check if user is business
  isBusinessUser(): boolean {
    return this.hasRole('business');
  }

  // Check if user is producer
  isProducer(): boolean {
    return this.hasRole('producer');
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Private methods
  private setAuthData(user: AuthUser, tokens: AuthTokens): void {
    this.setUser(user);
    this.setTokens(tokens);
  }

  private setUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private setTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }

  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  private transformUser(backendUser: any): AuthUser {
    return {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      role: this.determineUserRole(backendUser),
      emailVerified: backendUser.email_verified_at !== null,
      phone: backendUser.phone,
      // B2B fields
      businessName: backendUser?.business?.business_name,
      businessVerified: backendUser?.business?.verified || false,
      vatNumber: backendUser?.business?.vat_number,
      creditLimit: backendUser?.business?.credit_limit,
      // Producer fields
      producer_id: backendUser?.producer?.id,
      producerName: backendUser?.producer?.business_name,
      producerVerified: backendUser?.producer?.verified || false,
      producerCode: backendUser?.producer?.producer_code,
      // Timestamps
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at
    };
  }

  private determineUserRole(user: any): AuthUser['role'] {
    if (user.role === 'admin') return 'admin';
    if (user.producer) return 'producer';
    if (user.business) return 'business';
    return 'customer';
  }

  private getRegistrationEndpoint(role: string): string {
    switch (role) {
      case 'business':
        return '/api/v1/auth/register/business';
      case 'producer':
        return '/api/v1/auth/register/producer';
      default:
        return '/api/v1/auth/register';
    }
  }

  private prepareRegistrationPayload(data: RegisterData): any {
    const base = {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone
    };

    switch (data.role) {
      case 'business':
        return {
          ...base,
          business_name: data.businessName,
          vat_number: data.vatNumber
        };
      case 'producer':
        return {
          ...base,
          producer_name: data.producerName,
          location: data.location
        };
      default:
        return base;
    }
  }
}

export const authService = AuthService.getInstance();