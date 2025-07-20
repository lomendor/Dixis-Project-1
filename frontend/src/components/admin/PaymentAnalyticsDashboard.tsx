'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    total_revenue: { current: number; previous: number; change_percent: number };
    total_transactions: { current: number; previous: number; change_percent: number };
    successful_transactions: { current: number; previous: number; change_percent: number };
    unique_customers: { current: number; previous: number; change_percent: number };
    average_order_value: { current: number; previous: number };
  };
  revenue_chart: Array<{
    period: string;
    revenue: number;
    count: number;
    formatted_period: string;
  }>;
  payment_methods: Array<{
    method: string;
    count: number;
    total_amount: number;
    percentage: number;
  }>;
  success_rate: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    success_rate: number;
    failure_rate: number;
  };
  recent_transactions: Array<{
    id: number;
    amount: number;
    currency: string;
    status: string;
    payment_gateway: string;
    created_at: string;
    customer: { name: string; email: string };
    order_id: number;
  }>;
}

export default function PaymentAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/payment-analytics?period=${period}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
        setError(null);
      } else {
        setError('Αποτυχία φόρτωσης αναλυτικών στοιχείων');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`inline-flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
        ) : (
          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
        )}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Δοκιμάστε ξανά
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Αναλυτικά Πληρωμών</h2>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 ημέρες' },
            { value: '30d', label: '30 ημέρες' },
            { value: '90d', label: '90 ημέρες' },
            { value: '1y', label: '1 έτος' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-sm rounded ${
                period === p.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Συνολικά Έσοδα</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(data.overview.total_revenue.current)}
              </p>
              <p className="text-sm">
                {formatPercentage(data.overview.total_revenue.change_percent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Συναλλαγές</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.overview.total_transactions.current}
              </p>
              <p className="text-sm">
                {formatPercentage(data.overview.total_transactions.change_percent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Επιτυχείς</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.overview.successful_transactions.current}
              </p>
              <p className="text-sm">
                <span className="text-green-600">
                  {data.success_rate.success_rate}% επιτυχία
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Πελάτες</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.overview.unique_customers.current}
              </p>
              <p className="text-sm">
                {formatPercentage(data.overview.unique_customers.change_percent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Τρόποι Πληρωμής</h3>
          <div className="space-y-3">
            {data.payment_methods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(method.total_amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {method.count} συναλλαγές ({method.percentage}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ποσοστό Επιτυχίας</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Επιτυχείς</span>
              <span className="text-lg font-semibold text-green-600">
                {data.success_rate.successful}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Αποτυχημένες</span>
              <span className="text-lg font-semibold text-red-600">
                {data.success_rate.failed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Εκκρεμείς</span>
              <span className="text-lg font-semibold text-yellow-600">
                {data.success_rate.pending}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Ποσοστό Επιτυχίας</span>
                <span className="text-xl font-bold text-green-600">
                  {data.success_rate.success_rate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Πρόσφατες Συναλλαγές</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Πελάτης
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ποσό
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Μέθοδος
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
              {data.recent_transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.payment_gateway}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {transaction.status === 'succeeded'
                        ? 'Επιτυχής'
                        : transaction.status === 'failed'
                        ? 'Αποτυχημένη'
                        : 'Εκκρεμής'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleString('el-GR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}