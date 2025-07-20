'use client';

import React, { useState, useEffect } from 'react';
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import { PaymentRequest } from '@stripe/stripe-js';

interface ExpressPaymentMethodsProps {
  total: number;
  clientSecret: string;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
}

export default function ExpressPaymentMethods({ 
  total, 
  clientSecret,
  onPaymentSuccess,
  onPaymentError 
}: ExpressPaymentMethodsProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    // Create payment request for Apple Pay / Google Pay
    const pr = stripe.paymentRequest({
      country: 'GR',
      currency: 'eur',
      total: {
        label: 'Σύνολο Παραγγελίας',
        amount: Math.round(total * 100), // Convert to cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: false, // We already have shipping info
      disableWallets: [], // Enable all available wallets
    });

    // Check if Apple Pay / Google Pay is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    // Handle payment method selection
    pr.on('paymentmethod', async (ev) => {
      try {
        // Confirm the payment with the existing PaymentIntent
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (error) {
          // Report to the browser that the payment failed
          ev.complete('fail');
          onPaymentError(error.message || 'Η πληρωμή απέτυχε');
        } else {
          // Report to the browser that the payment was successful
          ev.complete('success');
          
          // Check if payment requires action (3D Secure)
          if (paymentIntent.status === 'requires_action') {
            const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
            if (actionError) {
              onPaymentError(actionError.message || 'Η επιβεβαίωση πληρωμής απέτυχε');
            } else {
              onPaymentSuccess(paymentIntent);
            }
          } else {
            onPaymentSuccess(paymentIntent);
          }
        }
      } catch (err) {
        ev.complete('fail');
        onPaymentError('Προέκυψε σφάλμα κατά την επεξεργασία της πληρωμής');
      }
    });

    // Update amount if total changes
    pr.update({
      total: {
        label: 'Σύνολο Παραγγελίας',
        amount: Math.round(total * 100),
      },
    });

  }, [stripe, total, clientSecret, onPaymentSuccess, onPaymentError]);

  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Γρήγορη Πληρωμή</p>
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: 'default',
                theme: 'dark',
                height: '48px',
              },
            },
          }}
          className="w-full"
        />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ή πληρώστε με κάρτα</span>
        </div>
      </div>
    </div>
  );
}