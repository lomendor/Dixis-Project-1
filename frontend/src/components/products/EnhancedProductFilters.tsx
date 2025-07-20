'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import TouchGestures from '@/components/mobile/TouchInteractions';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  productsCount: number;
  categories?: FilterOption[];
  locations?: FilterOption[];
  priceRange?: PriceRange;
}

export default function EnhancedProductFilters({ 
  onFiltersChange, 
  productsCount,
  categories: propCategories = [],
  locations: propLocations = [],
  priceRange: propPriceRange
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [localPriceRange, setLocalPriceRange] = useState<PriceRange>(propPriceRange || { min: 0, max: 100 });
  const [sortBy, setSortBy] = useState('name');
  const [minRating, setMinRating] = useState(0);
  const [isOrganic, setIsOrganic] = useState(false);
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [inStock, setInStock] = useState(false);

  // Use prop data if available, otherwise use defaults
  const categories = propCategories.length > 0 ? propCategories : [];
  const locations = propLocations.length > 0 ? propLocations : [];
  
  // Update price range when props change
  useEffect(() => {
    if (propPriceRange) {
      setLocalPriceRange(propPriceRange);
    }
  }, [propPriceRange]);

  const sortOptions = [
    { value: 'name', label: 'Αλφαβητικά' },
    { value: 'price_low', label: 'Τιμή: Χαμηλή → Υψηλή' },
    { value: 'price_high', label: 'Τιμή: Υψηλή → Χαμηλή' },
    { value: 'rating', label: 'Υψηλότερη αξιολόγηση' },
    { value: 'newest', label: 'Νεότερα πρώτα' },
    { value: 'popular', label: 'Δημοφιλέστερα' }
  ];

  // Update filters when any value changes
  useEffect(() => {
    const filters = {
      search: searchTerm,
      categories: selectedCategories,
      locations: selectedLocations,
      priceRange: localPriceRange,
      sortBy,
      minRating,
      isOrganic,
      isSeasonal,
      isFeatured,
      inStock
    };
    onFiltersChange(filters);
  }, [
    searchTerm, selectedCategories, selectedLocations, localPriceRange, 
    sortBy, minRating, isOrganic, isSeasonal, isFeatured, inStock
    // Removed onFiltersChange from dependencies to prevent infinite loop
  ]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleLocation = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedLocations([]);
    setLocalPriceRange(propPriceRange || { min: 0, max: 100 });
    setSortBy('name');
    setMinRating(0);
    setIsOrganic(false);
    setIsSeasonal(false);
    setIsFeatured(false);
    setInStock(false);
  };

  const activeFiltersCount = selectedCategories.length + selectedLocations.length + 
    (isOrganic ? 1 : 0) + (isSeasonal ? 1 : 0) + (isFeatured ? 1 : 0) + (inStock ? 1 : 0) + 
    (minRating > 0 ? 1 : 0) + (localPriceRange.min > (propPriceRange?.min || 0) || localPriceRange.max < (propPriceRange?.max || 100) ? 1 : 0);

  return (
    <>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <TouchGestures onLongPress={() => setIsOpen(true)}>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Φίλτρα</span>
              {activeFiltersCount > 0 && (
                <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </TouchGestures>

          {/* Quick Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {productsCount} προϊόντα
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Αναζητήστε προϊόντα, παραγωγούς, τοποθεσίες..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-gray-600">Ενεργά φίλτρα:</span>
          
          {selectedCategories.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            return (
              <span key={categoryId} className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {category?.label}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {selectedLocations.map(locationId => {
            const location = locations.find(l => l.id === locationId);
            return (
              <span key={locationId} className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {location?.label}
                <button
                  onClick={() => toggleLocation(locationId)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {isOrganic && (
            <span className="inline-flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
              Βιολογικά
              <button onClick={() => setIsOrganic(false)} className="ml-2 text-emerald-600 hover:text-emerald-800">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {isSeasonal && (
            <span className="inline-flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              Εποχιακά
              <button onClick={() => setIsSeasonal(false)} className="ml-2 text-orange-600 hover:text-orange-800">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {isFeatured && (
            <span className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
              Επιλεγμένα
              <button onClick={() => setIsFeatured(false)} className="ml-2 text-amber-600 hover:text-amber-800">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {inStock && (
            <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              Διαθέσιμα
              <button onClick={() => setInStock(false)} className="ml-2 text-purple-600 hover:text-purple-800">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Καθαρισμός όλων
          </button>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsOpen(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <TouchGestures onSwipeDown={() => setIsOpen(false)}>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-600" />
                      <h2 className="text-xl font-bold text-gray-900">Φίλτρα Προϊόντων</h2>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Categories */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TagIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Κατηγορίες
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map(category => (
                          <TouchGestures key={category.id} onLongPress={() => toggleCategory(category.id)}>
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                selectedCategories.includes(category.id)
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="font-medium">{category.label}</span>
                              <span className="text-sm text-gray-500">({category.count})</span>
                            </button>
                          </TouchGestures>
                        ))}
                      </div>
                    </div>

                    {/* Locations */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Περιοχές
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {locations.map(location => (
                          <TouchGestures key={location.id} onLongPress={() => toggleLocation(location.id)}>
                            <button
                              onClick={() => toggleLocation(location.id)}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                selectedLocations.includes(location.id)
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <span className="font-medium">{location.label}</span>
                              <span className="text-sm text-gray-500">({location.count})</span>
                            </button>
                          </TouchGestures>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Εύρος Τιμής: €{localPriceRange.min} - €{localPriceRange.max}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label className="text-sm text-gray-600 mb-1 block">Ελάχιστη</label>
                            <input
                              type="number"
                              min={propPriceRange?.min || 0}
                              max={propPriceRange?.max || 1000}
                              value={localPriceRange.min}
                              onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm text-gray-600 mb-1 block">Μέγιστη</label>
                            <input
                              type="number"
                              min={propPriceRange?.min || 0}
                              max={propPriceRange?.max || 1000}
                              value={localPriceRange.max}
                              onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <input
                          type="range"
                          min={propPriceRange?.min || 0}
                          max={propPriceRange?.max || 1000}
                          value={localPriceRange.max}
                          onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <StarIcon className="w-5 h-5 mr-2 text-gray-600" />
                        Ελάχιστη Αξιολόγηση
                      </h3>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors ${
                              minRating >= rating
                                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <StarIcon className="w-4 h-4" />
                            <span>{rating}+</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Special Filters */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ειδικά Φίλτρα</h3>
                      <div className="space-y-3">
                        <TouchGestures onLongPress={() => setIsOrganic(!isOrganic)}>
                          <button
                            onClick={() => setIsOrganic(!isOrganic)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              isOrganic
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium">🌿 Βιολογικά Προϊόντα</span>
                            <div className={`w-5 h-5 rounded border-2 ${isOrganic ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'} flex items-center justify-center`}>
                              {isOrganic && <span className="text-white text-xs">✓</span>}
                            </div>
                          </button>
                        </TouchGestures>

                        <TouchGestures onLongPress={() => setIsSeasonal(!isSeasonal)}>
                          <button
                            onClick={() => setIsSeasonal(!isSeasonal)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              isSeasonal
                                ? 'bg-orange-50 border-orange-200 text-orange-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium">🌾 Εποχιακά Προϊόντα</span>
                            <div className={`w-5 h-5 rounded border-2 ${isSeasonal ? 'bg-orange-500 border-orange-500' : 'border-gray-300'} flex items-center justify-center`}>
                              {isSeasonal && <span className="text-white text-xs">✓</span>}
                            </div>
                          </button>
                        </TouchGestures>

                        <TouchGestures onLongPress={() => setIsFeatured(!isFeatured)}>
                          <button
                            onClick={() => setIsFeatured(!isFeatured)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              isFeatured
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium">⭐ Επιλεγμένα Προϊόντα</span>
                            <div className={`w-5 h-5 rounded border-2 ${isFeatured ? 'bg-amber-500 border-amber-500' : 'border-gray-300'} flex items-center justify-center`}>
                              {isFeatured && <span className="text-white text-xs">✓</span>}
                            </div>
                          </button>
                        </TouchGestures>

                        <TouchGestures onLongPress={() => setInStock(!inStock)}>
                          <button
                            onClick={() => setInStock(!inStock)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              inStock
                                ? 'bg-purple-50 border-purple-200 text-purple-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium">📦 Μόνο Διαθέσιμα</span>
                            <div className={`w-5 h-5 rounded border-2 ${inStock ? 'bg-purple-500 border-purple-500' : 'border-gray-300'} flex items-center justify-center`}>
                              {inStock && <span className="text-white text-xs">✓</span>}
                            </div>
                          </button>
                        </TouchGestures>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Καθαρισμός
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Εφαρμογή Φίλτρων ({productsCount})
                    </button>
                  </div>
                </TouchGestures>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}