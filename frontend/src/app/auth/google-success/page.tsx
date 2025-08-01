'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleCallback } from '@/lib/api/services/auth/useAuth';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

export default function GoogleSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleCallback = useGoogleCallback();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const isNewUser = searchParams.get('new_user') === '1';

        if (!token) {
          throw new Error('No authentication token received from Google');
        }

        logger.info('Processing Google OAuth callback', { isNewUser });

        // Process the Google OAuth callback
        await googleCallback.mutateAsync({
          token,
          is_new_user: isNewUser
        });

        // Redirect to home page after successful authentication
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (error) {
        logger.error('Google OAuth callback processing failed', toError(error), errorToContext(error));
        setError('Η σύνδεση με Google απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
        setProcessing(false);

        // Redirect to login page after error
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, googleCallback, router]);

  if (processing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ολοκλήρωση σύνδεσης με Google...
          </h2>
          <p className="text-gray-600">
            Παρακαλώ περιμένετε ενώ ολοκληρώνουμε τη σύνδεσή σας.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Σφάλμα Σύνδεσης
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Θα μεταφερθείτε στη σελίδα σύνδεσης σε λίγα δευτερόλεπτα...
          </p>
        </div>
      </div>
    );
  }

  return null;
}