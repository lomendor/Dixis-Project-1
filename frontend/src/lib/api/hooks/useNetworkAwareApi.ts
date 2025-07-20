'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Simplified types
interface ApiOptions {
  timeout?: number;
  maxRetries?: number;
  fallbackEnabled?: boolean;
}

interface OfflineState {
  isOnline: boolean;
  lastConnectionTime?: Date;
  connectionQuality?: 'good' | 'slow' | 'poor';
}

interface NetworkAwareApiResult {
  networkStatus: OfflineState & {
    apiCallsEnabled: boolean;
    isSlowConnection: boolean;
    isGoodConnection: boolean;
  };
  shouldUseApi: boolean;
  getFallbackData: <T>(endpoint: string, params?: any) => Promise<T>;
  handleApiError: <T>(error: any, endpoint: string, params?: any) => Promise<T>;
  markConnectionSuccess: () => void;
  markConnectionFailure: (error: any) => void;
  disableApiCalls: () => void;
  enableApiCalls: () => void;
  retryFailedRequest: (endpoint: string) => void;
}

/**
 * Simplified network-aware API hook
 */
export function useNetworkAwareApi(
  options?: ApiOptions,
  domain: string = 'api'
): NetworkAwareApiResult {
  const queryClient = useQueryClient();
  const failedRequestsRef = useRef<Set<string>>(new Set());
  
  const [networkState, setNetworkState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionQuality: 'good'
  });

  const [apiCallsEnabled, setApiCallsEnabled] = useState(true);

  // Basic online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setNetworkState(prev => ({ ...prev, isOnline: true, lastConnectionTime: new Date() }));
    };

    const handleOffline = () => {
      setNetworkState(prev => ({ ...prev, isOnline: false }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const shouldUseApi = networkState.isOnline && apiCallsEnabled;

  const getFallbackData = useCallback(async <T>(endpoint: string, params?: any): Promise<T> => {
    // Return empty fallback data
    return {} as T;
  }, []);

  const handleApiError = useCallback(async <T>(error: any, endpoint: string, params?: any): Promise<T> => {
    console.error('API Error:', error);
    failedRequestsRef.current.add(endpoint);
    return getFallbackData<T>(endpoint, params);
  }, [getFallbackData]);

  const markConnectionSuccess = useCallback(() => {
    setNetworkState(prev => ({ 
      ...prev, 
      isOnline: true, 
      lastConnectionTime: new Date(),
      connectionQuality: 'good'
    }));
  }, []);

  const markConnectionFailure = useCallback((error: any) => {
    console.error('Connection failure:', error);
    setNetworkState(prev => ({ 
      ...prev, 
      connectionQuality: 'poor'
    }));
  }, []);

  const disableApiCalls = useCallback(() => {
    setApiCallsEnabled(false);
  }, []);

  const enableApiCalls = useCallback(() => {
    setApiCallsEnabled(true);
  }, []);

  const retryFailedRequest = useCallback((endpoint: string) => {
    failedRequestsRef.current.delete(endpoint);
    queryClient.invalidateQueries({ queryKey: [endpoint] });
  }, [queryClient]);

  return {
    networkStatus: {
      ...networkState,
      apiCallsEnabled,
      isSlowConnection: networkState.connectionQuality === 'slow',
      isGoodConnection: networkState.connectionQuality === 'good',
    },
    shouldUseApi,
    getFallbackData,
    handleApiError,
    markConnectionSuccess,
    markConnectionFailure,
    disableApiCalls,
    enableApiCalls,
    retryFailedRequest,
  };
}

export default useNetworkAwareApi;