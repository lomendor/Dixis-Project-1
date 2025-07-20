'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Users, ShoppingCart, Euro, Calendar, BarChart3, PieChart } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  customerStats: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      // Simulate API call to fetch analytics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAnalytics: AnalyticsData = {
        totalRevenue: 125450.75,
        monthlyRevenue: 18750.25,
        totalOrders: 342,
        monthlyOrders: 45,
        averageOrderValue: 416.67,
        topProducts: [
          { id: '1', name: 'Εξτραπάρθενο Ελαιόλαδο Κορωνέικη', revenue: 15250.00, orders: 85 },
          { id: '2', name: 'Ελιές Καλαμών Εξαιρετικές', revenue: 12800.50, orders: 72 },
          { id: '3', name: 'Μέλι Θυμαρίσιο Κρήτης', revenue: 9650.25, orders: 58 },
          { id: '4', name: 'Φέτα ΠΟΠ Παραδοσιακή', revenue: 8420.75, orders: 45 },
          { id: '5', name: 'Τοματάκια Cherry Βιολογικά', revenue: 7350.00, orders: 38 }
        ],
        monthlyTrends: [
          { month: 'Ιαν', revenue: 15250, orders: 38 },
          { month: 'Φεβ', revenue: 18750, orders: 45 },
          { month: 'Μαρ', revenue: 22100, orders: 52 },
          { month: 'Απρ', revenue: 19850, orders: 48 },
          { month: 'Μαι', revenue: 24500, orders: 58 },
          { month: 'Ιουν', revenue: 21750, orders: 51 }
        ],
        customerStats: {
          totalCustomers: 156,
          activeCustomers: 89,
          newCustomers: 12
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      logger.error('Failed to fetch analytics:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Φόρτωση αναλυτικών στοιχείων...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Σφάλμα φόρτωσης</h2>
          <p className="text-gray-600">Δεν ήταν δυνατή η φόρτωση των αναλυτικών στοιχείων</p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/b2b/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Επιστροφή στο Dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Αναλυτικά Στοιχεία</h1>
                <p className="text-sm text-gray-600">Επιχειρηματική ανάλυση και insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="week">Εβδομάδα</option>
                <option value="month">Μήνας</option>
                <option value="quarter">Τρίμηνο</option>
                <option value="year">Έτος</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Συνολικά Έσοδα</p>
                <p className="text-2xl font-bold text-gray-900">€{analytics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5% από προηγούμενο μήνα</span>
                </div>
              </div>
              <Euro className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Συνολικές Παραγγελίες</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">+8.3% από προηγούμενο μήνα</span>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Μέση Αξία Παραγγελίας</p>
                <p className="text-2xl font-bold text-gray-900">€{analytics.averageOrderValue.toFixed(2)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">+5.2% από προηγούμενο μήνα</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ενεργοί Πελάτες</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.customerStats.activeCustomers}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">+{analytics.customerStats.newCustomers} νέοι</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Μηνιαίες Τάσεις
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-medium text-gray-600">{trend.month}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="font-medium">€{trend.revenue.toLocaleString()}</span>
                            <span className="text-gray-500 ml-2">({trend.orders} παραγγελίες)</span>
                          </div>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(trend.revenue / 25000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Κορυφαία Προϊόντα
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.orders} παραγγελίες
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        €{product.revenue.toLocaleString()}
                      </p>
                      <div className="mt-1 w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(product.revenue / analytics.topProducts[0].revenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Στατιστικά Πελατών
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics.customerStats.totalCustomers}
                </div>
                <div className="text-sm text-gray-600">Συνολικοί Πελάτες</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analytics.customerStats.activeCustomers}
                </div>
                <div className="text-sm text-gray-600">Ενεργοί Πελάτες</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(analytics.customerStats.activeCustomers / analytics.customerStats.totalCustomers) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {analytics.customerStats.newCustomers}
                </div>
                <div className="text-sm text-gray-600">Νέοι Πελάτες (Μήνας)</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${(analytics.customerStats.newCustomers / analytics.customerStats.totalCustomers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Insights & Συστάσεις</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-green-900">Θετική Τάση</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Τα έσοδα αυξάνονται σταθερά τους τελευταίους 3 μήνες. 
                      Η μέση αξία παραγγελίας έχει αυξηθεί κατά 15%.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900">Ανάπτυξη Πελατών</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {analytics.customerStats.newCustomers} νέοι πελάτες αυτό το μήνα. 
                      Ποσοστό διατήρησης: 87%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}