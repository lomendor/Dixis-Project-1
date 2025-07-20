'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  EnvelopeIcon,
  ClockIcon,
  PhoneIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function ProducerRegistrationSuccess() {
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
            Η Αίτησή σου Υποβλήθηκε Επιτυχώς!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Σε ευχαριστούμε για το ενδιαφέρον σου να γίνεις μέρος της οικογένειας Dixis. 
            Η αίτησή σου βρίσκεται υπό επεξεργασία.
          </p>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Επόμενα Βήματα</h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Επαλήθευση Στοιχείων</h3>
                  <p className="text-gray-600 text-sm">Θα επαληθεύσουμε τα στοιχεία που μας έδωσες</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Επικοινωνία</h3>
                  <p className="text-gray-600 text-sm">Θα επικοινωνήσουμε μαζί σου εντός 2-3 εργάσιμων ημερών</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Ενεργοποίηση Λογαριασμού</h3>
                  <p className="text-gray-600 text-sm">Μετά την έγκριση, θα λάβεις τα στοιχεία πρόσβασης</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-green-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Έχεις Ερωτήσεις;</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">producers@dixis.gr</span>
              </div>
              
              <div className="flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">210 123 4567</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mt-4">
              Ωράριο εξυπηρέτησης: Δευτέρα - Παρασκευή, 9:00 - 17:00
            </p>
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-center text-sm text-gray-500 mb-8">
            <ClockIcon className="w-5 h-5 mr-2" />
            <span>Χρόνος επεξεργασίας: 2-3 εργάσιμες ημέρες</span>
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
              Περιήγηση Προϊόντων
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Αριθμός αίτησης: <span className="font-mono">#PR{Date.now().toString().slice(-6)}</span>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Κράτησε αυτόν τον αριθμό για μελλοντική αναφορά
          </p>
        </div>
      </div>
    </div>
  );
}