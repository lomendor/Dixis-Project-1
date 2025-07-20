'use client';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    quantity: number;
  }>;
}

export default function B2BReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);    // Mock data - will connect to real API on backend deployment
  const reportData: ReportData = {
    totalSales: 15420.50,
    totalOrders: 127,
    averageOrderValue: 121.42,
    topProducts: [
      { name: 'Ελαιόλαδο Extra Virgin 500ml', sales: 2340.00, quantity: 45 },
      { name: 'Μέλι Θυμαρίσιο 450g', sales: 1890.50, quantity: 38 },
      { name: 'Φέτα ΠΟΠ 400g', sales: 1650.75, quantity: 33 }
    ]
  };

  const handleExportPDF = () => {    // PDF export planned for post-launch
    logger.info('Exporting PDF report...');
  };

  const handleExportCSV = () => {    // CSV export planned for post-launch
    logger.info('Exporting CSV report...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
                Αναφορές & Αναλυτικά
              </h1>
              <p className="text-gray-600 mt-1">
                Παρακολουθήστε την απόδοση των πωλήσεων και αναλύστε τα δεδομένα σας
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                PDF
              </button>
              <button 
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Περίοδος:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="7">Τελευταίες 7 ημέρες</option>
              <option value="30">Τελευταίες 30 ημέρες</option>
              <option value="90">Τελευταίες 90 ημέρες</option>
              <option value="365">Τελευταίος χρόνος</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Συνολικές Πωλήσεις</p>
                <p className="text-2xl font-bold text-gray-900">€{reportData.totalSales.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Συνολικές Παραγγελίες</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
              </div>
              <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Μέσος Όρος Παραγγελίας</p>
                <p className="text-2xl font-bold text-gray-900">€{reportData.averageOrderValue.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">+3.7%</span>
                </div>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Top Products */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Κορυφαία Προϊόντα
          </h3>
          <div className="space-y-4">
            {reportData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.quantity} τεμάχια</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">€{product.sales.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Προσεχώς Διαθέσιμα
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Διαδραστικά γραφήματα πωλήσεων</li>
            <li>• Ανάλυση τάσεων αγοράς</li>
            <li>• Προβλέψεις ζήτησης</li>
            <li>• Σύγκριση με προηγούμενες περιόδους</li>
            <li>• Αυτοματοποιημένες αναφορές email</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}