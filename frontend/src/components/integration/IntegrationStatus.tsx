'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState, useEffect } from 'react';
import { integrationService } from '@/lib/api/integration/integrationService';

interface IntegrationStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function IntegrationStatus({ 
  showDetails = false, 
  className = '' 
}: IntegrationStatusProps) {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const integrationStatus = integrationService.getIntegrationStatus();
      setStatus(integrationStatus);
      setIsLoading(false);
    };

    // Initial load
    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '❌';
      default:
        return '⚠️';
    }
  };

  const testConnection = async () => {
    logger.info('🧪 IntegrationStatus: testConnection() called');
    setIsLoading(true);
    try {
      logger.info('📡 IntegrationStatus: Calling integrationService.testConnection()...');
      const result = await integrationService.testConnection();
      logger.info('✅ IntegrationStatus: Connection test result:', result);

      // Update status after test
      logger.info('🔄 IntegrationStatus: Getting integration status...');
      const integrationStatus = integrationService.getIntegrationStatus();
      logger.info('📊 IntegrationStatus: New status:', integrationStatus);
      setStatus(integrationStatus);
    } catch (error) {
      logger.error('❌ IntegrationStatus: Connection test failed:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !status) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Checking connection...</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Compact Status */}
      <div className="flex items-center space-x-2">
        <div 
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(status.health.backend)}`}
        >
          <span>{getStatusIcon(status.health.backend)}</span>
          <span>Backend</span>
        </div>
        
        <span className="text-xs text-gray-500">
          {status.health.responseTime}ms
        </span>

        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Hide' : 'Details'}
          </button>
        )}

        <button
          onClick={testConnection}
          disabled={isLoading}
          className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Test
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && isExpanded && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs space-y-2">
          {/* Backend URL */}
          <div>
            <span className="font-medium">Backend URL:</span>
            <span className="ml-2 text-gray-600">{status.backendUrl}</span>
          </div>

          {/* Health Status */}
          <div>
            <span className="font-medium">Health:</span>
            <div className="ml-2 space-y-1">
              <div className="flex justify-between">
                <span>Backend:</span>
                <span className={getStatusColor(status.health.backend).split(' ')[0]}>
                  {status.health.backend}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className={getStatusColor(status.health.database).split(' ')[0]}>
                  {status.health.database}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Check:</span>
                <span className="text-gray-600">
                  {new Date(status.health.lastCheck).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div>
            <span className="font-medium">Features:</span>
            <div className="ml-2 grid grid-cols-2 gap-1">
              {Object.entries(status.config).map(([key, value]) => {
                if (key.startsWith('use') && typeof value === 'boolean') {
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">
                        {key.replace('useReal', '').toLowerCase()}:
                      </span>
                      <span className={value ? 'text-green-600' : 'text-gray-400'}>
                        {value ? 'Real' : 'Mock'}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Configuration */}
          <div>
            <span className="font-medium">Config:</span>
            <div className="ml-2 space-y-1">
              <div className="flex justify-between">
                <span>Fallback to Mock:</span>
                <span className={status.config.fallbackToMock ? 'text-green-600' : 'text-red-600'}>
                  {status.config.fallbackToMock ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Health Check Interval:</span>
                <span className="text-gray-600">
                  {status.config.healthCheckInterval / 1000}s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}