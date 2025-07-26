'use client';

import { useState, useEffect } from 'react';
import { UNIFIED_ENDPOINTS } from '@/lib/api/config/unified';

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    // Test 1: Products List
    try {
      const response = await fetch(UNIFIED_ENDPOINTS.PRODUCTS.LIST() + '?per_page=5');
      const data = await response.json();
      results.push({
        test: 'Products List',
        status: response.ok ? 'SUCCESS' : 'FAILED',
        url: UNIFIED_ENDPOINTS.PRODUCTS.LIST() + '?per_page=5',
        data: response.ok ? `${data.data?.length || 0} products found` : data,
      });
    } catch (error) {
      results.push({
        test: 'Products List',
        status: 'ERROR',
        url: UNIFIED_ENDPOINTS.PRODUCTS.LIST() + '?per_page=5',
        data: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 2: Product by Slug
    try {
      const response = await fetch(UNIFIED_ENDPOINTS.PRODUCTS.BY_SLUG('mila-zaghoras'));
      const data = await response.json();
      results.push({
        test: 'Product by Slug',
        status: response.ok ? 'SUCCESS' : 'FAILED',
        url: UNIFIED_ENDPOINTS.PRODUCTS.BY_SLUG('mila-zaghoras'),
        data: response.ok ? `Product: ${data.data?.name || 'N/A'}` : data,
      });
    } catch (error) {
      results.push({
        test: 'Product by Slug',
        status: 'ERROR',
        url: UNIFIED_ENDPOINTS.PRODUCTS.BY_SLUG('mila-zaghoras'),
        data: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 3: Producers List
    try {
      const response = await fetch(UNIFIED_ENDPOINTS.PRODUCERS.LIST() + '?per_page=5');
      const data = await response.json();
      results.push({
        test: 'Producers List',
        status: response.ok ? 'SUCCESS' : 'FAILED',
        url: UNIFIED_ENDPOINTS.PRODUCERS.LIST() + '?per_page=5',
        data: response.ok ? `${data.data?.length || 0} producers found` : data,
      });
    } catch (error) {
      results.push({
        test: 'Producers List',
        status: 'ERROR',
        url: UNIFIED_ENDPOINTS.PRODUCERS.LIST() + '?per_page=5',
        data: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Connectivity Test</h1>
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Re-run Tests'}
          </button>
        </div>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                result.status === 'SUCCESS'
                  ? 'border-green-200 bg-green-50'
                  : result.status === 'FAILED'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{result.test}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'FAILED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>URL:</strong> {result.url}
              </div>
              <div className="text-sm">
                <strong>Result:</strong>{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                </code>
              </div>
            </div>
          ))}
        </div>

        {testResults.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No tests run yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}