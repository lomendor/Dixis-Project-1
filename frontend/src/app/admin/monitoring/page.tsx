'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance/monitoring';
import { apiCache, imageCache, userDataCache } from '@/lib/performance/cache';

interface SystemMetrics {
  health: any;
  performance: any;
  cache: any;
  errors: any[];
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch health data
      const healthResponse = await fetch('/api/health');
      const health = await healthResponse.json();
      
      // Get performance metrics
      const performance = performanceMonitor.getMetricsSummary();
      
      // Get cache statistics
      const cache = {
        api: apiCache.getStats(),
        images: imageCache.getStats(),
        userData: userDataCache.getStats()
      };
      
      // Fetch error logs (if available)
      const errorsResponse = await fetch('/api/monitoring/errors');
      const errors = errorsResponse.ok ? await errorsResponse.json() : [];
      
      setMetrics({ health, performance, cache, errors });
    } catch (error) {
      logger.error('Failed to fetch metrics:', toError(error), errorToContext(error));
    } finally {
      setLoading(false);
    }
  };

  const clearCache = (cacheType: string) => {
    switch (cacheType) {
      case 'api':
        apiCache.clear();
        break;
      case 'images':
        imageCache.clear();
        break;
      case 'userData':
        userDataCache.clear();
        break;
      case 'all':
        apiCache.clear();
        imageCache.clear();
        userDataCache.clear();
        break;
    }
    fetchMetrics();
  };

  const clearPerformanceMetrics = () => {
    performanceMonitor.clearMetrics();
    fetchMetrics();
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg ${
                autoRefresh 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Health Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
            <div className={`text-2xl font-bold ${
              metrics?.health?.data?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics?.health?.data?.status || 'Unknown'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Database</h3>
            <div className={`text-2xl font-bold ${
              metrics?.health?.data?.checks?.find((c: any) => c.name === 'database')?.status === 'healthy' 
                ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics?.health?.data?.checks?.find((c: any) => c.name === 'database')?.status || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500">
              Response: {metrics?.health?.data?.checks?.find((c: any) => c.name === 'database')?.details?.responseTime}ms
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Memory Usage</h3>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.health?.data?.memory?.heapUsed || 0}MB
            </div>
            <div className="text-sm text-gray-500">
              Total: {metrics?.health?.data?.memory?.heapTotal || 0}MB
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Uptime</h3>
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor((metrics?.health?.data?.uptime || 0) / 3600)}h
            </div>
            <div className="text-sm text-gray-500">
              {Math.floor(((metrics?.health?.data?.uptime || 0) % 3600) / 60)}m
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              <button
                onClick={clearPerformanceMetrics}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(metrics?.performance || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key.replace(/_/g, ' ').toUpperCase()}</span>
                  <div className="text-right">
                    <div className="font-semibold">{Math.round(value.avg)}ms</div>
                    <div className="text-sm text-gray-500">Max: {Math.round(value.max)}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cache Statistics</h3>
              <button
                onClick={() => clearCache('all')}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(metrics?.cache || {}).map(([cacheType, stats]: [string, any]) => (
                <div key={cacheType} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{cacheType.toUpperCase()}</span>
                    <button
                      onClick={() => clearCache(cacheType)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Size: {stats.size} items | Memory: {Math.round(stats.memoryUsage / 1024)}KB
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h3>
          {metrics?.errors && metrics.errors.length > 0 ? (
            <div className="space-y-2">
              {metrics.errors.slice(0, 10).map((error: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-800">{error.message}</div>
                  <div className="text-sm text-red-600">{error.timestamp}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No recent errors found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
