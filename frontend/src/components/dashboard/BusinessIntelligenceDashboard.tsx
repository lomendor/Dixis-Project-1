'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Percent,
  Receipt,
  CreditCard,
  Banknote,
  TrendingUpIcon,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    revenue_growth: number;
    orders_growth: number;
    conversion_rate: number;
    customer_satisfaction: number;
  };
  revenue: {
    daily_breakdown: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    by_payment_method: Array<{
      method: string;
      revenue: number;
      orders: number;
      percentage: number;
    }>;
    by_customer_type: Array<{
      type: string;
      revenue: number;
      orders: number;
    }>;
  };
  products: {
    top_products: Array<{
      id: number;
      name: string;
      price: number;
      quantity_sold: number;
      revenue: number;
      orders_count: number;
    }>;
    category_performance: Array<{
      category: string;
      quantity_sold: number;
      revenue: number;
      products_count: number;
    }>;
    inventory_insights: {
      total_products: number;
      low_stock_products: number;
      out_of_stock_products: number;
      average_stock: number;
      average_price: number;
    };
  };
  customers: {
    segments: Array<{
      segment: string;
      customer_count: number;
      revenue: number;
      avg_order_value: number;
      total_orders: number;
      orders_per_customer: number;
    }>;
  };
  forecasting: {
    next_month_forecast: number;
    next_quarter_forecast: number;
    confidence_level: number;
    trend_direction: string;
    growth_rate_prediction: number;
  };
  financial: {
    profit_margin: number;
    tax_collected: number;
    invoice_aging: Array<{
      period: string;
      count: number;
      amount: number;
    }>;
    payment_terms_performance: Array<{
      terms: string;
      avg_days_to_pay: number;
      default_rate: number;
    }>;
    cash_flow: Array<{
      month: string;
      inflow: number;
      outflow: number;
      net_flow: number;
    }>;
  };
}

interface BusinessIntelligenceDashboardProps {
  producerId?: number;
  userRole?: string;
}

