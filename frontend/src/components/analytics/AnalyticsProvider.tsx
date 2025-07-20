'use client';

import { logger } from '@/lib/logging/productionLogger';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Analytics configuration
const ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  DEBUG: process.env.NODE_ENV === 'development',
  TRACK_PERFORMANCE: true,
  TRACK_ERRORS: true
};

// Event types for type safety
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// E-commerce events
export interface EcommerceEvent {
  event_name: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item' | 'begin_checkout';
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Google Analytics
    if (ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
      initializeGA();
    }

    // Initialize custom analytics
    initializeCustomAnalytics();

    // Track performance metrics
    if (ANALYTICS_CONFIG.TRACK_PERFORMANCE) {
      trackPerformanceMetrics();
    }

    // Track errors
    if (ANALYTICS_CONFIG.TRACK_ERRORS) {
      trackErrors();
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}

// Initialize Google Analytics
function initializeGA() {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag?.('js', new Date().toISOString());
  window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    debug_mode: ANALYTICS_CONFIG.DEBUG
  });

  if (ANALYTICS_CONFIG.DEBUG) {
    logger.info('Google Analytics initialized');
  }
}

// Initialize custom analytics
function initializeCustomAnalytics() {
  // Track user session
  const sessionId = generateSessionId();
  localStorage.setItem('dixis_session_id', sessionId);

  // Track user preferences
  trackUserPreferences();

  if (ANALYTICS_CONFIG.DEBUG) {
    logger.info('Custom analytics initialized');
  }
}

// Track page views
function trackPageView(pathname: string) {
  // Google Analytics
  if (window.gtag) {
    window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      page_path: pathname,
      page_title: document.title
    });
  }

  // Custom analytics
  trackCustomEvent({
    action: 'page_view',
    category: 'navigation',
    label: pathname,
    custom_parameters: {
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }
  });

  if (ANALYTICS_CONFIG.DEBUG) {
    logger.info('Page view tracked:', { pathname });
  }
}

// Track custom events
export function trackCustomEvent(event: AnalyticsEvent) {
  // Google Analytics
  if (window.gtag) {
    window.gtag?.('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    });
  }

  // Custom analytics API
  sendToCustomAnalytics(event);

  if (ANALYTICS_CONFIG.DEBUG) {
    logger.info('Event tracked:', { event });
  }
}

// Track e-commerce events
export function trackEcommerceEvent(event: EcommerceEvent) {
  // Google Analytics Enhanced Ecommerce
  if (window.gtag) {
    window.gtag?.('event', event.event_name, {
      currency: event.currency || 'EUR',
      value: event.value,
      items: event.items
    });
  }

  // Custom e-commerce tracking
  trackCustomEvent({
    action: event.event_name,
    category: 'ecommerce',
    value: event.value,
    custom_parameters: {
      currency: event.currency,
      items: event.items
    }
  });

  if (ANALYTICS_CONFIG.DEBUG) {
    logger.info('E-commerce event tracked:', { event });
  }
}

// Track performance metrics
function trackPerformanceMetrics() {
  // Core Web Vitals tracking
  if ('web-vitals' in window || typeof window !== 'undefined') {
    import('web-vitals').then((vitals) => {
      vitals.onCLS((metric) => trackPerformanceMetric('CLS', metric.value));
      vitals.onLCP((metric) => trackPerformanceMetric('LCP', metric.value));
      vitals.onFCP((metric) => trackPerformanceMetric('FCP', metric.value));
      vitals.onTTFB((metric) => trackPerformanceMetric('TTFB', metric.value));
      
      // Use INP instead of FID for newer browsers
      if ('onINP' in vitals) {
        (vitals as any).onINP((metric: any) => trackPerformanceMetric('INP', metric.value));
      } else if ('onFID' in vitals) {
        (vitals as any).onFID((metric: any) => trackPerformanceMetric('FID', metric.value));
      }
    }).catch((error) => {
      logger.warn('Failed to load web-vitals:', error);
    });
  }

  // Navigation timing
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          trackPerformanceMetric('DOM_LOAD', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          trackPerformanceMetric('FULL_LOAD', navigation.loadEventEnd - navigation.loadEventStart);
        }
      }, 0);
    });
  }
}

// Track performance metric
function trackPerformanceMetric(name: string, value: number) {
  trackCustomEvent({
    action: 'performance_metric',
    category: 'performance',
    label: name,
    value: Math.round(value),
    custom_parameters: {
      metric_name: name,
      metric_value: value,
      timestamp: Date.now()
    }
  });
}

// Track errors
function trackErrors() {
  // JavaScript errors
  window.addEventListener('error', (event) => {
    trackCustomEvent({
      action: 'javascript_error',
      category: 'error',
      label: event.message,
      custom_parameters: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event?.error?.stack
      }
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackCustomEvent({
      action: 'unhandled_rejection',
      category: 'error',
      label: event?.reason?.toString(),
      custom_parameters: {
        reason: event.reason
      }
    });
  });
}

// Track user preferences
function trackUserPreferences() {
  const preferences = {
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen_resolution: `${screen.width}x${screen.height}`,
    color_scheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  trackCustomEvent({
    action: 'user_preferences',
    category: 'user',
    custom_parameters: preferences
  });
}

// Send to custom analytics API
async function sendToCustomAnalytics(event: AnalyticsEvent) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...event,
        session_id: localStorage.getItem('dixis_session_id'),
        timestamp: Date.now(),
        url: window.location.href,
        user_agent: navigator.userAgent
      })
    });
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) {
      logger.warn('Failed to send custom analytics:', { error });
    }
  }
}

// Generate session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility functions for common tracking scenarios
export const analytics = {
  // Product interactions
  trackProductView: (productId: string, productName: string, category: string, price: number) => {
    trackEcommerceEvent({
      event_name: 'view_item',
      currency: 'EUR',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        category,
        quantity: 1,
        price
      }]
    });
  },

  // Cart interactions
  trackAddToCart: (productId: string, productName: string, category: string, price: number, quantity: number) => {
    trackEcommerceEvent({
      event_name: 'add_to_cart',
      currency: 'EUR',
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        category,
        quantity,
        price
      }]
    });
  },

  // Search
  trackSearch: (searchTerm: string, resultsCount: number) => {
    trackCustomEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      value: resultsCount,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount
      }
    });
  },

  // User engagement
  trackEngagement: (action: string, element: string) => {
    trackCustomEvent({
      action,
      category: 'engagement',
      label: element
    });
  }
};
