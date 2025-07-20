'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useUnifiedAuthStore } from '@/stores/unifiedAuthStore';
import { DixisLogoFull } from '@/components/ui/DixisLogo';
import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'Το όνομα πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
  lastName: z.string().min(2, 'Το επώνυμο πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
  email: z.string().email('Μη έγκυρο email'),
  password: z.string()
    .min(8, 'Ο κωδικός πρέπει να είναι τουλάχιστον 8 χαρακτήρες')
    .regex(/[A-Z]/, 'Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα κεφαλαίο γράμμα')
    .regex(/[a-z]/, 'Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα μικρό γράμμα')
    .regex(/[0-9]/, 'Ο κωδικός πρέπει να περιέχει τουλάχιστον έναν αριθμό'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^(\+30)?[0-9]{10}$/, 'Μη έγκυρος αριθμός τηλεφώνου'),
  terms: z.boolean().refine(val => val === true, 'Πρέπει να αποδεχτείτε τους όρους χρήσης'),
  newsletter: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Οι κωδικοί δεν ταιριάζουν",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useUnifiedAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
        phone: data.phone,
        newsletter: data.newsletter || false
      });
      
      // If we reach here, registration was successful
      // Redirect to login with success message
      router.push('/auth/login?message=' + encodeURIComponent('Ο λογαριασμός σας δημιουργήθηκε επιτυχώς. Παρακαλώ συνδεθείτε.'));
    } catch (error) {
      logger.error('Registration error', toError(error), errorToContext(error));
      setError('root', {
        message: 'Σφάλμα εγγραφής. Παρακαλώ δοκιμάστε ξανά.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <DixisLogoFull size="lg" className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Δημιουργία λογαριασμού
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Έχετε ήδη λογαριασμό;{' '}
            <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
              Συνδεθείτε εδώ
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Όνομα
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Επώνυμο
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Τηλέφωνο
              </label>
              <input
                {...register('phone')}
                type="tel"
                autoComplete="tel"
                placeholder="6912345678"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Κωδικός
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i < passwordStrength
                            ? passwordStrength <= 2 ? 'bg-red-500'
                            : passwordStrength <= 3 ? 'bg-yellow-500'
                            : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {passwordStrength <= 2 ? 'Αδύναμος' : passwordStrength <= 3 ? 'Μέτριος' : 'Ισχυρός'} κωδικός
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Επιβεβαίωση κωδικού
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Newsletter */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  {...register('terms')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  Αποδέχομαι τους{' '}
                  <Link href="/terms" className="text-green-600 hover:text-green-500">
                    όρους χρήσης
                  </Link>
                  {' '}και την{' '}
                  <Link href="/privacy" className="text-green-600 hover:text-green-500">
                    πολιτική απορρήτου
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="ml-6 text-sm text-red-600">{errors.terms.message}</p>
              )}

              <div className="flex items-start">
                <input
                  {...register('newsletter')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                  Θέλω να λαμβάνω ενημερώσεις και προσφορές στο email μου
                </label>
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
                {isLoading ? 'Δημιουργία λογαριασμού...' : 'Δημιουργία λογαριασμού'}
              </button>
            </div>
          </form>

          {/* Benefits of registering */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-900 mb-3">
              Γιατί να δημιουργήσετε λογαριασμό;
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Γρήγορη ολοκλήρωση παραγγελιών
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Παρακολούθηση παραγγελιών
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Αποκλειστικές προσφορές
                </span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Αποθήκευση αγαπημένων προϊόντων
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}