'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface FilterState {
  search: string;
  category: string;
  priceRange: [number, number];
  producers: string[];
  sortBy: string;
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  producers: Array<{ id: string; name: string; count: number }>;
  totalProducts: number;
  filteredCount: number;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Νεότερα πρώτα' },
  { value: 'price_asc', label: 'Τιμή: Χαμηλή → Υψηλή' },
  { value: 'price_desc', label: 'Τιμή: Υψηλή → Χαμηλή' },
  { value: 'name_asc', label: 'Όνομα: Α → Ω' },
  { value: 'name_desc', label: 'Όνομα: Ω → Α' },
  { value: 'popular', label: 'Δημοφιλή' },
];

const CATEGORIES = [
  { id: '', name: 'Όλες οι Κατηγορίες', emoji: '🏪' },
  { id: 'elaiolado-elies', name: 'Ελαιόλαδο & Ελιές', emoji: '🫒' },
  { id: 'meli-proionta-meliou', name: 'Μέλι & Προϊόντα Μελιού', emoji: '🍯' },
  { id: 'tiria-galaktokomika', name: 'Τυριά & Γαλακτοκομικά', emoji: '🧀' },
  { id: 'ospria', name: 'Όσπρια', emoji: '🫘' },
  { id: 'zimarika-dimitriaka', name: 'Ζυμαρικά & Δημητριακά', emoji: '🍝' },
  { id: 'pota', name: 'Ποτά', emoji: '🍷' },
  { id: 'ksiri-karpi-apoksiramena', name: 'Ξηροί Καρποί & Αποξηραμένα', emoji: '🥜' },
  { id: 'mpakharika-botana', name: 'Μπαχαρικά & Βότανα', emoji: '🌿' },
  { id: 'glika-aleimmata', name: 'Γλυκά & Αλείμματα', emoji: '🍯' },
  { id: 'kallintika-peripiisi', name: 'Καλλυντικά & Περιποίηση', emoji: '🧴' },
];

export default function ProductFilters({
  filters,
  onFiltersChange,
  producers,
  totalProducts,
  filteredCount,
  className = ''
}: ProductFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      category: '',
      priceRange: [0, 100],
      producers: [],
      sortBy: 'newest',
      inStock: false
    };
    setSearchInput('');
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) count++;
    if (filters.producers.length > 0) count++;
    if (filters.inStock) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FunnelIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Φίλτρα Αναζήτησης</h3>
              <p className="text-sm text-gray-600">Βρες ακριβώς αυτό που ψάχνεις</p>
            </div>
            {activeFiltersCount > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
              {filteredCount} από {totalProducts} προϊόντα
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-all duration-200 shadow-sm"
              >
                🗑️ Καθαρισμός
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Search */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="🔍 Αναζήτηση προϊόντων... (π.χ. μέλι, ελαιόλαδο, φέτα)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                handleFilterChange('search', '');
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Filters Row */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            ⚡ Γρήγορα Φίλτρα
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category Quick Select */}
            <div className="relative">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* In Stock Toggle */}
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-white shadow-sm">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span className="font-medium">📦 Μόνο διαθέσιμα</span>
            </label>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${
                showAdvanced
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                  : 'border-gray-200 hover:bg-orange-50 hover:border-orange-300 bg-white'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Περισσότερα</span>
              <span className="sm:hidden">+</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Εύρος Τιμής: €{filters.priceRange[0]} - €{filters.priceRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    handleFilterChange('priceRange', [newMin, Math.max(newMin, filters.priceRange[1])]);
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    handleFilterChange('priceRange', [Math.min(filters.priceRange[0], newMax), newMax]);
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>€0</span>
                <span>€100+</span>
              </div>
            </div>

            {/* Producers Filter */}
            {producers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Παραγωγοί ({filters.producers.length} επιλεγμένοι)
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                  {producers.map((producer) => (
                    <label key={producer.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.producers.includes(producer.id)}
                        onChange={(e) => {
                          const newProducers = e.target.checked
                            ? [...filters.producers, producer.id]
                            : filters.producers.filter(p => p !== producer.id);
                          handleFilterChange('producers', newProducers);
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{producer.name}</span>
                      <span className="text-xs text-gray-500">({producer.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                🏷️ Ενεργά Φίλτρα ({activeFiltersCount})
              </h4>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-sm rounded-full shadow-sm border border-green-300">
                    🔍 "{filters.search}"
                    <button
                      onClick={() => {
                        setSearchInput('');
                        handleFilterChange('search', '');
                      }}
                      className="hover:text-green-900 hover:bg-green-300 rounded-full p-1 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.category && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm rounded-full shadow-sm border border-blue-300">
                    {CATEGORIES.find(c => c.id === filters.category)?.emoji} {CATEGORIES.find(c => c.id === filters.category)?.name}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="hover:text-blue-900 hover:bg-blue-300 rounded-full p-1 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.inStock && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-sm rounded-full shadow-sm border border-purple-300">
                    📦 Μόνο διαθέσιμα
                    <button
                      onClick={() => handleFilterChange('inStock', false)}
                      className="hover:text-purple-900 hover:bg-purple-300 rounded-full p-1 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.producers.length > 0 && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-sm rounded-full shadow-sm border border-orange-300">
                    👨‍🌾 {filters.producers.length} παραγωγοί
                    <button
                      onClick={() => handleFilterChange('producers', [])}
                      className="hover:text-orange-900 hover:bg-orange-300 rounded-full p-1 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100) && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 text-sm rounded-full shadow-sm border border-yellow-300">
                    💰 €{filters.priceRange[0]} - €{filters.priceRange[1]}
                    <button
                      onClick={() => handleFilterChange('priceRange', [0, 100])}
                      className="hover:text-yellow-900 hover:bg-yellow-300 rounded-full p-1 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
