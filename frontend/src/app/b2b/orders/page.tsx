'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  EyeIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  supplier: string;
  estimatedDelivery?: string;
}

export default function B2BOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/business/orders');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setOrders(result.orders || []);
      } catch (err) {
        logger.error('Error fetching orders:', toError(err), errorToContext(err));
        // Mock data fallback
        setOrders([
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            date: '2024-01-15T10:30:00Z',
            status: 'delivered',
            total: 125.50,
            items: 8,
            supplier: 'Ελαιώνες Καλαμάτας',
            estimatedDelivery: '2024-01-18'
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            date: '2024-01-14T14:20:00Z',
            status: 'shipped',
            total: 89.30,
            items: 5,
            supplier: 'Μελισσοκομείο Βλάχος',
            estimatedDelivery: '2024-01-17'
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            date: '2024-01-13T09:15:00Z',
            status: 'processing',
            total: 156.75,
            items: 12,
            supplier: 'Τυροκομείο Ζήση',
            estimatedDelivery: '2024-01-19'
          },
          {
            id: '4',
            orderNumber: 'ORD-2024-004',
            date: '2024-01-12T16:45:00Z',
            status: 'pending',
            total: 67.20,
            items: 4,
            supplier: 'Αγρόκτημα Κρήτης',
            estimatedDelivery: '2024-01-20'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-700 bg-green-100 border-green-200';
      case 'shipped': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'processing': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'pending': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'shipped': return <TruckIcon className="h-4 w-4" />;
      case 'processing': return <ClockIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Παραδόθηκε';
      case 'shipped': return 'Αποστάλθηκε';
      case 'processing': return 'Επεξεργασία';
      case 'pending': return 'Εκκρεμεί';
      case 'cancelled': return 'Ακυρώθηκε';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                Οι Παραγγελίες μου
              </h1>
              <p className="text-gray-600 mt-1">
                Διαχειριστείτε και παρακολουθήστε τις παραγγελίες σας
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Σύνολο Παραγγελιών</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Αναζήτηση παραγγελιών..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Όλες οι Καταστάσεις</option>
                <option value="pending">Εκκρεμείς</option>
                <option value="processing">Επεξεργασία</option>
                <option value="shipped">Αποστάλθηκαν</option>
                <option value="delivered">Παραδόθηκαν</option>
                <option value="cancelled">Ακυρώθηκαν</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(order.date).toLocaleDateString('el-GR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="h-4 w-4" />
                        <span>{order.items} προϊόντα</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyEuroIcon className="h-4 w-4" />
                        <span className="font-medium">€{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Προμηθευτής:</strong> {order.supplier}
                    </p>
                    
                    {order.estimatedDelivery && (
                      <p className="text-sm text-gray-600">
                        <strong>Εκτιμώμενη Παράδοση:</strong> {new Date(order.estimatedDelivery).toLocaleDateString('el-GR')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <EyeIcon className="h-4 w-4" />
                      Προβολή
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Δεν βρέθηκαν παραγγελίες
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης'
                : 'Δεν έχετε κάνει ακόμα καμία παραγγελία'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}