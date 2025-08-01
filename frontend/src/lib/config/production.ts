// Production Configuration
// This file contains production-specific settings and utilities

export const productionConfig = {
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // Site Configuration
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.io',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Dixis',
  
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
  
  // Security
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  databasePoolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
  databaseTimeout: parseInt(process.env.DATABASE_TIMEOUT || '30000'),
  
  // Redis
  redisUrl: process.env.REDIS_URL,
  redisPassword: process.env.REDIS_PASSWORD,
  
  // Email
  emailProvider: process.env.EMAIL_PROVIDER || 'sendgrid',
  emailFrom: process.env.EMAIL_FROM || 'noreply@dixis.io',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Dixis Team',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  
  // Payment
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  
  // File Storage
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION || 'eu-west-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET,
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
  
  // Monitoring
  sentryDsn: process.env.SENTRY_DSN,
  sentryOrg: process.env.SENTRY_ORG,
  sentryProject: process.env.SENTRY_PROJECT,
  
  // Analytics
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  
  // Essential Feature Flags (only for production safety)
  features: {
    payments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
    notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },
  
  // Performance
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'),
    staticTtl: parseInt(process.env.STATIC_CACHE_TTL || '86400'),
    apiTtl: parseInt(process.env.API_CACHE_TTL || '300'),
  },
  
  // Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  },
  
  // Security
  security: {
    enableSecurityHeaders: process.env.ENABLE_SECURITY_HEADERS === 'true',
    enableCsp: process.env.ENABLE_CSP === 'true',
    enableHsts: process.env.ENABLE_HSTS === 'true',
    allowedOrigins: process.env?.ALLOWED_ORIGINS?.split(',') || [],
    allowedMethods: process.env?.ALLOWED_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
  
  // Maintenance
  maintenance: {
    enabled: process.env.MAINTENANCE_MODE === 'true',
    message: process.env.MAINTENANCE_MESSAGE || 'Η εφαρμογή βρίσκεται σε συντήρηση.',
  },
  
  // Localization
  locale: {
    default: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'el',
    supported: process.env?.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(',') || ['el', 'en'],
  },
  
  // Currency
  currency: {
    default: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'EUR',
    symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '€',
  },
  
  // Contact
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@dixis.io',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@dixis.io',
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+30 210 1234567',
  },
  
  // Company
  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Dixis AE',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Αθήνα, Ελλάδα',
    vatNumber: process.env.NEXT_PUBLIC_VAT_NUMBER || 'EL123456789',
  },
};

// Validation function to check required environment variables
export function validateProductionConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_SITE_URL',
    'DATABASE_URL',
    'JWT_SECRET',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  return true;
}

// Get configuration with validation
export function getProductionConfig() {
  if (productionConfig.isProduction) {
    validateProductionConfig();
  }
  
  return productionConfig;
}

// Environment-specific utilities
export const env = {
  get(key: string, defaultValue?: string): string {
    return process.env[key] || defaultValue || '';
  },
  
  getNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (!value) return defaultValue || 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? (defaultValue || 0) : parsed;
  },
  
  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue || false;
    return value.toLowerCase() === 'true';
  },
  
  getArray(key: string, separator: string = ',', defaultValue?: string[]): string[] {
    const value = process.env[key];
    if (!value) return defaultValue || [];
    return value.split(separator).map(item => item.trim()).filter(Boolean);
  },
  
  require(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  },
};

// Production-specific constants
export const PRODUCTION_CONSTANTS = {
  // Cache keys
  CACHE_KEYS: {
    PRODUCTS: 'products',
    PRODUCERS: 'producers',
    CATEGORIES: 'categories',
    USER_SESSION: 'user_session',
    CART: 'cart',
    SEARCH_RESULTS: 'search_results',
  },
  
  // API endpoints
  API_ENDPOINTS: {
    HEALTH: '/api/health',
    METRICS: '/api/metrics',
    STATUS: '/api/status',
  },
  
  // Error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  },
  
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },
  
  // Timeouts (in milliseconds)
  TIMEOUTS: {
    API_REQUEST: 30000,
    DATABASE_QUERY: 30000,
    FILE_UPLOAD: 60000,
    EMAIL_SEND: 10000,
  },
  
  // Limits
  LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_REQUEST_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_ITEMS_PER_PAGE: 100,
    MAX_SEARCH_RESULTS: 1000,
  },
} as const;

export default productionConfig;
