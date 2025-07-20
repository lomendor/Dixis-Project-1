'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  main_image?: string;
  producer?: {
    business_name: string;
  };
  stock_quantity?: number;
}

export default function SimpleFeaturedProducts() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch('/api/products/featured');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Προτεινόμενα Προϊόντα
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Προτεινόμενα Προϊόντα
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ανακαλύψτε τα καλύτερα ελληνικά προϊόντα από επιλεγμένους παραγωγούς
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.main_image ? (
                  <img 
                    src={product.main_image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">🥗</div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                {product.producer && (
                  <p className="text-sm text-gray-600 mb-2">
                    {product.producer.business_name}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-emerald-600">
                    €{product.price.toFixed(2)}
                  </span>
                  {product.stock_quantity && product.stock_quantity > 0 ? (
                    <span className="text-sm text-green-600">Διαθέσιμο</span>
                  ) : (
                    <span className="text-sm text-red-600">Μη διαθέσιμο</span>
                  )}
                </div>
                <button className="w-full mt-4 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
                  Προσθήκη στο Καλάθι
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Δείτε Όλα τα Προϊόντα
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}