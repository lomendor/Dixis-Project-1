'use client';

import { useState, useEffect } from 'react';
import { 
  CurrencyEuroIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface BusinessMetrics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    platformCommission: number;
    producerPayouts: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    pending: number;
    completed: number;
    averageValue: number;
    conversionRate: number;
  };
  users: {
    totalCustomers: number;
    totalProducers: number;
    newCustomersThisMonth: number;
    newProducersThisMonth: number;
    activeProducers: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    averagePrice: number;
    topCategory: string;
  };
}

export default function BusinessMetricsPage() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year

  useEffect(() => {
    fetchBusinessMetrics();
  }, [timeRange]);

  const fetchBusinessMetrics = async () => {
    setLoading(true);
    try {
      // In production, this would fetch real data from analytics API
      // For now, we'll use realistic mock data for the business metrics

      const mockMetrics: BusinessMetrics = {
        revenue: {
          total: 15420.80,
          thisMonth: 4230.50,
          lastMonth: 3890.20,
          growth: 8.7, // percentage
          platformCommission: 507.66, // 12% of thisMonth
          producerPayouts: 3722.84, // 88% of thisMonth
        },
        orders: {
          total: 287,
          thisMonth: 89,
          pending: 12,
          completed: 275,
          averageValue: 47.55,
          conversionRate: 3.2, // percentage
        },
        users: {
          totalCustomers: 156,
          totalProducers: 23,
          newCustomersThisMonth: 34,
          newProducersThisMonth: 5,
          activeProducers: 18, // producers with orders this month
        },
        products: {
          total: 234,
          active: 198,
          outOfStock: 12,
          averagePrice: 28.75,
          topCategory: 'Ελαιόλαδο & Λάδια',
        }
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch business metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
  const formatPercentage = (percent: number) => `${percent.toFixed(1)}%`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Δεν ήταν δυνατή η φόρτωση των μετρικών</h2>
          <button
            onClick={fetchBusinessMetrics}
            className="text-green-600 hover:text-green-800"
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Business Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Παρακολούθηση επιδόσεων marketplace Dixis Fresh
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="week">Αυτή την εβδομάδα</option>
                <option value="month">Αυτόν τον μήνα</option>
                <option value="quarter">Αυτό το τρίμηνο</option>
                <option value="year">Αυτή τη χρονιά</option>
              </select>
              
              <button
                onClick={fetchBusinessMetrics}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Ανανέωση
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Συνολικά Έσοδα</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(metrics.revenue.thisMonth)}
                </p>
                <div className={`flex items-center mt-2 text-sm ${
                  metrics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.revenue.growth >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {formatPercentage(Math.abs(metrics.revenue.growth))} vs προηγούμενο μήνα
                </div>
              </div>
              <CurrencyEuroIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Προμήθεια Πλατφόρμας (12%)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(metrics.revenue.platformCommission)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Από {formatCurrency(metrics.revenue.thisMonth)}
                </p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Πληρωμές Παραγωγών (88%)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(metrics.revenue.producerPayouts)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Προς {metrics.users.activeProducers} παραγωγούς
                </p>
              </div>
              <UserGroupIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Μέσος Όρος Παραγγελίας</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(metrics.orders.averageValue)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Από {metrics.orders.thisMonth} παραγγελίες
                </p>
              </div>
              <ShoppingCartIcon className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Παραγγελίες</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Συνολικές Παραγγελίες:</span>
                <span className="font-semibold text-gray-900">{metrics.orders.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Αυτόν τον μήνα:</span>
                <span className="font-semibold text-gray-900">{metrics.orders.thisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Σε εκκρεμότητα:</span>
                <span className="font-semibold text-yellow-600">{metrics.orders.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ολοκληρωμένες:</span>
                <span className="font-semibold text-green-600">{metrics.orders.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ποσοστό Μετατροπής:</span>
                <span className="font-semibold text-blue-600">{formatPercentage(metrics.orders.conversionRate)}</span>
              </div>
            </div>
          </div>

          {/* User Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Χρήστες</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Συνολικοί Πελάτες:</span>
                <span className="font-semibold text-gray-900">{metrics.users.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Νέοι Πελάτες (μήνας):</span>
                <span className="font-semibold text-green-600">{metrics.users.newCustomersThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Συνολικοί Παραγωγοί:</span>
                <span className="font-semibold text-gray-900">{metrics.users.totalProducers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Νέοι Παραγωγοί (μήνας):</span>
                <span className="font-semibold text-green-600">{metrics.users.newProducersThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ενεργοί Παραγωγοί:</span>
                <span className="font-semibold text-blue-600">{metrics.users.activeProducers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Προϊόντα</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{metrics.products.total}</p>
              <p className="text-sm text-gray-600">Συνολικά Προϊόντα</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{metrics.products.active}</p>
              <p className="text-sm text-gray-600">Ενεργά Προϊόντα</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{metrics.products.outOfStock}</p>
              <p className="text-sm text-gray-600">Εκτός Αποθέματος</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.products.averagePrice)}</p>
              <p className="text-sm text-gray-600">Μέση Τιμή</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{metrics.products.topCategory}</p>
              <p className="text-sm text-gray-600">Top Κατηγορία</p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-sm p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">🎯 Βασικά Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">💰 Έσοδα</h3>
              <p className="text-green-100">
                Αύξηση {formatPercentage(metrics.revenue.growth)} αυτόν τον μήνα. 
                Η πλατφόρμα κερδίζει {formatCurrency(metrics.revenue.platformCommission)} 
                από προμήθειες 12%.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">👥 Χρήστες</h3>
              <p className="text-green-100">
                {metrics.users.newCustomersThisMonth} νέοι πελάτες και {metrics.users.newProducersThisMonth} νέοι 
                παραγωγοί αυτόν τον μήνα. {metrics.users.activeProducers}/{metrics.users.totalProducers} 
                παραγωγοί ενεργοί.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📦 Προϊόντα</h3>
              <p className="text-green-100">
                {metrics.products.active} ενεργά προϊόντα με μέση τιμή {formatCurrency(metrics.products.averagePrice)}. 
                Μόνο {metrics.products.outOfStock} εκτός αποθέματος.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}