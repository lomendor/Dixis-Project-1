'use client';

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthActions, useAuthStatus } from '@/stores/authStore';
import { RegisterData, UserRole } from '@/lib/api/models/auth/types';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface RegisterFormProps {
  onSuccess?: () => void;
  defaultRole?: UserRole;
  className?: string;
}

export default function RegisterForm({
  onSuccess,
  defaultRole = 'consumer' as UserRole,
  className = ''
}: RegisterFormProps) {
  const { register } = useAuthActions();
  const { isLoading } = useAuthStatus();

  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    phone: '',
    role: defaultRole,
    acceptTerms: false,
    marketingOptIn: false,
    newsletterOptIn: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Το όνομα είναι υποχρεωτικό';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Το επώνυμο είναι υποχρεωτικό';
    }

    if (!formData.email) {
      newErrors.email = 'Το email είναι υποχρεωτικό';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Παρακαλώ εισάγετε έγκυρο email';
    }

    if (!formData.password) {
      newErrors.password = 'Ο κωδικός πρόσβασης είναι υποχρεωτικός';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Ο κωδικός πρέπει να περιέχει κεφαλαία, μικρά γράμματα και αριθμούς';
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Η επιβεβαίωση κωδικού είναι υποχρεωτική';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Οι κωδικοί δεν ταιριάζουν';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Παρακαλώ εισάγετε έγκυρο τηλέφωνο';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Πρέπει να αποδεχτείτε τους όρους χρήσης';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register(formData);
      onSuccess?.();
    } catch (error) {
      logger.error('Registration error', toError(error), errorToContext(error));
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string | boolean | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));

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
            Εγγραφή
          </h2>
          <p className="text-gray-600">
            Δημιουργήστε τον λογαριασμό σας
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Όνομα
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.firstName ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Όνομα"
                  disabled={isLoading}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Επώνυμο
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`
                  block w-full px-3 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  ${errors.lastName ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Επώνυμο"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

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

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Τηλέφωνο (προαιρετικό)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Εισάγετε το τηλέφωνό σας"
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Password Fields */}
          <div className="space-y-4">
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
                  autoComplete="new-password"
                  className={`
                    block w-full pl-10 pr-10 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.password ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Εισάγετε κωδικό πρόσβασης"
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

            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Επιβεβαίωση Κωδικού
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="passwordConfirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  value={formData.passwordConfirmation}
                  onChange={(e) => handleInputChange('passwordConfirmation', e.target.value)}
                  autoComplete="new-password"
                  className={`
                    block w-full pl-10 pr-10 py-3 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${errors.passwordConfirmation ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Επιβεβαιώστε τον κωδικό"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPasswordConfirmation ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.passwordConfirmation && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirmation}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Τύπος Λογαριασμού
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={isLoading}
            >
              <option value="consumer">Καταναλωτής</option>
              <option value="producer">Παραγωγός</option>
              <option value="business">Επιχείρηση</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                disabled={isLoading}
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                Αποδέχομαι τους{' '}
                <Link href="/terms" className="text-green-600 hover:text-green-500">
                  όρους χρήσης
                </Link>{' '}
                και την{' '}
                <Link href="/privacy" className="text-green-600 hover:text-green-500">
                  πολιτική απορρήτου
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms}</p>
            )}

            <div className="flex items-start">
              <input
                id="newsletterOptIn"
                type="checkbox"
                checked={formData.newsletterOptIn}
                onChange={(e) => handleInputChange('newsletterOptIn', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                disabled={isLoading}
              />
              <label htmlFor="newsletterOptIn" className="ml-2 block text-sm text-gray-700">
                Θέλω να λαμβάνω το newsletter με προσφορές και νέα
              </label>
            </div>
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
                Δημιουργία λογαριασμού...
              </>
            ) : (
              'Δημιουργία Λογαριασμού'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Έχετε ήδη λογαριασμό;{' '}
            <Link
              href="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Σύνδεση
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
