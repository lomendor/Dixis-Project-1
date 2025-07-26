'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { UNIFIED_ENDPOINTS } from '@/lib/api/config/unified';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
}

export default function TestProductNavigationPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(UNIFIED_ENDPOINTS.PRODUCTS.LIST() + '?per_page=5');
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Product Navigation Test</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2">Testing Direct Product Navigation</h2>
          <p className="text-blue-800 text-sm">
            Click on any product below to test the direct navigation to product detail page.
            <br />
            <strong>Expected result:</strong> One click → Product detail page (no redirections)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600">Slug: {product.slug}</p>
                    <p className="text-green-600 font-medium">€{product.price}</p>
                  </div>
                  <div className="space-x-4">
                    <Link
                      href={`/products/${product.slug}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🔗 View Product (Slug)
                    </Link>
                    <Link
                      href={`/products/${product.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🔗 View Product (ID)
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Configuration:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>API Base:</strong> {UNIFIED_ENDPOINTS.PRODUCTS.LIST()}</li>
            <li>• <strong>Slug Endpoint:</strong> {UNIFIED_ENDPOINTS.PRODUCTS.BY_SLUG('EXAMPLE_SLUG')}</li>
            <li>• <strong>Detail Endpoint:</strong> {UNIFIED_ENDPOINTS.PRODUCTS.DETAIL('EXAMPLE_ID')}</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/products"
            className="text-green-600 hover:text-green-700 underline"
          >
            ← Back to Main Products Page
          </Link>
        </div>
      </div>
    </div>
  );
}