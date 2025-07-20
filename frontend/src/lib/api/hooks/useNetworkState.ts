'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

export interface NetworkState {
  online: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveDataMode: boolean | null;
  connectionQuality: 'offline' | 'poor' | 'fair' | 'good' | 'unknown';
  lastChecked: Date;
  lastOnline: Date | null;
  lastOffline: Date | null;
  isSlowConnection: boolean;
  hasResourceError: boolean;
  connectionFailureCount: number;
  lastConnectionAttempt: number | null;
}

interface NetworkStateHookResult extends NetworkState {
  checkConnection: () => void;
  simulateOffline: () => void;
  simulateOnline: () => void;
  markConnectionSuccess: () => void;
  markConnectionFailure: (error?: any) => void;
  disableApiCalls: () => void;
  enableApiCalls: () => void;
  shouldUseFallback: () => boolean;
}

/**
 * Custom hook για την παρακολούθηση και διαχείριση της κατάστασης δικτύου
 * Παρέχει πληροφορίες για την online/offline κατάσταση, την ποιότητα σύνδεσης,
 * και μεθόδους για διαχείριση σφαλμάτων δικτύου και πόρων
 * 
 * @param serviceDomain Το domain του service (π.χ. 'cart', 'product', 'auth')
 * @returns Αντικείμενο με την κατάσταση δικτύου και μεθόδους διαχείρισης
 */
