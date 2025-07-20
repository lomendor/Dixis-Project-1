'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { behaviorTracker, UserBehaviorEvent } from '@/lib/analytics/BehaviorTracker';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have an auth hook

/**
 * Analytics Hook for easy behavior tracking
 */
export const useAnalytics = () => {
  const router = useRouter();
  const { user } = useAuth();
  const previousPath = useRef<string>('');

  // Set user ID when user changes
  useEffect(() => {
    if (user?.id) {
      behaviorTracker.setUserId(user.id.toString());
    }
  }, [user?.id]);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== previousPath.current) {
        behaviorTracker.trackPageView();
        previousPath.current = currentPath;
      }
    };

    // Track initial page view
    handleRouteChange();

    // Listen for route changes (Next.js App Router)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Product tracking methods
  const trackProductView = useCallback((productId: string, metadata?: Record<string, any>) => {
    behaviorTracker.trackProductView(productId, metadata);
  }, []);

  const trackProductClick = useCallback((productId: string, source: string = 'unknown') => {
    behaviorTracker.trackClick('product_card', { productId, source });
  }, []);

  const trackAddToCart = useCallback((productId: string, quantity: number = 1, price?: number) => {
    behaviorTracker.trackAddToCart(productId, quantity, price);
  }, []);

  const trackRemoveFromCart = useCallback((productId: string, quantity: number = 1) => {
    behaviorTracker.trackRemoveFromCart(productId, quantity);
  }, []);

  const trackAddToWishlist = useCallback((productId: string) => {
    behaviorTracker.trackAddToWishlist(productId);
  }, []);

  // Category tracking
  const trackCategoryView = useCallback((categoryId: string, metadata?: Record<string, any>) => {
    behaviorTracker.trackCategoryView(categoryId, metadata);
  }, []);

  const trackCategoryClick = useCallback((categoryId: string, source: string = 'unknown') => {
    behaviorTracker.trackClick('category_card', { categoryId, source });
  }, []);

  // Producer tracking
  const trackProducerView = useCallback((producerId: string, metadata?: Record<string, any>) => {
    behaviorTracker.trackProducerView(producerId, metadata);
  }, []);

  const trackProducerClick = useCallback((producerId: string, source: string = 'unknown') => {
    behaviorTracker.trackClick('producer_card', { producerId, source });
  }, []);

  // Search tracking
  const trackSearch = useCallback((query: string, resultsCount: number = 0, metadata?: Record<string, any>) => {
    behaviorTracker.trackSearch(query, resultsCount, metadata);
  }, []);

  const trackSearchClick = useCallback((productId: string, query: string, position: number) => {
    behaviorTracker.trackSearchClick(productId, query, position);
  }, []);

  // Purchase tracking
  const trackPurchase = useCallback((orderId: string, items: Array<{productId: string, quantity: number, price: number}>) => {
    behaviorTracker.trackPurchase(orderId, items);
  }, []);

  // UI interaction tracking
  const trackClick = useCallback((element: string, metadata?: Record<string, any>) => {
    behaviorTracker.trackClick(element, metadata);
  }, []);

  const trackButtonClick = useCallback((buttonName: string, context?: string) => {
    behaviorTracker.trackClick('button', { button_name: buttonName, context });
  }, []);

  const trackLinkClick = useCallback((linkText: string, href: string, context?: string) => {
    behaviorTracker.trackClick('link', { link_text: linkText, href, context });
  }, []);

  // Form tracking
  const trackFormStart = useCallback((formName: string) => {
    behaviorTracker.trackClick('form_start', { form_name: formName });
  }, []);

  const trackFormSubmit = useCallback((formName: string, success: boolean = true) => {
    behaviorTracker.trackClick('form_submit', { form_name: formName, success });
  }, []);

  const trackFormError = useCallback((formName: string, errorField: string, errorMessage: string) => {
    behaviorTracker.trackClick('form_error', { 
      form_name: formName, 
      error_field: errorField, 
      error_message: errorMessage 
    });
  }, []);

  // Navigation tracking
  const trackNavigation = useCallback((from: string, to: string, method: 'click' | 'search' | 'direct' = 'click') => {
    behaviorTracker.trackClick('navigation', { from, to, method });
  }, []);

  // Filter tracking
  const trackFilterApply = useCallback((filterType: string, filterValue: string, context: string = 'product_list') => {
    behaviorTracker.trackClick('filter_apply', { 
      filter_type: filterType, 
      filter_value: filterValue, 
      context 
    });
  }, []);

  const trackFilterClear = useCallback((context: string = 'product_list') => {
    behaviorTracker.trackClick('filter_clear', { context });
  }, []);

  // Sort tracking
  const trackSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc', context: string = 'product_list') => {
    behaviorTracker.trackClick('sort_change', { 
      sort_by: sortBy, 
      sort_order: sortOrder, 
      context 
    });
  }, []);

  // Recommendation tracking
  const trackRecommendationView = useCallback((recommendationType: string, productIds: string[]) => {
    behaviorTracker.trackClick('recommendation_view', { 
      recommendation_type: recommendationType, 
      product_ids: productIds,
      product_count: productIds.length
    });
  }, []);

  const trackRecommendationClick = useCallback((productId: string, recommendationType: string, position: number) => {
    behaviorTracker.trackClick('recommendation_click', { 
      productId, 
      recommendation_type: recommendationType, 
      position 
    });
  }, []);

  // Error tracking
  const trackError = useCallback((errorType: string, errorMessage: string, context?: string) => {
    behaviorTracker.trackClick('error', { 
      error_type: errorType, 
      error_message: errorMessage, 
      context 
    });
  }, []);

  // Performance tracking
  const trackPerformance = useCallback((metric: string, value: number, context?: string) => {
    behaviorTracker.trackClick('performance', { 
      metric, 
      value, 
      context 
    });
  }, []);

  // Session info
  const getSessionInfo = useCallback(() => {
    return behaviorTracker.getSessionInfo();
  }, []);

  return {
    // Product tracking
    trackProductView,
    trackProductClick,
    trackAddToCart,
    trackRemoveFromCart,
    trackAddToWishlist,

    // Category tracking
    trackCategoryView,
    trackCategoryClick,

    // Producer tracking
    trackProducerView,
    trackProducerClick,

    // Search tracking
    trackSearch,
    trackSearchClick,

    // Purchase tracking
    trackPurchase,

    // UI interaction tracking
    trackClick,
    trackButtonClick,
    trackLinkClick,

    // Form tracking
    trackFormStart,
    trackFormSubmit,
    trackFormError,

    // Navigation tracking
    trackNavigation,

    // Filter and sort tracking
    trackFilterApply,
    trackFilterClear,
    trackSort,

    // Recommendation tracking
    trackRecommendationView,
    trackRecommendationClick,

    // Error and performance tracking
    trackError,
    trackPerformance,

    // Session info
    getSessionInfo,
  };
};

/**
 * Hook for tracking component visibility (intersection observer)
 */
export const useVisibilityTracking = (
  elementRef: React.RefObject<HTMLElement>,
  trackingData: { type: string; id: string; metadata?: Record<string, any> },
  threshold: number = 0.5
) => {
  const { trackClick } = useAnalytics();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackClick('element_visible', {
              element_type: trackingData.type,
              element_id: trackingData.id,
              visibility_ratio: entry.intersectionRatio,
              ...trackingData.metadata
            });
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, trackingData, threshold, trackClick]);
};

/**
 * Hook for tracking time spent on component
 */
export const useTimeTracking = (
  componentName: string,
  metadata?: Record<string, any>
) => {
  const { trackClick } = useAnalytics();
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const timeSpent = Date.now() - startTime.current;
      trackClick('time_on_component', {
        component_name: componentName,
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.round(timeSpent / 1000),
        ...metadata
      });
    };
  }, [componentName, metadata, trackClick]);
};

export default useAnalytics;
