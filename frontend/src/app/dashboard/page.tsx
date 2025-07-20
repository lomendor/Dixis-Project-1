'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCartSummary } from '@/stores/cartStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  ChartBarIcon,
  TruckIcon,
  StarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyEuroIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const { itemCount, total, currency } = useCartSummary();

  if (!user) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'consumer': return 'Καταναλωτής';
      case 'producer': return 'Παραγωγός';
      case 'business': return 'Επιχείρηση';
      case 'business_user': return 'Επιχείρηση';
      case 'admin': return 'Διαχειριστής';
      default: return role;
    }
  };

  // Show admin dashboard for admin users
  if (user.role === 'admin') {
    return <AdminDashboard user={user} logout={logout} />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Καλημέρα';
    if (hour < 18) return 'Καλησπέρα';
    return 'Καληνύχτα';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getGreeting()}, {user.name}!
                </h1>
                <p className="text-gray-600">
                  {getRoleDisplayName(user.role)} • Μέλος από {new Date(user.createdAt).toLocaleDateString('el-GR')}
                </p>
                {!user.emailVerified && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Εκκρεμεί επιβεβαίωση email
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                Ρυθμίσεις
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Αποσύνδεση
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Τρέχον Καλάθι</p>
                <p className="text-2xl font-semibold text-gray-900">{itemCount}</p>
                <p className="text-sm text-gray-500">
                  {total > 0 ? `€${total.toFixed(2)}` : 'Άδειο'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TruckIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Παραγγελίες</p>
                <p className="text-2xl font-semibold text-gray-900">
                  0
                </p>
                <p className="text-sm text-gray-500">Συνολικά</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Αγαπημένα</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Προϊόντα</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Αξιολογήσεις</p>
                <p className="text-2xl font-semibold text-gray-900">
                  0
                </p>
                <p className="text-sm text-gray-500">Γραμμένες</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Γρήγορες Ενέργειες</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/products"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <ShoppingBagIcon className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Περιήγηση Προϊόντων</h3>
                    <p className="text-sm text-gray-500">Ανακαλύψτε φρέσκα προϊόντα</p>
                  </div>
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <TruckIcon className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Οι Παραγγελίες μου</h3>
                    <p className="text-sm text-gray-500">Δείτε το ιστορικό παραγγελιών</p>
                  </div>
                </Link>

                <Link
                  href="/favorites"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <HeartIcon className="w-8 h-8 text-red-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Αγαπημένα</h3>
                    <p className="text-sm text-gray-500">Τα προϊόντα που αγαπάτε</p>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="w-8 h-8 text-gray-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Προφίλ</h3>
                    <p className="text-sm text-gray-500">Διαχείριση λογαριασμού</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Πρόσφατη Δραστηριότητα</h2>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Δημιουργήθηκε ο λογαριασμός σας</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('el-GR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Συνδεδεμένος/η</p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleDateString('el-GR')}
                    </p>
                  </div>
                </div>

                {itemCount > 0 && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Έχετε {itemCount} προϊόντα στο καλάθι
                      </p>
                      <p className="text-xs text-gray-500">Ολοκληρώστε την παραγγελία σας</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Κατάσταση Λογαριασμού</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <div className="flex items-center">
                    {user.emailVerified ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Επιβεβαιωμένο
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Εκκρεμεί
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Προφίλ</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Βασικό
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ασφάλεια</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    Βασική
                  </span>
                </div>
              </div>

              {!user.emailVerified && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full text-sm bg-yellow-50 text-yellow-800 py-2 px-3 rounded-md hover:bg-yellow-100 transition-colors">
                    Επιβεβαίωση Email
                  </button>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Προτάσεις</h3>

              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">Ολοκληρώστε το προφίλ σας</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Προσθέστε περισσότερες πληροφορίες για καλύτερες προτάσεις
                  </p>
                  <Link
                    href="/profile"
                    className="text-xs text-green-600 hover:text-green-500 mt-2 inline-block"
                  >
                    Ενημέρωση προφίλ →
                  </Link>
                </div>

                {itemCount > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900">Ολοκληρώστε την παραγγελία</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Έχετε {itemCount} προϊόντα στο καλάθι σας
                    </p>
                    <Link
                      href="/cart"
                      className="text-xs text-blue-600 hover:text-blue-500 mt-2 inline-block"
                    >
                      Προς το καλάθι →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ user, logout }: { user: any; logout: () => Promise<void> }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Καλημέρα';
    if (hour < 18) return 'Καλησπέρα';
    return 'Καληνύχτα';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-sm p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {getGreeting()}, {user.name}!
                </h1>
                <p className="text-green-100">
                  Διαχειριστής Πλατφόρμας • Dixis Marketplace
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                    Admin Access
                  </span>
                  <span className="text-sm text-green-100">
                    Τελευταία σύνδεση: {new Date().toLocaleDateString('el-GR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center px-4 py-2 border border-white border-opacity-30 rounded-md shadow-sm text-sm font-medium text-white hover:bg-white hover:bg-opacity-10"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Analytics
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-gray-50"
              >
                Αποσύνδεση
              </button>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Συνολικοί Χρήστες</p>
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
                <p className="text-sm text-green-600">+12% αυτόν τον μήνα</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Συνολικά Προϊόντα</p>
                <p className="text-2xl font-semibold text-gray-900">55</p>
                <p className="text-sm text-green-600">Ενεργά προϊόντα</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyEuroIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Μηνιαία Έσοδα</p>
                <p className="text-2xl font-semibold text-gray-900">€12,450</p>
                <p className="text-sm text-green-600">+8.2% από τον προηγούμενο μήνα</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Παραγγελίες</p>
                <p className="text-2xl font-semibold text-gray-900">89</p>
                <p className="text-sm text-green-600">Αυτόν τον μήνα</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Management Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Διαχείριση Πλατφόρμας</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <UsersIcon className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Διαχείριση Χρηστών</h3>
                    <p className="text-sm text-gray-500">Προβολή και διαχείριση χρηστών</p>
                  </div>
                </Link>

                <Link
                  href="/admin/products"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <ShoppingBagIcon className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Διαχείριση Προϊόντων</h3>
                    <p className="text-sm text-gray-500">Προσθήκη και επεξεργασία προϊόντων</p>
                  </div>
                </Link>

                <Link
                  href="/admin/producers"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                >
                  <BuildingStorefrontIcon className="w-8 h-8 text-yellow-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Διαχείριση Παραγωγών</h3>
                    <p className="text-sm text-gray-500">Έγκριση και διαχείριση παραγωγών</p>
                  </div>
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <ClipboardDocumentListIcon className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Διαχείριση Παραγγελιών</h3>
                    <p className="text-sm text-gray-500">Παρακολούθηση παραγγελιών</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/analytics"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <ChartBarIcon className="w-8 h-8 text-indigo-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Business Intelligence</h3>
                    <p className="text-sm text-gray-500">Αναλυτικά στοιχεία και αναφορές</p>
                  </div>
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <CogIcon className="w-8 h-8 text-gray-600 mr-4" />
                  <div>
                    <h3 className="font-medium text-gray-900">Ρυθμίσεις Συστήματος</h3>
                    <p className="text-sm text-gray-500">Διαμόρφωση πλατφόρμας</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Πρόσφατη Δραστηριότητα</h2>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Νέος χρήστης εγγράφηκε</p>
                    <p className="text-xs text-gray-500">Πριν από 2 ώρες</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Νέα παραγγελία #1234</p>
                    <p className="text-xs text-gray-500">Πριν από 4 ώρες</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Νέο προϊόν προστέθηκε</p>
                    <p className="text-xs text-gray-500">Πριν από 6 ώρες</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Κατάσταση Συστήματος</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Λειτουργεί
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Λειτουργεί
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Service</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Λειτουργεί
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Gateway</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Test Mode
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Γρήγορες Ενέργειες</h3>

              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <h4 className="text-sm font-medium text-green-900">Προσθήκη Νέου Προϊόντος</h4>
                  <p className="text-xs text-green-700 mt-1">Γρήγορη προσθήκη προϊόντος</p>
                </button>

                <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <h4 className="text-sm font-medium text-blue-900">Εξαγωγή Αναφοράς</h4>
                  <p className="text-xs text-blue-700 mt-1">Λήψη μηνιαίας αναφοράς</p>
                </button>

                <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <h4 className="text-sm font-medium text-purple-900">Backup Database</h4>
                  <p className="text-xs text-purple-700 mt-1">Δημιουργία αντιγράφου ασφαλείας</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
