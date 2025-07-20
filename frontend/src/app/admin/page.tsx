'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { 
  UsersIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AdminStats {
  total_users: number;
  total_producers: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  active_products: number;
  new_users_today: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  user_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_producers: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    active_products: 0,
    new_users_today: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchAdminData();
  }, [isAuthenticated, user, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - in real app would fetch from API
      setStats({
        total_users: 1247,
        total_producers: 89,
        total_products: 342,
        total_orders: 1856,
        total_revenue: 45670,
        pending_orders: 23,
        active_products: 298,
        new_users_today: 12
      });

      setRecentOrders([
        {
          id: 1,
          order_number: 'DX20250610001',
          user_name: 'Μαρία Παπαδοπούλου',
          total_amount: 43.50,
          status: 'pending',
          created_at: '2025-06-10T10:30:00Z'
        },
        {
          id: 2,
          order_number: 'DX20250610002',
          user_name: 'Γιάννης Κωνσταντίνου',
          total_amount: 67.20,
          status: 'processing',
          created_at: '2025-06-10T09:15:00Z'
        },
        {
          id: 3,
          order_number: 'DX20250610003',
          user_name: 'Ελένη Γεωργίου',
          total_amount: 28.90,
          status: 'shipped',
          created_at: '2025-06-10T08:45:00Z'
        }
      ]);

    } catch (err) {
      setError('Σφάλμα κατά τη φόρτωση των δεδομένων');
      logger.error('Admin dashboard fetch error:', toError(err), errorToContext(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Εκκρεμεί';
      case 'processing':
        return 'Επεξεργασία';
      case 'shipped':
        return 'Αποστολή';
      case 'delivered':
        return 'Παραδόθηκε';
      case 'cancelled':
        return 'Ακυρώθηκε';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Πίνακας Διαχείρισης</h1>
              <p className="text-gray-600">Καλώς ήρθες, {user?.name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/products')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Διαχείριση Προϊόντων
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Διαχείριση Χρηστών
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Συνολικοί Χρήστες</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{stats.new_users_today} σήμερα</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BuildingStorefrontIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Παραγωγοί</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_producers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Προϊόντα</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                <p className="text-sm text-green-600">{stats.active_products} ενεργά</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CurrencyEuroIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Συνολικά Έσοδα</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.total_revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Συνολικές Παραγγελίες</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_orders.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Εκκρεμείς Παραγγελίες</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TruckIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Μέσος Όρος Παραγγελίας</p>
                <p className="text-2xl font-bold text-gray-900">€{(stats.total_revenue / stats.total_orders).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Πρόσφατες Παραγγελίες</h2>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Αριθμός Παραγγελίας
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Πελάτης
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ποσό
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ημερομηνία
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{order.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('el-GR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}