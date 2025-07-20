'use client';

// Adoption Catalog Page - Following existing patterns from products/page.tsx
// Consistent layout and functionality with product catalog

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  TreePine,
  Flower2,
  Home,
  PawPrint,
  Star,
  MapPin
} from 'lucide-react';
import { useAdoptableItems } from '@/lib/api/services/adoption';
import { AdoptionFilterOptions } from '@/lib/api/models/adoption/types';
import { AdoptionCard } from '@/components/adoption/AdoptionCard';

// Filter options
const typeFilters = [
  { value: '', label: 'Όλα τα είδη', icon: null },
  { value: 'tree', label: 'Δέντρα', icon: TreePine },
  { value: 'beehive', label: 'Κυψέλες', icon: Flower2 },
  { value: 'plot', label: 'Οικόπεδα', icon: Home },
  { value: 'animal', label: 'Ζώα', icon: PawPrint },
];

const sortOptions = [
  { value: 'created_at:desc', label: 'Πιο πρόσφατα' },
  { value: 'created_at:asc', label: 'Παλαιότερα' },
  { value: 'name:asc', label: 'Αλφαβητικά (Α-Ω)' },
  { value: 'name:desc', label: 'Αλφαβητικά (Ω-Α)' },
];

export default function AdoptionsPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build filters
  const filters = useMemo((): AdoptionFilterOptions => {
    const [sort_by, sort_order] = sortBy.split(':') as [string, 'asc' | 'desc'];
    
    return {
      type: selectedType as any || undefined,
      featured: featuredOnly || undefined,
      sort_by: sort_by as any,
      sort_order,
      per_page: 12
    };
  }, [selectedType, featuredOnly, sortBy]);

  // Fetch data - only after component is mounted
  const queryResult = mounted ? useAdoptableItems(filters) : { data: undefined, isLoading: true, error: null };
  const { data, isLoading, error } = queryResult as {
    data?: { data: any[]; last_page?: number; current_page?: number } | undefined;
    isLoading: boolean;
    error: any;
  };

  // Filter by search term (client-side)
  const filteredItems = useMemo(() => {
    if (!data?.data) return [];
    
    if (!searchTerm.trim()) return data.data;
    
    const term = searchTerm.toLowerCase();
    return data.data.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.producer.business_name.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term)
    );
  }, [data?.data, searchTerm]);

  // Loading state with enhanced skeleton cards
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-9 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
          
          {/* Search and filters skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
            <div className="flex justify-between">
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Grid with enhanced skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <AdoptionCard 
                key={i} 
                loading={true}
                item={{} as any} // Dummy item for TypeScript
              />
            ))}
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
          <p className="text-gray-600 mb-4">Δεν μπορέσαμε να φορτώσουμε τα διαθέσιμα προς υιοθεσία αντικείμενα.</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Υιοθεσίες
          </h1>
          <p className="text-gray-600">
            Υιοθετήστε δέντρα, κυψέλες, οικόπεδα και ζώα από τους παραγωγούς μας
          </p>
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

            <div className="flex items-center gap-4">
              {/* View Mode */}
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Είδος
                  </label>
                  <div className="space-y-2">
                    {typeFilters.map(filter => {
                      const Icon = filter.icon;
                      return (
                        <label key={filter.value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="type"
                            value={filter.value}
                            checked={selectedType === filter.value}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                            <span className="text-sm">{filter.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Featured Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ειδικά
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Μόνο προτεινόμενα</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredItems.length} αποτελέσματα
            {searchTerm && ` για "${searchTerm}"`}
          </p>
        </div>

        {/* Items Grid with Enhanced Mobile Support */}
        {filteredItems.length > 0 ? (
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredItems.map((item: any, index: number) => (
              <AdoptionCard
                key={item.id}
                item={item}
                priority={index < 4} // Priority loading for first 4 items
                className="transform-gpu" // GPU acceleration for animations
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Δεν βρέθηκαν αποτελέσματα
            </h3>
            <p className="text-gray-600 mb-4">
              Δοκιμάστε να αλλάξετε τα φίλτρα ή τον όρο αναζήτησης
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setFeaturedOnly(false);
              }}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Καθαρισμός φίλτρων
            </button>
          </div>
        )}

        {/* Pagination */}
        {data && data.last_page && data.last_page > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              {/* Pagination implementation would go here */}
              <span className="text-sm text-gray-600">
                Σελίδα {data.current_page || 1} από {data.last_page}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
