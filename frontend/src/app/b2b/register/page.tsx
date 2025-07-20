'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SimpleB2BRegistrationForm from '@/components/b2b/SimpleB2BRegistrationForm';
import Link from 'next/link';

export default function B2BRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Dixis</h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Εγγραφή Επιχείρησης
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Δημιουργήστε τον επιχειρησιακό σας λογαριασμό και αποκτήστε πρόσβαση 
            σε χιλιάδες ποιοτικά ελληνικά προϊόντα με ειδικές τιμές B2B.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Γιατί να επιλέξετε το Dixis B2B;
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Ειδικές Τιμές B2B</h4>
              <p className="text-sm text-gray-600">
                Αποκλειστικές τιμές χονδρικής για επιχειρήσεις
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚚</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Δωρεάν Μεταφορικά</h4>
              <p className="text-sm text-gray-600">
                Δωρεάν παράδοση για παραγγελίες άνω των €100
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Αναλυτικά Στατιστικά</h4>
              <p className="text-sm text-gray-600">
                Παρακολουθήστε τις παραγγελίες και τα έξοδά σας
              </p>
            </div>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <SimpleB2BRegistrationForm />
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            Έχετε ήδη λογαριασμό;{' '}
            <Link href="/b2b/login" className="font-medium text-blue-600 hover:text-blue-500">
              Σύνδεση εδώ
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Είστε ιδιώτης πελάτης;{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Εγγραφή ως καταναλωτής
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}