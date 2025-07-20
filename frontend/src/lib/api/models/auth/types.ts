/**
 * Authentication and User Management Types
 */

import { ID } from '../../client/apiTypes';

/**
 * User role enumeration
 */
export enum UserRole {
  CONSUMER = 'consumer',
  PRODUCER = 'producer',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

/**
 * User status enumeration
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

/**
 * Core User interface
 */
export interface User {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  name: string; // Alias for fullName - compatibility property
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Profile extensions
  profile?: UserProfile;
  addresses?: Address[];
  preferences?: UserPreferences;

  // Role-specific data
  business?: BusinessProfile;
  producer?: ProducerProfile;

  // Statistics
  stats?: UserStats;
}

/**
 * User profile information
 */
export interface UserProfile {
  id: ID;
  userId: ID;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  occupation?: string;
  interests?: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
  preferredLanguage: string;
  timezone: string;
  marketingOptIn: boolean;
  newsletterOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User address information
 */
export interface Address {
  id: ID;
  userId: ID;
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Business profile information
 */
export interface BusinessProfile {
  id: ID;
  name: string;
  taxId: string;
  taxOffice: string;
  verified: boolean;
  verificationDate?: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  website?: string;
  description?: string;
  logo?: string;
  rating?: number;
  commissionRate?: number;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Producer profile information
 */
export interface ProducerProfile {
  id: ID;
  businessName: string;
  farmName?: string;
  taxId: string;
  verified: boolean;
  verificationDate?: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  website?: string;
  description?: string;
  logo?: string;
  rating?: number;
  certifications?: string[];
  farmSize?: number;
  farmType?: string;
  productsOffered?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  id: ID;
  userId: ID;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  shopping: ShoppingPreferences;
  createdAt: string;
  updatedAt: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    productRecommendations: boolean;
    priceAlerts: boolean;
    stockAlerts: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    recommendations: boolean;
  };
  sms: {
    orderUpdates: boolean;
    deliveryUpdates: boolean;
  };
}

/**
 * Privacy preferences
 */
export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showPurchaseHistory: boolean;
  allowDataCollection: boolean;
  allowPersonalization: boolean;
  allowThirdPartySharing: boolean;
}

/**
 * Shopping preferences
 */
export interface ShoppingPreferences {
  defaultPaymentMethod?: string;
  defaultShippingAddress?: ID;
  defaultBillingAddress?: ID;
  autoSaveToWishlist: boolean;
  preferredDeliveryTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
  preferredDeliveryDays: string[];
  subscriptionReminders: boolean;
}

/**
 * User statistics
 */
export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  lastOrderDate?: string;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  reviewsCount: number;
  averageRating: number;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

/**
 * Authentication actions
 */
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAddress: (addressId: ID, address: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: ID) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone?: string;
  role?: UserRole;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
  newsletterOptIn?: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  token: string;
  password: string;
  passwordConfirmation: string;
}

/**
 * Email verification data
 */
export interface EmailVerificationData {
  token: string;
}

/**
 * Change password data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Authentication error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  ACCOUNT_SUSPENDED = 'account_suspended',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  WEAK_PASSWORD = 'weak_password',
  RATE_LIMITED = 'rate_limited',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Authentication error
 */
export interface AuthError extends Error {
  type: AuthErrorType;
  code?: string;
  details?: any;
}

/**
 * Session information
 */
export interface SessionInfo {
  id: string;
  userId: ID;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
    device: string;
    browser: string;
    os: string;
  };
  isActive: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Social login provider
 */
export enum SocialProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  TWITTER = 'twitter',
}

/**
 * Social login data
 */
export interface SocialLoginData {
  provider: SocialProvider;
  accessToken: string;
  idToken?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/**
 * Two-factor authentication data
 */
export interface TwoFactorAuthData {
  isEnabled: boolean;
  method: 'sms' | 'email' | 'authenticator';
  backupCodes?: string[];
  lastUsed?: string;
}

/**
 * Account security settings
 */
export interface SecuritySettings {
  twoFactorAuth: TwoFactorAuthData;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionTimeout: number; // in minutes
  allowMultipleSessions: boolean;
  trustedDevices: string[];
}
