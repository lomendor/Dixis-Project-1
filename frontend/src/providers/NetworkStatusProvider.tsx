'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface NetworkStatusContextType {
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isOffline: boolean;
  isSlowConnection: boolean;
  retryConnection: () => Promise<boolean>;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

interface NetworkStatusProviderProps {
  children: ReactNode;
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({ children }) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  const updateNetworkStatus = () => {
    if (typeof navigator === 'undefined') return;

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    const newStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      isSlowConnection: false,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0
    };

    // Determine if connection is slow
    if (connection) {
      newStatus.isSlowConnection = 
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        (connection.downlink && connection.downlink < 1.5) ||
        (connection.rtt && connection.rtt > 300);
    }

    setNetworkStatus(newStatus);
  };

  const retryConnection = async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('http://localhost:8000/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const isConnected = response.ok;
      
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: isConnected
      }));
      
      return isConnected;
    } catch (error) {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false
      }));
      return false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    updateNetworkStatus();

    const handleOnline = () => {
      updateNetworkStatus();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false
      }));
    };

    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const value: NetworkStatusContextType = {
    networkStatus,
    isOnline: networkStatus.isOnline,
    isOffline: !networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
    retryConnection
  };

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatusContext = (): NetworkStatusContextType => {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error('useNetworkStatusContext must be used within a NetworkStatusProvider');
  }
  return context;
};

export const useNetworkStatus = () => {
  const { networkStatus, isOnline, isOffline, isSlowConnection, retryConnection } = useNetworkStatusContext();
  return { networkStatus, isOnline, isOffline, isSlowConnection, retryConnection };
};

export default NetworkStatusProvider;
