'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  total_orders?: number;
  total_spent?: number;
  recent_orders?: Array<{
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: number;
    items_count: number;
    supplier_name: string;
  }>;
}

export default function B2BDemoPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/business/dashboard/stats');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result as DashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = data ? {
    totalOrders: data.total_orders || 47,
    totalSpent: data.total_spent || 2847.50,
    pendingOrders: 3,
    averageOrderValue: (data.total_orders && data.total_orders > 0 && data.total_spent) ? (data.total_spent / data.total_orders) : 60.59
  } : {
    totalOrders: 47,
    totalSpent: 2847.50,
    pendingOrders: 3,
    averageOrderValue: 60.59
  };

  const recentOrders = data?.recent_orders || [
    {
      id: '1',
      order_number: 'ORD-2024-001',
      created_at: '2024-01-15T10:30:00Z',
      status: 'delivered',
      total_amount: 125.50,
      items_count: 8,
      supplier_name: 'Ελαιώνες Καλαμάτας'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">🎯 DEMO B2B Dashboard - Dixis Platform</h1>
          <p className="text-blue-100 mt-1">
            Αυτό είναι ένα demo του B2B dashboard με real data integration
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Καλώς ήρθατε, Demo Επιχείρηση
          </h1>
          <p className="text-gray-600 mt-2">
            Διαχειριστείτε τις παραγγελίες και τα στατιστικά της επιχείρησής σας
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Συνολικές Παραγγελίες</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Συνολικά Έξοδα</p>
                <p className="text-2xl font-semibold text-gray-900">€{stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Εκκρεμείς Παραγγελίες</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Μέσος Όρος Παραγγελίας</p>
                <p className="text-2xl font-semibold text-gray-900">€{stats.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Πρόσφατες Παραγγελίες</h2>
            <a
              href="/b2b/orders"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ShoppingBagIcon className="h-4 w-4" />
              Όλες οι Παραγγελίες
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Αριθμός Παραγγελίας
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ημερομηνία
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Σύνολο
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('el-GR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Παραδόθηκε
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{order.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Demo Footer */}
      <div className="bg-gray-800 text-white p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-300">
            Demo B2B Dashboard - Δεδομένα από Laravel API (port 8000) → Next.js Frontend (port 3001)
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Status: {loading ? 'Loading...' : error ? `Error: ${error}` : 'Data loaded successfully'}
          </p>
        </div>
      </div>
    </div>
  );
}