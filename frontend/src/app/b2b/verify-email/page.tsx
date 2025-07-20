'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useB2BAuth } from '@/lib/api/services/b2b/useB2BAuth';
import toast from 'react-hot-toast';

export default function B2BVerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const { user } = useB2BAuth();

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      // Simulate API call to resend verification email
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Email επιβεβαίωσης στάλθηκε ξανά!');
    } catch (error) {
      toast.error('Σφάλμα κατά την αποστολή email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Dixis</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Επιβεβαίωση Email
          </h2>
          <p className="text-sm text-gray-600">
            Ελέγξτε το email σας για να ολοκληρώσετε την εγγραφή
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10"
        >
          {/* Email Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Email επιβεβαίωσης στάλθηκε!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Στείλαμε ένα email επιβεβαίωσης στη διεύθυνση:
            </p>
            <p className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded">
              {user?.email || 'your-email@business.com'}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Τι να κάνετε τώρα:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Ελέγξτε τα εισερχόμενα email σας</li>
                  <li>Αν δεν το βρείτε, ελέγξτε τον φάκελο spam</li>
                  <li>Κάντε κλικ στον σύνδεσμο επιβεβαίωσης</li>
                  <li>Επιστρέψτε εδώ για να συνδεθείτε</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Resend Email */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Δεν λάβατε το email;
            </p>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isResending 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Αποστολή...
                </>
              ) : (
                'Αποστολή ξανά'
              )}
            </button>
          </div>

          {/* Demo Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Demo Mode
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Σε demo mode, μπορείτε να συνεχίσετε απευθείας στο dashboard χωρίς επιβεβαίωση email.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/b2b/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Συνέχεια στο Dashboard (Demo)
            </Link>
            
            <Link
              href="/b2b/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Επιστροφή στη σύνδεση
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}