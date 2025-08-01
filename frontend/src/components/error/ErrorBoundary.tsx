'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only affects this component
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    };

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Connected to production logging service
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(console.error);
    } else {
      logger.error('Error Boundary caught an error:', toError(errorReport), errorToContext(errorReport));
    }
  };

  private handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }

    // Reset error state after a brief delay to prevent rapid retries
    this.retryTimeoutId = window.setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        errorId: undefined 
      });
    }, 100);
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Κάτι πήγε στραβά
              </h1>
              <p className="text-gray-600 mb-4">
                Συγγνώμη, παρουσιάστηκε ένα απροσδόκητο σφάλμα. Μπορείτε να δοκιμάσετε ξανά ή να επιστρέψετε στην αρχική σελίδα.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Error Details (Development)
                </h3>
                <p className="text-xs text-red-700 mb-2 font-mono">
                  {this.state.error.message}
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-red-600">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCwIcon className="w-4 h-4" />
                <span>Δοκιμάστε ξανά</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Αρχική σελίδα</span>
              </button>
            </div>

            {/* Contact Support */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Αν το πρόβλημα συνεχίζει, επικοινωνήστε με την υποστήριξη.
              </p>
              {this.state.errorId && (
                <p className="text-xs text-gray-400 mt-1">
                  Κωδικός σφάλματος: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Specialized error boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      logger.error('Page Error:', error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; componentName?: string }> = ({ 
  children, 
  componentName 
}) => (
  <ErrorBoundary
    isolate
    onError={(error, errorInfo) => {
      logger.error(`Component Error (${componentName}):`, error, errorInfo);
    }}
    fallback={(error, errorInfo, retry) => (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <AlertTriangleIcon className="w-4 h-4" />
          <span className="font-medium">Σφάλμα {componentName}</span>
        </div>
        <p className="text-red-700 text-sm mb-3">
          Αυτό το τμήμα δεν μπόρεσε να φορτώσει σωστά.
        </p>
        <button
          onClick={retry}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Δοκιμάστε ξανά
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);