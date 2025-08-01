'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  UserIcon, 
  EnvelopeIcon,
  BellIcon,
  ShieldCheckIcon,
  LanguageIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

// Profile form schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'Το όνομα πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
  lastName: z.string().min(2, 'Το επώνυμο πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
  email: z.string().email('Μη έγκυρο email'),
  phone: z.string().regex(/^(\+30)?[0-9]{10}$/, 'Μη έγκυρος αριθμός τηλεφώνου'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional()
});

// Password form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Εισάγετε τον τρέχοντα κωδικό'),
  newPassword: z.string()
    .min(8, 'Ο κωδικός πρέπει να είναι τουλάχιστον 8 χαρακτήρες')
    .regex(/[A-Z]/, 'Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα κεφαλαίο γράμμα')
    .regex(/[a-z]/, 'Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα μικρό γράμμα')
    .regex(/[0-9]/, 'Ο κωδικός πρέπει να περιέχει τουλάχιστον έναν αριθμό'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Οι κωδικοί δεν ταιριάζουν",
  path: ["confirmPassword"],
});

// Notification settings schema
const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  orderUpdates: z.boolean(),
  productRecommendations: z.boolean(),
  priceAlerts: z.boolean()
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: '',
      gender: ''
    }
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  // Notification form
  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      orderUpdates: true,
      productRecommendations: false,
      priceAlerts: true
    }
  });

  useEffect(() => {
    // Load user preferences when component mounts
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/account/preferences');
      if (response.ok) {
        const data = await response.json();
        notificationForm.reset(data.notifications || {});
      }
    } catch (error) {
      logger.error('Failed to fetch user preferences', toError(error), errorToContext(error));
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Το προφίλ σας ενημερώθηκε επιτυχώς!' });
      } else {
        setMessage({ type: 'error', text: 'Σφάλμα κατά την ενημέρωση του προφίλ.' });
      }
    } catch (error) {
      logger.error('Failed to update profile', toError(error), errorToContext(error));
      setMessage({ type: 'error', text: 'Σφάλμα κατά την ενημέρωση του προφίλ.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/account/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword,
          new_password_confirmation: data.confirmPassword
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ο κωδικός σας άλλαξε επιτυχώς!' });
        passwordForm.reset();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Σφάλμα κατά την αλλαγή κωδικού.' });
      }
    } catch (error) {
      logger.error('Failed to change password', toError(error), errorToContext(error));
      setMessage({ type: 'error', text: 'Σφάλμα κατά την αλλαγή κωδικού.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitNotifications = async (data: NotificationFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/account/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Οι ρυθμίσεις ειδοποιήσεων ενημερώθηκαν!' });
      } else {
        setMessage({ type: 'error', text: 'Σφάλμα κατά την ενημέρωση των ρυθμίσεων.' });
      }
    } catch (error) {
      logger.error('Failed to update notifications', toError(error), errorToContext(error));
      setMessage({ type: 'error', text: 'Σφάλμα κατά την ενημέρωση των ρυθμίσεων.' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Προφίλ', icon: UserIcon },
    { id: 'security', name: 'Ασφάλεια', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Ειδοποιήσεις', icon: BellIcon },
    { id: 'preferences', name: 'Προτιμήσεις', icon: LanguageIcon }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ρυθμίσεις Λογαριασμού</h1>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Στοιχεία Προφίλ</h2>
          
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Όνομα</label>
                <input
                  {...profileForm.register('firstName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {profileForm.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Επώνυμο</label>
                <input
                  {...profileForm.register('lastName')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {profileForm.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <input
                  {...profileForm.register('email')}
                  type="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pl-10"
                />
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
              {profileForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Τηλέφωνο</label>
              <input
                {...profileForm.register('phone')}
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {profileForm.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ημερομηνία Γέννησης</label>
                <input
                  {...profileForm.register('dateOfBirth')}
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Φύλο</label>
                <select
                  {...profileForm.register('gender')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Επιλέξτε</option>
                  <option value="male">Άνδρας</option>
                  <option value="female">Γυναίκα</option>
                  <option value="other">Άλλο</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Αλλαγή Κωδικού</h2>
          
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Τρέχων κωδικός</label>
              <div className="mt-1 relative">
                <input
                  {...passwordForm.register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Νέος κωδικός</label>
              <div className="mt-1 relative">
                <input
                  {...passwordForm.register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Επιβεβαίωση νέου κωδικού</label>
              <div className="mt-1 relative">
                <input
                  {...passwordForm.register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 pr-10"
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
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Αλλαγή...' : 'Αλλαγή Κωδικού'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Ρυθμίσεις Ειδοποιήσεων</h2>
          
          <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email ειδοποιήσεις</h3>
                  <p className="text-sm text-gray-500">Λάβετε ειδοποιήσεις στο email σας</p>
                </div>
                <input
                  {...notificationForm.register('emailNotifications')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">SMS ειδοποιήσεις</h3>
                  <p className="text-sm text-gray-500">Λάβετε SMS για σημαντικές ενημερώσεις</p>
                </div>
                <input
                  {...notificationForm.register('smsNotifications')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Marketing emails</h3>
                  <p className="text-sm text-gray-500">Λάβετε προσφορές και νέα προϊόντα</p>
                </div>
                <input
                  {...notificationForm.register('marketingEmails')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Ενημερώσεις παραγγελιών</h3>
                  <p className="text-sm text-gray-500">Ειδοποιήσεις για την κατάσταση των παραγγελιών σας</p>
                </div>
                <input
                  {...notificationForm.register('orderUpdates')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Προτάσεις προϊόντων</h3>
                  <p className="text-sm text-gray-500">Λάβετε προτάσεις βάσει των αγορών σας</p>
                </div>
                <input
                  {...notificationForm.register('productRecommendations')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Ειδοποιήσεις τιμών</h3>
                  <p className="text-sm text-gray-500">Ειδοποίηση όταν προϊόντα από τα αγαπημένα σας είναι σε προσφορά</p>
                </div>
                <input
                  {...notificationForm.register('priceAlerts')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση Ρυθμίσεων'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Προτιμήσεις</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Γλώσσα</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                <option value="el">Ελληνικά</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Νόμισμα</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                <option value="EUR">Euro (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ζώνη Ώρας</label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                <option value="Europe/Athens">Αθήνα (UTC+2)</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Αποθήκευση Προτιμήσεων
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}