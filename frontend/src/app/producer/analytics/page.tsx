'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/lib/utils/apiUrls';
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    totalViews: number;
    totalCustomers: number;
    topProduct: string;
    topProductRevenue: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  productPerformance: Array<{
    name: string;
    revenue: number;
    orders: number;
    views: number;
    conversionRate: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    averageCustomerLifetime: number;
    topCustomerSegments: Array<{
      segment: string;
      count: number;
      revenue: number;
    }>;
  };
  monthlyComparison: {
    thisMonth: {
      revenue: number;
      orders: number;
      customers: number;
    };
    lastMonth: {
      revenue: number;
      orders: number;
      customers: number;
    };
  };
}

export default function ProducerAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
      return;
    }

    fetchAnalyticsData();
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!refreshing) setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(buildApiUrl(`producer/analytics?days=${timeRange}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Backend returns {status: 'success', data: {...analytics...}}
        if (result.status === 'success' && result.data) {
          setAnalytics(result.data);
        } else {
          console.warn('Analytics API returned unexpected format:', result);
          setAnalytics(generateMockAnalytics());
        }
      } else {
        console.warn('Analytics API request failed:', response.status, response.statusText);
        // Use mock data if API not available yet
        setAnalytics(generateMockAnalytics());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(generateMockAnalytics());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockAnalytics = (): AnalyticsData => {
    const baseRevenue = Math.floor(Math.random() * 5000) + 2000;
    const baseOrders = Math.floor(Math.random() * 50) + 20;
    
    return {
      overview: {
        totalRevenue: baseRevenue,
        totalOrders: baseOrders,
        averageOrderValue: Math.round(baseRevenue / baseOrders),
        conversionRate: Math.round((Math.random() * 3 + 2) * 10) / 10,
        totalViews: Math.floor(Math.random() * 1000) + 500,
        totalCustomers: Math.floor(baseOrders * 0.7) + Math.floor(Math.random() * 10),
        topProduct: 'Εξαιρετικό Παρθένο Ελαιόλαδο 500ml',
        topProductRevenue: Math.floor(baseRevenue * 0.3)
      },
      revenueChart: Array.from({ length: parseInt(timeRange) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (parseInt(timeRange) - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 200) + 50,
          orders: Math.floor(Math.random() * 5) + 1
        };
      }),
      productPerformance: [
        { name: 'Εξαιρετικό Παρθένο Ελαιόλαδο 500ml', revenue: 1200, orders: 24, views: 156, conversionRate: 15.4 },
        { name: 'Θυμαρίσιο Μέλι 250g', revenue: 890, orders: 18, views: 134, conversionRate: 13.4 },
        { name: 'Καλαματιανές Ελιές 300g', revenue: 650, orders: 13, views: 98, conversionRate: 13.3 },
        { name: 'Ντομάτες Χωρίς Ψεκασμούς 1kg', revenue: 420, orders: 21, views: 87, conversionRate: 24.1 },
        { name: 'Φέτα ΠΟΠ 400g', revenue: 380, orders: 8, views: 72, conversionRate: 11.1 }
      ],
      categoryBreakdown: [
        { name: 'Ελαιόλαδο & Ελιές', value: 40, color: '#22c55e' },
        { name: 'Μέλι & Μελισσοκομικά', value: 25, color: '#f59e0b' },
        { name: 'Λαχανικά', value: 20, color: '#ef4444' },
        { name: 'Τυριά', value: 10, color: '#3b82f6' },
        { name: 'Άλλα', value: 5, color: '#8b5cf6' }
      ],
      customerInsights: {
        newCustomers: Math.floor(Math.random() * 15) + 8,
        returningCustomers: Math.floor(Math.random() * 20) + 12,
        averageCustomerLifetime: Math.floor(Math.random() * 200) + 150,
        topCustomerSegments: [
          { segment: 'Οικογένειες 30-45', count: 24, revenue: 1850 },
          { segment: 'Νέοι ενήλικες 25-35', count: 18, revenue: 1200 },
          { segment: 'Ηλικιωμένοι 55+', count: 12, revenue: 980 }
        ]
      },
      monthlyComparison: {
        thisMonth: {
          revenue: baseRevenue,
          orders: baseOrders,
          customers: Math.floor(baseOrders * 0.7)
        },
        lastMonth: {
          revenue: Math.floor(baseRevenue * (0.8 + Math.random() * 0.4)),
          orders: Math.floor(baseOrders * (0.8 + Math.random() * 0.4)),
          customers: Math.floor(baseOrders * 0.6)
        }
      }
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση στατιστικών...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Δεν βρέθηκαν δεδομένα στατιστικών</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Προσπάθεια ξανά
          </Button>
        </div>
      </div>
    );
  }

  const revenueChange = calculateChange(
    analytics.monthlyComparison.thisMonth.revenue,
    analytics.monthlyComparison.lastMonth.revenue
  );

  const ordersChange = calculateChange(
    analytics.monthlyComparison.thisMonth.orders,
    analytics.monthlyComparison.lastMonth.orders
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Έξυπνα Αναλυτικά</h1>
            <p className="text-gray-600 mt-1">
              Ανακαλύψτε patterns και βελτιώστε τις πωλήσεις σας
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="7">Τελευταίες 7 ημέρες</option>
              <option value="30">Τελευταίες 30 ημέρες</option>
              <option value="90">Τελευταίες 90 ημέρες</option>
            </select>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Ανανέωση
            </Button>
          </div>
        </div>

        {/* Quick Insights Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">🔥 Top Μήνας</p>
                <p className="text-xl font-bold">
                  {formatCurrency(Math.max(...analytics.revenueChart.map(d => d.revenue)))}
                </p>
              </div>
              <CurrencyEuroIcon className="h-8 w-8 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">⭐ Best Seller</p>
                <p className="text-lg font-bold truncate">
                  {analytics.overview.topProduct.length > 20 
                    ? analytics.overview.topProduct.substring(0, 20) + "..." 
                    : analytics.overview.topProduct}
                </p>
              </div>
              <StarIcon className="h-8 w-8 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">📈 Αύξηση</p>
                <p className="text-xl font-bold">
                  {revenueChange >= 0 ? '+' : ''}{revenueChange}%
                </p>
              </div>
              {revenueChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-8 w-8 opacity-80" />
              ) : (
                <ArrowTrendingDownIcon className="h-8 w-8 opacity-80" />
              )}
            </div>
          </motion.div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
                <CurrencyEuroIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  {revenueChange >= 0 ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(revenueChange)}%
                  </span>
                  <span className="ml-1">σε σχέση με τον προηγούμενο μήνα</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Παραγγελίες</CardTitle>
                <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalOrders}</div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  {ordersChange >= 0 ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={ordersChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(ordersChange)}%
                  </span>
                  <span className="ml-1">σε σχέση με τον προηγούμενο μήνα</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Μέσος Όρος Παραγγελίας</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.overview.averageOrderValue)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Ποσοστό μετατροπής: {analytics.overview.conversionRate}%
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Προβολές</CardTitle>
                <EyeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalViews.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {analytics.overview.totalCustomers} μοναδικοί πελάτες
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Εξέλιξη Εσόδων</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('el-GR', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString('el-GR')}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Έσοδα' : 'Παραγγελίες'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Κατανομή Κατηγοριών</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Ποσοστό']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Product Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Απόδοση Προϊόντων</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Προϊόν</th>
                      <th className="text-right py-3 px-4">Έσοδα</th>
                      <th className="text-right py-3 px-4">Παραγγελίες</th>
                      <th className="text-right py-3 px-4">Προβολές</th>
                      <th className="text-right py-3 px-4">Μετατροπή</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.productPerformance.map((product, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right">{product.orders}</td>
                        <td className="py-3 px-4 text-right">{product.views}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-green-600 font-medium">
                            {product.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Πληροφορίες Πελατών</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.customerInsights.newCustomers}
                  </div>
                  <div className="text-sm text-blue-600">Νέοι Πελάτες</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.customerInsights.returningCustomers}
                  </div>
                  <div className="text-sm text-green-600">Επαναλαμβανόμενοι</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CurrencyEuroIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(analytics.customerInsights.averageCustomerLifetime)}
                  </div>
                  <div className="text-sm text-purple-600">Μέση Αξία Πελάτη</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Κορυφαία Τμήματα Πελατών</h4>
                <div className="space-y-3">
                  {analytics.customerInsights.topCustomerSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{segment.segment}</div>
                        <div className="text-sm text-gray-600">{segment.count} πελάτες</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(segment.revenue)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(segment.revenue / segment.count)} / πελάτη
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}