export default function BusinessIntelligenceDashboard({ 
  producerId, 
  userRole = 'admin' 
}: BusinessIntelligenceDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, producerId]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        ...(producerId && { producer_id: producerId.toString() })
      });

      const response = await fetch(`/api/business-intelligence/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      logger.error('Failed to fetch analytics data:', toError(error), errorToContext(error));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Φόρτωση αναλυτικών στοιχείων...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Δεν ήταν δυνατή η φόρτωση των αναλυτικών στοιχείων.</p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          Δοκιμάστε ξανά
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Business Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Αναλυτικά στοιχεία και insights για τη βελτίωση των επιδόσεων
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Τελευταίες 7 ημέρες</SelectItem>
              <SelectItem value="30d">Τελευταίες 30 ημέρες</SelectItem>
              <SelectItem value="90d">Τελευταίες 90 ημέρες</SelectItem>
              <SelectItem value="1y">Τελευταίος χρόνος</SelectItem>
              <SelectItem value="all">Όλα τα δεδομένα</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Ανανέωση
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Εξαγωγή
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Τελευταία ενημέρωση: {lastUpdated.toLocaleString('el-GR')}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.overview.total_revenue)}
            </div>
            <div className={`text-xs flex items-center gap-1 ${getGrowthColor(analyticsData.overview.revenue_growth)}`}>
              {getGrowthIcon(analyticsData.overview.revenue_growth)}
              {formatPercentage(analyticsData.overview.revenue_growth)} από την προηγούμενη περίοδο
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικές Παραγγελίες</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.total_orders.toLocaleString('el-GR')}
            </div>
            <div className={`text-xs flex items-center gap-1 ${getGrowthColor(analyticsData.overview.orders_growth)}`}>
              {getGrowthIcon(analyticsData.overview.orders_growth)}
              {formatPercentage(analyticsData.overview.orders_growth)} από την προηγούμενη περίοδο
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μέση Αξία Παραγγελίας</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.overview.average_order_value)}
            </div>
            <div className="text-xs text-muted-foreground">
              Ποσοστό μετατροπής: {analyticsData.overview.conversion_rate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ικανοποίηση Πελατών</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.customer_satisfaction.toFixed(1)}/5.0
            </div>
            <div className="text-xs text-muted-foreground">
              Βαθμολογία ικανοποίησης
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Επισκόπηση</TabsTrigger>
          <TabsTrigger value="revenue">Έσοδα</TabsTrigger>
          <TabsTrigger value="financial">Οικονομικά</TabsTrigger>
          <TabsTrigger value="products">Προϊόντα</TabsTrigger>
          <TabsTrigger value="customers">Πελάτες</TabsTrigger>
          <TabsTrigger value="forecasting">Προβλέψεις</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue by Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Έσοδα ανά Μέθοδο Πληρωμής
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.revenue.by_payment_method.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="font-medium capitalize">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(method.revenue)}</div>
                      <div className="text-sm text-gray-500">{method.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Κατηγορίες Πελατών
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.customers.segments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold capitalize">{segment.segment}</div>
                      <div className="text-sm text-gray-500">
                        {segment.customer_count} πελάτες • {segment.orders_per_customer} παραγγελίες/πελάτη
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(segment.revenue)}</div>
                      <div className="text-sm text-gray-500">
                        ΜΟ: {formatCurrency(segment.avg_order_value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue by Payment Method Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Αναλυτικά Έσοδα ανά Μέθοδο Πληρωμής
              </CardTitle>
              <CardDescription>
                Συμπεριλαμβανομένου του νέου SEPA Direct Debit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {analyticsData.revenue.by_payment_method.map((method, index) => {
                    const getPaymentMethodIcon = (methodName: string) => {
                      switch (methodName) {
                        case 'credit_card': return <CreditCard className="w-4 h-4" />;
                        case 'sepa_direct_debit': return <Banknote className="w-4 h-4" />;
                        case 'cash_on_delivery': return <DollarSign className="w-4 h-4" />;
                        default: return <CreditCard className="w-4 h-4" />;
                      }
                    };

                    const getPaymentMethodName = (methodName: string) => {
                      switch (methodName) {
                        case 'credit_card': return 'Πιστωτική Κάρτα';
                        case 'sepa_direct_debit': return 'SEPA Direct Debit';
                        case 'cash_on_delivery': return 'Αντικαταβολή';
                        default: return methodName;
                      }
                    };

                    const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500'];
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(method.method)}
                            <span className="font-medium">{getPaymentMethodName(method.method)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(method.revenue)}</div>
                          <div className="text-sm text-gray-500">
                            {method.orders} παραγγελίες • {method.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">SEPA Success</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Το SEPA Direct Debit έχει φτάσει το 32.5% των εσόδων, δείχνοντας υψηλή αποδοχή από Ευρωπαίους πελάτες.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Conversion Rate</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Οι πιστωτικές κάρτες διατηρούν την κυριαρχία με 52.3%, ενώ η αντικαταβολή μειώνεται σταδιακά.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Ημερήσια Ανάλυση Εσόδων ({period})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analyticsData.revenue.daily_breakdown.slice(-10).reverse().map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {new Date(day.date).toLocaleDateString('el-GR', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-500">{day.orders} παραγγελίες</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(day.revenue)}</div>
                      <div className="text-sm text-gray-500">
                        ΜΟ: {formatCurrency(day.revenue / day.orders)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Customer Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Έσοδα ανά Τύπο Πελάτη
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.revenue.by_customer_type.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-500' : 'bg-indigo-500'}`} />
                      <div>
                        <div className="font-semibold capitalize">
                          {type.type === 'consumer' ? 'Καταναλωτές (B2C)' : 'Επιχειρήσεις (B2B)'}
                        </div>
                        <div className="text-sm text-gray-500">{type.orders} παραγγελίες</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(type.revenue)}</div>
                      <div className="text-sm text-gray-500">
                        ΜΟ: {formatCurrency(type.revenue / type.orders)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Κορυφαία Προϊόντα
              </CardTitle>
              <CardDescription>
                Τα προϊόντα με τις καλύτερες επιδόσεις για την επιλεγμένη περίοδο
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.products.top_products.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.quantity_sold} τεμάχια • {product.orders_count} παραγγελίες
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(product.price)}/τεμ.</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Στοιχεία Αποθέματος</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.products.inventory_insights.total_products}
                  </div>
                  <div className="text-sm text-gray-500">Συνολικά Προϊόντα</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analyticsData.products.inventory_insights.low_stock_products}
                  </div>
                  <div className="text-sm text-gray-500">Χαμηλό Απόθεμα</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {analyticsData.products.inventory_insights.out_of_stock_products}
                  </div>
                  <div className="text-sm text-gray-500">Εξαντλημένα</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.products.inventory_insights.average_stock.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Μέσο Απόθεμα</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(analyticsData.products.inventory_insights.average_price)}
                  </div>
                  <div className="text-sm text-gray-500">Μέση Τιμή</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Περιθώριο Κέρδους</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.financial.profit_margin.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Μέσο περιθώριο κέρδους
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ΦΠΑ Συλλογή</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analyticsData.financial.tax_collected)}
                </div>
                <div className="text-xs text-muted-foreground">
                  24% ΦΠΑ επί των πωλήσεων
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Καθαρή Ταμειακή Ροή</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    analyticsData.financial.cash_flow[analyticsData.financial.cash_flow.length - 1]?.net_flow || 0
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Τρέχων μήνας
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Aging Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Ανάλυση Γήρανσης Τιμολογίων
              </CardTitle>
              <CardDescription>
                Κατάσταση ληξιπρόθεσμων τιμολογίων και εισπράξεων
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.financial.invoice_aging.map((aging, index) => {
                  const isOverdue = index >= 2; // 61+ days considered overdue
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {isOverdue && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        <div>
                          <div className="font-semibold">{aging.period}</div>
                          <div className="text-sm text-gray-500">
                            {aging.count} τιμολόγια
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatCurrency(aging.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {((aging.amount / analyticsData.financial.invoice_aging.reduce((sum, a) => sum + a.amount, 0)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Ταμειακή Ροή (6 Μήνες)
              </CardTitle>
              <CardDescription>
                Εισροές, εκροές και καθαρή ταμειακή ροή ανά μήνα
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.financial.cash_flow.map((flow, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{flow.month}</div>
                      <div className="text-xs text-gray-500">Μήνας</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{formatCurrency(flow.inflow)}</div>
                      <div className="text-xs text-gray-500">Εισροές</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{formatCurrency(flow.outflow)}</div>
                      <div className="text-xs text-gray-500">Εκροές</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${flow.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(flow.net_flow)}
                      </div>
                      <div className="text-xs text-gray-500">Καθαρή Ροή</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Απόδοση Όρων Πληρωμής
              </CardTitle>
              <CardDescription>
                Ανάλυση συμπεριφοράς πληρωμών και καθυστερήσεων
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.financial.payment_terms_performance.map((term, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">{term.terms} Όροι</div>
                      <div className="text-sm text-gray-500">
                        Μέσος χρόνος πληρωμής: {term.avg_days_to_pay} ημέρες
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${term.default_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {term.default_rate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Ποσοστό καθυστέρησης</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          {/* Revenue Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Πρόβλεψη Εσόδων
              </CardTitle>
              <CardDescription>
                Προβλέψεις βασισμένες σε ιστορικά δεδομένα και τάσεις
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analyticsData.forecasting.next_month_forecast)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Επόμενος Μήνας</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analyticsData.forecasting.next_quarter_forecast)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Επόμενο Τρίμηνο</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.forecasting.confidence_level}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Επίπεδο Εμπιστοσύνης</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Τάση Ανάπτυξης</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {analyticsData.forecasting.trend_direction}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">Προβλεπόμενη Ανάπτυξη</div>
                    <div className={`text-sm ${getGrowthColor(analyticsData.forecasting.growth_rate_prediction)}`}>
                      {formatPercentage(analyticsData.forecasting.growth_rate_prediction)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
