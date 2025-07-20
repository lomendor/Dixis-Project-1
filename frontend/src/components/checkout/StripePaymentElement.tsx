'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState, useEffect } from 'react';
import { 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ExpressPaymentMethods from './ExpressPaymentMethods';

interface StripePaymentElementProps {
  clientSecret: string;
  orderId: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentProcessing?: (isProcessing: boolean) => void;
  className?: string;
}

export default function StripePaymentElement({
  clientSecret,
  orderId,
  onPaymentSuccess,
  onPaymentError,
  onPaymentProcessing,
  className = '',
}: StripePaymentElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Check payment status on component mount
  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Η πληρωμή ολοκληρώθηκε επιτυχώς!');
          setMessageType('success');
          onPaymentSuccess(paymentIntent);
          break;
        case 'processing':
          setMessage('Η πληρωμή σας επεξεργάζεται...');
          setMessageType('info');
          break;
        case 'requires_payment_method':
          setMessage('Παρακαλούμε συμπληρώστε τα στοιχεία πληρωμής σας.');
          setMessageType('info');
          break;
        default:
          setMessage('Κάτι πήγε στραβά με την πληρωμή.');
          setMessageType('error');
          break;
      }
    });
  }, [stripe, clientSecret, onPaymentSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onPaymentError('Το σύστημα πληρωμών δεν είναι διαθέσιμο. Παρακαλούμε δοκιμάστε ξανά.');
      return;
    }

    setIsLoading(true);
    setMessage(null);
    onPaymentProcessing?.(true);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Payment failed
        const errorMessage = getErrorMessage(error);
        setMessage(errorMessage);
        setMessageType('error');
        onPaymentError(errorMessage);
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded
        setMessage('Η πληρωμή ολοκληρώθηκε επιτυχώς!');
        setMessageType('success');
        
        // Confirm payment with backend
        await confirmPaymentWithBackend(paymentIntent.id);
        onPaymentSuccess(paymentIntent);
      } else {
        // Payment requires additional action
        setMessage('Η πληρωμή σας επεξεργάζεται...');
        setMessageType('info');
      }
    } catch (err) {
      const errorMessage = 'Προέκυψε σφάλμα κατά την επεξεργασία της πληρωμής. Παρακαλούμε δοκιμάστε ξανά.';
      setMessage(errorMessage);
      setMessageType('error');
      onPaymentError(errorMessage);
      logger.error('Payment error:', toError(err), errorToContext(err));
    } finally {
      setIsLoading(false);
      onPaymentProcessing?.(false);
    }
  };

  // Confirm payment with Laravel backend
  const confirmPaymentWithBackend = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add authentication header if user is logged in
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }),
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend confirmation failed: ${response.status}`);
      }

      const result = await response.json();
      logger.info('Payment confirmed with backend:', result);
    } catch (error) {
      logger.error('Failed to confirm payment with backend:', toError(error), errorToContext(error));
      // Don't throw error here as payment was successful with Stripe
      // This is just for backend sync
    }
  };

  // Get user-friendly error message
  const getErrorMessage = (error: any): string => {
    switch (error.type) {
      case 'card_error':
        switch (error.code) {
          case 'card_declined':
            return 'Η κάρτα σας απορρίφθηκε. Παρακαλούμε επικοινωνήστε με την τράπεζά σας.';
          case 'insufficient_funds':
            return 'Η κάρτα σας δεν έχει επαρκή χρήματα.';
          case 'incorrect_cvc':
            return 'Ο κωδικός ασφαλείας της κάρτας σας είναι λανθασμένος.';
          case 'expired_card':
            return 'Η κάρτα σας έχει λήξει.';
          case 'processing_error':
            return 'Προέκυψε σφάλμα κατά την επεξεργασία της κάρτας σας.';
          default:
            return error.message || 'Πρόβλημα με την κάρτα σας.';
        }
      case 'validation_error':
        return 'Παρακαλούμε ελέγξτε τα στοιχεία που εισάγατε.';
      default:
        return error.message || 'Προέκυψε σφάλμα. Παρακαλούμε δοκιμάστε ξανά.';
    }
  };

  const paymentElementOptions = {
    layout: {
      type: 'tabs' as const,
      defaultCollapsed: false,
    },
    fields: {
      billingDetails: {
        name: 'auto' as const,
        email: 'auto' as const,
        phone: 'auto' as const,
        address: {
          country: 'auto' as const,
          line1: 'auto' as const,
          line2: 'auto' as const,
          city: 'auto' as const,
          state: 'auto' as const,
          postalCode: 'auto' as const,
        },
      },
    },
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Φόρτωση συστήματος πληρωμών...</span>
      </div>
    );
  }

  // Calculate total from payment intent amount
  const [totalAmount, setTotalAmount] = useState(0);
  
  useEffect(() => {
    if (stripe && clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (paymentIntent && paymentIntent.amount) {
          setTotalAmount(paymentIntent.amount / 100); // Convert from cents
        }
      });
    }
  }, [stripe, clientSecret]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Express Payment Methods (Apple Pay / Google Pay) */}
      {totalAmount > 0 && (
        <ExpressPaymentMethods
          total={totalAmount}
          clientSecret={clientSecret}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      )}

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-start space-x-2 ${
          messageType === 'success' 
            ? 'bg-green-50 border-green-200' 
            : messageType === 'error'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          {messageType === 'success' && (
            <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          )}
          {messageType === 'error' && (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm ${
            messageType === 'success' 
              ? 'text-green-800' 
              : messageType === 'error'
              ? 'text-red-800'
              : 'text-blue-800'
          }`}>
            {message}
          </p>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <PaymentElement 
            id="payment-element" 
            options={paymentElementOptions}
          />
        </div>

        <button
          disabled={isLoading || !stripe || !elements}
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isLoading || !stripe || !elements
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Επεξεργασία πληρωμής...</span>
            </div>
          ) : (
            'Ολοκλήρωση Πληρωμής'
          )}
        </button>
      </form>

      {/* Test Mode Notice */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-2">
          <strong>Test Mode:</strong> Χρησιμοποιήστε κάρτα 4242 4242 4242 4242 για δοκιμαστική πληρωμή
        </div>
      )}
    </div>
  );
}