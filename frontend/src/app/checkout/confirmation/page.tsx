'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useOrder } from '@/lib/api/services/order/useOrders';
import { Order } from '@/lib/api/models/order/types';
import EmailConfirmationStatus from '@/components/orders/EmailConfirmationStatus';
import { emailService } from '@/lib/services/emailService';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const paymentStatus = searchParams.get('payment');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  const { order: orderData, isLoading, error: orderError } = useOrder(
    orderId || ''
  );

  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
      setLoading(false);

      // Show email confirmation status
      emailService.showEmailConfirmationStatus(parseInt(orderData.id.toString()));
    }
    if (orderError) {
      setError('Δεν βρέθηκε η παραγγελία');
      setLoading(false);
    }
  }, [orderData, orderError]);

  useEffect(() => {
    if (!orderId) {
      setError('Δεν βρέθηκε αναγνωριστικό παραγγελίας');
      setLoading(false);
    }
  }, [orderId]);

  const getStatusIcon = () => {
    if (paymentStatus === 'success' || order?.status === 'confirmed') {
      return <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />;
    }
    if (paymentStatus === 'failed' || order?.status === 'failed') {
      return <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />;
    }
    return <ClockIcon className="w-16 h-16 text-yellow-500 mx-auto" />;
  };

  const getStatusMessage = () => {
    if (paymentStatus === 'success' || order?.status === 'confirmed') {
      return {
        title: 'Η παραγγελία σας ολοκληρώθηκε επιτυχώς!',
        message: 'Θα λάβετε email επιβεβαίωσης σύντομα.',
        color: 'text-green-600'
      };
    }
    if (paymentStatus === 'failed' || order?.status === 'failed') {
      return {
        title: 'Η πληρωμή απέτυχε',
        message: 'Παρακαλώ δοκιμάστε ξανά ή επικοινωνήστε μαζί μας.',
        color: 'text-red-600'
      };
    }
    return {
      title: 'Η παραγγελία σας επεξεργάζεται',
      message: 'Θα ενημερωθείτε για την πρόοδο της παραγγελίας σας.',
      color: 'text-yellow-600'
    };
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Σφάλμα</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/products" 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Συνεχίστε τις αγορές
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
          {getStatusIcon()}
          <h1 className={`text-3xl font-bold mt-4 mb-2 ${statusInfo.color}`}>
            {statusInfo.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {statusInfo.message}
          </p>
          
          {order && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Αριθμός Παραγγελίας</p>
                <p className="text-xl font-bold text-gray-900">#{order.id}</p>
              </div>

              {/* Email Confirmation Status */}
              <EmailConfirmationStatus
                orderId={parseInt(order.id.toString())}
                showResendButton={true}
              />
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Λεπτομέρειες Παραγγελίας</h2>
            
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {order?.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item?.product?.name || `Προϊόν #${item.productId}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ποσότητα: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      €{(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      €{item.unitPrice.toFixed(2)} / τεμ.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Υποσύνολο:</span>
                <span className="font-medium">€{order?.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Μεταφορικά:</span>
                <span className="font-medium">€{order?.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">ΦΠΑ:</span>
                <span className="font-medium">€{order?.taxAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
                <span>Σύνολο:</span>
                <span>€{order?.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Διεύθυνση Αποστολής</h3>
                <div className="text-gray-600">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Τηλ: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/products" 
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-center font-medium"
          >
            Συνεχίστε τις αγορές
          </Link>
          
          {order && (
            <Link 
              href={`/orders/${order.id}`}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 text-center font-medium"
            >
              Παρακολούθηση Παραγγελίας
            </Link>
          )}
          
          <Link 
            href="/account/orders" 
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 text-center font-medium"
          >
            Όλες οι Παραγγελίες
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">Χρειάζεστε βοήθεια;</p>
          <p>
            Επικοινωνήστε μαζί μας στο{' '}
            <a href="mailto:support@dixis.gr" className="text-green-600 hover:text-green-700">
              support@dixis.gr
            </a>
            {' '}ή στο{' '}
            <a href="tel:+302101234567" className="text-green-600 hover:text-green-700">
              210 123 4567
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
