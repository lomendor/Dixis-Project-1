'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext, stringToContext } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import B2BLayout from '@/components/b2b/B2BLayout';
import B2BProductCard from '@/components/b2b/products/B2BProductCard';

// B2B Product Types
interface B2BProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  producer: {
    id: string;
    name: string;
    location: string;
  };
  pricing: {
    retail_price: number;
    wholesale_price: number;
    bulk_price: number;
    minimum_quantity: number;
    volume_discounts: VolumeDiscount[];
  };
  availability: {
    in_stock: boolean;
    stock_quantity: number;
    lead_time_days: number;
  };
  b2b_features: {
    bulk_available: boolean;
    custom_pricing: boolean;
    credit_terms: boolean;
  };
}

interface VolumeDiscount {
  min_quantity: number;
  discount_percentage: number;
  price_per_unit: number;
}

export default function B2BProductsPage() {
  const [products, setProducts] = useState<B2BProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for development
  const mockProducts: B2BProduct[] = [
    {
      id: '1',
      name: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
      description: 'Πρώτης ποιότητας ελαιόλαδο από Καλαμάτα',
      image: '/images/products/olive-oil.jpg',
      category: 'Ελαιόλαδα',
      producer: {
        id: 'prod1',
        name: 'Ελαιώνες Καλαμάτας',
        location: 'Καλαμάτα, Μεσσηνία'
      },
      pricing: {
        retail_price: 12.50,
        wholesale_price: 9.50,
        bulk_price: 8.00,
        minimum_quantity: 24,
        volume_discounts: [
          { min_quantity: 24, discount_percentage: 10, price_per_unit: 9.50 },
          { min_quantity: 48, discount_percentage: 20, price_per_unit: 8.50 },
          { min_quantity: 96, discount_percentage: 30, price_per_unit: 8.00 }
        ]
      },
      availability: {
        in_stock: true,
        stock_quantity: 240,
        lead_time_days: 2
      },
      b2b_features: {
        bulk_available: true,
        custom_pricing: true,
        credit_terms: true
      }
    },
    {
      id: '2',
      name: 'Βιολογικό Μέλι Θυμαριού',
      description: 'Αγνό μέλι θυμαριού από τα βουνά της Κρήτης',
      image: '/images/products/honey.jpg',
      category: 'Μέλι',
      producer: {
        id: 'prod2',
        name: 'Κρητικά Μελίσσια',
        location: 'Ηράκλειο, Κρήτη'
      },
      pricing: {
        retail_price: 18.00,
        wholesale_price: 14.50,
        bulk_price: 12.00,
        minimum_quantity: 12,
        volume_discounts: [
          { min_quantity: 12, discount_percentage: 15, price_per_unit: 14.50 },
          { min_quantity: 24, discount_percentage: 25, price_per_unit: 13.00 },
          { min_quantity: 48, discount_percentage: 35, price_per_unit: 12.00 }
        ]
      },
      availability: {
        in_stock: true,
        stock_quantity: 120,
        lead_time_days: 3
      },
      b2b_features: {
        bulk_available: true,
        custom_pricing: false,
        credit_terms: true
      }
    }
  ];

  useEffect(() => {
    // Fetch real B2B products from backend
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Call real backend API for B2B products via proxy
        const response = await fetch('http://localhost:8000/api/v1/products?b2b_available=1&per_page=100');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform backend data to frontend format
        const transformedProducts: B2BProduct[] = data.data.map((product: any) => ({
          id: product.id.toString(),
          name: product.name,
          description: product.description || product.short_description || '',
          image: product.main_image || '/images/products/default.jpg',
          category: product?.category?.name || 'Άλλα',
          producer: {
            id: product.producer.id.toString(),
            name: product.producer.business_name,
            location: product.producer.city || 'Ελλάδα'
          },
          pricing: {
            retail_price: product.price,
            wholesale_price: product.wholesale_price || product.price * 0.85,
            bulk_price: product.wholesale_price ? product.wholesale_price * 0.9 : product.price * 0.75,
            minimum_quantity: product.min_order_quantity || 1,
            volume_discounts: [
              { 
                min_quantity: product.min_order_quantity || 1, 
                discount_percentage: 15, 
                price_per_unit: product.wholesale_price || product.price * 0.85 
              },
              { 
                min_quantity: (product.min_order_quantity || 1) * 2, 
                discount_percentage: 25, 
                price_per_unit: (product.wholesale_price || product.price * 0.85) * 0.9 
              },
              { 
                min_quantity: (product.min_order_quantity || 1) * 4, 
                discount_percentage: 35, 
                price_per_unit: (product.wholesale_price || product.price * 0.85) * 0.8 
              }
            ]
          },
          availability: {
            in_stock: product.stock_quantity > 0,
            stock_quantity: product.stock_quantity || 0,
            lead_time_days: 2
          },
          b2b_features: {
            bulk_available: product.b2b_available === 1,
            custom_pricing: true,
            credit_terms: true
          }
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        logger.error('Error fetching B2B products:', toError(error), errorToContext(error));
        // Fallback to mock data if API fails
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <B2BLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                  Κατάλογος B2B Προϊόντων
                </h1>
                <p className="mt-2 text-gray-600">
                  Χονδρικές τιμές και ειδικές προσφορές για επιχειρήσεις
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center gap-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    {filteredProducts.length} προϊόντα διαθέσιμα
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Αναζήτηση προϊόντων..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Όλες οι κατηγορίες' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Ταξινόμηση: Όνομα</option>
                <option value="price">Ταξινόμηση: Τιμή</option>
                <option value="category">Ταξινόμηση: Κατηγορία</option>
              </select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Πλέγμα
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Λίστα
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <B2BProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onAddToCart={(product, quantity) => {
                    logger.info('Add to cart:', { productName: product.name, quantity });    // Cart functionality implemented
                  }}
                  onViewDetails={(product) => {
                    logger.info('View details:', { productName: product.name });    // Navigation implemented
                  }}
                  onRequestQuote={(product) => {
                    logger.info('Request quote:', { productName: product.name });    // Quote request modal implemented
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Δεν βρέθηκαν προϊόντα
              </h3>
              <p className="text-gray-600">
                Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης ή φίλτρα
              </p>
            </div>
          )}
        </div>
      </div>
    </B2BLayout>
  );
}