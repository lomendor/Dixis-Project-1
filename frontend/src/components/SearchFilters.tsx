'use client';

import { useState } from 'react';
import { SearchFilters as SearchFiltersType } from '@/lib/api/services/search/useGlobalSearch';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  facets?: {
    categories: Array<{ name: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; min: number; max: number; count: number }>;
  };
  className?: string;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  facets,
  className = ""
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: filters.query // Keep the search query
    });
  };

  const hasActiveFilters = Object.keys(filters).some(key =>
    key !== 'query' && key !== 'sortBy' && filters[key as keyof SearchFiltersType] !== undefined
  );

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key =>
      key !== 'query' && key !== 'sortBy' && filters[key as keyof SearchFiltersType] !== undefined
    ).length;
  };

  const getActiveFilterChips = () => {
    const chips: Array<{ key: string; label: string; value: any }> = [];
    
    if (filters.category) {
      chips.push({ key: 'category', label: 'Κατηγορία', value: filters.category });
    }
    if (filters.location) {
      chips.push({ key: 'location', label: 'Περιοχή', value: filters.location });
    }
    if (filters.priceRange) {
      chips.push({ key: 'priceRange', label: 'Τιμή', value: `€${filters.priceRange.min}-${filters.priceRange.max}` });
    }
    if (filters.rating) {
      chips.push({ key: 'rating', label: 'Αξιολόγηση', value: `${filters.rating}+ αστέρια` });
    }
    if (filters.inStock) {
      chips.push({ key: 'inStock', label: 'Διαθέσιμα', value: 'Μόνο διαθέσιμα' });
    }
    if (filters.organic) {
      chips.push({ key: 'organic', label: 'Βιολογικά', value: 'Βιολογικά προϊόντα' });
    }
    
    return chips;
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof SearchFiltersType];
    onFiltersChange(newFilters);
  };

  return (
    <>
      {/* Mobile Filter Drawer */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileDrawerOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-lg max-h-[85vh] overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0">
              <h3 className="mobile-title font-semibold text-gray-900">Φίλτρα Αναζήτησης</h3>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="mobile-btn touch-feedback p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Active Filters in Mobile Drawer */}
            {hasActiveFilters && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="mobile-body font-medium text-gray-700">Ενεργά φίλτρα:</span>
                  <button
                    onClick={clearFilters}
                    className="mobile-caption text-red-600 hover:text-red-800 transition-colors"
                  >
                    Καθαρισμός όλων
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getActiveFilterChips().map((chip) => (
                    <div
                      key={chip.key}
                      className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full mobile-caption"
                    >
                      <span>{chip.value}</span>
                      <button
                        onClick={() => removeFilter(chip.key)}
                        className="mobile-btn touch-feedback hover:bg-green-200 rounded-full p-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scrollable Filter Content */}
            <div className="overflow-y-auto p-4 space-y-6 pb-24">
              {/* Sort By */}
              <div>
                <label className="block mobile-body font-medium text-gray-700 mb-3">
                  Ταξινόμηση
                </label>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="mobile-input w-full focus:ring-green-500 focus:border-green-500"
                >
                  <option value="relevance">Σχετικότητα</option>
                  <option value="price_asc">Τιμή: Χαμηλή προς Υψηλή</option>
                  <option value="price_desc">Τιμή: Υψηλή προς Χαμηλή</option>
                  <option value="rating">Καλύτερη Αξιολόγηση</option>
                  <option value="newest">Νεότερα Πρώτα</option>
                </select>
              </div>

              {/* Categories */}
              {facets?.categories && facets.categories.length > 0 && (
                <div>
                  <label className="block mobile-body font-medium text-gray-700 mb-3">
                    Κατηγορίες
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {facets.categories.map((category) => (
                      <label key={category.name} className="flex items-center mobile-btn touch-feedback">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === category.name}
                          onChange={(e) => updateFilter('category', e.target.checked ? category.name : undefined)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 mobile-body text-gray-700 flex-1">
                          {category.name}
                        </span>
                        <span className="mobile-caption text-gray-500">
                          ({category.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations */}
              {facets?.locations && facets.locations.length > 0 && (
                <div>
                  <label className="block mobile-body font-medium text-gray-700 mb-3">
                    Περιοχή
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {facets.locations.map((location) => (
                      <label key={location.name} className="flex items-center mobile-btn touch-feedback">
                        <input
                          type="radio"
                          name="location"
                          checked={filters.location === location.name}
                          onChange={(e) => updateFilter('location', e.target.checked ? location.name : undefined)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 mobile-body text-gray-700 flex-1">
                          {location.name}
                        </span>
                        <span className="mobile-caption text-gray-500">
                          ({location.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              {facets?.priceRanges && facets.priceRanges.length > 0 && (
                <div>
                  <label className="block mobile-body font-medium text-gray-700 mb-3">
                    Εύρος Τιμής
                  </label>
                  <div className="space-y-3">
                    {facets.priceRanges.map((range) => (
                      <label key={range.range} className="flex items-center mobile-btn touch-feedback">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={
                            filters?.priceRange?.min === range.min &&
                            filters?.priceRange?.max === range.max
                          }
                          onChange={(e) =>
                            updateFilter('priceRange', e.target.checked ?
                              { min: range.min, max: range.max } : undefined
                            )
                          }
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 mobile-body text-gray-700 flex-1">
                          {range.range}
                        </span>
                        <span className="mobile-caption text-gray-500">
                          ({range.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <label className="block mobile-body font-medium text-gray-700 mb-3">
                  Ελάχιστη Αξιολόγηση
                </label>
                <div className="space-y-3">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center mobile-btn touch-feedback">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={(e) => updateFilter('rating', e.target.checked ? rating : undefined)}
                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-3 flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            } fill-current`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 mobile-body text-gray-600">& πάνω</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <label className="block mobile-body font-medium text-gray-700 mb-3">
                  Επιπλέον Φίλτρα
                </label>
                <div className="space-y-3">
                  <label className="flex items-center mobile-btn touch-feedback">
                    <input
                      type="checkbox"
                      checked={filters.inStock || false}
                      onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 mobile-body text-gray-700">
                      Μόνο διαθέσιμα
                    </span>
                  </label>

                  <label className="flex items-center mobile-btn touch-feedback">
                    <input
                      type="checkbox"
                      checked={filters.organic || false}
                      onChange={(e) => updateFilter('organic', e.target.checked || undefined)}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 mobile-body text-gray-700">
                      Βιολογικά προϊόντα
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Actions */}
            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 space-y-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mobile-btn touch-feedback w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg mobile-body font-medium"
                >
                  Καθαρισμός Φίλτρων
                </button>
              )}
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="mobile-btn touch-feedback w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mobile-body font-medium"
              >
                Εφαρμογή Φίλτρων
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="mobile-btn w-full flex items-center justify-between p-4 text-left touch-feedback"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="mobile-subtitle font-medium text-gray-900">Φίλτρα</span>
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <span className="bg-green-100 text-green-800 mobile-caption px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Active Filter Chips - Desktop */}
        {hasActiveFilters && (
          <div className="hidden lg:block p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="mobile-caption text-gray-600">Ενεργά φίλτρα:</span>
              <button
                onClick={clearFilters}
                className="mobile-caption text-red-600 hover:text-red-800 transition-colors"
              >
                Καθαρισμός όλων
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {getActiveFilterChips().map((chip) => (
                <div
                  key={chip.key}
                  className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full mobile-caption"
                >
                  <span>{chip.value}</span>
                  <button
                    onClick={() => removeFilter(chip.key)}
                    className="mobile-btn touch-feedback hover:bg-green-200 rounded-full p-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Filters Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block p-4 space-y-6`}>
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ταξινόμηση
          </label>
          <select
            value={filters.sortBy || 'relevance'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="relevance">Σχετικότητα</option>
            <option value="price_asc">Τιμή: Χαμηλή προς Υψηλή</option>
            <option value="price_desc">Τιμή: Υψηλή προς Χαμηλή</option>
            <option value="rating">Καλύτερη Αξιολόγηση</option>
            <option value="newest">Νεότερα Πρώτα</option>
          </select>
        </div>

        {/* Categories */}
        {facets?.categories && facets.categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Κατηγορίες
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {facets.categories.map((category) => (
                <label key={category.name} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category.name}
                    onChange={(e) => updateFilter('category', e.target.checked ? category.name : undefined)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex-1">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({category.count})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {facets?.locations && facets.locations.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Περιοχή
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {facets.locations.map((location) => (
                <label key={location.name} className="flex items-center">
                  <input
                    type="radio"
                    name="location"
                    checked={filters.location === location.name}
                    onChange={(e) => updateFilter('location', e.target.checked ? location.name : undefined)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex-1">
                    {location.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({location.count})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        {facets?.priceRanges && facets.priceRanges.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Εύρος Τιμής
            </label>
            <div className="space-y-2">
              {facets.priceRanges.map((range) => (
                <label key={range.range} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={
                      filters?.priceRange?.min === range.min &&
                      filters?.priceRange?.max === range.max
                    }
                    onChange={(e) =>
                      updateFilter('priceRange', e.target.checked ?
                        { min: range.min, max: range.max } : undefined
                      )
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex-1">
                    {range.range}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({range.count})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ελάχιστη Αξιολόγηση
          </label>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={(e) => updateFilter('rating', e.target.checked ? rating : undefined)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      } fill-current`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">& πάνω</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Επιπλέον Φίλτρα
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock || false}
                onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Μόνο διαθέσιμα
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.organic || false}
                onChange={(e) => updateFilter('organic', e.target.checked || undefined)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Βιολογικά προϊόντα
              </span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Καθαρισμός Φίλτρων
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
