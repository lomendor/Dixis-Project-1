'use client';

import { useMemo } from 'react';
import { OfflineSupportOptions, OfflineSupportResult } from '../client/apiTypes';

/**
 * Hook for providing offline support with fallback data
 * 
 * @param options - Configuration options for offline support
 * @returns Object with offline status and modified data
 */
export function useOfflineSupport<T>({
  data,
  mockData,
  status,
}: OfflineSupportOptions<T>): OfflineSupportResult<T> {
  
  const result = useMemo(() => {
    // Check if we're in an error state (likely offline or network issue)
    const isOffline = status === 'error' || (!data && status !== 'pending');
    
    // Determine what data to return
    let modifiedData: T;
    
    if (data) {
      // We have real data, use it
      modifiedData = data;
    } else if (isOffline && mockData) {
      // We're offline or have an error, use mock data
      modifiedData = mockData;
    } else {
      // No data available, return mock data as fallback
      modifiedData = mockData;
    }
    
    return {
      isOffline,
      modifiedData,
    };
  }, [data, mockData, status]);
  
  return result;
}

/**
 * Simple offline detection hook
 */
export function useIsOnline(): boolean {
  // In a real implementation, this would use navigator.onLine
  // and listen for online/offline events
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Hook for checking network status
 */
export function useNetworkStatus() {
  const isOnline = useIsOnline();
  
  return {
    isOnline,
    isOffline: !isOnline,
    connectionType: 'unknown', // Could be enhanced with Network Information API
  };
}

export default useOfflineSupport;
