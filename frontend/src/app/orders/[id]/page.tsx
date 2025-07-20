'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useOrder } from '@/lib/api/services/order/useOrders';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';
import OrderItemsList from '@/components/orders/OrderItemsList';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id ? parseInt(params.id as string) : null;

  const { order, isLoading, error } = useOrder(orderId?.toString() || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Παραγγελία δεν βρέθηκε</h1>
          <p className="text-gray-600 mb-4">Η παραγγελία που ζητήσατε δεν υπάρχει.</p>
          <Link 
            href="/account/orders" 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Όλες οι Παραγγελίες
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Εκκρεμής';
      case 'confirmed':
        return 'Επιβεβαιωμένη';
      case 'processing':
        return 'Επεξεργασία';
      case 'shipped':
        return 'Αποστάλθηκε';
      case 'delivered':
        return 'Παραδόθηκε';
      case 'cancelled':
        return 'Ακυρώθηκε';
      default:
        return 'Άγνωστη';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Επιστροφή
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Παραγγελία #{order.id}
              </h1>
              <p className="text-gray-600 mt-1">
                Ημερομηνία: {new Date(order.createdAt).toLocaleDateString('el-GR')}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Status Tracker */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Κατάσταση Παραγγελίας</h2>
          <OrderStatusTracker
            status={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
            shippedAt={order.shippedAt}
            deliveredAt={order.deliveredAt}
          />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Προϊόντα</h2>
          <OrderItemsList
            items={order.items || []}
            showReviewButton={order.status === 'delivered'}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Σύνοψη Παραγγελίας</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Υποσύνολο:</span>
              <span className="font-medium">€{order?.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Μεταφορικά:</span>
              <span className="font-medium">€{order?.shippingCost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ΦΠΑ:</span>
              <span className="font-medium">€{order?.taxAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Σύνολο:</span>
                <span>€{order?.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Διεύθυνση Αποστολής</h3>
              <div className="text-gray-600 space-y-1">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2">Τηλ: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Διεύθυνση Χρέωσης</h3>
              <div className="text-gray-600 space-y-1">
                <p className="font-medium">
                  {order.billingAddress.firstName} {order.billingAddress.lastName}
                </p>
                <p>{order.billingAddress.address}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && (
                  <p className="mt-2">Τηλ: {order.billingAddress.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment & Shipping Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Μέθοδος Πληρωμής</h3>
            <p className="text-gray-600">
              {order.paymentMethod === 'credit_card' && 'Πιστωτική Κάρτα'}
              {order.paymentMethod === 'cash_on_delivery' && 'Αντικαταβολή'}
              {order.paymentMethod === 'bank_transfer' && 'Τραπεζική Μεταφορά'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Μέθοδος Αποστολής</h3>
            <p className="text-gray-600">
              {order.shippingMethod === 'standard' && 'Κανονική Αποστολή (3-5 εργάσιμες)'}
              {order.shippingMethod === 'express' && 'Ταχεία Αποστολή (1-2 εργάσιμες)'}
              {order.shippingMethod === 'pickup' && 'Παραλαβή από κατάστημα'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/products" 
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-center font-medium"
          >
            Συνεχίστε τις αγορές
          </Link>
          
          <Link 
            href="/account/orders" 
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 text-center font-medium"
          >
            Όλες οι Παραγγελίες
          </Link>

          {order.status === 'pending' && (
            <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium">
              Ακύρωση Παραγγελίας
            </button>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">Χρειάζεστε βοήθεια με την παραγγελία σας;</p>
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
