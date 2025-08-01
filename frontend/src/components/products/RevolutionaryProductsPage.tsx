'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bars3Icon, Squares2X2Icon, ListBulletIcon, AdjustmentsHorizontalIcon, FunnelIcon } from '@heroicons/react/24/outline';
import AdvancedProductFilters from './AdvancedProductFilters';
import SmartProductSearch from './SmartProductSearch';
import EnhancedProductCard from './EnhancedProductCard';
import { useCartStore } from '@/stores/cartStore';

interface Producer {
  id?: number;
  business_name: string;
  slug?: string;
  city?: string;
  location?: string;
  avatar_url?: string;
  rating?: number;
  verified?: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  producer_price?: number;
  discount_price?: number;
  main_image?: string;
  short_description?: string;
  description?: string;
  stock: number;
  producer?: Producer;
  rating?: number;
  reviews_count?: number;
  category?: {
    name: string;
  };
  unit?: string;
  is_featured?: boolean;
  is_organic?: boolean;
  pdo_certification?: string;
  pgi_certification?: string;
  tsg_certification?: string;
  organic_certification_body?: string;
  quality_grade?: string;
  carbon_footprint?: number;
  created_at?: string;
  updated_at?: string;
}

interface RevolutionaryProductsPageProps {
  products: Product[];
  className?: string;
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name' | 'featured' | 'sustainability';
type ViewMode = 'grid' | 'list' | 'compact';

const SORT_OPTIONS = [
  { key: 'relevance' as SortOption, label: 'Σχετικότητα', icon: '🎯' },
  { key: 'featured' as SortOption, label: 'Επιλεγμένα', icon: '⭐' },
  { key: 'price_asc' as SortOption, label: 'Τιμή: Χαμηλή → Υψηλή', icon: '💰' },
  { key: 'price_desc' as SortOption, label: 'Τιμή: Υψηλή → Χαμηλή', icon: '💸' },
  { key: 'rating' as SortOption, label: 'Αξιολόγηση', icon: '🌟' },
  { key: 'newest' as SortOption, label: 'Νεότερα', icon: '🆕' },
  { key: 'name' as SortOption, label: 'Αλφαβητικά', icon: '🔤' },
  { key: 'sustainability' as SortOption, label: 'Αειφορία', icon: '🌱' }
];

export default function RevolutionaryProductsPage({ 
  products = [], 
  className = '' 
}: RevolutionaryProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addToCart } = useCartStore();

