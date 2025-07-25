'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report error to monitoring system
    if (typeof window !== 'undefined') {
      import('@/lib/monitoring/errorHandler').then(({ errorHandler }) => {
        errorHandler.handleUIError(error, 'ErrorBoundary', errorInfo);
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Κάτι πήγε στραβά</h2>
            <p className="text-gray-600 mb-6">
              Παρουσιάστηκε ένα απροσδόκητο σφάλμα. Παρακαλούμε δοκιμάστε ξανά.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Δοκιμάστε ξανά
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Ανανέωση σελίδας
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
