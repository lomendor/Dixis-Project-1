'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import { PaymentMethod } from '@/lib/api/models/order/types';
import SepaDirectDebitForm from './SepaDirectDebitForm';
import VivaWalletPayment from './VivaWalletPayment';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  paymentData: any;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onPaymentDataChange: (data: any) => void;
  orderId?: number;
  total: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

interface StripeFormProps {
  orderId?: number;
  total: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentDataChange: (data: any) => void;
  paymentMethod?: 'credit_card' | 'sepa_direct_debit';
}

const StripeForm: React.FC<StripeFormProps> = ({
  orderId,
  total,
  onPaymentSuccess,
  onPaymentError,
  onPaymentDataChange,
  paymentMethod = 'credit_card',
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Create payment intent when form loads
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'eur',
            paymentMethodTypes: paymentMethod === 'sepa_direct_debit' ? ['sepa_debit'] : ['card'],
            metadata: {
              orderId: orderId?.toString() || 'pending',
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setPaymentIntent(data);
        onPaymentDataChange({
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
          isValid: cardComplete,
        });
      } catch (error) {
        logger.error('Payment intent creation failed', toError(error), errorToContext(error));
        onPaymentError('Failed to initialize payment');
      }
    };

    if (total > 0) {
      createPaymentIntent();
    }
  }, [total, orderId, onPaymentDataChange, onPaymentError]);

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    onPaymentDataChange({
      ...paymentIntent,
      isValid: event.complete,
      cardError: event?.error?.message || null,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent?.clientSecret) {
      return;
    }

    setIsLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        onPaymentError(error.message || 'Payment failed');
        return;
      }

      if (confirmedPaymentIntent?.status === 'succeeded') {
        // Confirm order with backend
        const confirmResponse = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: confirmedPaymentIntent.id,
            orderData: {
              orderId,
              total,
            },
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm order');
        }

        const confirmData = await confirmResponse.json();
        onPaymentSuccess(confirmData);
      }
    } catch (error) {
      logger.error('Payment submission failed', toError(error), errorToContext(error));
      onPaymentError(toError(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: false,
          }}
          onChange={handleCardChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>Ασφαλής πληρωμή με SSL κρυπτογράφηση</p>
          <p>Δεκτές κάρτες: Visa, Mastercard, American Express</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !cardComplete || isLoading}
        className={`
          w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${(!stripe || !cardComplete || isLoading)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
            Επεξεργασία πληρωμής...
          </>
        ) : (
          `Πληρωμή €${total.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

export default function PaymentForm({
  paymentMethod,
  paymentData,
  onPaymentMethodChange,
  onPaymentDataChange,
  orderId,
  total,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) {
  const paymentMethods = [
    {
      id: 'VIVA_WALLET' as PaymentMethod,
      name: 'Viva Wallet',
      description: 'Ελληνικές κάρτες με δόσεις - Προτεινόμενο',
      icon: '🏛️',
      recommended: true,
    },
    {
      id: PaymentMethod.CREDIT_CARD,
      name: 'Πιστωτική Κάρτα',
      description: 'Visa, Mastercard, American Express (Διεθνείς)',
      icon: '💳',
    },
    {
      id: PaymentMethod.SEPA_DIRECT_DEBIT,
      name: 'Τραπεζικό Έμβασμα SEPA',
      description: 'Άμεση χρέωση από τραπεζικό λογαριασμό',
      icon: '🏦',
    },
    {
      id: PaymentMethod.CASH_ON_DELIVERY,
      name: 'Αντικαταβολή',
      description: 'Πληρωμή κατά την παράδοση',
      icon: '💵',
      extraFee: 2.50,
    },
  ];

  useEffect(() => {
    // Update payment data validation for cash on delivery
    if (paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      onPaymentDataChange({
        isValid: true,
        isCompleted: true,
      });
    } else if (paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT) {
      // Create SEPA payment intent
      const createSepaPaymentIntent = async () => {
        try {
          const response = await fetch('/api/payment/create-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: total,
              currency: 'eur',
              paymentMethodTypes: ['sepa_debit'],
              metadata: {
                orderId: orderId?.toString() || 'pending',
              },
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create SEPA payment intent');
          }

          const data = await response.json();
          onPaymentDataChange({
            clientSecret: data.clientSecret,
            paymentIntentId: data.paymentIntentId,
            isValid: false,
            isCompleted: false,
          });
        } catch (error) {
          logger.error('SEPA payment intent creation failed', toError(error), errorToContext(error));
          onPaymentError('Failed to initialize SEPA payment');
        }
      };

      if (total > 0) {
        createSepaPaymentIntent();
      }
    }
  }, [paymentMethod, onPaymentDataChange, total, orderId, onPaymentError]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Τρόπος Πληρωμής</h3>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`
              border-2 rounded-lg p-4 cursor-pointer transition-colors relative
              ${paymentMethod === method.id
                ? method.recommended
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => onPaymentMethodChange(method.id)}
          >
            {method.recommended && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Προτεινόμενο
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{method.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  {method.extraFee && (
                    <p className="text-sm text-orange-600">
                      Επιπλέον χρέωση: €{method.extraFee.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div
                className={`
                  w-5 h-5 rounded-full border-2
                  ${paymentMethod === method.id
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                  }
                `}
              >
                {paymentMethod === method.id && (
                  <div className="w-full h-full rounded-full bg-white border-2 border-green-500 scale-50" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Form */}
      {paymentMethod === 'VIVA_WALLET' && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-4">Πληρωμή μέσω Viva Wallet</h4>
          <VivaWalletPayment
            orderId={orderId}
            total={total}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            onPaymentDataChange={onPaymentDataChange}
          />
        </div>
      )}

      {paymentMethod === PaymentMethod.CREDIT_CARD && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-4">Στοιχεία Κάρτας</h4>
          <Elements stripe={stripePromise}>
            <StripeForm
              orderId={orderId}
              total={total}
              onPaymentSuccess={onPaymentSuccess}
              onPaymentError={onPaymentError}
              onPaymentDataChange={onPaymentDataChange}
              paymentMethod="credit_card"
            />
          </Elements>
        </div>
      )}

      {paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT && paymentData?.clientSecret && (
        <div className="mt-6">
          <SepaDirectDebitForm
            clientSecret={paymentData.clientSecret}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        </div>
      )}

      {paymentMethod === PaymentMethod.CASH_ON_DELIVERY && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-600 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800">Αντικαταβολή</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Θα πληρώσετε €{(total + 2.50).toFixed(2)} στον courier κατά την παράδοση
                (συμπεριλαμβανομένης επιπλέον χρέωσης €2.50).
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Παρακαλώ έχετε έτοιμο το ακριβές ποσό.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="text-gray-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Ασφαλής Πληρωμή</h4>
            <p className="text-sm text-gray-600 mt-1">
              Όλες οι πληρωμές επεξεργάζονται με ασφαλή SSL κρυπτογράφηση.
              Τα στοιχεία της κάρτας σας δεν αποθηκεύονται στους διακομιστές μας.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}