'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

function VivaWalletReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment data from session storage
        const paymentDataStr = sessionStorage.getItem('vivaWalletPayment');
        if (!paymentDataStr) {
          throw new Error('Payment data not found in session');
        }

        const paymentData = JSON.parse(paymentDataStr);
        const orderCode = paymentData.orderCode;

        if (!orderCode) {
          throw new Error('Order code not found');
        }

        // Verify payment status with backend
        const response = await fetch(`/api/payments/greek/viva-wallet/verify/${orderCode}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Payment verification failed');
        }

        const verificationResult = await response.json();
        
        logger.info('Viva Wallet payment verification completed', {
          orderCode,
          status: verificationResult.data.status,
          orderId: verificationResult.data.order_id
        });

        // Clear payment data from session storage
        sessionStorage.removeItem('vivaWalletPayment');

        if (verificationResult.data.status === 'succeeded') {
          // Payment successful - redirect to success page
          const orderId = verificationResult.data.order_id;
          router.push(`/orders/${orderId}/confirmation?payment=success&gateway=viva_wallet`);
        } else if (verificationResult.data.status === 'pending') {
          // Payment pending - show pending status
          setError('Η πληρωμή σας επεξεργάζεται. Θα ενημερωθείτε σύντομα για την κατάσταση.');
          setTimeout(() => {
            router.push('/orders');
          }, 5000);
        } else {
          // Payment failed
          setError('Η πληρωμή απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
          setTimeout(() => {
            router.push('/checkout');
          }, 3000);
        }

      } catch (error) {
        logger.error('Viva Wallet return verification error', toError(error), errorToContext(error));
        setError(toError(error).message);
        
        setTimeout(() => {
          router.push('/checkout?error=verification_failed');
        }, 3000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Επιβεβαίωση Πληρωμής
          </h1>
          <p className="text-gray-600">
            Επιβεβαιώνουμε την πληρωμή σας. Παρακαλώ περιμένετε...
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zM12 16h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">
                  Viva Wallet
                </p>
                <p className="text-xs text-blue-600">
                  Ασφαλής ελληνική πληρωμή
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Πρόβλημα με την Πληρωμή
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Επιστροφή στην Ολοκλήρωση
            </button>
            <button
              onClick={() => router.push('/cart')}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Επιστροφή στο Καλάθι
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached normally, but just in case
  return null;
}

export default function VivaWalletReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Φόρτωση...
          </h1>
        </div>
      </div>
    }>
      <VivaWalletReturnContent />
    </Suspense>
  );
}