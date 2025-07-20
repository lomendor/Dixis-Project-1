'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequireGuest, useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  BuildingStorefrontIcon,
  UserIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const { isGuest, isLoading: authLoading } = useRequireGuest();
  const { login, error, isLoading, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'business' | 'producer'>('customer');

  // Get redirect URL or determine based on user type
  const redirectUrl = searchParams.get('redirect');
  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password, rememberMe });
      // Redirect is handled by the auth store
    } catch (err) {
      // Error is handled by the auth store
    }
  };

  const getRegisterLink = () => {
    switch (userType) {
      case 'business':
        return '/b2b/register';
      case 'producer':
        return '/producer/register';
      default:
        return '/register';
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'business':
        return 'Επιχείρηση B2B';
      case 'producer':
        return 'Παραγωγός';
      default:
        return 'Πελάτης';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <Link href="/" className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Σύνδεση στον λογαριασμό σας
          </h2>
          
          {message && (
            <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
        </div>

        {/* User Type Selector */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setUserType('customer')}
            className={`relative rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              userType === 'customer'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="h-5 w-5 mx-auto mb-1" />
            <span>Πελάτης</span>
          </button>

          <button
            type="button"
            onClick={() => setUserType('business')}
            className={`relative rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              userType === 'business'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <BuildingStorefrontIcon className="h-5 w-5 mx-auto mb-1" />
            <span>B2B</span>
          </button>

          <button
            type="button"
            onClick={() => setUserType('producer')}
            className={`relative rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              userType === 'producer'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <TruckIcon className="h-5 w-5 mx-auto mb-1" />
            <span>Παραγωγός</span>
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Κωδικός
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Κωδικός"
                />
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-md bg-red-50 p-4"
            >
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Να με θυμάσαι
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                Ξεχάσατε τον κωδικό;
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Σύνδεση...
                </span>
              ) : (
                `Σύνδεση ως ${getUserTypeLabel()}`
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Δεν έχετε λογαριασμό;{' '}
              <Link href={getRegisterLink()} className="font-medium text-green-600 hover:text-green-500">
                Εγγραφείτε τώρα
              </Link>
            </span>
          </div>

          {userType === 'business' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Για επιχειρήσεις:</strong> Απολαύστε χονδρικές τιμές, εκπτώσεις όγκου και ειδικές προσφορές.
              </p>
            </div>
          )}

          {userType === 'producer' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Για παραγωγούς:</strong> Πουλήστε τα προϊόντα σας απευθείας σε χιλιάδες πελάτες.
              </p>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}