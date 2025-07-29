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
  ClockIcon,
  CheckCircleIcon
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
              
              {/* Real-time Earnings Calculator */}
              <div className="text-right bg-green-50 rounded-lg p-4 min-w-[200px]">
                <p className="text-sm text-green-600 font-medium">💰 Φετινά Έσοδα</p>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900">
                    €{stats?.this_month_revenue || 0}
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Προμήθεια ({profile?.commission_rate || 12}%):</span>
                      <span className="text-red-600">-€{((stats?.this_month_revenue || 0) * ((profile?.commission_rate || 12) / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span className="text-green-700">Καθαρό Κέρδος:</span>
                      <span className="text-green-700">€{((stats?.this_month_revenue || 0) * (1 - ((profile?.commission_rate || 12) / 100))).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
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

        {/* Smart Priority Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">⚡ Έξυπνη Προτεραιότητα</h2>
              <div className="space-y-2">
                {stats?.pending_orders > 0 ? (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">ΕΠΕΙΓΟΝ: {stats.pending_orders} παραγγελίες περιμένουν</span>
                  </div>
                ) : stats?.active_products < 5 ? (
                  <div className="flex items-center">
                    <CubeIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">ΑΥΞΗΣΗ: Προσθέστε περισσότερα προϊόντα ({stats.active_products}/10+)</span>
                  </div>
                ) : stats?.this_month_revenue < 1000 ? (
                  <div className="flex items-center">
                    <CurrencyEuroIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">ΣΤΟΧΟΣ: €{1000 - stats.this_month_revenue} για €1000 μηνιαίως</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">🎉 Εξαιρετική απόδοση! Συνεχίστε έτσι!</span>
                  </div>
                )}
              </div>
              
              {/* Smart Recommendations */}
              <div className="mt-3 text-sm bg-white bg-opacity-10 rounded-lg p-3">
                {stats?.pending_orders > 0 ? (
                  <span>💡 Tip: Οι γρήγορες αποκρίσεις αυξάνουν τις αξιολογήσεις κατά 23%</span>
                ) : stats?.active_products < 5 ? (
                  <span>💡 Tip: Καταστήματα με 10+ προϊόντα έχουν 3x περισσότερες πωλήσεις</span>
                ) : (
                  <span>💡 Tip: Προσθέστε seasonal προϊόντα για περισσότερες πωλήσεις</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <Link
                href={
                  stats?.pending_orders > 0 
                    ? "/producer/orders" 
                    : stats?.active_products < 5
                    ? "/producer/products/new"
                    : "/producer/analytics"
                }
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {stats?.pending_orders > 0 
                  ? "⚡ Επεξεργασία" 
                  : stats?.active_products < 5
                  ? "➕ Προσθήκη"
                  : "📊 Ανάλυση"
                }
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics - Reduced to 4 most important */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Έσοδα Μήνα</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  €{stats?.this_month_revenue || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.last_month_revenue && stats.this_month_revenue > stats.last_month_revenue ? '+' : ''}
                  {stats?.last_month_revenue ? Math.round(((stats.this_month_revenue - stats.last_month_revenue) / stats.last_month_revenue) * 100) : 0}% από προηγ. μήνα
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ενεργές Παραγγελίες</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats?.pending_orders || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Χρειάζονται δράση</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ενεργά Προϊόντα</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {stats?.active_products || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">από {stats?.total_products || 0} σύνολο</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <CubeIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Αξιολόγηση</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats?.average_rating || 4.8}/5
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.total_reviews || 0} κριτικές
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Essential Quick Actions - Reduced to 3 most important */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href={stats?.pending_orders > 0 ? "/producer/orders" : "/producer/products/new"}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {stats?.pending_orders > 0 ? "📋 Επεξεργασία Παραγγελιών" : "➕ Νέο Προϊόν"}
              </h3>
              {stats?.pending_orders > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {stats.pending_orders}
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {stats?.pending_orders > 0 
                ? "Διαχειριστείτε τις εκκρεμείς παραγγελίες" 
                : "Προσθέστε νέο προϊόν για αύξηση πωλήσεων"
              }
            </p>
          </Link>
          
          <Link
            href="/producer/products"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                📦 Προϊόντα
              </h3>
              <span className="text-blue-600 font-medium">
                {stats?.active_products || 0}
              </span>
            </div>
            <p className="text-gray-600">
              Διαχείριση και βελτιστοποίηση προϊόντων
            </p>
          </Link>
          
          <Link
            href="/producer/analytics"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Αναλυτικά
              </h3>
              <span className="text-purple-600 font-medium">
                €{stats?.this_month_revenue || 0}
              </span>
            </div>
            <p className="text-gray-600">
              Παρακολουθήστε την απόδοσή σας
            </p>
          </Link>
        </div>

        {/* Secondary Actions - Collapsed by default */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-gray-900 mb-2">
              <span>Περισσότερες Δράσεις</span>
              <ChartBarIcon className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/producer/profile"
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-900 mb-1">👤 Προφίλ</h4>
                <p className="text-xs text-gray-500">Ενημέρωση στοιχείων</p>
              </Link>
              
              <Link
                href="/producer/subscription"
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-900 mb-1">💳 Συνδρομή</h4>
                <p className="text-xs text-gray-500">Μείωση προμήθειας</p>
              </Link>
              
              <Link
                href="/producer/support"
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-900 mb-1">🎧 Υποστήριξη</h4>
                <p className="text-xs text-gray-500">Βοήθεια & οδηγίες</p>
              </Link>
            </div>
          </details>
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