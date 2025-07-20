'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  MapPinIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  wishlistItems: number;
  savedAddresses: number;
  savedPaymentMethods: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
    savedAddresses: 0,
    savedPaymentMethods: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch('/api/account/stats'),
        fetch('/api/account/orders?limit=5')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.data || []);
      }
    } catch (error) {
      logger.error('Failed to fetch dashboard data', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Εκκρεμεί';
      case 'processing':
        return 'Σε επεξεργασία';
      case 'shipped':
        return 'Έχει αποσταλεί';
      case 'delivered':
        return 'Παραδόθηκε';
      case 'cancelled':
        return 'Ακυρώθηκε';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Καλωσήρθατε, {user?.name || 'Χρήστη'}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/account/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Συνολικές Παραγγελίες</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingOrders} εκκρεμούν
              </p>
            </div>
            <ShoppingBagIcon className="h-12 w-12 text-green-600" />
          </div>
        </Link>

        <Link href="/account/wishlist" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Αγαπημένα</p>
              <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
              <p className="text-xs text-gray-500 mt-1">προϊόντα</p>
            </div>
            <HeartIcon className="h-12 w-12 text-red-500" />
          </div>
        </Link>

        <Link href="/account/addresses" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Διευθύνσεις</p>
              <p className="text-2xl font-bold text-gray-900">{stats.savedAddresses}</p>
              <p className="text-xs text-gray-500 mt-1">αποθηκευμένες</p>
            </div>
            <MapPinIcon className="h-12 w-12 text-blue-600" />
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Πρόσφατες Παραγγελίες</h2>
            <Link href="/account/orders" className="text-sm text-green-600 hover:text-green-500">
              Δείτε όλες →
            </Link>
          </div>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="px-6 py-4 hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Παραγγελία #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('el-GR')} • {order.items} προϊόντα
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      €{order.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getStatusText(order.status)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Δεν έχετε κάνει ακόμα καμία παραγγελία
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Ξεκινήστε τις αγορές
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Γρήγορες Ενέργειες</h3>
          <div className="space-y-3">
            <Link
              href="/account/settings"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Ενημέρωση Προφίλ</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/account/payment-methods"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Διαχείριση Καρτών</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/account/notifications"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Ρυθμίσεις Ειδοποιήσεων</span>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ειδικές Προσφορές</h3>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-800">
              🎉 Κερδίστε <strong>10% έκπτωση</strong> στην επόμενη παραγγελία σας!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Χρησιμοποιήστε τον κωδικό: <code className="bg-green-100 px-1 py-0.5 rounded">WELCOME10</code>
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/products"
              className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Αγοράστε Τώρα
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}