'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    } else {
      // Redirect to home if no order ID
      router.push('/');
    }
  }, [searchParams, router]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Η Παραγγελία σου Ολοκληρώθηκε!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Σε ευχαριστούμε για την εμπιστοσύνη σου στο Dixis!
          </p>
          
          <p className="text-gray-500 mb-8">
            Αριθμός παραγγελίας: <span className="font-mono font-semibold">{orderId}</span>
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Τι Συμβαίνει Τώρα;</h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Επιβεβαίωση Παραγγελίας</h3>
                  <p className="text-gray-600 text-sm">Θα λάβεις email επιβεβαίωσης εντός 5 λεπτών</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Προετοιμασία Παραγγελίας</h3>
                  <p className="text-gray-600 text-sm">Οι παραγωγοί θα προετοιμάσουν τα προϊόντα σου</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Αποστολή</h3>
                  <p className="text-gray-600 text-sm">Παράδοση εντός 2-3 εργάσιμων ημερών</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-green-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <TruckIcon className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Εκτιμώμενη Παράδοση</h3>
            </div>
            
            <p className="text-green-700 font-medium text-lg">
              {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('el-GR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            
            <p className="text-green-600 text-sm mt-2">
              Θα λάβεις SMS με τον κωδικό παρακολούθησης
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Χρειάζεσαι Βοήθεια;</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700">support@dixis.gr</span>
              </div>
              
              <div className="flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700">210 123 4567</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mt-4">
              Ωράριο εξυπηρέτησης: Δευτέρα - Παρασκευή, 9:00 - 17:00
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Επιστροφή στην Αρχική
            </Link>
            
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              Συνέχισε τις Αγορές
            </Link>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
            Γιατί Επέλεξες Σωστά το Dixis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🌱</div>
              <h4 className="font-semibold text-gray-900 mb-1">Αυθεντικά Ελληνικά</h4>
              <p className="text-gray-600 text-sm">Απευθείας από τον παραγωγό</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🚛</div>
              <h4 className="font-semibold text-gray-900 mb-1">Γρήγορη Παράδοση</h4>
              <p className="text-gray-600 text-sm">��ρέσκα προϊόντα στην πόρτα σου</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💚</div>
              <h4 className="font-semibold text-gray-900 mb-1">Υποστήριξη Παραγωγών</h4>
              <p className="text-gray-600 text-sm">Βοηθάς την ελληνική οικονομία</p>
            </div>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Μοιράσου την εμπειρία σου με τους φίλους σου!
          </p>
          <div className="flex justify-center space-x-4">
            <button className="text-blue-600 hover:text-blue-700 text-sm">
              📘 Facebook
            </button>
            <button className="text-blue-400 hover:text-blue-500 text-sm">
              🐦 Twitter
            </button>
            <button className="text-pink-600 hover:text-pink-700 text-sm">
              📷 Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}