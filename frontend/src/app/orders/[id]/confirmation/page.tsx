'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ClockIcon, TruckIcon, DocumentTextIcon, EnvelopeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { generateInvoiceFromOrder, generateInvoiceHTML } from '@/lib/invoice/invoiceGenerator';

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
  shipping_address?: {
    address: string;
    city: string;
    postal_code: string;
  };
  created_at: string;
  estimated_delivery?: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.id as string;
  const paymentSuccess = searchParams?.get('payment') === 'success';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        
        // Try to fetch from backend first
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        } else {
          // Create mock order for development
          const mockOrder: Order = {
            id: orderId,
            order_number: `DX${Date.now()}`,
            status: 'confirmed',
            payment_status: paymentSuccess ? 'completed' : 'pending',
            total_amount: 89.50,
            items: [
              {
                id: '1',
                name: 'Οργανικές Ντομάτες',
                price: 4.50,
                quantity: 2,
                product: {
                  name: 'Οργανικές Ντομάτες',
                  imageUrl: '/images/tomatoes.jpg'
                }
              },
              {
                id: '2',
                name: 'Φρέσκο Μαρούλι',
                price: 2.80,
                quantity: 3,
                product: {
                  name: 'Φρέσκο Μαρούλι',
                  imageUrl: '/images/lettuce.jpg'
                }
              }
            ],
            shipping_address: {
              address: 'Πατησίων 123',
              city: 'Αθήνα',
              postal_code: '10678'
            },
            created_at: new Date().toISOString(),
            estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
          };
          setOrder(mockOrder);
        }
      } catch (err) {
        logger.error('Failed to fetch order', toError(err), errorToContext(err));
        setError('Δεν ήταν δυνατή η ανάκτηση των στοιχείων της παραγγελίας');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, paymentSuccess]);

  useEffect(() => {
    if (order) {
      fetchInvoiceData();
    }
  }, [order]);

  const fetchInvoiceData = async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/invoices/generate?orderId=${order.id}`);
      if (response.ok) {
        const data = await response.json();
        setInvoiceData(data);
      }
    } catch (error) {
      logger.error('Failed to fetch invoice data', toError(error), errorToContext(error));
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      setDownloadingInvoice(true);
      
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          format: 'pdf'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      logger.info('Invoice downloaded successfully', { orderId: order.id });
      
    } catch (error) {
      logger.error('Failed to download invoice', toError(error), errorToContext(error));
      alert('Αποτυχία λήψης τιμολογίου');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Σφάλμα</h1>
          <p className="text-gray-600 mb-4">{error || 'Η παραγγελία δεν βρέθηκε'}</p>
          <Link 
            href="/account/orders" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Προβολή παραγγελιών
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-8 h-8 text-green-600" />;
      case 'processing':
        return <ClockIcon className="w-8 h-8 text-yellow-600" />;
      case 'shipped':
        return <TruckIcon className="w-8 h-8 text-blue-600" />;
      default:
        return <ClockIcon className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Επιβεβαιωμένη';
      case 'processing':
        return 'Σε επεξεργασία';
      case 'shipped':
        return 'Αποστάλθηκε';
      case 'delivered':
        return 'Παραδόθηκε';
      default:
        return 'Αναμονή';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {paymentSuccess ? 'Η παραγγελία ολοκληρώθηκε!' : 'Παραγγελία καταχωρήθηκε!'}
          </h1>
          <p className="text-lg text-gray-600">
            Παραγγελία #{order.order_number}
          </p>
          {paymentSuccess && (
            <p className="text-green-600 font-medium mt-2">
              Η πληρωμή έγινε επιτυχώς
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Order Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Κατάσταση: {getStatusText(order.status)}
                </h3>
                <p className="text-sm text-gray-600">
                  Παραγγελία από {new Date(order.created_at).toLocaleDateString('el-GR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                €{order.total_amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Πληρωμή: {order.payment_status === 'completed' ? 'Ολοκληρώθηκε' : 'Εκκρεμεί'}
              </p>
            </div>
          </div>

          {/* Estimated Delivery */}
          {order.estimated_delivery && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <TruckIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Εκτιμώμενη παράδοση</h4>
                  <p className="text-sm text-blue-700">
                    {new Date(order.estimated_delivery).toLocaleDateString('el-GR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Προϊόντα</h4>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item?.product?.imageUrl || '/placeholder-product.jpg'}
                    alt={item?.product?.name || item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">
                      {item?.product?.name || item.name}
                    </h5>
                    <p className="text-sm text-gray-600">
                      Ποσότητα: {item.quantity} × €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Διεύθυνση παράδοσης</h4>
              <div className="text-sm text-gray-600">
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
              </div>
            </div>
          )}

          {/* Invoice Information */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5 text-green-600" />
                <span>Τιμολόγιο</span>
              </h4>
              {invoiceData && (
                <span className="text-sm text-green-600 font-medium">
                  {invoiceData.invoiceNumber}
                </span>
              )}
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="w-6 h-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-medium text-green-900">Αυτόματη αποστολή τιμολογίου</h5>
                  <p className="text-sm text-green-700 mt-1">
                    Το τιμολόγιό σας έχει δημιουργηθεί αυτόματα και έχει σταλεί στο email σας.
                  </p>
                  {invoiceData && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>• Αριθμός τιμολογίου: <span className="font-medium">{invoiceData.invoiceNumber}</span></p>
                      <p>• Ημερομηνία έκδοσης: <span className="font-medium">{new Date(invoiceData.date).toLocaleDateString('el-GR')}</span></p>
                      <p>• Συνολικό ποσό: <span className="font-medium">€{invoiceData.total.toFixed(2)}</span></p>
                      <p>• Προθεσμία πληρωμής: <span className="font-medium">{new Date(invoiceData.dueDate).toLocaleDateString('el-GR')}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingInvoice ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                <span>Δημιουργία...</span>
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Λήψη Τιμολογίου PDF</span>
              </>
            )}
          </button>
          
          <Link
            href="/account/orders"
            className="flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Προβολή όλων των παραγγελιών
          </Link>
          
          <Link
            href="/products"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Συνέχεια αγορών
          </Link>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Τι ακολουθεί;</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Επιβεβαίωση παραγγελίας</h4>
                <p className="text-sm text-gray-600">
                  Θα λάβετε email επιβεβαίωσης με τα στοιχεία της παραγγελίας σας.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Προετοιμασία παραγγελίας</h4>
                <p className="text-sm text-gray-600">
                  Η ομάδα μας θα προετοιμάσει τα φρέσκα προϊόντα σας.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Παράδοση</h4>
                <p className="text-sm text-gray-600">
                  Η παραγγελία σας θα παραδοθεί στη διεύθυνση που επιλέξατε.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}