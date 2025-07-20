'use client';

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, getErrorMessage, toError } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { CreditCardIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethod {
  id: string;
  type: string;
  is_default: boolean;
  created_at: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: string;
    country: string;
  };
}

export default function SavedPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment-methods`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.payment_methods);
      }
    } catch (error) {
      logger.error('Failed to load payment methods', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    setIsDeleting(paymentMethodId);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment-methods/${paymentMethodId}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      } else {
        logger.error('Failed to delete payment method');
      }
    } catch (error) {
      logger.error('Failed to delete payment method', toError(error), errorToContext(error));
    } finally {
      setIsDeleting(null);
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment-methods/set-default`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ payment_method_id: paymentMethodId }),
        }
      );

      if (response.ok) {
        // Update local state
        setPaymentMethods(prev => prev.map(pm => ({
          ...pm,
          is_default: pm.id === paymentMethodId,
        })));
      }
    } catch (error) {
      logger.error('Failed to set default payment method', toError(error), errorToContext(error));
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    switch (brandLower) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Αποθηκευμένες Κάρτες</h3>
        <button
          onClick={() => setShowAddCard(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Προσθήκη Κάρτας
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Δεν έχετε αποθηκευμένες κάρτες
          </p>
          <button
            onClick={() => setShowAddCard(true)}
            className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Προσθέστε την πρώτη σας κάρτα
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                pm.is_default ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getCardBrandIcon(pm?.card?.brand || '')}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">
                      •••• •••• •••• {pm?.card?.last4}
                    </p>
                    {pm.is_default && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Προεπιλογή
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {pm?.card?.brand.toUpperCase()} • Λήγει {pm?.card?.exp_month}/{pm?.card?.exp_year}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!pm.is_default && (
                  <button
                    onClick={() => setDefaultPaymentMethod(pm.id)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Ορισμός ως προεπιλογή
                  </button>
                )}
                <button
                  onClick={() => deletePaymentMethod(pm.id)}
                  disabled={isDeleting === pm.id}
                  className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {isDeleting === pm.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal/Drawer would go here */}
      {showAddCard && (
        <AddCardModal
          onClose={() => setShowAddCard(false)}
          onSuccess={() => {
            setShowAddCard(false);
            loadPaymentMethods();
          }}
        />
      )}
    </div>
  );
}

import AddCardForm from './AddCardForm';

// Add Card Modal Component
function AddCardModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create SetupIntent when modal opens
    createSetupIntent();
  }, []);

  const createSetupIntent = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment-methods/setup-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.client_secret);
      }
    } catch (error) {
      logger.error('Failed to create setup intent', toError(error), errorToContext(error));
      setError('Αποτυχία προετοιμασίας. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={handleClose}
            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-center mt-2 text-gray-600">Προετοιμασία...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: 'el' }}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Προσθήκη Νέας Κάρτας
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <AddCardForm
            clientSecret={clientSecret}
            onSuccess={onSuccess}
            onError={setError}
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </Elements>
  );
}