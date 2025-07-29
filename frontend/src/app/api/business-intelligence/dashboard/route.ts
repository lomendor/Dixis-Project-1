/**
 * Business Intelligence Dashboard API
 * Advanced Financial Reporting & Analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

interface DashboardAnalytics {
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

/**
 * GET - Fetch dashboard analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const producerId = searchParams.get('producer_id');

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020); // Set to beginning of operations
        break;
    }

    // In production, this would fetch from your database
    // For now, generate realistic mock data with Greek business context
    const analyticsData: DashboardAnalytics = {
      overview: {
        total_revenue: generateRandomRevenue(period),
        total_orders: generateRandomOrders(period),
        average_order_value: 0, // Will be calculated
        revenue_growth: generateRandomGrowth(),
        orders_growth: generateRandomGrowth(),
        conversion_rate: Math.random() * 5 + 2, // 2-7%
        customer_satisfaction: Math.random() * 1 + 4, // 4-5 stars
      },
      revenue: {
        daily_breakdown: generateDailyBreakdown(period, startDate, endDate),
        by_payment_method: [
          {
            method: 'credit_card',
            revenue: 45320.50,
            orders: 234,
            percentage: 52.3
          },
          {
            method: 'sepa_direct_debit',
            revenue: 28150.75,
            orders: 145,
            percentage: 32.5
          },
          {
            method: 'cash_on_delivery',
            revenue: 13200.25,
            orders: 98,
            percentage: 15.2
          }
        ],
        by_customer_type: [
          {
            type: 'consumer',
            revenue: 52340.80,
            orders: 312
          },
          {
            type: 'business',
            revenue: 34330.70,
            orders: 165
          }
        ]
      },
      products: {
        top_products: generateTopProducts(),
        category_performance: [
          {
            category: 'Φρέσκα Λαχανικά',
            quantity_sold: 1250,
            revenue: 18750.50,
            products_count: 23
          },
          {
            category: 'Φρούτα',
            quantity_sold: 980,
            revenue: 15680.75,
            products_count: 18
          },
          {
            category: 'Μπαχαρικά & Βότανα',
            quantity_sold: 560,
            revenue: 8940.25,
            products_count: 15
          }
        ],
        inventory_insights: {
          total_products: 65,
          low_stock_products: 8,
          out_of_stock_products: 2,
          average_stock: 47.5,
          average_price: 12.85
        }
      },
      customers: {
        segments: [
          {
            segment: 'premium',
            customer_count: 156,
            revenue: 28450.80,
            avg_order_value: 89.50,
            total_orders: 318,
            orders_per_customer: 2.04
          },
          {
            segment: 'regular',
            customer_count: 432,
            revenue: 35670.45,
            avg_order_value: 52.30,
            total_orders: 682,
            orders_per_customer: 1.58
          },
          {
            segment: 'new',
            customer_count: 234,
            revenue: 12560.25,
            avg_order_value: 38.75,
            total_orders: 324,
            orders_per_customer: 1.38
          }
        ]
      },
      forecasting: {
        next_month_forecast: 95000 + (Math.random() * 20000 - 10000),
        next_quarter_forecast: 285000 + (Math.random() * 60000 - 30000),
        confidence_level: Math.round(Math.random() * 15 + 80), // 80-95%
        trend_direction: Math.random() > 0.3 ? 'ανοδική' : 'σταθερή',
        growth_rate_prediction: generateRandomGrowth()
      },
      financial: {
        profit_margin: Math.random() * 10 + 15, // 15-25%
        tax_collected: 0, // Will be calculated
        invoice_aging: [
          {
            period: '0-30 ημέρες',
            count: 45,
            amount: 28450.80
          },
          {
            period: '31-60 ημέρες',
            count: 12,
            amount: 8920.50
          },
          {
            period: '61-90 ημέρες',
            count: 5,
            amount: 3240.75
          },
          {
            period: '90+ ημέρες',
            count: 3,
            amount: 1890.25
          }
        ],
        payment_terms_performance: [
          {
            terms: '30 ημέρες',
            avg_days_to_pay: 28.5,
            default_rate: 2.3
          },
          {
            terms: '60 ημέρες',
            avg_days_to_pay: 55.2,
            default_rate: 5.8
          }
        ],
        cash_flow: generateCashFlow()
      }
    };

    // Calculate derived values
    analyticsData.overview.average_order_value = 
      analyticsData.overview.total_revenue / analyticsData.overview.total_orders;
    
    // Calculate tax collected (24% VAT in Greece)
    analyticsData.financial.tax_collected = analyticsData.overview.total_revenue * 0.24;

    // Update payment method percentages
    const totalPaymentRevenue = analyticsData.revenue.by_payment_method.reduce(
      (sum, method) => sum + method.revenue, 0
    );
    analyticsData.revenue.by_payment_method.forEach(method => {
      method.percentage = (method.revenue / totalPaymentRevenue) * 100;
    });

    logger.info('Dashboard analytics generated successfully', {
      period,
      producerId,
      totalRevenue: analyticsData.overview.total_revenue,
      totalOrders: analyticsData.overview.total_orders
    });

    return NextResponse.json({
      success: true,
      data: analyticsData,
      meta: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Failed to generate dashboard analytics', toError(error), errorToContext(error));
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Helper functions for generating realistic data
function generateRandomRevenue(period: string): number {
  const baseAmounts: Record<string, number> = {
    '7d': 15000,
    '30d': 65000,
    '90d': 195000,
    '1y': 780000,
    'all': 1200000
  };
  
  const base = baseAmounts[period] || 65000;
  return base + (Math.random() * base * 0.3 - base * 0.15); // ±15% variation
}

function generateRandomOrders(period: string): number {
  const baseOrders: Record<string, number> = {
    '7d': 85,
    '30d': 350,
    '90d': 1050,
    '1y': 4200,
    'all': 6500
  };
  
  const base = baseOrders[period] || 350;
  return Math.round(base + (Math.random() * base * 0.2 - base * 0.1)); // ±10% variation
}

function generateRandomGrowth(): number {
  // Greek agricultural market context - moderate growth
  return Math.random() * 20 - 5; // -5% to +15% growth
}

function generateDailyBreakdown(period: string, startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const breakdown = [];
  
  for (let i = 0; i < Math.min(days, 30); i++) { // Limit to 30 days for performance
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    breakdown.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.random() * 5000 + 1000, // €1000-6000 daily
      orders: Math.round(Math.random() * 25 + 5) // 5-30 orders daily
    });
  }
  
  return breakdown;
}

function generateTopProducts() {
  const greekProducts = [
    { name: 'Οργανικές Ντομάτες Κρήτης', price: 4.50 },
    { name: 'Φρέσκο Μαρούλι Θεσσαλονίκης', price: 2.80 },
    { name: 'Premium Ελαιόλαδο Extra Virgin', price: 15.90 },
    { name: 'Φέτα ΠΟΠ', price: 8.50 },
    { name: 'Μαϊντανός Φρέσκος', price: 1.20 },
    { name: 'Καρότα Βιολογικά', price: 3.20 },
    { name: 'Ρίγανη Κρητική', price: 2.50 },
    { name: 'Αγγούρια Θερμοκηπίου', price: 2.90 }
  ];
  
  return greekProducts.map((product, index) => ({
    id: index + 1,
    name: product.name,
    price: product.price,
    quantity_sold: Math.round(Math.random() * 200 + 50),
    revenue: 0, // Will be calculated
    orders_count: Math.round(Math.random() * 50 + 10)
  })).map(product => {
    product.revenue = product.quantity_sold * product.price;
    return product;
  }).sort((a, b) => b.revenue - a.revenue);
}

function generateCashFlow() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    
    const inflow = Math.random() * 50000 + 40000; // €40k-90k monthly inflow
    const outflow = Math.random() * 35000 + 25000; // €25k-60k monthly outflow
    
    months.push({
      month: date.toLocaleDateString('el-GR', { year: 'numeric', month: 'short' }),
      inflow,
      outflow,
      net_flow: inflow - outflow
    });
  }
  
  return months;
}