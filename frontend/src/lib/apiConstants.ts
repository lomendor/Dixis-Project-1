// Direct Laravel API configuration for consistent performance
export const LARAVEL_API_BASE = 'http://localhost:8000/api/v1';
export const API_VERSION = 'v1';

export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: () => `${LARAVEL_API_BASE}/products`,
    PRODUCT: (id: string | number) => `${LARAVEL_API_BASE}/products/${id}`,
    FEATURED: () => `${LARAVEL_API_BASE}/products?is_featured=1&per_page=8`,
    SEARCH: () => `/api/products/search`, // Keep as proxy for complex search
    BASE: () => `${LARAVEL_API_BASE}/products`,
  },
  PRODUCERS: {
    LIST: () => `${LARAVEL_API_BASE}/producers`,
    DETAIL: (id: string | number) => `${LARAVEL_API_BASE}/producers/${id}`,
    PRODUCER: (id: string | number) => `${LARAVEL_API_BASE}/producers/${id}`,
    PRODUCTS: (id: string | number) => `${LARAVEL_API_BASE}/producers/${id}/products`,
    SEARCH: () => `/api/producers/search`, // Keep as proxy for complex search
  },
  CATEGORIES: {
    LIST: () => `${LARAVEL_API_BASE}/categories`,
    CATEGORY: (id: string | number) => `${LARAVEL_API_BASE}/categories/${id}`,
    PRODUCTS: (id: string | number) => `${LARAVEL_API_BASE}/categories/${id}/products`,
  },
  RECOMMENDATIONS: {
    RELATED: (id: string | number) => `/api/products/${id}/related`, // Keep as proxy
    SIMILAR: (id: string | number) => `/api/products/${id}/similar`, // Keep as proxy
  },
  ORDERS: () => `/api/orders`, // Keep as proxy for complex business logic
  AUTH: {
    LOGIN: () => `/api/auth/login`, // Keep as proxy for security
    REGISTER: () => `/api/auth/register`, // Keep as proxy for security
    LOGOUT: () => `/api/auth/logout`, // Keep as proxy for security
    ME: () => `/api/auth/me`, // Keep as proxy for security
  },
  USERS: () => `${LARAVEL_API_BASE}/user`,
  // Cart operations - direct Laravel API
  CART: {
    GUEST: () => `${LARAVEL_API_BASE}/cart/guest`,
    GET: (cartId: string) => `${LARAVEL_API_BASE}/cart/${cartId}`,
    ITEMS: (cartId: string) => `${LARAVEL_API_BASE}/cart/${cartId}/items`,
    ITEM: (cartId: string, itemId: string) => `${LARAVEL_API_BASE}/cart/${cartId}/items/${itemId}`,
  },
  // Greek market specific endpoints - direct Laravel API
  PAYMENTS: {
    GREEK_METHODS: () => `${LARAVEL_API_BASE}/payments/greek/methods`,
    VIVA_WALLET: {
      CREATE: () => `${LARAVEL_API_BASE}/payments/greek/viva-wallet/create`,
      CALLBACK: () => `${LARAVEL_API_BASE}/payments/greek/viva-wallet/callback`,
    },
    CREATE_INTENT: () => `/api/payment/create-intent`, // Keep as proxy for Stripe security
    CONFIRM: () => `${LARAVEL_API_BASE}/payment/confirm`,
  },
  SHIPPING: {
    GREEK_CARRIERS: () => `${LARAVEL_API_BASE}/shipping/greek/carriers`,
    GREEK_RATES: () => `${LARAVEL_API_BASE}/shipping/greek/rates`,
    GREEK_ZONES: () => `${LARAVEL_API_BASE}/shipping/greek/zones`,
    TRACK: () => `${LARAVEL_API_BASE}/shipping/greek/track`,
  },
  VAT: {
    GREEK_RATES: () => `${LARAVEL_API_BASE}/vat/greek/rates`,
    GREEK_CALCULATE: () => `${LARAVEL_API_BASE}/vat/greek/cart`,
    POSTCODE_CHECK: () => `${LARAVEL_API_BASE}/vat/greek/postcode-check`,
    INVOICE: () => `${LARAVEL_API_BASE}/vat/greek/invoice`,
  },
  // Complex business logic - keep as proxies
  TAX_CALCULATE: () => `/api/tax/calculate`,
  MONITORING_HEALTH: () => `/api/monitoring/health`,
  // Legacy endpoints for gradual migration
  SEARCH: () => `/api/search`,
  ANALYTICS: () => `/api/analytics`,
  NOTIFICATIONS: () => `/api/notifications`,
  UPLOADS: () => `/api/uploads`,
  ADMIN: () => `/api/admin`,
  REPORTS: () => `/api/reports`,
  SETTINGS: () => `/api/settings`
};

// Greek market specific configurations
export const GREEK_MARKET = {
  VAT_RATES: {
    MAINLAND: 0.24, // 24% standard VAT
    ISLANDS: 0.13,  // 13% reduced VAT for islands
    REDUCED: 0.06,  // 6% for basic foods
  },
  SHIPPING: {
    FREE_THRESHOLD: 50, // €50+ free shipping
    COD_FEE: 2.5,      // €2.50 cash on delivery fee
    ISLAND_SURCHARGE: 7.5, // €7.50 island delivery surcharge
  },
  CURRENCY: 'EUR',
  LANGUAGE: 'el',
};