export function useNetworkState(serviceDomain: string = 'app'): NetworkStateHookResult {
  // Ανάκτηση πληροφοριών σύνδεσης
  const getConnectionInfo = useCallback(() => {
    // Έλεγχος αν είμαστε στον browser
    if (typeof navigator === 'undefined') {
      return {
        connectionType: null,
        effectiveType: null,
        downlink: null,
        rtt: null,
        saveDataMode: null
      };
    }

    // Έλεγχος αν το Network Information API είναι διαθέσιμο
    // @ts-ignore - Το Network Information API δεν είναι standard ακόμα
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      return {
        connectionType: null,
        effectiveType: null,
        downlink: null,
        rtt: null,
        saveDataMode: null
      };
    }

    return {
      // @ts-ignore
      connectionType: connection.type || null,
      // @ts-ignore
      effectiveType: connection.effectiveType || null,
      // @ts-ignore
      downlink: connection.downlink || null,
      // @ts-ignore
      rtt: connection.rtt || null,
      // @ts-ignore
      saveDataMode: connection.saveData || null
    };
  }, []);

  // Υπολογισμός ποιότητας σύνδεσης από effectiveType
  const calculateConnectionQuality = useCallback((effectiveType: string | null, online: boolean): 'offline' | 'poor' | 'fair' | 'good' | 'unknown' => {
    if (!online) return 'offline';
    
    if (effectiveType) {
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'poor';
        case '3g':
          return 'fair';
        case '4g':
          return 'good';
        default:
          return 'unknown';
      }
    }
    
    return 'unknown';
  }, []);

  // Αρχικές καταστάσεις
  const [state, setState] = useState<NetworkState>(() => {
    // Έλεγχος online κατάστασης
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const now = new Date();
    
    // Λήψη πληροφοριών σύνδεσης
    const connection = getConnectionInfo();
    
    // Υπολογισμός ποιότητας σύνδεσης
    const quality = calculateConnectionQuality(connection.effectiveType, isOnline);
    
    // Έλεγχος για προηγούμενα σφάλματα πόρων
    let hasResourceError = false;
    let connectionFailureCount = 0;
    let lastConnectionAttempt = null;
    
    if (typeof localStorage !== 'undefined') {
      hasResourceError = localStorage.getItem(`${serviceDomain}_resource_error`) === 'true' || 
                         localStorage.getItem('has_resource_error') === 'true';
      
      connectionFailureCount = parseInt(localStorage.getItem(`${serviceDomain}_failure_count`) || 
                                        localStorage.getItem('connection_failure_count') || '0', 10);
      
      const lastAttempt = localStorage.getItem(`${serviceDomain}_last_attempt`) || 
                          localStorage.getItem('last_connection_attempt');
      
      if (lastAttempt) {
        lastConnectionAttempt = parseInt(lastAttempt, 10);
      }
    }
    
    return {
      online: isOnline,
      ...connection,
      connectionQuality: quality,
      lastChecked: now,
      lastOnline: isOnline ? now : null,
      lastOffline: !isOnline ? now : null,
      isSlowConnection: quality === 'poor' || quality === 'fair',
      hasResourceError,
      connectionFailureCount,
      lastConnectionAttempt
    };
  });
  
  // Έλεγχος σύνδεσης
  const checkConnection = useCallback(() => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const now = new Date();
    const connection = getConnectionInfo();
    const quality = calculateConnectionQuality(connection.effectiveType, isOnline);
    
    setState(prev => ({
      ...prev,
      ...connection,
      online: isOnline,
      connectionQuality: quality,
      lastChecked: now,
      lastOnline: isOnline ? now : prev.lastOnline,
      lastOffline: !isOnline ? now : prev.lastOffline,
      isSlowConnection: quality === 'poor' || quality === 'fair'
    }));
    
    // Καταγραφή
    logger.debug('Connection status checked', { 
      context: { 
        feature: serviceDomain, 
        action: 'checkConnection' 
      },
      data: { 
        online: isOnline, 
        quality, 
        ...connection 
      }
    });
  }, [getConnectionInfo, calculateConnectionQuality, serviceDomain]);
  
  // Χειρισμός αλλαγών στην κατάσταση online/offline
  const handleOnlineStatusChange = useCallback(() => {
    checkConnection();
    
    if (navigator.onLine) {
      // Επανήλθε η σύνδεση
      logger.info('Connection restored', { 
        context: { 
          feature: serviceDomain, 
          action: 'connectionRestored' 
        }
      });
    } else {
      // Χάθηκε η σύνδεση
      logger.warn('Connection lost', { 
        context: { 
          feature: serviceDomain, 
          action: 'connectionLost' 
        }
      });
    }
  }, [checkConnection, serviceDomain]);
  
  // Σήμανση επιτυχίας σύνδεσης
  const markConnectionSuccess = useCallback(() => {
    if (state.connectionFailureCount > 0) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${serviceDomain}_failure_count`, '0');
        localStorage.removeItem(`${serviceDomain}_last_attempt`);
      }
      
      setState(prev => ({
        ...prev,
        connectionFailureCount: 0,
        lastConnectionAttempt: null
      }));
      
      logger.debug('Connection success marked', { 
        context: { 
          feature: serviceDomain, 
          action: 'markConnectionSuccess' 
        }
      });
    }
  }, [state.connectionFailureCount, serviceDomain]);
  
  // Σήμανση αποτυχίας σύνδεσης
  const markConnectionFailure = useCallback((error?: any) => {
    const now = Date.now();
    const newCount = state.connectionFailureCount + 1;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${serviceDomain}_failure_count`, String(newCount));
      localStorage.setItem(`${serviceDomain}_last_attempt`, String(now));
    }
    
    setState(prev => ({
      ...prev,
      connectionFailureCount: newCount,
      lastConnectionAttempt: now
    }));
    
    logger.warn('Connection failure marked', { 
      context: { 
        feature: serviceDomain, 
        action: 'markConnectionFailure' 
      },
      data: error
    });
    
    // Έλεγχος αν το σφάλμα είναι ERR_INSUFFICIENT_RESOURCES
    if (error && 
        error.message && 
        typeof error.message === 'string' && 
        error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${serviceDomain}_resource_error`, 'true');
        localStorage.setItem('has_resource_error', 'true');
        localStorage.setItem('resource_error_timestamp', String(now));
      }
      
      setState(prev => ({
        ...prev,
        hasResourceError: true
      }));
      
      logger.error('Resource error detected', { 
        context: { 
          feature: serviceDomain, 
          action: 'resourceError' 
        },
        data: error
      });
    }
  }, [state.connectionFailureCount, serviceDomain]);
  
  // Έλεγχος αν πρέπει να χρησιμοποιηθεί fallback
  const shouldUseFallback = useCallback((): boolean => {
    // Άμεση χρήση fallback αν είμαστε offline
    if (!state.online) {
      return true;
    }
    
    // Χρήση fallback αν υπάρχει σφάλμα πόρων
    if (state.hasResourceError) {
      return true;
    }
    
    // Χρήση fallback αν υπάρχουν πολλαπλές αποτυχίες στις τελευταίες 30 δευτερόλεπτα
    const now = Date.now();
    if (state.connectionFailureCount >= 3 && 
        state.lastConnectionAttempt && 
        (now - state.lastConnectionAttempt) < 30000) {
      return true;
    }
    
    return false;
  }, [state.online, state.hasResourceError, state.connectionFailureCount, state.lastConnectionAttempt]);
  
  // Απενεργοποίηση API κλήσεων (π.χ. σε περίπτωση σφάλματος πόρων)
  const disableApiCalls = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${serviceDomain}_resource_error`, 'true');
      localStorage.setItem('has_resource_error', 'true');
    }
    
    setState(prev => ({
      ...prev,
      hasResourceError: true
    }));
    
    logger.info('API calls manually disabled', { 
      context: { 
        feature: serviceDomain, 
        action: 'disableApiCalls' 
      }
    });
  }, [serviceDomain]);
  
  // Ενεργοποίηση API κλήσεων
  const enableApiCalls = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`${serviceDomain}_resource_error`);
      localStorage.removeItem('has_resource_error');
    }
    
    setState(prev => ({
      ...prev,
      hasResourceError: false
    }));
    
    logger.info('API calls enabled', { 
      context: { 
        feature: serviceDomain, 
        action: 'enableApiCalls' 
      }
    });
  }, [serviceDomain]);
  
  // Προσομοίωση offline mode (για testing)
  const simulateOffline = useCallback(() => {
    setState(prev => ({
      ...prev,
      online: false,
      lastChecked: new Date(),
      lastOffline: new Date(),
      connectionQuality: 'offline'
    }));
    
    logger.debug('Simulating offline mode', { 
      context: { 
        feature: serviceDomain, 
        action: 'simulateOffline' 
      }
    });
  }, [serviceDomain]);
  
  // Προσομοίωση online mode (για testing)
  const simulateOnline = useCallback(() => {
    const connection = getConnectionInfo();
    const quality = calculateConnectionQuality(connection.effectiveType, true);
    
    setState(prev => ({
      ...prev,
      ...connection,
      online: true,
      connectionQuality: quality,
      lastChecked: new Date(),
      lastOnline: new Date(),
      isSlowConnection: quality === 'poor' || quality === 'fair'
    }));
    
    logger.debug('Simulating online mode', { 
      context: { 
        feature: serviceDomain, 
        action: 'simulateOnline' 
      }
    });
  }, [getConnectionInfo, calculateConnectionQuality, serviceDomain]);
  
  // Εγκατάσταση event listeners για online/offline κατάσταση
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Αρχικός έλεγχος σύνδεσης
      checkConnection();
      
      // Προσθήκη event listeners για online/offline
      window.addEventListener('online', handleOnlineStatusChange);
      window.addEventListener('offline', handleOnlineStatusChange);
      
      // Έλεγχος για σφάλματα πόρων
      if (typeof localStorage !== 'undefined') {
        const errorTimestamp = parseInt(localStorage.getItem('resource_error_timestamp') || '0', 10);
        const now = Date.now();
        const ERROR_RESET_WINDOW = 10 * 60 * 1000; // 10 λεπτά
        
        if (state.hasResourceError && errorTimestamp > 0 && (now - errorTimestamp) > ERROR_RESET_WINDOW) {
          // Αν έχει περάσει αρκετός χρόνος, επαναφέρουμε τη λειτουργία API
          enableApiCalls();
          
          logger.info('Resource error timeout expired, re-enabling API calls', { 
            context: { 
              feature: serviceDomain, 
              action: 'autoEnableApiCalls' 
            }
          });
        }
      }
      
      // Έλεγχος αλλαγών στο Network Information API αν υποστηρίζεται
      // @ts-ignore - Το Network Information API δεν είναι standard ακόμα
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        // @ts-ignore
        connection.addEventListener('change', checkConnection);
      }
      
      // Τακτικός έλεγχος σύνδεσης
      const intervalId = setInterval(checkConnection, 30000); // Κάθε 30 δευτερόλεπτα
      
      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnlineStatusChange);
        window.removeEventListener('offline', handleOnlineStatusChange);
        
        if (connection) {
          // @ts-ignore
          connection.removeEventListener('change', checkConnection);
        }
        
        clearInterval(intervalId);
      };
    }
  }, [checkConnection, handleOnlineStatusChange, state.hasResourceError, enableApiCalls, serviceDomain]);
  
  return {
    ...state,
    checkConnection,
    simulateOffline,
    simulateOnline,
    markConnectionSuccess,
    markConnectionFailure,
    disableApiCalls,
    enableApiCalls,
    shouldUseFallback
  };
}

export default useNetworkState;