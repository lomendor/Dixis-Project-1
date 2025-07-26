'use client';

import { useState } from 'react';
import { useEnhancedProduct } from '@/lib/api/services/product/useProductsEnhanced';

export default function DebugApiPage() {
  const [testSlug, setTestSlug] = useState('mila-zaghoras');
  const { product, isLoading, isError, error } = useEnhancedProduct(testSlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 API Debug Page</h1>
        
        <div className="space-y-6">
          {/* Test Input */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Slug:
            </label>
            <input
              type="text"
              value={testSlug}
              onChange={(e) => setTestSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter product slug"
            />
          </div>

          {/* API Response */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  isLoading ? 'bg-yellow-100 text-yellow-800' :
                  isError ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {isLoading ? 'Loading...' : isError ? 'Error' : 'Success'}
                </span>
              </div>

              {isError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 font-medium">Error Details:</p>
                  <pre className="text-sm text-red-700 mt-1">
                    {error?.message || 'Unknown error'}
                  </pre>
                </div>
              )}

              {product && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-800 font-medium">Product Data:</p>
                  <pre className="text-sm text-green-700 mt-1 overflow-auto">
                    {JSON.stringify(product, null, 2)}
                  </pre>
                </div>
              )}

              {!isLoading && !isError && !product && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <p className="text-gray-800">No product data received</p>
                </div>
              )}
            </div>
          </div>

          {/* Expected Endpoint */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Expected API Endpoint</h2>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              http://localhost:8000/api/v1/products/slug/{testSlug}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}