  // Handle cart operations
  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1, {
        productName: product.name,
        price: product.discount_price || product.price,
        image: product.main_image && product.main_image.trim() !== '' 
          ? product.main_image 
          : '/images/placeholder-product.svg',
        producer: product.producer?.business_name || 'Unknown Producer'
      });
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.short_description?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.producer?.business_name.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query)
      );
    }

    // Apply category filters (simulated - would integrate with real product data)
    Object.entries(activeFilters).forEach(([category, filterValues]) => {
      if (filterValues.length === 0) return;

      filtered = filtered.filter(product => {
        switch (category) {
          case 'dietary':
            return filterValues.some(filter => {
              switch (filter) {
                case 'biological':
                  return product.is_organic;
                case 'traditional_greek':
                  return product.name.toLowerCase().includes('παραδοσιακ') || 
                         product.description?.toLowerCase().includes('παραδοσιακ');
                case 'monastery_made':
                  return product.name.toLowerCase().includes('μοναστηρ') ||
                         product.producer?.business_name.toLowerCase().includes('μοναστηρ');
                case 'island_specialty':
                  return product.name.toLowerCase().includes('νησ') ||
                         product.producer?.location?.toLowerCase().includes('νησ');
                default:
                  return true; // Would implement real filtering logic
              }
            });
          
          case 'certifications':
            return filterValues.some(filter => {
              switch (filter) {
                case 'pdo_protected':
                  return !!product.pdo_certification;
                case 'pgi_indicated':
                  return !!product.pgi_certification;
                case 'bio_hellas':
                  return product.is_organic;
                default:
                  return true;
              }
            });
          
          case 'sustainability':
            return filterValues.some(filter => {
              switch (filter) {
                case 'low_carbon':
                  return product.carbon_footprint && product.carbon_footprint < 5;
                case 'renewable_energy':
                  return product.name.toLowerCase().includes('βιολογικ') || product.is_organic;
                default:
                  return true;
              }
            });
          
          default:
            return true; // Would implement other category filters
        }
      });
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.discount_price || a.price) - (b.discount_price || b.price);
        case 'price_desc':
          return (b.discount_price || b.price) - (a.discount_price || a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'name':
          return a.name.localeCompare(b.name, 'el');
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case 'sustainability':
          return (a.carbon_footprint || 999) - (b.carbon_footprint || 999);
        case 'relevance':
        default:
          // Relevance score calculation (AI-powered)
          let scoreA = 0;
          let scoreB = 0;
          
          // Boost featured products
          if (a.is_featured) scoreA += 10;
          if (b.is_featured) scoreB += 10;
          
          // Boost organic products
          if (a.is_organic) scoreA += 5;
          if (b.is_organic) scoreB += 5;
          
          // Boost high-rated products
          scoreA += (a.rating || 0) * 2;
          scoreB += (b.rating || 0) * 2;
          
          // Boost verified producers
          if (a.producer?.verified) scoreA += 3;
          if (b.producer?.verified) scoreB += 3;
          
          return scoreB - scoreA;
      }
    });

    return filtered;
  }, [products, searchQuery, activeFilters, sortBy]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm mb-4 opacity-80">
            <span>Αρχική</span> → <span className="font-medium">Προϊόντα</span>
          </nav>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Ανακαλύψτε Αυθεντικά Ελληνικά Προϊόντα
              </h1>
              <p className="text-green-100 text-lg">
                {filteredAndSortedProducts.length} από {products.length} προϊόντα
              </p>
            </div>
            
            {/* AI-Powered Search */}
            <div className="lg:max-w-md xl:max-w-lg flex-1">
              <SmartProductSearch
                onSearch={setSearchQuery}
                placeholder="Αναζήτηση με AI..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Advanced Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-6">
              <AdvancedProductFilters
                onFiltersChange={setActiveFilters}
                onSearchChange={setSearchQuery}
                productCount={filteredAndSortedProducts.length}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left side - Results and Filter Toggle */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium"
                  >
                    <FunnelIcon className="h-5 w-5 mr-2" />
                    Φίλτρα
                    {Object.values(activeFilters).reduce((sum, filters) => sum + filters.length, 0) > 0 && (
                      <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        {Object.values(activeFilters).reduce((sum, filters) => sum + filters.length, 0)}
                      </span>
                    )}
                  </button>
                  
                  <p className="text-gray-600">
                    <span className="font-semibold text-green-600">
                      {filteredAndSortedProducts.length}
                    </span> προϊόντα
                  </p>
                </div>

                {/* Right side - View and Sort Controls */}
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.key} value={option.key}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-green-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Πλέγμα"
                    >
                      <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white text-green-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Λίστα"
                    >
                      <ListBulletIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'compact' 
                          ? 'bg-white text-green-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Συμπαγές"
                    >
                      <Bars3Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                  : viewMode === 'list'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}>
                {filteredAndSortedProducts.map((product) => (
                  <EnhancedProductCard
                    key={product.id}
                    product={{
                      ...product,
                      main_image: product.main_image && product.main_image.trim() !== '' 
                        ? product.main_image 
                        : '/images/placeholder-product.svg'
                    }}
                    onAddToCart={handleAddToCart}
                    showProducerInfo={true}
                    showEnhancedFeatures={true}
                    compact={viewMode === 'compact'}
                    listView={viewMode === 'list'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Δεν βρέθηκαν προϊόντα
                </h3>
                <p className="text-gray-600 mb-4">
                  Δοκιμάστε να αλλάξετε τα φίλτρα ή τον όρο αναζήτησης.
                </p>
                <button
                  onClick={() => {
                    setActiveFilters({});
                    setSearchQuery('');
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Καθαρισμός Φίλτρων
                </button>
              </div>
            )}

            {/* Load More / Pagination would go here */}
            {filteredAndSortedProducts.length > 0 && filteredAndSortedProducts.length >= 20 && (
              <div className="text-center mt-12">
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Φόρτωση Περισσότερων Προϊόντων
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}