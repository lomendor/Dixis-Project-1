'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface ProducerApplication {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  description: string;
  productTypes: string[];
  experience: string;
  certifications: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function AdminProducersPage() {
  const [applications, setApplications] = useState<ProducerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ProducerApplication | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/producer-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      logger.error('Failed to fetch applications:', toError(error), errorToContext(error));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: number, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/producer-applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
              : app
          )
        );
        setSelectedApplication(null);
      }
    } catch (error) {
      logger.error('Failed to update application status:', toError(error), errorToContext(error));
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Εκκρεμεί
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Εγκρίθηκε
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Απορρίφθηκε
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση αιτήσεων...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Παραγωγών</h1>
              <p className="text-gray-600 mt-1">Έγκριση και διαχείριση αιτήσεων παραγωγών</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-600 font-medium">
                  {applications.filter(app => app.status === 'pending').length} εκκρεμείς αιτήσεις
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Φίλτρο:</span>
            {[
              { key: 'all', label: 'Όλες', count: applications.length },
              { key: 'pending', label: 'Εκκρεμείς', count: applications.filter(app => app.status === 'pending').length },
              { key: 'approved', label: 'Εγκεκριμένες', count: applications.filter(app => app.status === 'approved').length },
              { key: 'rejected', label: 'Απορριφθείσες', count: applications.filter(app => app.status === 'rejected').length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν αιτήσεις</h3>
              <p className="text-gray-500">Δεν υπάρχουν αιτήσεις με τα επιλεγμένα κριτήρια.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Επιχείρηση
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Υπεύθυνος
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Τοποθεσία
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Προϊόντα
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Κατάσταση
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ημερομηνία
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ενέργειες
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BuildingStorefrontIcon className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.experience} εμπειρία
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.ownerName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <EnvelopeIcon className="w-4 h-4 mr-1" />
                            {application.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {application.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                          {application.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.postalCode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {application.productTypes.slice(0, 2).join(', ')}
                          {application.productTypes.length > 2 && (
                            <span className="text-gray-500">
                              {' '}+{application.productTypes.length - 2} ακόμη
                            </span>
                          )}
                        </div>
                        {application.certifications.length > 0 && (
                          <div className="text-sm text-gray-500">
                            🏆 {application.certifications.length} πιστοποιήσεις
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString('el-GR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Προβολή
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedApplication.businessName}
                  </h2>
                  <p className="text-gray-600">Αίτηση παραγωγού #{selectedApplication.id}</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Στοιχεία Επιχείρησης</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Επιχείρηση:</span> {selectedApplication.businessName}</p>
                      <p><span className="font-medium">Υπεύθυνος:</span> {selectedApplication.ownerName}</p>
                      <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                      <p><span className="font-medium">Τηλέφωνο:</span> {selectedApplication.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Τοποθεσία</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Διεύθυνση:</span> {selectedApplication.address}</p>
                      <p><span className="font-medium">Πόλη:</span> {selectedApplication.city}</p>
                      <p><span className="font-medium">Τ.Κ.:</span> {selectedApplication.postalCode}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Προϊόντα & Εμπειρία</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Εμπειρία:</span> {selectedApplication.experience}</p>
                      <div>
                        <span className="font-medium">Τύποι Προϊόντων:</span>
                        <ul className="list-disc list-inside mt-1">
                          {selectedApplication.productTypes.map((type, index) => (
                            <li key={index} className="text-sm">{type}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Πιστοποιήσεις</h3>
                    {selectedApplication.certifications.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {selectedApplication.certifications.map((cert, index) => (
                          <li key={index} className="text-sm">{cert}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">Δεν έχει πιστοποιήσεις</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Περιγραφή Επιχείρησης</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedApplication.description}
                </p>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Απόρριψη
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'approved')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Έγκριση
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}