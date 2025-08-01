'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// Greek-specific filter categories based on competitive analysis
const GREEK_FILTER_CATEGORIES = {
  dietary: {
    label: 'Διατροφικές Προτιμήσεις',
    icon: '🥗',
    filters: [
      { key: 'biological', label: 'Βιολογικό', count: 0 },
      { key: 'gluten_free', label: 'Χωρίς Γλουτένη', count: 0 },
      { key: 'vegan', label: 'Vegan', count: 0 },
      { key: 'vegetarian', label: 'Χορτοφαγικό', count: 0 },
      { key: 'ketogenic', label: 'Κετογονικό', count: 0 },
      { key: 'traditional_greek', label: 'Παραδοσιακό Ελληνικό', count: 0 },
      { key: 'monastery_made', label: 'Μοναστηριακό', count: 0 },
      { key: 'island_specialty', label: 'Νησιώτικη Ειδικότητα', count: 0 },
      { key: 'lactose_free', label: 'Χωρίς Λακτόζη', count: 0 },
      { key: 'sugar_free', label: 'Χωρίς Ζάχαρη', count: 0 }
    ]
  },
  origin: {
    label: 'Προέλευση & Περιοχή',
    icon: '🗺️',
    filters: [
      { key: 'peloponnese', label: 'Πελοπόννησος', count: 0 },
      { key: 'crete', label: 'Κρήτη', count: 0 },
      { key: 'macedonia', label: 'Μακεδονία', count: 0 },
      { key: 'thessaly', label: 'Θεσσαλία', count: 0 },
      { key: 'epirus', label: 'Ήπειρος', count: 0 },
      { key: 'central_greece', label: 'Στερεά Ελλάδα', count: 0 },
      { key: 'aegean_islands', label: 'Νησιά Αιγαίου', count: 0 },
      { key: 'ionian_islands', label: 'Ιόνια Νησιά', count: 0 },
      { key: 'local_producer', label: 'Τοπικός Παραγωγός', count: 0 },
      { key: 'family_farm', label: 'Οικογενειακή Φάρμα', count: 0 },
      { key: 'cooperative', label: 'Συνεταιρισμός', count: 0 }
    ]
  },
  seasonality: {
    label: 'Εποχικότητα',
    icon: '📅',
    filters: [
      { key: 'spring_harvest', label: 'Ανοιξιάτικη Συγκομιδή', count: 0 },
      { key: 'summer_fresh', label: 'Καλοκαιρινό Φρέσκο', count: 0 },
      { key: 'autumn_specialty', label: 'Φθινοπωρινή Ειδικότητα', count: 0 },
      { key: 'winter_preserved', label: 'Χειμερινό Διατηρημένο', count: 0 },
      { key: 'year_round', label: 'Όλο το Χρόνο', count: 0 },
      { key: 'limited_edition', label: 'Περιορισμένη Έκδοση', count: 0 },
      { key: 'harvest_fresh', label: 'Φρέσκο από Συγκομιδή', count: 0 },
      { key: 'aged_traditional', label: 'Παλαιωμένο Παραδοσιακό', count: 0 }
    ]
  },
  certifications: {
    label: 'Πιστοποιήσεις',
    icon: '🏆',
    filters: [
      { key: 'bio_hellas', label: 'ΒΙΟ Ελλάς', count: 0 },
      { key: 'pdo_protected', label: 'ΠΟΠ (Προστατευόμενη Ονομασία Προέλευσης)', count: 0 },
      { key: 'pgi_indicated', label: 'ΠΓΕ (Προστατευόμενη Γεωγραφική Ένδειξη)', count: 0 },
      { key: 'tsg_guaranteed', label: 'ΠΣΕ (Παραδοσιακό Ειδικό Έναρξη)', count: 0 },
      { key: 'demeter_biodynamic', label: 'Demeter Βιοδυναμικό', count: 0 },
      { key: 'iso_22000', label: 'ISO 22000', count: 0 },
      { key: 'haccp', label: 'HACCP', count: 0 },
      { key: 'fair_trade', label: 'Fair Trade', count: 0 },
      { key: 'kosher', label: 'Kosher', count: 0 },
      { key: 'halal', label: 'Halal', count: 0 }
    ]
  },
  sustainability: {
    label: 'Αειφορία & Περιβάλλον',
    icon: '🌱',
    filters: [
      { key: 'low_carbon', label: 'Χαμηλό Αποτύπωμα Άνθρακα', count: 0 },
      { key: 'minimal_packaging', label: 'Ελάχιστη Συσκευασία', count: 0 },
      { key: 'recyclable', label: 'Ανακυκλώσιμο', count: 0 },
      { key: 'biodegradable', label: 'Βιοδιασπώμενο', count: 0 },
      { key: 'renewable_energy', label: 'Ανανεώσιμη Ενέργεια', count: 0 },
      { key: 'water_efficient', label: 'Εξοικονόμηση Νερού', count: 0 },
      { key: 'soil_regenerative', label: 'Αναγεννητική Γεωργία', count: 0 },
      { key: 'zero_waste', label: 'Μηδενικά Απόβλητα', count: 0 },
      { key: 'carbon_neutral', label: 'Άνθρακας-Ουδέτερο', count: 0 }
    ]
  },
  quality: {
    label: 'Ποιότητα & Ειδικότητες',
    icon: '⭐',
    filters: [
      { key: 'premium_grade', label: 'Premium Ποιότητα', count: 0 },
      { key: 'artisanal', label: 'Χειροποίητο', count: 0 },
      { key: 'small_batch', label: 'Μικρή Παραγωγή', count: 0 },
      { key: 'award_winning', label: 'Βραβευμένο', count: 0 },
      { key: 'heritage_variety', label: 'Παραδοσιακή Ποικιλία', count: 0 },
      { key: 'single_origin', label: 'Μοναδική Προέλευση', count: 0 },
      { key: 'cold_pressed', label: 'Ψυχρή Έκθλιψη', count: 0 },
      { key: 'raw_unprocessed', label: 'Ακατέργαστο', count: 0 }
    ]
  }
};

