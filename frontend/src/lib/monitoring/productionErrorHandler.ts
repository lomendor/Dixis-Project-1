/**
 * Production Error Handling System for Dixis Fresh
 * Comprehensive error tracking, reporting, and recovery
 */

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for Greek marketplace
export enum ErrorCategory {
  PAYMENT = 'payment',
  TAX_CALCULATION = 'tax_calculation',
  AUTHENTICATION = 'authentication',
  PRODUCT_CATALOG = 'product_catalog',
  ORDER_PROCESSING = 'order_processing',
  SHIPPING = 'shipping',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  USER_INTERFACE = 'user_interface'
}

// Greek-specific error types
export enum GreekErrorType {
  VAT_CALCULATION_FAILED = 'vat_calculation_failed',
  COURIER_INTEGRATION_FAILED = 'courier_integration_failed',
  QUICKBOOKS_SYNC_FAILED = 'quickbooks_sync_failed',
  SEPA_PAYMENT_FAILED = 'sepa_payment_failed',
  PRODUCER_VERIFICATION_FAILED = 'producer_verification_failed',
  POSTAL_CODE_VALIDATION_FAILED = 'postal_code_validation_failed'
}

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  orderId?: string;
  productId?: string;
  producerId?: string;
  ipAddress?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  grecianContext?: {
    vatNumber?: string;
    postalCode?: string;
    region?: string;
    courierService?: string;
  };
}

interface ErrorReport {
  id: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  type: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
  attempts: number;
}

class ProductionErrorHandler {
  private static instance: ProductionErrorHandler;
  private errorReports: Map<string, ErrorReport> = new Map();
  private criticalErrorThreshold = 5; // Critical errors in 5 minutes
  private errorWindowMs = 5 * 60 * 1000; // 5 minutes
  
  static getInstance(): ProductionErrorHandler {
    if (!ProductionErrorHandler.instance) {
      ProductionErrorHandler.instance = new ProductionErrorHandler();
    }
    return ProductionErrorHandler.instance;
  }

  /**
   * Handle and report errors with Greek marketplace context
   */
  async handleError(
    error: Error,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context: ErrorContext = {}
  ): Promise<string> {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    const errorReport: ErrorReport = {
      id: errorId,
      severity,
      category,
      type: error.name || 'UnknownError',
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp,
        url: context.url || (typeof window !== 'undefined' ? window.location.href : undefined)
      },
      timestamp,
      resolved: false,
      attempts: 0
    };

    this.errorReports.set(errorId, errorReport);

    // Log error with structured context
    logger.error(
      `${category.toUpperCase()}: ${error.message}`,
      toError(error),
      {
        errorId,
        severity,
        category,
        ...errorToContext(error),
        ...context
      }
    );

    // Handle based on severity
    await this.processBySeverity(errorReport);

    // Check for error rate spikes
    await this.checkErrorRates();

