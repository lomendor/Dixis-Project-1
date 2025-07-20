'use client';

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthActions, useAuthStatus } from '@/stores/authStore';
import { LoginCredentials } from '@/lib/api/models/auth/types';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import {
  sanitizeInput,
  isValidEmail,
  containsSqlInjection,
  containsXss,
  clientRateLimit
} from '@/lib/security/inputSanitization';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export default function LoginForm({
  onSuccess,
  redirectTo,
  className = ''
}: LoginFormProps) {
  const { loginWithCredentials } = useAuthActions();
  const { isLoading } = useAuthStatus();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Το email είναι υποχρεωτικό';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Παρακαλώ εισάγετε έγκυρο email';
    } else if (containsSqlInjection(formData.email) || containsXss(formData.email)) {
      newErrors.email = 'Το email περιέχει μη επιτρεπτούς χαρακτήρες';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Ο κωδικός πρόσβασης είναι υποχρεωτικός';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Ο κωδικός είναι πολύ μεγάλος';
    } else if (containsSqlInjection(formData.password) || containsXss(formData.password)) {
      newErrors.password = 'Ο κωδικός περιέχει μη επιτρεπτούς χαρακτήρες';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    const clientId = `login_${formData.email}`;
    if (!clientRateLimit.isAllowed(clientId, 5, 60000)) { // 5 attempts per minute
      setErrors({ general: 'Πολλές προσπάθειες σύνδεσης. Παρακαλώ δοκιμάστε ξανά σε λίγο.' });
      return;
    }

    if (!validateForm()) return;

    try {
      // Sanitize input before sending
      const sanitizedData = {
        email: sanitizeInput(formData.email.toLowerCase()),
        password: formData.password, // Don't sanitize password as it might contain special chars
        rememberMe: formData.rememberMe
      };

      await loginWithCredentials(sanitizedData);
      clientRateLimit.reset(clientId); // Reset on successful login
      onSuccess?.();
    } catch (error) {
      // Show error to user
      setErrors({ general: error instanceof Error ? error.message : 'Σφάλμα κατά τη σύνδεση' });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // For now, show a message that this will be implemented
      alert('Google σύνδεση θα υλοποιηθεί σύντομα!');
      logger.info('Google login clicked - will implement with OAuth');
    } catch (error) {
      logger.error('Google login error', toError(error), errorToContext(error));
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    // Sanitize string inputs
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Σύνδεση
          </h2>
          <p className="text-gray-600">
            Συνδεθείτε στον λογαριασμό σας
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  ${errors.email ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Εισάγετε το email σας"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Κωδικός Πρόσβασης
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`
                  block w-full pl-10 pr-10 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  ${errors.password ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Εισάγετε τον κωδικό σας"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Να με θυμάσαι
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-green-600 hover:text-green-500"
            >
              Ξεχάσατε τον κωδικό;
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
              text-sm font-medium text-white
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }
              transition-colors duration-200
            `}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Σύνδεση...
              </>
            ) : (
              'Σύνδεση'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ή</span>
            </div>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Σύνδεση με Google
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Δεν έχετε λογαριασμό;{' '}
            <Link
              href="/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Εγγραφή
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
