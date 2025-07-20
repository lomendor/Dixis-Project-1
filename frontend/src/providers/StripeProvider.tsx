'use client';

import { logger } from '@/lib/logging/productionLogger';

import React, { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: ReactNode;
  options?: {
    clientSecret?: string;
    appearance?: {
      theme?: 'stripe' | 'night' | 'flat';
      variables?: {
        colorPrimary?: string;
        colorBackground?: string;
        colorText?: string;
        colorDanger?: string;
        fontFamily?: string;
        spacingUnit?: string;
        borderRadius?: string;
      };
    };
  };
}

/**
 * StripeProvider component that wraps the application with Stripe Elements
 * Provides Stripe context to all child components
 */
export default function StripeProvider({ children, options }: StripeProviderProps) {
  // Default Stripe Elements options with Dixis branding
  const defaultOptions = {
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a', // Green-600 (Dixis primary color)
        colorBackground: '#ffffff',
        colorText: '#1f2937', // Gray-800
        colorDanger: '#dc2626', // Red-600
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #d1d5db',
        },
        '.Input:focus': {
          borderColor: '#16a34a',
          boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.1)',
        },
        '.Input--invalid': {
          borderColor: '#dc2626',
        },
        '.Tab': {
          borderRadius: '6px',
          border: '1px solid #d1d5db',
        },
        '.Tab:hover': {
          backgroundColor: '#f9fafb',
        },
        '.Tab--selected': {
          backgroundColor: '#f0fdf4',
          borderColor: '#16a34a',
        },
        '.Label': {
          fontWeight: '500',
          fontSize: '14px',
          color: '#374151',
        },
      },
    },
    ...options,
  };

  // Error boundary for Stripe initialization
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    logger.error('Stripe publishable key is missing. Please check your environment variables.');
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">Payment system is currently unavailable.</p>
        <p className="text-red-600 text-sm mt-1">Please contact support if this issue persists.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={defaultOptions}>
      {children}
    </Elements>
  );
}

/**
 * Hook to check if Stripe is properly configured
 */
export function useStripeConfig() {
  const isConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  return {
    isConfigured,
    publishableKey,
    isTestMode: publishableKey?.includes('pk_test_') ?? false,
    isLiveMode: publishableKey?.includes('pk_live_') ?? false,
  };
}