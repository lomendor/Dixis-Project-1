'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TruckIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    product?: {
      name: string;
      imageUrl?: string;
    };
  }>;
  created_at: string;
  estimated_delivery?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Try to fetch from backend first
        const response = await fetch('/api/orders', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const ordersData = await response.json();
          setOrders(ordersData);
        } else {
          // Create mock orders for development
          const mockOrders: Order[] = [
            {
              id: '1',
              order_number: 'DX2024001',
              status: 'delivered',
              payment_status: 'completed',
              total_amount: 45.50,
              items: [
                {
                  id: '1',
                  name: 'Οργανικές Ντομάτες',
                  price: 4.50,
                  quantity: 2,
                  product: {
                    name: 'Οργανικές Ντομάτες',
                    imageUrl: '/images/products/tomatoes.jpg'
                  }
                },
                {
                  id: '2',
                  name: 'Φρέσκο Μαρούλι',
                  price: 2.80,
                  quantity: 3,
                  product: {
                    name: 'Φρέσκο Μαρούλι',
                    imageUrl: '/images/products/lettuce.jpg'
                  }
                }
              ],
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              estimated_delivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              order_number: 'DX2024002',
              status: 'shipped',
              payment_status: 'completed',
              total_amount: 89.50,
              items: [
                {
                  id: '3',
                  name: 'Οργανικά Αυγά',
                  price: 5.50,
                  quantity: 2,
                  product: {
                    name: 'Οργανικά Αυγά (12τμχ)',
                    imageUrl: '/images/products/eggs.jpg'
                  }
                },
                {
                  id: '4',
                  name: 'Φρέσκο Γάλα',
                  price: 3.20,
                  quantity: 3,
                  product: {
                    name: 'Φρέσκο Γάλα Αγελάδος',
                    imageUrl: '/images/products/milk.jpg'
                  }
                }
              ],
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              estimated_delivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              order_number: 'DX2024003',
              status: 'processing',
              payment_status: 'completed',
              total_amount: 67.80,
              items: [
                {
                  id: '5',
                  name: 'Μέλι Θυμαρίσιο',
                  price: 12.50,
                  quantity: 1,
                  product: {
                    name: 'Μέλι Θυμαρίσιο 500g',
                    imageUrl: '/images/products/honey.jpg'
                  }
                }
              ],
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          setOrders(mockOrders);
        }
      } catch (err) {
        logger.error('Failed to fetch orders', toError(err), errorToContext(err));
        setError('Δεν ήταν δυνατή η ανάκτηση των παραγγελιών');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Αναμονή';
      case 'confirmed':
        return 'Επιβεβαιωμένη';
      case 'processing':
        return 'Σε επεξεργασία';
      case 'shipped':
        return 'Αποστάλθηκε';
      case 'delivered':
        return 'Παραδόθηκε';
      case 'cancelled':
        return 'Ακυρώθηκε';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const orderCounts = {
    all: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Σφάλμα</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Οι Παραγγελίες μου</h1>
        <p className="text-gray-600">Διαχειριστείτε και παρακολουθήστε τις παραγγελίες σας</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Όλες', count: orderCounts.all },
            { key: 'processing', label: 'Σε επεξεργασία', count: orderCounts.processing },
            { key: 'shipped', label: 'Αποστάλθηκαν', count: orderCounts.shipped },
            { key: 'delivered', label: 'Παραδόθηκαν', count: orderCounts.delivered },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`
                flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Δεν βρέθηκαν παραγγελίες
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Δεν έχετε κάνει καμία παραγγελία ακόμα.'
              : `Δεν έχετε παραγγελίες με κατάσταση "${getStatusText(filter)}".`
            }
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Ξεκινήστε τις αγορές
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Παραγγελία #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    €{order.total_amount.toFixed(2)}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 overflow-x-auto">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 flex-shrink-0">
                      <img
                        src={item?.product?.imageUrl || '/placeholder-product.jpg'}
                        alt={item?.product?.name || item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 truncate max-w-32">
                          {item?.product?.name || item.name}
                        </p>
                        <p className="text-gray-600">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-sm text-gray-600 flex-shrink-0">
                      +{order.items.length - 3} περισσότερα
                    </div>
                  )}
                </div>
              </div>

              {/* Estimated Delivery */}
              {order.estimated_delivery && order.status !== 'delivered' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TruckIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Εκτιμώμενη παράδοση: {formatDate(order.estimated_delivery)}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  href={`/orders/${order.id}/confirmation`}
                  className="inline-flex items-center space-x-2 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Προβολή λεπτομερειών</span>
                </Link>
                
                <div className="flex items-center space-x-3">
                  {order.status === 'shipped' && (
                    <button className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                      <TruckIcon className="w-4 h-4" />
                      <span>Παρακολούθηση</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                    </button>
                  )}
                  
                  <Link
                    href={`/products`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-700"
                  >
                    Επαναπαραγγελία
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}