'use client';

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface B2BProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  producer: {
    id: string;
    name: string;
    location: string;
  };
  pricing: {
    retail_price: number;
    wholesale_price: number;
    bulk_price: number;
    minimum_quantity: number;
  };
}

interface QuoteRequestData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  vat_number: string;
  requested_quantity: number;
  delivery_date: string;
  special_requirements: string;
  payment_terms: string;
}interface B2BQuoteRequestProps {
  product: B2BProduct;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: QuoteRequestData) => void;
}

export default function B2BQuoteRequest({
  product,
  isOpen,
  onClose,
  onSubmit
}: B2BQuoteRequestProps) {
  const [formData, setFormData] = useState<QuoteRequestData>({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    vat_number: '',
    requested_quantity: product.pricing.minimum_quantity,
    delivery_date: '',
    special_requirements: '',
    payment_terms: 'net30'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<QuoteRequestData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<QuoteRequestData> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Το όνομα εταιρείας είναι υποχρεωτικό';
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Το όνομα επικοινωνίας είναι υποχρεωτικό';
    }    if (!formData.email.trim()) {
      newErrors.email = 'Το email είναι υποχρεωτικό';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Μη έγκυρο email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Το τηλέφωνο είναι υποχρεωτικό';
    }

    if (formData.requested_quantity < product.pricing.minimum_quantity) {
      newErrors.requested_quantity = `Ελάχιστη ποσότητα: ${product.pricing.minimum_quantity}`;
    }

    if (!formData.delivery_date) {
      newErrors.delivery_date = 'Η ημερομηνία παράδοσης είναι υποχρεωτική';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setIsSubmitted(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          company_name: '',
          contact_person: '',
          email: '',
          phone: '',
          vat_number: '',
          requested_quantity: product.pricing.minimum_quantity,
          delivery_date: '',
          special_requirements: '',
          payment_terms: 'net30'
        });
      }, 2000);
      
    } catch (error) {
      logger.error('Error submitting quote request', toError(error), errorToContext(error));
    } finally {
      setIsSubmitting(false);
    }
  };  const handleInputChange = (field: keyof QuoteRequestData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const estimatedPrice = formData.requested_quantity * product.pricing.wholesale_price;
  const savings = (product.pricing.retail_price - product.pricing.wholesale_price) * formData.requested_quantity;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <CurrencyEuroIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Αίτημα Προσφοράς</h2>
                <p className="text-sm text-gray-600">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>          {/* Success State */}
          {isSubmitted ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Το αίτημά σας στάλθηκε επιτυχώς!
              </h3>
              <p className="text-gray-600">
                Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών με την προσφορά μας.
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-600">IMG</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{product.producer.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Χονδρική τιμή</div>
                    <div className="text-lg font-bold text-blue-600">
                      €{product.pricing.wholesale_price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ελάχιστη: {product.pricing.minimum_quantity} τεμ.
                    </div>
                  </div>
                </div>
              </div>              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Company Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Στοιχεία Εταιρείας</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Όνομα Εταιρείας *
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.company_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="π.χ. Εταιρεία ΑΒΓ ΑΕ"
                      />
                      {errors.company_name && (
                        <p className="text-red-600 text-xs mt-1">{errors.company_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ΑΦΜ
                      </label>
                      <input
                        type="text"
                        value={formData.vat_number}
                        onChange={(e) => handleInputChange('vat_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="π.χ. 123456789"
                      />
                    </div>
                  </div>
                </div>                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Στοιχεία Επικοινωνίας</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Υπεύθυνος Επικοινωνίας *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.contact_person}
                          onChange={(e) => handleInputChange('contact_person', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.contact_person ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="π.χ. Γιάννης Παπαδόπουλος"
                        />
                        <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.contact_person && (
                        <p className="text-red-600 text-xs mt-1">{errors.contact_person}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="π.χ. info@company.gr"
                        />
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Τηλέφωνο *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="π.χ. 210 1234567"
                      />
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.phone && (
                      <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Λεπτομέρειες Παραγγελίας</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ζητούμενη Ποσότητα *
                      </label>
                      <input
                        type="number"
                        min={product.pricing.minimum_quantity}
                        value={formData.requested_quantity}
                        onChange={(e) => handleInputChange('requested_quantity', parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.requested_quantity ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={`Ελάχιστη: ${product.pricing.minimum_quantity}`}
                      />
                      {errors.requested_quantity && (
                        <p className="text-red-600 text-xs mt-1">{errors.requested_quantity}</p>
                      )}
                    </div>                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Επιθυμητή Ημερομηνία Παράδοσης *
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.delivery_date}
                          onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.delivery_date ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.delivery_date && (
                        <p className="text-red-600 text-xs mt-1">{errors.delivery_date}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Όροι Πληρωμής
                    </label>
                    <select
                      value={formData.payment_terms}
                      onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="net30">Πληρωμή σε 30 ημέρες</option>
                      <option value="net15">Πληρωμή σε 15 ημέρες</option>
                      <option value="immediate">Άμεση πληρωμή</option>
                      <option value="cod">Αντικαταβολή</option>
                    </select>
                  </div>
                </div>                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ειδικές Απαιτήσεις / Σχόλια
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.special_requirements}
                      onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                      rows={4}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="π.χ. Ειδικές οδηγίες παράδοσης, συσκευασίας, κλπ."
                    />
                    <DocumentTextIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Price Estimation */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="text-sm font-medium text-blue-900 mb-3">Εκτίμηση Κόστους</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Ποσότητα:</span>
                      <span className="font-medium text-blue-900">{formData.requested_quantity} τεμάχια</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Τιμή μονάδας:</span>
                      <span className="font-medium text-blue-900">€{product.pricing.wholesale_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="text-blue-700 font-medium">Εκτιμώμενο σύνολο:</span>
                      <span className="font-bold text-blue-900">€{estimatedPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700 text-xs">Εξοικονόμηση vs λιανική:</span>
                      <span className="font-medium text-green-700 text-xs">€{savings.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    * Η τελική τιμή μπορεί να διαφέρει βάσει των ειδικών απαιτήσεων και της ποσότητας
                  </p>
                </div>                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Ακύρωση
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Αποστολή...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-4 w-4" />
                        Αποστολή Αιτήματος
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}