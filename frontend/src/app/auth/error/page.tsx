'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('Σφάλμα κατά τη σύνδεση');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    }

    // Auto-redirect to login page after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/auth/login');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        {/* Error Icon */}
        <div className="text-red-500 mb-6">
          <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Σφάλμα Σύνδεσης
        </h1>
        
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Επιστροφή στη Σύνδεση
          </Link>
          
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Αρχική Σελίδα
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-xs text-gray-500 mt-4">
          Θα μεταφερθείτε αυτόματα στη σελίδα σύνδεσης σε 5 δευτερόλεπτα...
        </p>
      </div>
    </div>
  );
}