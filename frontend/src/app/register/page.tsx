'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/stores/authStore';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStatus();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-gray-900">Dixis</span>
          </Link>
        </div>
      </div>

      {/* Register Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm
          onSuccess={() => {
            // Handle success if needed
          }}
        />
      </div>

      {/* Additional Links */}
      <div className="mt-8 text-center">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Έχετε ήδη λογαριασμό;{' '}
            <Link
              href="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Συνδεθείτε
            </Link>
          </p>

          <p className="text-sm text-gray-600">
            <Link
              href="/"
              className="font-medium text-gray-600 hover:text-gray-500"
            >
              ← Επιστροφή στην αρχική
            </Link>
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Ανακαλύψτε τα οφέλη του Dixis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Εύκολες Αγορές</h4>
              <p className="text-sm text-gray-600">
                Αγοράστε απευθείας από τους παραγωγούς με λίγα κλικ
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Αγαπημένα</h4>
              <p className="text-sm text-gray-600">
                Αποθηκεύστε τα προϊόντα που αγαπάτε για μελλοντικές αγορές
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Ιστορικό Παραγγελιών</h4>
              <p className="text-sm text-gray-600">
                Παρακολουθήστε τις παραγγελίες σας και επαναλάβετε αγορές
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Προσωποποιημένες Προτάσεις</h4>
              <p className="text-sm text-gray-600">
                Λάβετε προτάσεις βάσει των προτιμήσεών σας
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Types */}
      <div className="mt-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Επιλέξτε τον τύπο λογαριασμού που σας ταιριάζει
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Καταναλωτής</h4>
              <p className="text-sm text-gray-600 mb-4">
                Για ιδιώτες που θέλουν να αγοράζουν φρέσκα προϊόντα
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Αγορά προϊόντων</li>
                <li>• Αγαπημένα προϊόντα</li>
                <li>• Ιστορικό παραγγελιών</li>
                <li>• Αξιολογήσεις</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Παραγωγός</h4>
              <p className="text-sm text-gray-600 mb-4">
                Για αγρότες και παραγωγούς που θέλουν να πουλήσουν τα προϊόντα τους
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Διαχείριση προϊόντων</li>
                <li>• Παρακολούθηση πωλήσεων</li>
                <li>• Προφίλ παραγωγού</li>
                <li>• Στατιστικά</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Επιχείρηση</h4>
              <p className="text-sm text-gray-600 mb-4">
                Για εστιατόρια, ξενοδοχεία και άλλες επιχειρήσεις
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Χονδρικές αγορές</li>
                <li>• Ειδικές τιμές</li>
                <li>• Τιμολόγηση</li>
                <li>• Πιστώσεις</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