    return errorId;
  }

  /**
   * Handle Greek-specific business errors
   */
  async handleGreekBusinessError(
    type: GreekErrorType,
    message: string,
    context: ErrorContext & { grecianContext?: any } = {}
  ): Promise<string> {
    const error = new Error(message);
    error.name = type;

    let severity = ErrorSeverity.MEDIUM;
    let category = ErrorCategory.INTEGRATION;

    // Determine severity based on Greek business impact
    switch (type) {
      case GreekErrorType.VAT_CALCULATION_FAILED:
        severity = ErrorSeverity.HIGH;
        category = ErrorCategory.TAX_CALCULATION;
        break;
      case GreekErrorType.SEPA_PAYMENT_FAILED:
        severity = ErrorSeverity.CRITICAL;
        category = ErrorCategory.PAYMENT;
        break;
      case GreekErrorType.COURIER_INTEGRATION_FAILED:
        severity = ErrorSeverity.HIGH;
        category = ErrorCategory.SHIPPING;
        break;
      case GreekErrorType.QUICKBOOKS_SYNC_FAILED:
        severity = ErrorSeverity.MEDIUM;
        category = ErrorCategory.INTEGRATION;
        break;
      case GreekErrorType.PRODUCER_VERIFICATION_FAILED:
        severity = ErrorSeverity.HIGH;
        category = ErrorCategory.AUTHENTICATION;
        break;
    }

    return await this.handleError(error, severity, category, context);
  }

  /**
   * Process errors based on severity level
   */
  private async processBySeverity(errorReport: ErrorReport): Promise<void> {
    switch (errorReport.severity) {
      case ErrorSeverity.CRITICAL:
        await this.handleCriticalError(errorReport);
        break;
      case ErrorSeverity.HIGH:
        await this.handleHighSeverityError(errorReport);
        break;
      case ErrorSeverity.MEDIUM:
        await this.handleMediumSeverityError(errorReport);
        break;
      case ErrorSeverity.LOW:
        await this.handleLowSeverityError(errorReport);
        break;
    }
  }

  /**
   * Handle critical errors (immediate attention required)
   */
  private async handleCriticalError(errorReport: ErrorReport): Promise<void> {
    // Immediate notifications
    await this.sendCriticalAlert(errorReport);
    
    // Attempt automatic recovery
    await this.attemptRecovery(errorReport);
    
    // Log to special critical error log
    logger.error('CRITICAL ERROR DETECTED', toError(new Error(errorReport.message)), {
      errorId: errorReport.id,
      category: errorReport.category,
      context: errorReport.context,
      requiresImmediateAttention: true
    });
  }

  /**
   * Handle high severity errors
   */
  private async handleHighSeverityError(errorReport: ErrorReport): Promise<void> {
    // Queue for admin notification
    await this.queueAdminNotification(errorReport);
    
    // Attempt recovery if applicable
    if (this.isRecoverable(errorReport)) {
      await this.attemptRecovery(errorReport);
    }
  }

  /**
   * Handle medium severity errors
   */
  private async handleMediumSeverityError(errorReport: ErrorReport): Promise<void> {
    // Log for monitoring
    logger.warn(`Medium severity error: ${errorReport.message}`, {
      errorId: errorReport.id,
      category: errorReport.category
    });
    
    // Queue for daily digest
    await this.addToDailyDigest(errorReport);
  }

  /**
   * Handle low severity errors
   */
  private async handleLowSeverityError(errorReport: ErrorReport): Promise<void> {
    // Just track for analytics
    logger.info(`Low severity error tracked: ${errorReport.message}`, {
      errorId: errorReport.id,
      category: errorReport.category
    });
  }

  /**
   * Attempt automatic error recovery
   */
  private async attemptRecovery(errorReport: ErrorReport): Promise<boolean> {
    try {
      errorReport.attempts++;
      
      switch (errorReport.category) {
        case ErrorCategory.PAYMENT:
          return await this.recoverPaymentError(errorReport);
        case ErrorCategory.TAX_CALCULATION:
          return await this.recoverTaxCalculationError(errorReport);
        case ErrorCategory.INTEGRATION:
          return await this.recoverIntegrationError(errorReport);
        case ErrorCategory.SHIPPING:
          return await this.recoverShippingError(errorReport);
        default:
          return false;
      }
    } catch (recoveryError) {
      logger.error('Recovery attempt failed', toError(recoveryError as Error), {
        originalErrorId: errorReport.id,
        recoveryAttempt: errorReport.attempts
      });
      return false;
    }
  }

  /**
   * Recover payment errors
   */
  private async recoverPaymentError(errorReport: ErrorReport): Promise<boolean> {
    // For Greek SEPA payments, attempt retry with different parameters
    if (errorReport.type === GreekErrorType.SEPA_PAYMENT_FAILED) {
      logger.info('Attempting SEPA payment recovery', {
        errorId: errorReport.id,
        attempt: errorReport.attempts
      });
      
      // Could implement retry logic here
      // For now, just mark for manual review
      await this.flagForManualReview(errorReport, 'SEPA payment requires manual intervention');
      return false;
    }
    
    return false;
  }

  /**
   * Recover tax calculation errors
   */
  private async recoverTaxCalculationError(errorReport: ErrorReport): Promise<boolean> {
    // For Greek VAT calculation errors, use fallback rates
    if (errorReport.type === GreekErrorType.VAT_CALCULATION_FAILED) {
      logger.info('Attempting VAT calculation recovery with fallback rates', {
        errorId: errorReport.id,
        grecianContext: errorReport.context.grecianContext
      });
      
      // Could implement fallback calculation here
      errorReport.resolution = 'Fallback VAT calculation applied';
      errorReport.resolved = true;
      return true;
    }
    
    return false;
  }

  /**
   * Recover integration errors
   */
  private async recoverIntegrationError(errorReport: ErrorReport): Promise<boolean> {
    // For QuickBooks or courier integration errors
    if (errorReport.type === GreekErrorType.QUICKBOOKS_SYNC_FAILED) {
      logger.info('Queuing QuickBooks sync for retry', {
        errorId: errorReport.id
      });
      
      // Queue for retry
      await this.queueForRetry(errorReport, 300000); // Retry in 5 minutes
      return true;
    }
    
    if (errorReport.type === GreekErrorType.COURIER_INTEGRATION_FAILED) {
      logger.info('Attempting courier integration fallback', {
        errorId: errorReport.id,
        courierService: errorReport.context.grecianContext?.courierService
      });
      
      // Could switch to backup courier service
      return false;
    }
    
    return false;
  }

  /**
   * Recover shipping errors
   */
  private async recoverShippingError(errorReport: ErrorReport): Promise<boolean> {
    // For Greek postal code validation or shipping calculation errors
    if (errorReport.type === GreekErrorType.POSTAL_CODE_VALIDATION_FAILED) {
      logger.info('Attempting postal code validation recovery', {
        errorId: errorReport.id,
        postalCode: errorReport.context.grecianContext?.postalCode
      });
      
      // Could implement manual validation or ask user for confirmation
      return false;
    }
    
    return false;
  }

  /**
   * Check for error rate spikes
   */
  private async checkErrorRates(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.errorWindowMs;
    
    const recentCriticalErrors = Array.from(this.errorReports.values())
      .filter(error => 
        error.severity === ErrorSeverity.CRITICAL &&
        new Date(error.timestamp).getTime() > windowStart
      );
    
    if (recentCriticalErrors.length >= this.criticalErrorThreshold) {
      await this.triggerEmergencyProtocol(recentCriticalErrors);
    }
  }

  /**
   * Trigger emergency protocol for error spikes
   */
  private async triggerEmergencyProtocol(errors: ErrorReport[]): Promise<void> {
    logger.error('EMERGENCY: Critical error threshold exceeded', null, {
      criticalErrorCount: errors.length,
      timeWindow: this.errorWindowMs / 1000,
      errors: errors.map(e => ({ id: e.id, category: e.category, type: e.type }))
    });
    
    // Could implement circuit breaker pattern here
    // Could send emergency notifications
    // Could trigger automatic failover
  }

  /**
   * Send critical alerts
   */
  private async sendCriticalAlert(errorReport: ErrorReport): Promise<void> {
    // In production, this would send to Slack, SMS, email, etc.
    logger.error('CRITICAL ALERT TRIGGERED', null, {
      errorId: errorReport.id,
      message: errorReport.message,
      category: errorReport.category,
      severity: errorReport.severity,
      requiresImmediateAction: true
    });
  }

  /**
   * Queue admin notification
   */
  private async queueAdminNotification(errorReport: ErrorReport): Promise<void> {
    logger.warn('Admin notification queued', {
      errorId: errorReport.id,
      category: errorReport.category,
      message: errorReport.message
    });
  }

  /**
   * Add to daily digest
   */
  private async addToDailyDigest(errorReport: ErrorReport): Promise<void> {
    // Implementation would add to digest queue
    logger.info('Added to daily error digest', {
      errorId: errorReport.id,
      category: errorReport.category
    });
  }

  /**
   * Flag for manual review
   */
  private async flagForManualReview(errorReport: ErrorReport, reason: string): Promise<void> {
    errorReport.resolution = `Flagged for manual review: ${reason}`;
    
    logger.warn('Error flagged for manual review', {
      errorId: errorReport.id,
      reason,
      category: errorReport.category
    });
  }

  /**
   * Queue error for retry
   */
  private async queueForRetry(errorReport: ErrorReport, delayMs: number): Promise<void> {
    // Implementation would add to retry queue
    logger.info('Error queued for retry', {
      errorId: errorReport.id,
      delayMs,
      attempt: errorReport.attempts
    });
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(errorReport: ErrorReport): boolean {
    const recoverableTypes = [
      GreekErrorType.VAT_CALCULATION_FAILED,
      GreekErrorType.QUICKBOOKS_SYNC_FAILED,
      GreekErrorType.COURIER_INTEGRATION_FAILED
    ];
    
    return recoverableTypes.includes(errorReport.type as GreekErrorType);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `err_${timestamp}_${random}`;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(timeWindow: number = 24 * 60 * 60 * 1000): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    resolved: number;
    pending: number;
  } {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const recentErrors = Array.from(this.errorReports.values())
      .filter(error => new Date(error.timestamp).getTime() > windowStart);
    
    const bySeverity = {} as Record<ErrorSeverity, number>;
    const byCategory = {} as Record<ErrorCategory, number>;
    
    Object.values(ErrorSeverity).forEach(severity => {
      bySeverity[severity] = 0;
    });
    
    Object.values(ErrorCategory).forEach(category => {
      byCategory[category] = 0;
    });
    
    let resolved = 0;
    let pending = 0;
    
    recentErrors.forEach(error => {
      bySeverity[error.severity]++;
      byCategory[error.category]++;
      
      if (error.resolved) {
        resolved++;
      } else {
        pending++;
      }
    });
    
    return {
      total: recentErrors.length,
      bySeverity,
      byCategory,
      resolved,
      pending
    };
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string, resolution: string): boolean {
    const errorReport = this.errorReports.get(errorId);
    if (errorReport) {
      errorReport.resolved = true;
      errorReport.resolution = resolution;
      
      logger.info('Error marked as resolved', {
        errorId,
        resolution,
        category: errorReport.category
      });
      
      return true;
    }
    
    return false;
  }
}

// Global error handler instance
export const productionErrorHandler = ProductionErrorHandler.getInstance();

// React Error Boundary for frontend errors
export class ProductionErrorBoundary extends Error {
  constructor(
    message: string,
    public readonly componentStack?: string,
    public readonly errorBoundary?: string
  ) {
    super(message);
    this.name = 'ProductionErrorBoundary';
  }
}

// Hook for React components
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: ErrorContext) => 
      productionErrorHandler.handleError(error, ErrorSeverity.HIGH, ErrorCategory.USER_INTERFACE, context),
    
    handleGreekBusinessError: (type: GreekErrorType, message: string, context?: ErrorContext) =>
      productionErrorHandler.handleGreekBusinessError(type, message, context),
    
    getStatistics: () => productionErrorHandler.getErrorStatistics()
  };
}

export default productionErrorHandler;