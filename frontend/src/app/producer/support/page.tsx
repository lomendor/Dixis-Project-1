'use client';

import Link from 'next/link';
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ProducerSupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Υποστήριξη Παραγωγών
              </h1>
              <p className="text-gray-600 mt-1">
                Είμαστε εδώ για να σας βοηθήσουμε με οτιδήποτε χρειάζεστε
              </p>
            </div>
            
            <Link
              href="/producer/dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Πίσω στο Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Phone Support */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Τηλεφωνική Υποστήριξη</h3>
            <p className="text-gray-600 mb-4">Άμεση βοήθεια για επείγοντα θέματα</p>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">210 123 4567</p>
              <p className="text-sm text-gray-600">Δευτ-Παρ: 9:00-18:00</p>
              <p className="text-sm text-gray-600">Σάβ: 10:00-15:00</p>
            </div>
            <a
              href="tel:+302101234567"
              className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Κλήση Τώρα
            </a>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Λεπτομερή βοήθεια για σύνθετα θέματα</p>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">producers@dixis.gr</p>
              <p className="text-sm text-gray-600">Απάντηση εντός 2 ωρών</p>
              <p className="text-sm text-gray-600">24/7 διαθέσιμο</p>
            </div>
            <a
              href="mailto:producers@dixis.gr"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Στείλτε Email
            </a>
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Άμεση επικοινωνία με τον ειδικό σας</p>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">Άμεση Απάντηση</p>
              <p className="text-sm text-gray-600">Δευτ-Σάβ: 8:00-20:00</p>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <button
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => alert('Live Chat θα ανοίξει σύντομα!')}
            >
              Έναρξη Chat
            </button>
          </div>
        </div>

        {/* Common Topics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Συχνές Ερωτήσεις</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Management */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Διαχείριση Παραγγελιών</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Πώς επιβεβαιώνω παραγγελίες</li>
                    <li>• Ενημέρωση κατάστασης αποστολής</li>
                    <li>• Διαχείριση επιστροφών</li>
                    <li>• Χρόνοι παράδοσης</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ClockIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Πληρωμές & Προμήθειες</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Εβδομαδιαίες πληρωμές</li>
                    <li>• Υπολογισμός προμήθειας 12%</li>
                    <li>• Στοιχεία τραπεζικού λογαριασμού</li>
                    <li>• Φορολογικές πληροφορίες</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Management */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Διαχείριση Προϊόντων</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Προσθήκη νέων προϊόντων</li>
                    <li>• Επεξεργασία τιμών και stock</li>
                    <li>• Φωτογραφίες προϊόντων</li>
                    <li>• SEO και περιγραφές</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Technical Issues */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Τεχνικά Προβλήματα</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Προβλήματα σύνδεσης</li>
                    <li>• Ανάκτηση κωδικού πρόσβασης</li>
                    <li>• Errors στην πλατφόρμα</li>
                    <li>• Mobile app issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ώρες Υποστήριξης</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Τηλεφωνική Υποστήριξη</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Δευτέρα - Παρασκευή:</span>
                  <span className="font-medium">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Σάββατο:</span>
                  <span className="font-medium">10:00 - 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Κυριακή:</span>
                  <span className="text-red-600">Κλειστά</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Online Υποστήριξη</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Support:</span>
                  <span className="font-medium text-green-600">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Live Chat:</span>
                  <span className="font-medium">8:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Support:</span>
                  <span className="font-medium text-red-600">24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Επείγουσα Υποστήριξη</h3>
              <p className="text-red-800 mb-4">
                Για επείγοντα θέματα που αφορούν παραγγελίες σε εξέλιξη ή τεχνικά προβλήματα που εμποδίζουν τις πωλήσεις:
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-red-900">📞 Emergency Hotline: 210 123 4567 (Πατήστε 1)</p>
                <p className="font-semibold text-red-900">📧 Emergency Email: emergency@dixis.gr</p>
                <p className="text-sm text-red-700">Απάντηση εντός 15 λεπτών, 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}