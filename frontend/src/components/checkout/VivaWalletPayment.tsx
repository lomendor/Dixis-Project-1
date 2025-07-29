'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

interface VivaWalletPaymentProps {
  orderId?: number;
  total: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentDataChange: (data: any) => void;
}

interface VivaWalletPaymentData {
  orderCode: string;
  paymentUrl: string;
  paymentId: number;
  maxInstallments: number;
  expiresAt: string;
}

export default function VivaWalletPayment({
  orderId,
  total,
  onPaymentSuccess,
  onPaymentError,
  onPaymentDataChange,
}: VivaWalletPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<VivaWalletPaymentData | null>(null);
  const [selectedInstallments, setSelectedInstallments] = useState<number>(0);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  useEffect(() => {
    // Initialize payment data
    onPaymentDataChange({
      isValid: true,
      isCompleted: false,
      gateway: 'viva_wallet'
    });
  }, [onPaymentDataChange]);

  const createVivaWalletPayment = async () => {
    if (!orderId) {
      onPaymentError('Order ID is required for Viva Wallet payment');
      return;
    }

    setIsCreatingPayment(true);

    try {
      const response = await fetch('/api/payments/greek/viva-wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: total,
          installments: selectedInstallments,
          options: {
            language: 'el',
            returnUrl: `${window.location.origin}/checkout/viva-wallet/return`,
            cancelUrl: `${window.location.origin}/checkout`
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create Viva Wallet payment');
      }

      const data = await response.json();
      
      setPaymentData(data.data);
      
      onPaymentDataChange({
        isValid: true,
        isCompleted: false,
        gateway: 'viva_wallet',
        orderCode: data.data.orderCode,
        paymentUrl: data.data.paymentUrl,
        paymentId: data.data.paymentId
      });

      logger.info('Viva Wallet payment created successfully', {
        orderCode: data.data.orderCode,
        orderId,
        total
      });

    } catch (error) {
      logger.error('Failed to create Viva Wallet payment', toError(error), errorToContext(error));
      onPaymentError(toError(error).message);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const redirectToVivaWallet = () => {
    if (!paymentData?.paymentUrl) {
      onPaymentError('Payment URL not available');
      return;
    }

    // Store payment data in session storage for return handling
    sessionStorage.setItem('vivaWalletPayment', JSON.stringify({
      orderCode: paymentData.orderCode,
      paymentId: paymentData.paymentId,
      orderId,
      total
    }));

    // Redirect to Viva Wallet checkout
    window.location.href = paymentData.paymentUrl;
  };

  const getInstallmentOptions = () => {
    const options = [{ value: 0, label: 'Πληρωμή χωρίς δόσεις' }];
    
    if (total >= 30) {
      options.push({ value: 3, label: '3 άτοκες δόσεις' });
    }
    if (total >= 100) {
      options.push({ value: 6, label: '6 άτοκες δόσεις' });
    }
    if (total >= 500) {
      options.push({ value: 12, label: '12 άτοκες δόσεις' });
    }
    if (total >= 1500) {
      options.push({ value: 24, label: '24 άτοκες δόσεις' });
    }

    return options;
  };

  const installmentOptions = getInstallmentOptions();

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zM12 16h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">Viva Wallet - Ασφαλής Ελληνική Πληρωμή</h4>
            <p className="text-sm text-blue-700 mt-1">
              Πληρώστε με όλες τις ελληνικές τραπεζικές κάρτες με δυνατότητα δόσεων.
              Υποστηρίζονται όλες οι ελληνικές τράπεζες.
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
              <span>✓ Άτοκες δόσεις</span>
              <span>✓ Ασφαλής πληρωμή SSL</span>
              <span>✓ Ελληνική υποστήριξη</span>
            </div>
          </div>
        </div>
      </div>

      {/* Installment Selection */}
      {installmentOptions.length > 1 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Επιλογή Δόσεων
          </label>
          <div className="space-y-2">
            {installmentOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  border-2 rounded-lg p-3 cursor-pointer transition-colors
                  ${selectedInstallments === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedInstallments(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2
                        ${selectedInstallments === option.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                        }
                      `}
                    >
                      {selectedInstallments === option.value && (
                        <div className="w-full h-full rounded-full bg-white border-2 border-blue-500 scale-50" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.value === 0 ? (
                      `€${total.toFixed(2)}`
                    ) : (
                      <>
                        {option.value} x €{(total / option.value).toFixed(2)}
                      </>
                    )}
                  </div>
                </div>
                {option.value > 0 && (
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Άτοκες δόσεις χωρίς πρόσθετο κόστος
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Actions */}
      <div className="space-y-4">
        {!paymentData ? (
          <button
            onClick={createVivaWalletPayment}
            disabled={isCreatingPayment}
            className={`
              w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${isCreatingPayment
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
            `}
          >
            {isCreatingPayment ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                Προετοιμασία πληρωμής...
              </>
            ) : (
              `Δημιουργία Πληρωμής €${total.toFixed(2)}`
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Η πληρωμή έχει δημιουργηθεί επιτυχώς
                  </p>
                  <p className="text-xs text-green-700">
                    Order Code: {paymentData.orderCode}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={redirectToVivaWallet}
              disabled={isLoading}
              className={`
                w-full py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                  Μεταφορά στη Viva Wallet...
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-2">
                    <span>Πληρωμή μέσω Viva Wallet</span>
                    <span className="text-lg">🏦</span>
                  </div>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Θα μεταφερθείτε στην ασφαλή σελίδα πληρωμής της Viva Wallet
            </p>
          </div>
        )}
      </div>

      {/* Security Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-gray-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Ασφαλής Πληρωμή</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• Η Viva Wallet είναι αδειοδοτημένη τράπεζα στην Ελλάδα</li>
              <li>• Όλες οι πληρωμές προστατεύονται με SSL κρυπτογράφηση</li>
              <li>• Δεν αποθηκεύουμε στοιχεία κάρτας στους διακομιστές μας</li>
              <li>• Υποστήριξη 24/7 στα ελληνικά</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supported Cards */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">Δεκτές κάρτες:</p>
        <div className="flex justify-center space-x-4 text-2xl">
          <span title="Visa">💳</span>
          <span title="Mastercard">💳</span>
          <span title="American Express">💳</span>
          <span title="Ελληνικές Τράπεζες">🏛️</span>
        </div>
      </div>
    </div>
  );
}