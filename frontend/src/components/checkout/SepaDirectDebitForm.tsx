'use client';

import React, { useState } from 'react';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SepaDirectDebitFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
}

function SepaDirectDebitFormContent({ 
  clientSecret, 
  onPaymentSuccess, 
  onPaymentError 
}: SepaDirectDebitFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [iban, setIban] = useState('');
  const [acceptedMandate, setAcceptedMandate] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !accountHolderName.trim() || !iban.trim() || !acceptedMandate) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmSepaDebitPayment(clientSecret, {
        payment_method: {
          sepa_debit: {
            iban: iban.replace(/\s/g, ''), // Remove spaces
          },
          billing_details: {
            name: accountHolderName,
            email: '', // Will be populated from customer
          },
        },
      });

      if (error) {
        onPaymentError(error.message || 'Σφάλμα κατά την επεξεργασία SEPA');
      } else if (paymentIntent) {
        onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      onPaymentError('Προέκυψε σφάλμα. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatIban = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Add spaces every 4 characters for readability
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    
    return formatted;
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIban(e.target.value);
    setIban(formatted);
  };

  const isValidIban = (iban: string) => {
    const cleanIban = iban.replace(/\s/g, '');
    // Basic IBAN validation (simplified)
    return cleanIban.length >= 15 && cleanIban.length <= 34 && /^[A-Z]{2}[0-9]{2}/.test(cleanIban);
  };

  const isFormValid = accountHolderName.trim() && isValidIban(iban) && acceptedMandate;

  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
          SEPA
        </span>
        Τραπεζικό έμβασμα
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="account-holder-name" className="block text-sm font-medium text-gray-700 mb-1">
            Όνομα Κατόχου Λογαριασμού *
          </label>
          <input
            id="account-holder-name"
            type="text"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Όπως αναγράφεται στον τραπεζικό λογαριασμό"
          />
        </div>

        <div>
          <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-1">
            IBAN *
          </label>
          <input
            id="iban"
            type="text"
            value={iban}
            onChange={handleIbanChange}
            required
            maxLength={39} // 34 characters + 5 spaces
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="GR16 0110 1250 0000 0001 2300 695"
          />
          {iban && !isValidIban(iban) && (
            <p className="mt-1 text-xs text-red-600">
              Παρακαλώ εισάγετε έγκυρο IBAN
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Εντολή Άμεσης Χρέωσης SEPA</h5>
          <p className="text-sm text-gray-600 mb-3">
            Με την υπογραφή αυτής της εντολής εξουσιοδοτείτε τη Dixis να χρεώνει τον λογαριασμό σας 
            για μελλοντικές πληρωμές σύμφωνα με τους όρους και τις προϋποθέσεις. 
            Δικαιούστε επιστροφή χρημάτων από την τράπεζά σας σύμφωνα με τους όρους 
            και τις προϋποθέσεις της συμφωνίας σας.
          </p>
          
          <div className="flex items-start">
            <input
              id="accept-mandate"
              type="checkbox"
              checked={acceptedMandate}
              onChange={(e) => setAcceptedMandate(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="accept-mandate" className="ml-2 block text-sm text-gray-700">
              Αποδέχομαι την εντολή άμεσης χρέωσης SEPA και τους όρους χρήσης
            </label>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Σημαντικές πληροφορίες:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Η χρέωση θα εμφανιστεί στον λογαριασμό σας σε 1-3 εργάσιμες ημέρες</li>
                <li>Μπορείτε να ακυρώσετε τη χρέωση εντός 8 εβδομάδων από την τράπεζά σας</li>
                <li>Η παραγγελία θα επεξεργαστεί μετά την επιβεβαίωση της πληρωμής</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isFormValid && !isProcessing
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Επεξεργασία...</span>
            </div>
          ) : (
            'Επιβεβαίωση Πληρωμής με SEPA'
          )}
        </button>
      </form>
    </div>
  );
}

export default function SepaDirectDebitForm(props: SepaDirectDebitFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <SepaDirectDebitFormContent {...props} />
    </Elements>
  );
}