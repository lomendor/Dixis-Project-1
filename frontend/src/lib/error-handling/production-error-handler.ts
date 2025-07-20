import { logger } from '@/lib/logging/productionLogger';

/**
 * Production Error Handling System
 * Comprehensive error handling for production environment
 */

import React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  SERVER = 'SERVER_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  DATABASE = 'DATABASE_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  UPLOAD = 'UPLOAD_ERROR',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message);
    
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.metadata = metadata;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  public setRequestId(requestId: string): this {
    (this as any).requestId = requestId;
    return this;
  }

  public setUserId(userId: string): this {
    (this as any).userId = userId;
    return this;
  }

  public toJSON() {
    return {
      message: this.message,
      type: this.type,
      severity: this.severity,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      userId: this.userId,
      metadata: this.metadata,
      ...(process.env.NODE_ENV !== 'production' && { stack: this.stack }),
    };
  }
}

// Error logger interface
interface ErrorLogger {
  log(error: AppError | Error, context?: Record<string, any>): Promise<void>;
}

// Console logger (fallback)
class ConsoleLogger implements ErrorLogger {
  async log(error: AppError | Error, context?: Record<string, any>): Promise<void> {
    const timestamp = new Date().toISOString();
    const errorInfo = error instanceof AppError ? error.toJSON() : {
      message: error.message,
      stack: error.stack,
      timestamp,
    };

    logger.error(`[${timestamp}] ERROR:`, undefined, {
      ...errorInfo,
      context,
    });
  }
}

// Sentry logger (production)
class SentryLogger implements ErrorLogger {
  async log(error: AppError | Error, context?: Record<string, any>): Promise<void> {
    // In a real implementation, you would use @sentry/nextjs
    // For now, we'll use console as fallback
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: error instanceof AppError ? {
          errorType: error.type,
          severity: error.severity,
        } : {},
        extra: context,
      });
    } else {
      // Fallback to console
      await new ConsoleLogger().log(error, context);
    }
  }
}

// Error handler class
export class ProductionErrorHandler {
  private logger: ErrorLogger;

  constructor() {
    this.logger = process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN
      ? new SentryLogger()
      : new ConsoleLogger();
  }

  // Handle API errors
  public async handleApiError(
    error: Error | AppError,
    req: NextApiRequest,
    res: NextApiResponse,
    context?: Record<string, any>
  ): Promise<void> {
    const appError = error instanceof AppError ? error : this.convertToAppError(error);
    
    // Add request context
    appError.setRequestId(this.generateRequestId(req));
    
    // Log the error
    await this.logger.log(appError, {
      ...context,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
      ip: this.getClientIp(req),
    });

    // Send response
    const response = this.formatErrorResponse(appError);
    res.status(appError.statusCode).json(response);
  }

  // Handle client-side errors
  public async handleClientError(
    error: Error | AppError,
    context?: Record<string, any>
  ): Promise<void> {
    const appError = error instanceof AppError ? error : this.convertToAppError(error);
    
    await this.logger.log(appError, {
      ...context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });
  }

  // Convert regular error to AppError
  private convertToAppError(error: Error): AppError {
    // Determine error type based on error message or properties
    let type = ErrorType.SERVER;
    let statusCode = 500;
    let severity = ErrorSeverity.MEDIUM;

    if (error.message.includes('validation')) {
      type = ErrorType.VALIDATION;
      statusCode = 400;
      severity = ErrorSeverity.LOW;
    } else if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      type = ErrorType.AUTHENTICATION;
      statusCode = 401;
      severity = ErrorSeverity.MEDIUM;
    } else if (error.message.includes('forbidden') || error.message.includes('authorization')) {
      type = ErrorType.AUTHORIZATION;
      statusCode = 403;
      severity = ErrorSeverity.MEDIUM;
    } else if (error.message.includes('not found')) {
      type = ErrorType.NOT_FOUND;
      statusCode = 404;
      severity = ErrorSeverity.LOW;
    } else if (error.message.includes('rate limit')) {
      type = ErrorType.RATE_LIMIT;
      statusCode = 429;
      severity = ErrorSeverity.MEDIUM;
    }

    return new AppError(
      error.message,
      type,
      statusCode,
      severity,
      true,
      { originalError: error.name }
    );
  }

  // Format error response for API
  private formatErrorResponse(error: AppError) {
    const baseResponse = {
      success: false,
      error: {
        message: error.message,
        type: error.type,
        timestamp: error.timestamp.toISOString(),
        requestId: error.requestId,
      },
    };

    // Add stack trace in development
    if (process.env.NODE_ENV !== 'production') {
      (baseResponse.error as any).stack = error.stack;
      (baseResponse.error as any).metadata = error.metadata;
    }

    return baseResponse;
  }

  // Generate request ID
  private generateRequestId(req: NextApiRequest): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get client IP
  private getClientIp(req: NextApiRequest): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    return ip || 'unknown';
  }
}

// Global error handler instance
export const errorHandler = new ProductionErrorHandler();

// Utility functions for common errors
export const createValidationError = (message: string, field?: string) =>
  new AppError(
    message,
    ErrorType.VALIDATION,
    400,
    ErrorSeverity.LOW,
    true,
    { field }
  );

export const createAuthenticationError = (message: string = 'Authentication required') =>
  new AppError(
    message,
    ErrorType.AUTHENTICATION,
    401,
    ErrorSeverity.MEDIUM
  );

export const createAuthorizationError = (message: string = 'Insufficient permissions') =>
  new AppError(
    message,
    ErrorType.AUTHORIZATION,
    403,
    ErrorSeverity.MEDIUM
  );

export const createNotFoundError = (resource: string = 'Resource') =>
  new AppError(
    `${resource} not found`,
    ErrorType.NOT_FOUND,
    404,
    ErrorSeverity.LOW
  );

export const createRateLimitError = (message: string = 'Rate limit exceeded') =>
  new AppError(
    message,
    ErrorType.RATE_LIMIT,
    429,
    ErrorSeverity.MEDIUM
  );

export const createServerError = (message: string = 'Internal server error') =>
  new AppError(
    message,
    ErrorType.SERVER,
    500,
    ErrorSeverity.HIGH
  );

export const createPaymentError = (message: string) =>
  new AppError(
    message,
    ErrorType.PAYMENT,
    402,
    ErrorSeverity.HIGH
  );

// Error boundary for React components
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return class ErrorBoundaryWrapper extends React.Component<any, { hasError: boolean }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorHandler.handleClientError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    }

    render() {
      if (this.state.hasError) {
        return React.createElement('div', {
          className: 'min-h-screen flex items-center justify-center bg-gray-50'
        }, React.createElement('div', {
          className: 'text-center'
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-2xl font-bold text-gray-900 mb-4'
          }, 'Something went wrong'),
          React.createElement('p', {
            key: 'message',
            className: 'text-gray-600 mb-6'
          }, 'An error occurred. Please try again.'),
          React.createElement('button', {
            key: 'button',
            onClick: () => window.location.reload(),
            className: 'bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700'
          }, 'Reload page')
        ]));
      }

      return React.createElement(Component, this.props);
    }
  };
};
