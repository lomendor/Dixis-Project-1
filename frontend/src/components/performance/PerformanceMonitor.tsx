'use client';

import { logger } from '@/lib/logging/productionLogger';
import { useEffect, useCallback } from 'react';
import { monitorBundleSize, addResourceHints, optimizeThirdPartyScripts, prefetchRoutes, codeSplitBoundaries } from '@/lib/performance/bundleOptimization';
import { setupLazyLoading, preloadCriticalImages } from '@/lib/performance/imageOptimization';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  navigationType?: string;
}

interface PerformanceMonitorProps {
  onMetric?: (metric: PerformanceMetric) => void;
  enableConsoleLogging?: boolean;
  enableAnalytics?: boolean;
}

/**
 * Performance Monitor Component using React 19 patterns
 * Monitors Web Vitals and other performance metrics
 */
export function PerformanceMonitor({
  onMetric,
  enableConsoleLogging = process.env.NODE_ENV === 'development',
  enableAnalytics = process.env.NODE_ENV === 'production',
}: PerformanceMonitorProps) {
  
  // Initialize performance optimizations on mount
  useEffect(() => {
    // Add resource hints for faster connections
    addResourceHints();
    
    // Setup lazy loading for images
    setupLazyLoading();
    
    // Optimize third-party scripts
    optimizeThirdPartyScripts();
    
    // Monitor bundle size in development
    if (process.env.NODE_ENV === 'development') {
      monitorBundleSize();
    }
    
    // Preload critical images for homepage
    const criticalImages = [
      '/images/dixis-logo-with-text.png',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop&auto=format'
    ];
    preloadCriticalImages(criticalImages);
    
    // Prefetch important routes
    prefetchRoutes(codeSplitBoundaries.prefetchRoutes);
  }, []);
  
  const handleMetric = useCallback((metric: PerformanceMetric) => {
    // Console logging for development - DISABLED to reduce spam
    if (enableConsoleLogging && false) {
      console.group(`🔍 Performance Metric: ${metric.name}`);
      logger.info('Value:', { value: metric.value });
      logger.info('Rating:', { rating: metric.rating });
      logger.info('ID:', { id: metric.id });
      if (metric.delta) logger.info('Delta:', { delta: metric.delta });
      if (metric.navigationType) logger.info('Navigation Type:', { navigationType: metric.navigationType });
      console.groupEnd();
    }

    // Send to analytics in production
    if (enableAnalytics) {
      // Send to your analytics service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.value),
          custom_map: {
            metric_rating: metric.rating,
            metric_delta: metric.delta,
          },
        });
      }
    }

    // Custom callback
    onMetric?.(metric);
  }, [onMetric, enableConsoleLogging, enableAnalytics]);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Import web-vitals dynamically for better performance
    import('web-vitals').then((vitals) => {
      // Core Web Vitals
      vitals.onCLS(handleMetric);
      vitals.onLCP(handleMetric);
      
      // Check if FID is available (deprecated in newer versions)
      if ('onFID' in vitals) {
        (vitals as any).onFID(handleMetric);
      }
      
      // Other important metrics
      vitals.onFCP(handleMetric);
      vitals.onTTFB(handleMetric);
      
      // React 19: Use INP instead of FID when available
      if ('onINP' in vitals) {
        (vitals as any).onINP(handleMetric);
      }
    }).catch((error) => {
      logger.warn('Failed to load web-vitals:', error);
    });

    // Monitor React-specific performance
    const monitorReactPerformance = () => {
      // Monitor component render times
      if ('performance' in window && 'measure' in window.performance) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name.includes('React')) {
              handleMetric({
                name: 'React Render',
                value: entry.duration,
                rating: entry.duration < 16 ? 'good' : entry.duration < 50 ? 'needs-improvement' : 'poor',
                id: entry.name,
              });
            }
          });
        });

        observer.observe({ entryTypes: ['measure'] });

        return () => observer.disconnect();
      }
    };

    const cleanup = monitorReactPerformance();

    // Monitor memory usage
    let memoryInterval: NodeJS.Timeout | null = null;
    
    const monitorMemory = () => {
      if ('memory' in performance && typeof window !== 'undefined') {
        try {
          const memoryInfo = (performance as any).memory;
          if (memoryInfo && memoryInfo.usedJSHeapSize && memoryInfo.jsHeapSizeLimit) {
            const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
            
            handleMetric({
              name: 'Memory Usage',
              value: memoryUsage,
              rating: memoryUsage < 50 ? 'good' : memoryUsage < 80 ? 'needs-improvement' : 'poor',
              id: 'memory-usage',
            });
          }
        } catch (error) {
          logger.warn('Failed to monitor memory:', { error: error as any });
        }
      }
    };

    // Monitor memory every 30 seconds with proper cleanup
    if (typeof window !== 'undefined') {
      memoryInterval = setInterval(monitorMemory, 30000);
    }

    // Monitor long tasks
    const monitorLongTasks = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            handleMetric({
              name: 'Long Task',
              value: entry.duration,
              rating: entry.duration < 50 ? 'good' : entry.duration < 100 ? 'needs-improvement' : 'poor',
              id: `long-task-${Date.now()}`,
            });
          });
        });

        try {
          observer.observe({ entryTypes: ['longtask'] });
          return () => observer.disconnect();
        } catch (error) {
          logger.warn('Long task monitoring not supported:', { error: error as any });
          return () => {};
        }
      }
      return () => {};
    };

    const longTaskCleanup = monitorLongTasks();

    // Cleanup function
    return () => {
      cleanup?.();
      if (memoryInterval) {
        clearInterval(memoryInterval);
        memoryInterval = null;
      }
      longTaskCleanup();
    };
  }, [handleMetric]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for manual performance measurements
 */
export function usePerformanceMeasurement() {
  const startMeasurement = useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`);
    }
  }, []);

  const endMeasurement = useCallback((name: string, onComplete?: (duration: number) => void) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const entries = performance.getEntriesByName(name, 'measure');
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry && onComplete) {
        onComplete(lastEntry.duration);
      }
      
      // Clean up marks
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    }
  }, []);

  return { startMeasurement, endMeasurement };
}

/**
 * Component wrapper for measuring render performance
 */
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const WrappedComponent = (props: T) => {
    const { startMeasurement, endMeasurement } = usePerformanceMeasurement();
    const name = componentName || Component.displayName || Component.name || 'Component';

    useEffect(() => {
      startMeasurement(`${name}-render`);
      
      return () => {
        endMeasurement(`${name}-render`, (duration) => {
          if (duration > 16) { // More than one frame
            logger.warn(`Slow render detected in ${name}: ${duration.toFixed(2)}ms`);
          }
        });
      };
    });

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${name})`;
  return WrappedComponent;
}

export default PerformanceMonitor;
