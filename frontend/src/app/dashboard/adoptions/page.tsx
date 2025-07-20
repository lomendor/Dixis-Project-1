'use client';

// User Adoptions Dashboard - Following existing patterns from dashboard/page.tsx
// Manage user's adoptions with progress tracking

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  TreePine,
  Flower2,
  Home,
  PawPrint
} from 'lucide-react';
import { useUserAdoptions } from '@/lib/api/services/adoption';
import { Adoption } from '@/lib/api/models/adoption/types';

// Status mapping
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'active':
      return {
        label: 'Ενεργό',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle
      };
    case 'completed':
      return {
        label: 'Ολοκληρωμένο',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: CheckCircle
      };
    case 'cancelled':
      return {
        label: 'Ακυρωμένο',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: AlertCircle
      };
    case 'expired':
      return {
        label: 'Ληγμένο',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: Clock
      };
    default:
      return {
        label: 'Άγνωστο',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: AlertCircle
      };
  }
};

// Type icons mapping
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'tree':
      return <TreePine className="w-4 h-4" />;
    case 'beehive':
      return <Flower2 className="w-4 h-4" />;
    case 'plot':
      return <Home className="w-4 h-4" />;
    case 'animal':
      return <PawPrint className="w-4 h-4" />;
    default:
      return <TreePine className="w-4 h-4" />;
  }
};

export default function UserAdoptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before using React Query
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user adoptions - only after component is mounted
  const queryResult = mounted ? useUserAdoptions() : { data: undefined, isLoading: true, error: null };
  const { data, isLoading, error } = queryResult as {
    data?: { data: any[] } | undefined;
    isLoading: boolean;
    error: any;
  };

  // Filter adoptions
  const filteredAdoptions = React.useMemo(() => {
    if (!data?.data) return [];
    
    let filtered = data.data;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((adoption: any) =>
        adoption.adoptable_item.name.toLowerCase().includes(term) ||
        adoption.adoptable_item.producer.business_name.toLowerCase().includes(term) ||
        adoption.adoptable_item.location.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((adoption: any) => adoption.status === statusFilter);
    }
    
    return filtered;
  }, [data?.data, searchTerm, statusFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Σφάλμα φόρτωσης</h2>
          <p className="text-gray-600 mb-4">Δεν μπορέσαμε να φορτώσουμε τις υιοθεσίες σας.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Οι Υιοθεσίες μου
            </h1>
            <p className="text-gray-600">
              Διαχειριστείτε και παρακολουθήστε τις υιοθεσίες σας
            </p>
          </div>
          
          <Link
            href="/adoptions"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Νέα Υιοθεσία
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Αναζήτηση υιοθεσιών..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-5 h-5" />
              Φίλτρα
            </button>

            <div className="text-sm text-gray-600">
              {filteredAdoptions.length} αποτελέσματα
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Κατάσταση
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="">Όλες οι καταστάσεις</option>
                    <option value="active">Ενεργές</option>
                    <option value="completed">Ολοκληρωμένες</option>
                    <option value="cancelled">Ακυρωμένες</option>
                    <option value="expired">Ληγμένες</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Adoptions Grid */}
        {filteredAdoptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdoptions.map(adoption => {
              const statusInfo = getStatusInfo(adoption.status);
              const StatusIcon = statusInfo.icon;
              const daysRemaining = adoption.end_date 
                ? Math.ceil((new Date(adoption.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={adoption.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Adoption Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {adoption.adoptable_item.main_image ? (
                      <Image
                        src={adoption.adoptable_item.main_image}
                        alt={adoption.adoptable_item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                        <div className="text-green-600 text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-green-300 rounded-lg flex items-center justify-center">
                            {getTypeIcon(adoption.adoptable_item.type)}
                          </div>
                          <p className="text-sm font-medium">Εικόνα μη διαθέσιμη</p>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <div className={`${statusInfo.bgColor} ${statusInfo.color} px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Certificate Number */}
                    {adoption.certificate_number && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-medium rounded-full">
                          #{adoption.certificate_number}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {adoption.adoptable_item.name}
                    </h3>

                    {/* Producer */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <span>Από:</span>
                      <span className="font-medium text-green-600">
                        {adoption.adoptable_item.producer.business_name}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{adoption.adoptable_item.location}</span>
                    </div>

                    {/* Plan Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          €{adoption.price_paid}
                        </div>
                        <div className="text-xs text-gray-500">
                          {adoption.adoption_plan.name}
                        </div>
                      </div>
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          {daysRemaining} ημέρες
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Έναρξη: {new Date(adoption.start_date).toLocaleDateString('el-GR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Λήξη: {new Date(adoption.end_date).toLocaleDateString('el-GR')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/adoptions/${adoption.id}`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Προβολή
                      </Link>
                      
                      {adoption.certificate_number && (
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          Πιστοποιητικό
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'Δεν βρέθηκαν αποτελέσματα' : 'Δεν έχετε υιοθεσίες ακόμα'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter 
                ? 'Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης'
                : 'Ξεκινήστε την πρώτη σας υιοθεσία σήμερα!'
              }
            </p>
            <Link
              href="/adoptions"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Εξερευνήστε Υιοθεσίες
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