interface FilterOption {
  key: string;
  label: string;
  count: number;
}

interface FilterCategory {
  label: string;
  icon: string;
  filters: FilterOption[];
}

interface AdvancedProductFiltersProps {
  onFiltersChange: (filters: Record<string, string[]>) => void;
  onSearchChange: (search: string) => void;
  productCount: number;
  className?: string;
}

export default function AdvancedProductFilters({
  onFiltersChange,
  onSearchChange,
  productCount,
  className = ''
}: AdvancedProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    dietary: true,
    origin: false,
    seasonality: false,
    certifications: false,
    sustainability: false,
    quality: false
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  // Toggle filter selection
  const toggleFilter = (category: string, filterKey: string) => {
    setActiveFilters(prev => {
      const categoryFilters = prev[category] || [];
      const isActive = categoryFilters.includes(filterKey);
      
      const newCategoryFilters = isActive
        ? categoryFilters.filter(f => f !== filterKey)
        : [...categoryFilters, filterKey];
      
      const newFilters = {
        ...prev,
        [category]: newCategoryFilters
      };
      
      // Remove empty categories
      if (newCategoryFilters.length === 0) {
        delete newFilters[category];
      }
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onFiltersChange({});
    onSearchChange('');
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).reduce((sum, filters) => sum + filters.length, 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          className="w-full flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg text-green-700 font-medium"
        >
          <span className="flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Φίλτρα ({activeFilterCount})
          </span>
          {isMobileFiltersOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Αναζήτηση προϊόντων..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                Ενεργά Φίλτρα ({activeFilterCount})
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Καθαρισμός Όλων
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([category, filters]) =>
                filters.map(filterKey => {
                  const categoryData = GREEK_FILTER_CATEGORIES[category as keyof typeof GREEK_FILTER_CATEGORIES];
                  const filter = categoryData.filters.find(f => f.key === filterKey);
                  return (
                    <span
                      key={`${category}-${filterKey}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {categoryData.icon} {filter?.label}
                      <button
                        onClick={() => toggleFilter(category, filterKey)}
                        className="ml-2 hover:text-green-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Filter Categories */}
        <div className="max-h-96 md:max-h-none overflow-y-auto">
          {Object.entries(GREEK_FILTER_CATEGORIES).map(([categoryKey, category]) => (
            <div key={categoryKey} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center font-medium text-gray-900">
                  <span className="text-lg mr-3">{category.icon}</span>
                  {category.label}
                  {activeFilters[categoryKey]?.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {activeFilters[categoryKey].length}
                    </span>
                  )}
                </span>
                {expandedCategories[categoryKey] ? 
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                }
              </button>
              
              {expandedCategories[categoryKey] && (
                <div className="px-4 pb-4 space-y-2">
                  {category.filters.map(filter => (
                    <label key={filter.key} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={activeFilters[categoryKey]?.includes(filter.key) || false}
                        onChange={() => toggleFilter(categoryKey, filter.key)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700 flex-1">
                        {filter.label}
                      </span>
                      {filter.count > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {filter.count}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Results Summary */}
        <div className="p-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">{productCount}</span> προϊόντα βρέθηκαν
          </p>
        </div>
      </div>
    </div>
  );
}