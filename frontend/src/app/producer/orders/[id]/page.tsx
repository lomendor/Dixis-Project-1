'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/lib/utils/apiUrls';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderDetail {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items: OrderItem[];
  shipping_address: {
    full_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    postal_code: string;
    phone: string;
  };
  payment_method: string;
  payment_status: string;
  notes?: string;
}

const statusConfig = {
  pending: {
    label: 'Αναμονή Επιβεβαίωσης',
    color: 'bg-yellow-100 text-yellow-800',
    icon: ClockIcon,
    nextAction: 'Επιβεβαίωση Παραγγελίας',
    nextStatus: 'confirmed'
  },
  confirmed: {
    label: 'Επιβεβαιωμένη',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircleIcon,
    nextAction: 'Έναρξη Επεξεργασίας',
    nextStatus: 'processing'
  },
  processing: {
    label: 'Σε Επεξεργασία',
    color: 'bg-orange-100 text-orange-800',
    icon: ClockIcon,
    nextAction: 'Σήμανση ως Αποσταλμένη',
    nextStatus: 'shipped'
  },
  shipped: {
    label: 'Απεστάλη',
    color: 'bg-purple-100 text-purple-800',
    icon: TruckIcon,
    nextAction: 'Σήμανση ως Παραδοθείσα',
    nextStatus: 'delivered'
  },
  delivered: {
    label: 'Παραδόθηκε',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    nextAction: null,
    nextStatus: null
  }
};

export default function ProducerOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
      return;
    }

    fetchOrderDetail();
  }, [user, orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      
      // Try Laravel backend first
      try {
        const response = await fetch(buildApiUrl(`producer/orders/${orderId}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data.data.order);
          return;
        }
      } catch (error) {
        console.log('Laravel backend not available, using mock data');
      }

      // Fallback to mock data for development
      const mockOrder: OrderDetail = {
        id: orderId,
        customer_name: 'Μαρία Παπαδοπούλου',
        customer_email: 'maria.papadopoulou@email.com',
        customer_phone: '+30 210 123 4567',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        total_amount: 45.80,
        items: [
          {
            id: '1',
            product_name: 'Βιολογικό Ελαιόλαδο 500ml',
            quantity: 2,
            unit_price: 12.50,
            total_price: 25.00
          },
          {
            id: '2',
            product_name: 'Παραδοσιακό Μέλι Θυμαρισιού 450g',
            quantity: 1,
            unit_price: 15.30,
            total_price: 15.30
          },
          {
            id: '3',
            product_name: 'Κρητικές Ελιές Καλαμάτας 300g',
            quantity: 1,
            unit_price: 5.50,
            total_price: 5.50
          }
        ],
        shipping_address: {
          full_name: 'Μαρία Παπαδοπούλου',
          address_line_1: 'Πανεπιστημίου 123',
          address_line_2: '2ος όροφος',
          city: 'Αθήνα',
          postal_code: '10431',
          phone: '+30 210 123 4567'
        },
        payment_method: 'Αντικαταβολή',
        payment_status: 'Εκκρεμείς',
        notes: 'Παρακαλώ καλέστε πριν την παράδοση.'
      };

      setOrder(mockOrder);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('auth-token');
      
      // Try Laravel backend first
      try {
        const response = await fetch(buildApiUrl(`producer/orders/${orderId}/status`), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
          return;
        }
      } catch (error) {
        console.log('Laravel backend not available, updating locally');
      }

      // Fallback - update locally for demo
      setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Η παραγγελία δεν βρέθηκε</h2>
          <Link
            href="/producer/orders"
            className="text-green-600 hover:text-green-800"
          >
            Επιστροφή στις παραγγελίες
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/producer/orders"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Παραγγελία {order.id}
                </h1>
                <p className="text-gray-600 mt-1">
                  {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {status.label}
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                €{order.total_amount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Στοιχεία Πελάτη</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Όνομα</label>
                <p className="text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{order.customer_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Τηλέφωνο</label>
                <p className="text-gray-900">{order.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Διεύθυνση Αποστολής
            </h2>
            <div className="text-gray-900">
              <p>{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.address_line_1}</p>
              {order.shipping_address.address_line_2 && (
                <p>{order.shipping_address.address_line_2}</p>
              )}
              <p>{order.shipping_address.city} {order.shipping_address.postal_code}</p>
              <p className="text-sm text-gray-600 mt-2">{order.shipping_address.phone}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Πληρωμή
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Τρόπος Πληρωμής</label>
              <p className="text-gray-900">{order.payment_method}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Κατάσταση Πληρωμής</label>
              <p className="text-gray-900">{order.payment_status}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Προϊόντα Παραγγελίας</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Προϊόν
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ποσότητα
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Τιμή μονάδας
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Σύνολο
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      €{item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      €{item.total_price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    Σύνολο Παραγγελίας:
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-900">
                    €{order.total_amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Σημειώσεις</h2>
            <p className="text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        {status.nextAction && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ενέργειες</h2>
            <button
              onClick={() => updateOrderStatus(status.nextStatus!)}
              disabled={updating}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ενημέρωση...
                </>
              ) : (
                status.nextAction
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}