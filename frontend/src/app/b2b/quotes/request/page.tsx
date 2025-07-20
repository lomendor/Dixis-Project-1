'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState } from 'react';
import Link from 'next/link';
import { useB2BCartStore } from '@/stores/b2b/b2bCartStore';
import { ArrowLeft, FileText, Calendar, Truck, MessageSquare, Send } from 'lucide-react';

export default function QuoteRequestPage() {
  const { items: cartItems, getSubtotal, getTotalDiscount, getTotal, clearCart } = useB2BCartStore();
  
  const [formData, setFormData] = useState({
    deliveryDate: '',
    deliveryAddress: '',
    specialRequirements: '',
    paymentTerms: '30_days',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call to submit quote request
      const quoteData = {
        items: cartItems,
        subtotal: getSubtotal(),
        discount: getTotalDiscount(),
        total: getTotal(),
        ...formData,
        requestDate: new Date().toISOString(),
        status: 'pending'
      };

      logger.info('Submitting quote request:', quoteData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful quote request
      clearCart();
      setSubmitStatus('success');
      
    } catch (error) {
      logger.error('Quote submission error:', toError(error), errorToContext(error));
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Δεν υπάρχουν προϊόντα</h2>
          <p className="text-gray-600 mb-6">
            Προσθέστε προϊόντα στην παραγγελία σας πριν ζητήσετε προσφορά
          </p>
          <Link
            href="/b2b/dashboard"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Επιστροφή στο Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Η προσφορά στάλθηκε!</h2>
          <p className="text-gray-600 mb-6">
            Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών με την προσφορά μας
          </p>
          <div className="space-y-3">
            <Link
              href="/b2b/quotes"
              className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Προβολή Προσφορών
            </Link>
            <Link
              href="/b2b/dashboard"
              className="block bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium"
            >
              Επιστροφή στο Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/b2b/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Επιστροφή στο Dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Αίτημα Προσφοράς</h1>
                <p className="text-sm text-gray-600">Ζητήστε προσφορά για την παραγγελία σας</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitQuote} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Στοιχεία Επικοινωνίας</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Υπεύθυνος Επικοινωνίας *
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Όνομα υπευθύνου"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Τηλέφωνο *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="210 1234567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      required
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Στοιχεία Παράδοσης
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Επιθυμητή Ημερομηνία Παράδοσης
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Διεύθυνση Παράδοσης
                    </label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Πλήρης διεύθυνση παράδοσης..."
                    />
                  </div>
                </div>
              </div>              {/* Payment & Special Requirements */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Όροι & Απαιτήσεις
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Όροι Πληρωμής
                    </label>
                    <select
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="immediate">Άμεση Πληρωμή</option>
                      <option value="15_days">15 ημέρες</option>
                      <option value="30_days">30 ημέρες</option>
                      <option value="60_days">60 ημέρες</option>
                      <option value="90_days">90 ημέρες</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ειδικές Απαιτήσεις
                    </label>
                    <textarea
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ειδικές απαιτήσεις συσκευασίας, παράδοσης, κλπ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Επιπλέον Σημειώσεις
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Οποιαδήποτε επιπλέον πληροφορία που θα βοηθήσει στην προσφορά..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-lg shadow p-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md font-medium flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Αποστολή...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Αποστολή Αιτήματος Προσφοράς</span>
                    </>
                  )}
                </button>
                
                {submitStatus === 'error' && (
                  <p className="mt-3 text-red-600 text-center">
                    Σφάλμα κατά την αποστολή. Παρακαλώ δοκιμάστε ξανά.
                  </p>
                )}
              </div>
            </form>
          </div>          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Σύνοψη Παραγγελίας</h3>
              </div>
              
              <div className="p-6">
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × €{item.wholesale_price}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        €{(item.quantity * item.wholesale_price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Totals */}
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Υποσύνολο:</span>
                    <span className="font-medium">€{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Εξοικονόμηση:</span>
                    <span className="font-medium text-green-600">-€{getTotalDiscount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Σύνολο:</span>
                    <span>€{getTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Quote Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Σχετικά με την Προσφορά</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Θα λάβετε απάντηση εντός 24 ωρών</li>
                    <li>• Η προσφορά ισχύει για 30 ημέρες</li>
                    <li>• Δυνατότητα διαπραγμάτευσης τιμών</li>
                    <li>• Ειδικές εκπτώσεις για μεγάλες παραγγελίες</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}