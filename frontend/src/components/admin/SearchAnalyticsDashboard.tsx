'use client';

import { useState, useEffect } from 'react';
import { getSearchMetrics, getSearchAnalytics, SearchMetrics, SearchAnalytics } from '@/lib/utils/searchUtils';

export default function SearchAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchAnalytics[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const analytics = getSearchAnalytics();
    const currentMetrics = getSearchMetrics();
    
    // Filter by timeframe
    const now = Date.now();
    const timeframes = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const filtered = analytics.filter(
      search => now - search.timestamp <= timeframes[selectedTimeframe]
    );
    
    setMetrics(currentMetrics);
    setRecentSearches(filtered);
  }, [selectedTimeframe]);

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Analytics</h3>
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('el-GR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Search Analytics</h3>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Total Searches</h4>
            <p className="text-2xl font-bold text-blue-900">{recentSearches.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Click Through Rate</h4>
            <p className="text-2xl font-bold text-green-900">
              {recentSearches.length > 0 
                ? Math.round((recentSearches.filter(s => s.clickedResult).length / recentSearches.length) * 100)
                : 0
              }%
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800">No Results</h4>
            <p className="text-2xl font-bold text-yellow-900">
              {recentSearches.filter(s => s.resultsCount === 0).length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Unique Queries</h4>
            <p className="text-2xl font-bold text-purple-900">
              {new Set(recentSearches.map(s => s.query)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Popular Queries */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Popular Search Queries</h4>
        <div className="space-y-2">
          {metrics.popularQueries.length > 0 ? (
            metrics.popularQueries.map((query, index) => {
              const count = recentSearches.filter(s => s.query === query).length;
              return (
                <div key={query} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-900">#{index + 1} {query}</span>
                  <span className="text-sm text-gray-500">{count} searches</span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No popular queries yet</p>
          )}
        </div>
      </div>

      {/* No Results Queries */}
      {metrics.noResultsQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Queries with No Results</h4>
          <div className="space-y-2">
            {metrics.noResultsQueries.map((query, index) => (
              <div key={query} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-900">{query}</span>
                <span className="text-xs text-red-600">No results</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Consider adding products or content related to these search terms.
          </p>
        </div>
      )}

      {/* Recent Searches */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Query</th>
                <th className="text-left py-2">Results</th>
                <th className="text-left py-2">Clicked</th>
                <th className="text-left py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentSearches.slice(0, 20).map((search, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{search.query}</td>
                  <td className="py-2 text-gray-600">{search.resultsCount}</td>
                  <td className="py-2">
                    {search.clickedResult ? (
                      <span className="text-green-600 text-xs">✓ {search.clickedResult}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2 text-gray-500 text-xs">{formatDate(search.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentSearches.length === 0 && (
            <p className="text-gray-500 text-center py-8">No search data available</p>
          )}
        </div>
      </div>
    </div>
  );
}