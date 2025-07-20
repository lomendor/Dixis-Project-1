'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CogIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  BellIcon,
  KeyIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface CompanyProfile {
  name: string;
  vatNumber: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

export default function B2BSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);    // Mock data - will connect to real API on backend deployment
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: 'Εταιρεία Παραδείγματος ΑΕ',
    vatNumber: '123456789',
    address: 'Λεωφόρος Κηφισίας 123',
    city: 'Αθήνα',
    postalCode: '11526',
    phone: '+30 210 1234567',
    email: 'info@company.gr'
  });

  const handleSave = async () => {
    setLoading(true);    // Will be implemented in next phase
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', name: 'Προφίλ Εταιρείας', icon: BuildingOfficeIcon },
    { id: 'billing', name: 'Χρεώσεις', icon: CreditCardIcon },
    { id: 'notifications', name: 'Ειδοποιήσεις', icon: BellIcon },
    { id: 'security', name: 'Ασφάλεια', icon: ShieldCheckIcon },
    { id: 'users', name: 'Χρήστες', icon: UserGroupIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CogIcon className="h-6 w-6 text-gray-600" />
                Ρυθμίσεις Λογαριασμού
              </h1>
              <p className="text-gray-600 mt-1">
                Διαχειριστείτε τις ρυθμίσεις του B2B λογαριασμού σας
              </p>
            </div>
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Αποθηκεύτηκε!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Στοιχεία Εταιρείας
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Επωνυμία Εταιρείας
                      </label>
                      <input
                        type="text"
                        value={companyProfile.name}
                        onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ΑΦΜ
                      </label>
                      <input
                        type="text"
                        value={companyProfile.vatNumber}
                        onChange={(e) => setCompanyProfile({...companyProfile, vatNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Διεύθυνση
                      </label>
                      <input
                        type="text"
                        value={companyProfile.address}
                        onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Πόλη
                      </label>
                      <input
                        type="text"
                        value={companyProfile.city}
                        onChange={(e) => setCompanyProfile({...companyProfile, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ταχυδρομικός Κώδικας
                      </label>
                      <input
                        type="text"
                        value={companyProfile.postalCode}
                        onChange={(e) => setCompanyProfile({...companyProfile, postalCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Τηλέφωνο
                      </label>
                      <input
                        type="tel"
                        value={companyProfile.phone}
                        onChange={(e) => setCompanyProfile({...companyProfile, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={companyProfile.email}
                        onChange={(e) => setCompanyProfile({...companyProfile, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Στοιχεία Χρέωσης
                  </h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      Η διαχείριση χρεώσεων θα είναι διαθέσιμη σύντομα.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Ρυθμίσεις Ειδοποιήσεων
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email για νέες παραγγελίες</p>
                        <p className="text-sm text-gray-600">Λάβετε ειδοποίηση όταν έχετε νέα παραγγελία</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS για επείγουσες ειδοποιήσεις</p>
                        <p className="text-sm text-gray-600">Λάβετε SMS για σημαντικές ενημερώσεις</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Ρυθμίσεις Ασφάλειας
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      Οι ρυθμίσεις ασφάλειας θα είναι διαθέσιμες σύντομα.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Διαχείριση Χρηστών
                  </h2>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800">
                      Η διαχείριση χρηστών θα είναι διαθέσιμη σύντομα.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    API Keys
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800">
                      Η διαχείριση API keys θα είναι διαθέσιμη σύντομα.
                    </p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {activeTab === 'profile' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}