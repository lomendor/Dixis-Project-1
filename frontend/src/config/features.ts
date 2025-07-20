/**
 * Simplified Feature Flags Configuration
 * Only Essential Production Safety Features
 */

// Simplified Feature Flags - Only Essential Production Safety Features
export interface FeatureFlags {
  enablePayments: boolean;       // Production safety - can cause real money transactions
  enableNotifications: boolean;  // Performance control - can impact performance
}

// Environment-based feature flags
export const features: FeatureFlags = {
  enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
};

// Development helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// API Configuration
export const apiConfig = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_API_URL || 'https://api.dixis.gr')
    : '', // Use proxy in development
  timeout: 10000,
  retries: 3,
};

// Feature flag utilities
export const getFeatureStatus = () => {
  return {
    'Payments': features.enablePayments,
    'Notifications': features.enableNotifications,
  };
};

// API Strategy: Always try real API first, automatic fallback to mock data on failure
// No feature flags needed for data display - this is handled by Enhanced Hooks automatically
export const apiStrategy = {
  approach: 'real-first-with-fallback',
  description: 'Always attempt real API calls first, automatically fallback to mock data on failure',
  benefits: [
    'No runtime feature flag checks',
    'Automatic resilience',
    'Single code path',
    'Better performance'
  ]
};

// Debug helper for development
if (isDevelopment) {
  console.log('🚀 Feature Flags Status:', getFeatureStatus());
  console.log('🔗 API Base URL:', apiConfig.baseUrl);
}

export default features;
