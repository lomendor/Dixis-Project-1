'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import { CheckIcon } from '@heroicons/react/24/outline';

interface AddCardFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function AddCardForm({ clientSecret, onSuccess, onError }: AddCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the SetupIntent
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (error) {
        onError(error.message || 'Σφάλμα κατά την αποθήκευση της κάρτας');
        setIsProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.payment_method) {
        // Save the payment method to the backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment-methods`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              payment_method_id: setupIntent.payment_method,
              set_as_default: setAsDefault,
            }),
          }
        );

        if (response.ok) {
          onSuccess();
        } else {
          const errorData = await response.json();
          onError(errorData.error || 'Αποτυχία αποθήκευσης κάρτας');
        }
      }
    } catch (err) {
      onError('Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-1">
          Όνομα Κατόχου Κάρτας
        </label>
        <input
          id="cardholder-name"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          placeholder="Όπως αναγράφεται στην κάρτα"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Στοιχεία Κάρτας
        </label>
        <div className="p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="set-as-default"
          type="checkbox"
          checked={setAsDefault}
          onChange={(e) => setSetAsDefault(e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="set-as-default" className="ml-2 block text-sm text-gray-700">
          Ορισμός ως προεπιλεγμένη κάρτα
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isProcessing || !stripe
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Αποθήκευση...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Αποθήκευση Κάρτας
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 24L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Ασφαλής αποθήκευση με Stripe
      </div>
    </form>
  );
}