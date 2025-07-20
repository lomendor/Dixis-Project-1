'use client';

import { idToString } from '@/lib/api/client/apiTypes';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserOrders } from '@/lib/api/services/order/useOrders';
import { OrderStatus, PaymentStatus } from '@/lib/api/models/order/types';
import { 
  TruckIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  
  const { orders, isLoading, isError, error, refetch, isOffline } = useGetUserOrders(
    user?.id ? idToString(user.id) : undefined,
    statusFilter !== 'all' ? { status: [statusFilter] } : undefined
  );

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Εκκρεμεί';
      case 'confirmed': return 'Επιβεβαιωμένη';
      case 'processing': return 'Επεξεργασία';
      case 'shipped': return 'Αποστάλθηκε';
      case 'delivered': return 'Παραδόθηκε';
      case 'cancelled': return 'Ακυρώθηκε';
      case 'refunded': return 'Επιστράφηκε';
      default: return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'pending': return 'Εκκρεμεί';
      case 'processing': return 'Επεξεργασία';
      case 'completed': return 'Ολοκληρώθηκε';
      case 'failed': return 'Απέτυχε';
      case 'cancelled': return 'Ακυρώθηκε';
      case 'refunded': return 'Επιστράφηκε';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Οι Παραγγελίες μου</h1>
          <p className="text-gray-600">
            Παρακολουθήστε τις παραγγελίες σας και δείτε το ιστορικό αγορών
          </p>
          {isOffline && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                📱 Λειτουργία offline - Εμφανίζονται δοκιμαστικά δεδομένα
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Φιλτράρισμα:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Όλες οι παραγγελίες</option>
              <option value="pending">Εκκρεμείς</option>
              <option value="confirmed">Επιβεβαιωμένες</option>
              <option value="processing">Σε επεξεργασία</option>
              <option value="shipped">Αποσταλμένες</option>
              <option value="delivered">Παραδομένες</option>
              <option value="cancelled">Ακυρωμένες</option>
            </select>
            
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Ανανέωση
            </button>
          </div>
        </div>

        {/* Orders List */}
        {isError ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Σφάλμα φόρτωσης</h3>
            <p className="text-gray-600 mb-4">
              Δεν ήταν δυνατή η φόρτωση των παραγγελιών σας.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Δοκιμάστε ξανά
            </button>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν έχετε παραγγελίες</h3>
            <p className="text-gray-600 mb-6">
              Δεν έχετε κάνει καμία παραγγελία ακόμα. Ανακαλύψτε τα προϊόντα μας!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Περιήγηση Προϊόντων
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Παραγγελία #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Παραγγέλθηκε στις {new Date(order.placedAt).toLocaleDateString('el-GR')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          €{order.totals.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getPaymentStatusText(order.paymentStatus)}
                        </p>
                      </div>
                      
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Προβολή
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <img
                          key={item.id}
                          src={item?.product?.imageUrl || '/placeholder-product.jpg'}
                          alt={item?.product?.name || 'Product'}
                          className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.items.length} προϊόντα
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items.slice(0, 2).map(item => item?.product?.name).join(', ')}
                        {order.items.length > 2 && '...'}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {order.estimatedDelivery && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TruckIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900">
                          Εκτιμώμενη παράδοση: {new Date(order.estimatedDelivery).toLocaleDateString('el-GR')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {order.tracking && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TruckIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-900">
                            Tracking: {order.tracking.trackingNumber}
                          </span>
                        </div>
                        {order.tracking.trackingUrl && (
                          <a
                            href={order.tracking.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-500"
                          >
                            Παρακολούθηση →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
