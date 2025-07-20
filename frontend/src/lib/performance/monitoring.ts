'use client';

import { logger } from '@/lib/logging/productionLogger';

/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userAgent?: string;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;
  private apiEndpoint: string = '/api/analytics/track';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeNavigationTiming();
      this.initializeResourceTiming();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private async initializeWebVitals(): Promise<void> {
    try {
      const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

      onCLS(this.handleWebVital.bind(this));
      onINP(this.handleWebVital.bind(this)); // INP replaces FID
      onFCP(this.handleWebVital.bind(this));
      onLCP(this.handleWebVital.bind(this));
      onTTFB(this.handleWebVital.bind(this));
    } catch (error) {
      logger.warn('Web Vitals not available:', error);
    }
  }

  /**
   * Handle Web Vitals metrics
   */
  private handleWebVital(metric: WebVitalsMetric): void {
    if (!this.isEnabled) return;

    this.recordMetric({
      name: `web_vital_${metric.name.toLowerCase()}`,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Send to analytics if rating is poor
    if (metric.rating === 'poor') {
      this.sendToAnalytics({
        event: 'poor_web_vital',
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href
      });
    }
  }

  /**
   * Initialize Navigation Timing monitoring
   */
  private initializeNavigationTiming(): void {
    if (!('performance' in window) || !('getEntriesByType' in performance)) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordNavigationMetrics(navigation);
        }
      }, 0);
    });
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationMetrics(navigation: PerformanceNavigationTiming): void {
    const metrics = [
      { name: 'dns_lookup', value: navigation.domainLookupEnd - navigation.domainLookupStart },
      { name: 'tcp_connect', value: navigation.connectEnd - navigation.connectStart },
      { name: 'ssl_handshake', value: navigation.connectEnd - navigation.secureConnectionStart },
      { name: 'request_time', value: navigation.responseStart - navigation.requestStart },
      { name: 'response_time', value: navigation.responseEnd - navigation.responseStart },
      { name: 'dom_processing', value: navigation.domContentLoadedEventEnd - navigation.responseEnd },
      { name: 'load_complete', value: navigation.loadEventEnd - navigation.loadEventStart },
      { name: 'total_load_time', value: navigation.loadEventEnd - navigation.fetchStart }
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now(),
          url: window.location.href
        });
      }
    });
  }

  /**
   * Initialize Resource Timing monitoring
   */
  private initializeResourceTiming(): void {
    if (!('performance' in window) || !('getEntriesByType' in performance)) return;

    // Monitor large resources
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // Track slow resources (>1s)
          if (resource.duration > 1000) {
            this.recordMetric({
              name: 'slow_resource',
              value: resource.duration,
              timestamp: Date.now(),
              url: resource.name
            });
          }

          // Track large resources (>500KB)
          if (resource.transferSize > 500000) {
            this.recordMetric({
              name: 'large_resource',
              value: resource.transferSize,
              timestamp: Date.now(),
              url: resource.name
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Send critical metrics immediately
    if (this.isCriticalMetric(metric)) {
      this.sendToAnalytics({
        event: 'performance_metric',
        ...metric
      });
    }
  }

  /**
   * Check if metric is critical
   */
  private isCriticalMetric(metric: PerformanceMetric): boolean {
    const criticalThresholds = {
      'web_vital_lcp': 4000, // 4s
      'web_vital_fid': 300,  // 300ms
      'web_vital_cls': 0.25, // 0.25
      'total_load_time': 5000, // 5s
      'slow_resource': 2000,   // 2s
    };

    return metric.name in criticalThresholds && 
           metric.value > criticalThresholds[metric.name as keyof typeof criticalThresholds];
  }

  /**
   * Send data to analytics
   */
  private async sendToAnalytics(data: any): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance',
          data,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      logger.warn('Failed to send analytics:', error);
    }
  }

  /**
   * Get all recorded metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  public getMetricsSummary(): Record<string, { avg: number; max: number; count: number }> {
    const tempSummary: Record<string, { values: number[]; avg: number; max: number; count: number }> = {};

    this.metrics.forEach(metric => {
      if (!tempSummary[metric.name]) {
        tempSummary[metric.name] = { values: [], avg: 0, max: 0, count: 0 };
      }
      tempSummary[metric.name].values.push(metric.value);
      tempSummary[metric.name].max = Math.max(tempSummary[metric.name].max, metric.value);
      tempSummary[metric.name].count++;
    });

    // Calculate averages and create final summary without values
    const summary: Record<string, { avg: number; max: number; count: number }> = {};
    Object.keys(tempSummary).forEach(key => {
      const values = tempSummary[key].values;
      summary[key] = {
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        max: tempSummary[key].max,
        count: tempSummary[key].count
      };
    });

    return summary;
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  public isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export utilities
export { PerformanceMonitor, performanceMonitor };
export type { PerformanceMetric, WebVitalsMetric };

/**
 * Hook for using performance monitoring in React components
 */
export function usePerformanceMonitoring() {
  return {
    recordMetric: (metric: PerformanceMetric) => performanceMonitor.recordMetric(metric),
    getMetrics: () => performanceMonitor.getMetrics(),
    getSummary: () => performanceMonitor.getMetricsSummary(),
    clearMetrics: () => performanceMonitor.clearMetrics(),
    isEnabled: () => performanceMonitor.isMonitoringEnabled()
  };
}

export default performanceMonitor;
