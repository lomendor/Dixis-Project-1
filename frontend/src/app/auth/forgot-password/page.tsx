'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { DixisLogoFull } from '@/components/ui/DixisLogo';
import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Μη έγκυρο email')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      
      // Call forgot password API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError('root', {
          message: result.message || 'Σφάλμα αποστολής. Παρακαλώ δοκιμάστε ξανά.'
        });
      }
    } catch (error) {
      logger.error('Forgot password error', toError(error), errorToContext(error));
      setError('root', {
        message: 'Σφάλμα αποστολής. Παρακαλώ δοκιμάστε ξανά.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <DixisLogoFull size="lg" />
          </div>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
              </div>
              
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Ελέγξτε το email σας
              </h3>
              
              <p className="mt-2 text-sm text-gray-600">
                Σας στείλαμε οδηγίες για την επαναφορά του κωδικού σας.
                Παρακαλώ ελέγξτε το email σας και ακολουθήστε τις οδηγίες.
              </p>
              
              <p className="mt-4 text-xs text-gray-500">
                Αν δεν λάβετε email σε λίγα λεπτά, ελέγξτε τον φάκελο spam.
              </p>
              
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Επιστροφή στη σύνδεση
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <DixisLogoFull size="lg" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Ξεχάσατε τον κωδικό σας;
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Εισάγετε το email σας και θα σας στείλουμε οδηγίες για την επαναφορά του κωδικού σας.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Error message */}
            {errors.root && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{errors.root.message}</p>
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Αποστολή...' : 'Αποστολή οδηγιών'}
              </button>
            </div>

            {/* Back to login */}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Επιστροφή στη σύνδεση
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}