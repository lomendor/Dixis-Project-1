'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/lib/utils/apiUrls';
import {
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  ExclamationCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  customer_name: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items_count: number;
  shipping_address: {
    city: string;
    postal_code: string;
  };
}

const statusConfig = {
  pending: {
    label: 'Αναμονή',
    color: 'bg-yellow-100 text-yellow-800',
    icon: ClockIcon
  },
  confirmed: {
    label: 'Επιβεβαιωμένη',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircleIcon
  },
  processing: {
    label: 'Επεξεργασία',
    color: 'bg-orange-100 text-orange-800',
    icon: ArrowPathIcon
  },
  shipped: {
    label: 'Αποστολή',
    color: 'bg-purple-100 text-purple-800',
    icon: TruckIcon
  },
  delivered: {
    label: 'Παραδόθηκε',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon
  },
  cancelled: {
    label: 'Ακυρώθηκε',
    color: 'bg-red-100 text-red-800',
    icon: ExclamationCircleIcon
  }
};

export default function ProducerOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!user || user.role !== 'producer') {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      
      // Try Laravel backend first
      try {
        const response = await fetch(buildApiUrl('producer/orders'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.data.orders || []);
          return;
        }
      } catch (error) {
        console.log('Laravel backend not available, using mock data');
      }

      // Fallback to mock data for development
      const mockOrders: Order[] = [
        {
          id: 'ORD-2024-001',
          customer_name: 'Μαρία Παπαδοπούλου',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          total_amount: 45.80,
          items_count: 3,
          shipping_address: {
            city: 'Αθήνα',
            postal_code: '10431'
          }
        },
        {
          id: 'ORD-2024-002',
          customer_name: 'Γιάννης Κωνσταντίνου',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          total_amount: 32.50,
          items_count: 2,
          shipping_address: {
            city: 'Θεσσαλονίκη',
            postal_code: '54248'
          }
        },
        {
          id: 'ORD-2024-003',
          customer_name: 'Ελένη Γεωργίου',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'processing',
          total_amount: 67.30,
          items_count: 5,
          shipping_address: {
            city: 'Πάτρα',
            postal_code: '26442'
          }
        },
        {
          id: 'ORD-2024-004',
          customer_name: 'Δημήτρης Αντωνίου',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          status: 'shipped',
          total_amount: 28.90,
          items_count: 2,
          shipping_address: {
            city: 'Λάρισα',
            postal_code: '41222'
          }
        },
        {
          id: 'ORD-2024-005',
          customer_name: 'Αννα Βλάχου',
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          status: 'delivered',
          total_amount: 53.75,
          items_count: 4,
          shipping_address: {
            city: 'Ηράκλειο',
            postal_code: '71202'
          }
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'needsAction') return ['pending', 'confirmed'].includes(order.status);
    if (filter === 'inProgress') return ['processing', 'shipped'].includes(order.status);
    if (filter === 'completed') return order.status === 'delivered';
    if (filter === 'issues') return order.status === 'cancelled';
    return order.status === filter;
  });

  const getSmartGroupCounts = () => {
    return {
      all: orders.length,
      needsAction: orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length,
      inProgress: orders.filter(o => ['processing', 'shipped'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'delivered').length,
      issues: orders.filter(o => o.status === 'cancelled').length,
    };
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

  const smartCounts = getSmartGroupCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 Έξυπνη Διαχείριση Παραγγελιών
              </h1>
              <p className="text-gray-600 mt-1">
                Ομαδοποιημένες με βάση την δράση που χρειάζεται
              </p>
            </div>
            
            <Link
              href="/producer/dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Smart Groups - Reduced to 4 actionable categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setFilter('needsAction')}
            className={`p-6 rounded-lg border-2 transition-all ${
              filter === 'needsAction' 
                ? 'border-red-500 bg-red-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
              {smartCounts.needsAction > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  ΕΠΕΙΓΟΝ
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-red-600">{smartCounts.needsAction}</div>
            <div className="text-sm text-red-700 font-medium">Χρειάζονται Δράση</div>
            <div className="text-xs text-gray-500 mt-1">Αναμονή + Επιβεβαιωμένες</div>
          </button>
          
          <button
            onClick={() => setFilter('inProgress')}
            className={`p-6 rounded-lg border-2 transition-all ${
              filter === 'inProgress' 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ArrowPathIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{smartCounts.inProgress}</div>
            <div className="text-sm text-blue-700 font-medium">Σε Εξέλιξη</div>
            <div className="text-xs text-gray-500 mt-1">Επεξεργασία + Αποστολή</div>
          </button>
          
          <button
            onClick={() => setFilter('completed')}
            className={`p-6 rounded-lg border-2 transition-all ${
              filter === 'completed' 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{smartCounts.completed}</div>
            <div className="text-sm text-green-700 font-medium">Ολοκληρωμένες</div>
            <div className="text-xs text-gray-500 mt-1">Παραδόθηκαν</div>
          </button>
          
          <button
            onClick={() => setFilter('all')}
            className={`p-6 rounded-lg border-2 transition-all ${
              filter === 'all' 
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ShoppingCartIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{smartCounts.all}</div>
            <div className="text-sm text-purple-700 font-medium">Όλες</div>
            <div className="text-xs text-gray-500 mt-1">Συνολικές παραγγελίες</div>
          </button>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'all' ? '📋 Όλες οι Παραγγελίες' : 
               filter === 'needsAction' ? '⚡ Χρειάζονται Άμεση Δράση' :
               filter === 'inProgress' ? '🔄 Παραγγελίες σε Εξέλιξη' :
               filter === 'completed' ? '✅ Ολοκληρωμένες Παραγγελίες' :
               `Παραγγελίες - ${statusConfig[filter as keyof typeof statusConfig]?.label}`}
            </h2>
            {filter === 'needsAction' && smartCounts.needsAction > 0 && (
              <p className="text-sm text-red-600 mt-1">
                💡 Προτεραιότητα: Απαντήστε γρήγορα για καλύτερες αξιολογήσεις!
              </p>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Παραγγελία
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Πελάτης
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ημερομηνία
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Προϊόντα
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Σύνολο
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {order.shipping_address.city}, {order.shipping_address.postal_code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items_count} προϊόντα
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        €{order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/producer/orders/${order.id}`}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Προβολή
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Δεν βρέθηκαν παραγγελίες
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Δεν έχετε παραγγελίες ακόμα.'
                  : `Δεν υπάρχουν παραγγελίες με κατάσταση "${statusConfig[filter as keyof typeof statusConfig]?.label}".`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}