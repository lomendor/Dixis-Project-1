'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsKPI {
  label: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ChartDataPoint {
  date: string;
  orders: number;
  revenue: number;
  customers: number;
  savings: number;
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  producer: string;
  growth: number;
}

interface BusinessAnalyticsDashboardProps {
  className?: string;
  dateRange?: '7d' | '30d' | '90d' | '1y';
  onDateRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export default function BusinessAnalyticsDashboard({
  className = '',
  dateRange = '30d',
  onDateRangeChange
}: BusinessAnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<'orders' | 'revenue' | 'customers' | 'savings'>('revenue');

  // Mock data - in real implementation, this would come from API
  const kpis: AnalyticsKPI[] = [
    {
      label: 'Total Revenue',
      value: '€45,230',
      change: 12.5,
      changeType: 'increase',
      icon: <CurrencyEuroIcon className="w-6 h-6" />,
      color: 'text-green-600'
    },
    {
      label: 'Orders',
      value: '156',
      change: 8.2,
      changeType: 'increase',
      icon: <ShoppingBagIcon className="w-6 h-6" />,
      color: 'text-blue-600'
    },
    {
      label: 'Active Customers',
      value: '23',
      change: -2.1,
      changeType: 'decrease',
      icon: <UsersIcon className="w-6 h-6" />,
      color: 'text-purple-600'
    },
    {
      label: 'Savings Generated',
      value: '€8,940',
      change: 15.7,
      changeType: 'increase',
      icon: <ArrowUpIcon className="w-6 h-6" />,
      color: 'text-orange-600'
    }
  ];

  const chartData: ChartDataPoint[] = [
    { date: '2024-01-01', orders: 12, revenue: 3200, customers: 8, savings: 640 },
    { date: '2024-01-02', orders: 15, revenue: 4100, customers: 10, savings: 820 },
    { date: '2024-01-03', orders: 8, revenue: 2800, customers: 6, savings: 560 },
    { date: '2024-01-04', orders: 22, revenue: 5600, customers: 14, savings: 1120 },
    { date: '2024-01-05', orders: 18, revenue: 4800, customers: 12, savings: 960 },
    { date: '2024-01-06', orders: 25, revenue: 6200, customers: 16, savings: 1240 },
    { date: '2024-01-07', orders: 20, revenue: 5400, customers: 13, savings: 1080 }
  ];

  const topProducts: TopProduct[] = [
    {
      id: '1',
      name: 'Organic Olive Oil',
      quantity: 245,
      revenue: 6150,
      producer: 'Κρητικός Ελαιώνας',
      growth: 23.5
    },
    {
      id: '2', 
      name: 'Wild Honey',
      quantity: 189,
      revenue: 4725,
      producer: 'Μελίσσια Αρκαδίας',
      growth: 18.2
    },
    {
      id: '3',
      name: 'Premium Feta',
      quantity: 156,
      revenue: 3900,
      producer: 'Τυροκομείο Μυκόνου',
      growth: -5.1
    },
    {
      id: '4',
      name: 'Organic Herbs Mix',
      quantity: 134,
      revenue: 2680,
      producer: 'Αρωματικά Πελίου',
      growth: 31.8
    },
    {
      id: '5',
      name: 'Kalamate Olives',
      quantity: 98,
      revenue: 2450,
      producer: 'Ελιές Καλαμάτας',
      growth: 12.4
    }
  ];

  const categoryData = [
    { name: 'Olive Oil', value: 35, color: '#8884d8' },
    { name: 'Honey', value: 25, color: '#82ca9d' },
    { name: 'Dairy', value: 20, color: '#ffc658' },
    { name: 'Herbs', value: 12, color: '#ff7300' },
    { name: 'Others', value: 8, color: '#00ff88' }
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="w-8 h-8 mr-3" />
            Business Analytics
          </h1>
          <p className="text-gray-600 mt-1">Performance insights for your business</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={kpi.color}>
                {kpi.icon}
              </div>
              <div className={`flex items-center text-sm ${
                kpi.changeType === 'increase' ? 'text-green-600' : 
                kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {kpi.changeType === 'increase' ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : kpi.changeType === 'decrease' ? (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                ) : null}
                {formatPercentage(kpi.change)}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex space-x-2">
              {(['orders', 'revenue', 'customers', 'savings'] as const).map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedMetric === metric
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('el-GR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('el-GR')}
                  formatter={(value: number) => [
                    selectedMetric === 'revenue' || selectedMetric === 'savings' 
                      ? formatCurrency(value) 
                      : value,
                    selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-gray-600">{category.name}</span>
                <span className="ml-1 font-medium">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
          <p className="text-sm text-gray-600 mt-1">Products driving the most revenue</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.producer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.quantity.toLocaleString()} units
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center text-sm ${
                      product.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.growth > 0 ? (
                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {formatPercentage(product.growth)}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('el-GR', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('el-GR')}
                formatter={(value: number, name: string) => [
                  name === 'revenue' || name === 'savings' ? formatCurrency(value) : value,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Bar dataKey="orders" fill="#3B82F6" name="orders" />
              <Bar dataKey="revenue" fill="#10B981" name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}