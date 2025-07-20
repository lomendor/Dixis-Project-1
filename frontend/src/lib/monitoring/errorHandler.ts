import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

// Production Error Handling and Monitoring
import { productionConfig } from '@/lib/config/production';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp?: Date;
  environment?: string;
  version?: string;
  extra?: Record<string, any>;
  type?: string;
  statusCode?: number;
  componentName?: string;
  operationName?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  responseData?: any;
  props?: any;
  duration?: number;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'api' | 'ui' | 'auth' | 'payment' | 'database' | 'external' | 'unknown';
  fingerprint?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private isInitialized = false;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Sentry initialization temporarily disabled for build
    if (productionConfig.isProduction && productionConfig.sentryDsn) {
      logger.info('Sentry initialization skipped - not installed');
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, {
          category: 'unknown',
          severity: 'high',
          context: {
            type: 'unhandledrejection',
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        });
      });

      // Handle global errors
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          category: 'ui',
          severity: 'medium',
          context: {
            type: 'global_error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        });
      });
    }
  }

  captureError(error: Error | string, options: Partial<ErrorReport> = {}) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const report: ErrorReport = {
      error: errorObj,
      context: {
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version,
        ...options.context,
      },
      severity: options.severity || 'medium',
      category: options.category || 'unknown',
      fingerprint: options.fingerprint || this.generateFingerprint(errorObj),
    };

    // Log to console in development
    if (productionConfig.isDevelopment) {
      logger.error('Error captured:', toError(report), errorToContext(report));
    }

    // Send to monitoring service
    this.sendToMonitoring(report);

    // Store locally for offline scenarios
    this.storeLocalError(report);

    return report;
  }

  private generateFingerprint(error: Error): string {
    const key = `${error.name}-${error.message}-${error?.stack?.split('\n')[1] || ''}`;
    return btoa(key).slice(0, 16);
  }

  private async sendToMonitoring(report: ErrorReport) {
    try {
      // Sentry reporting temporarily disabled
      if (productionConfig.isProduction && productionConfig.sentryDsn) {
        logger.info('Sentry reporting skipped - not installed');
      }

      // Send to custom monitoring endpoint
      if (productionConfig.isProduction) {
        await this.sendToCustomEndpoint(report);
      }
    } catch (monitoringError) {
      logger.error('Failed to send error to monitoring:', toError(monitoringError), errorToContext(monitoringError));
    }
  }

  private mapSeverityToSentryLevel(severity: string): any {
    const mapping = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'fatal',
    };
    return mapping[severity as keyof typeof mapping] || 'error';
  }

  private async sendToCustomEndpoint(report: ErrorReport) {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            name: report.error.name,
            message: report.error.message,
            stack: report.error.stack,
          },
          context: report.context,
          severity: report.severity,
          category: report.category,
          fingerprint: report.fingerprint,
        }),
      });
    } catch (error) {
      logger.error('Failed to send to custom endpoint:', toError(error), errorToContext(error));
    }
  }

  private storeLocalError(report: ErrorReport) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('dixis_error_reports') || '[]';
        const reports = JSON.parse(stored);
        
        reports.push({
          ...report,
          error: {
            name: report.error.name,
            message: report.error.message,
            stack: report.error.stack,
          },
        });
        
        // Keep only last 10 errors
        const trimmed = reports.slice(-10);
        localStorage.setItem('dixis_error_reports', JSON.stringify(trimmed));
      }
    } catch (error) {
      logger.error('Failed to store error locally:', toError(error), errorToContext(error));
    }
  }

  // API Error Handler
  handleApiError(error: any, context: Partial<ErrorContext> = {}) {
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let category: ErrorReport['category'] = 'api';

    // Determine severity based on status code
    if (error.status) {
      if (error.status >= 500) {
        severity = 'high';
      } else if (error.status >= 400) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
    }

    // Categorize based on error type
    if (error?.message?.includes('auth') || error.status === 401) {
      category = 'auth';
    } else if (error?.message?.includes('payment') || error?.message?.includes('stripe')) {
      category = 'payment';
    } else if (error?.message?.includes('database') || error?.message?.includes('sql')) {
      category = 'database';
    }

    return this.captureError(error, {
      severity,
      category,
      context: {
        ...context,
        statusCode: error.status,
        responseData: error.data,
      },
    });
  }

  // UI Error Handler
  handleUIError(error: Error, componentName?: string, props?: any) {
    return this.captureError(error, {
      severity: 'medium',
      category: 'ui',
      context: {
        componentName,
        props: props ? JSON.stringify(props) : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    });
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => Promise<any>) {
    const start = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - start;
      
      if (duration > 1000) { // Log slow operations
        logger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        
        if (productionConfig.isProduction) {
          this.captureError(new Error(`Slow operation: ${name}`), {
            severity: 'low',
            category: 'unknown',
            context: {
              operationName: name,
              duration,
              type: 'performance',
            },
          });
        }
      }
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      monitoring: this.isInitialized,
    };

    try {
      // Add more health checks here
      return {
        status: 'healthy',
        details: checks,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          ...checks,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const captureError = (error: Error | string, options?: Partial<ErrorReport>) => 
  errorHandler.captureError(error, options);

export const handleApiError = (error: any, context?: Partial<ErrorContext>) => 
  errorHandler.handleApiError(error, context);

export const handleUIError = (error: Error, componentName?: string, props?: any) => 
  errorHandler.handleUIError(error, componentName, props);

export const measurePerformance = (name: string, fn: () => Promise<any>) => 
  errorHandler.measurePerformance(name, fn);

// Initialize error handler
if (typeof window !== 'undefined') {
  errorHandler.initialize();
}

export default errorHandler;
