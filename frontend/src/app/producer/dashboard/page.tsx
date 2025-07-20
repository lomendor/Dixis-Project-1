'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useProducerStore } from '@/stores/producerStore';
import { buildApiUrl } from '@/lib/utils/apiUrls';
import {
  CubeIcon,
  ShoppingCartIcon,
  CurrencyEuroIcon,
  StarIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TruckIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ProducerLayout from '@/components/producer/ProducerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductStats from '@/components/producer/ProductStats';
import { SubscriptionNotifications } from '@/components/subscription/SubscriptionNotifications';
import NotificationCenter from '@/components/producer/NotificationCenter';

export default function ProducerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, stats, setProfile, setStats, setLoading, setError } = useProducerStore();
  const [loading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setPageLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      
      // Fetch profile
      const profileRes = await fetch(buildApiUrl('producer/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data.profile);
      }

      // Fetch stats
      const statsRes = await fetch(buildApiUrl('producer/dashboard/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data.stats);
      }
    } catch (error) {
      setError('Σφάλμα φόρτωσης δεδομένων');
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const verificationStatusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const verificationStatusText = {
    pending: 'Αναμονή Έγκρισης',
    verified: 'Εγκεκριμένος',
    rejected: 'Απορρίφθηκε',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Καλώς ήρθατε, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {profile?.business_name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Center */}
              <NotificationCenter producerId={user?.id?.toString() || '1'} />
              
              {profile && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  verificationStatusStyles[profile.verification_status]
                }`}>
                  {verificationStatusText[profile.verification_status]}
                </span>
              )}
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Προμήθεια</p>
                <p className="text-xl font-bold text-gray-900">
                  {profile?.commission_rate || 12}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Notifications */}
        <SubscriptionNotifications 
          userId={user?.id?.toString() || '1'} 
          className="mb-6"
        />

        {/* Verification Warning */}
        {profile?.verification_status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Ο λογαριασμός σας είναι υπό έγκριση
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Μπορείτε να προσθέσετε προϊόντα, αλλά θα είναι ορατά στους πελάτες μετά την έγκριση.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Προϊόντα</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.active_products || 0} / {stats?.total_products || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ενεργά / Σύνολο</p>
              </div>
              <CubeIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Παραγγελίες</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.pending_orders || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Σε αναμονή</p>
              </div>
              <ShoppingCartIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Έσοδα (Μήνας)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  €{stats?.this_month_revenue || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Τρέχων μήνας</p>
              </div>
              <CurrencyEuroIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Αξιολόγηση</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.average_rating || 0}/5
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.total_reviews || 0} κριτικές
                </p>
              </div>
              <StarIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/producer/products/new"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ➕ Προσθήκη Προϊόντος
            </h3>
            <p className="text-gray-600">
              Προσθέστε ένα νέο προϊόν στο κατάστημά σας
            </p>
          </Link>
          
          <Link
            href="/producer/products"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📦 Διαχείριση Προϊόντων
            </h3>
            <p className="text-gray-600">
              Επεξεργαστείτε και διαχειριστείτε τα προϊόντα σας
            </p>
          </Link>
          
          <Link
            href="/producer/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📋 Παραγγελίες
            </h3>
            <p className="text-gray-600">
              Δείτε και διαχειριστείτε τις παραγγελίες σας
            </p>
          </Link>
          
          <Link
            href="/producer/profile"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              👤 Προφίλ Παραγωγού
            </h3>
            <p className="text-gray-600">
              Ενημερώστε τα στοιχεία και τις πληροφορίες σας
            </p>
          </Link>
          
          <Link
            href="/producer/subscription"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💳 Συνδρομή
            </h3>
            <p className="text-gray-600">
              Διαχειριστείτε τη συνδρομή σας και μειώστε την προμήθεια
            </p>
          </Link>
          
          <Link
            href="/producer/analytics"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 Στατιστικά
            </h3>
            <p className="text-gray-600">
              Δείτε αναλυτικά στατιστικά για τις πωλήσεις σας
            </p>
          </Link>
        </div>

        {/* Product Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Στατιστικά Προϊόντων
            </h2>
            <Link
              href="/producer/products/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Νέο Προϊόν
            </Link>
          </div>
          <ProductStats />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Πρόσφατη Δραστηριότητα
          </h2>
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Δεν υπάρχει πρόσφατη δραστηριότητα</p>
          </div>
        </div>
      </div>
    </div>
  );
}