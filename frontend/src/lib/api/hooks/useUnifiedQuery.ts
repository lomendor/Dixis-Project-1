'use client';

import { 
  useQuery, 
  useSuspenseQuery,
  UseQueryOptions, 
  UseQueryResult, 
  UseSuspenseQueryResult,
  QueryKey, 
  QueryClient,
  useQueryClient
} from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useNetworkState } from './useNetworkState';
import { ApiError, ApiResponse } from '../client/apiTypes';
import { logger } from '@/utils/logger';

/**
 * Επιλογές για το API call
 */
export interface ApiOptions {
  timeout?: number;
  offlineMode?: 'fallback' | 'error' | 'silent';
  retries?: number;
  headers?: Record<string, string>;
  defaultData?: any;
  suspense?: boolean;
}

/**
 * Συνδυασμένες επιλογές για το useUnifiedQuery
 */
export interface UnifiedQueryOptions<TData = unknown, TError = ApiError> 
  extends Omit<UseQueryOptions<ApiResponse<TData>, TError, TData>, 'queryKey' | 'queryFn'> {
  apiOptions?: ApiOptions;
  mockData?: TData;
  domain?: string;
}

/**
 * Τύπος για τη συνάρτηση ερωτήματος
 */
export type QueryFunction<TData = unknown, TParams = any> = 
  (params?: TParams, options?: ApiOptions) => Promise<ApiResponse<TData>>;

/**
 * Διαχείριση δεδομένων fallback
 */
type FallbackHandler<TData = unknown> = (queryKey: QueryKey, error?: any) => Promise<ApiResponse<TData> | null>;

/**
 * Τύπος για τα αποτελέσματα offline
 */
export interface OfflineQueryResult<TData = unknown> {
  loading: boolean;
  online: boolean;
  isOfflineData: boolean;
  lastOnlineUpdate: Date | null;
  offlineTimestamp: Date | null;
}

/**
 * Το κύριο hook για ερωτήματα με υποστήριξη offline
 * 
 * @param queryKey - Το κλειδί για το ερώτημα (cache key)
 * @param queryFn - Η συνάρτηση που εκτελεί το ερώτημα
 * @param options - Επιλογές για το ερώτημα και το API call
 * @param queryClient - Προαιρετικό instance του QueryClient
 * @returns Το αποτέλεσμα του ερωτήματος
 */
export function useUnifiedQuery<TData = unknown, TParams = any>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData, TParams>,
  options?: UnifiedQueryOptions<TData>,
  queryClient?: QueryClient
): UseQueryResult<TData, ApiError> & OfflineQueryResult {
  // Πρόσβαση στο QueryClient αν δεν έχει παρασχεθεί
  const defaultQueryClient = useQueryClient();
  const client = queryClient || defaultQueryClient;
  
  // Εξαγωγή παραμέτρων και επιλογών
  const domain = options?.domain || 'app';
  const params = queryKey.length > 1 && typeof queryKey[1] === 'object' ? queryKey[1] as TParams : undefined;
  
  // Network state για έλεγχο σύνδεσης και offline mode
  const {
    online,
    hasResourceError,
    connectionFailureCount,
    lastOnline,
    markConnectionSuccess,
    markConnectionFailure,
    shouldUseFallback,
    checkConnection
  } = useNetworkState(domain);
  
  // Αναφορά για το αν τα δεδομένα προέρχονται από offline cache
  const offlineDataRef = useRef<boolean>(false);
  const offlineTimestampRef = useRef<Date | null>(null);
  
  // Προεπιλεγμένες τιμές για τις επιλογές
  const {
    staleTime = 5 * 60 * 1000, // 5 λεπτά
    gcTime = 30 * 60 * 1000,   // 30 λεπτά
    refetchInterval = false,
    refetchOnWindowFocus = true,
    retry = 3,
    ...restOptions
  } = options || {};
  
  // Επιλογές για το API call
  const apiOptions = options?.apiOptions || {};
  
  // Fallback handler για offline mode και σφάλματα
  const getFallbackData: FallbackHandler<TData> = useCallback(async (queryKey, error) => {
    try {
      logger.debug(`Getting fallback data for ${JSON.stringify(queryKey)}`, {
        context: {
          feature: domain,
          action: 'getFallbackData'
        }
      });
      
      // Έλεγχος αν υπάρχουν cached δεδομένα στο React Query cache
      const cachedData = client.getQueryData<ApiResponse<TData>>(queryKey);
      if (cachedData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        logger.debug('Using cached data from React Query', {
          context: {
            feature: domain,
            action: 'useCachedData'
          }
        });
        
        return {
          ...cachedData,
          meta: {
            ...cachedData.meta,
            offline: true,
            cache: {
              hit: true,
              updated_at: lastOnline?.toISOString() || new Date().toISOString()
            }
          }
        };
      }
      
      // Αν δοθεί mockData στις επιλογές, χρησιμοποίησέ το
      if (options?.mockData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        logger.debug('Using provided mock data', {
          context: {
            feature: domain,
            action: 'useMockData'
          }
        });
        
        return {
          data: options.mockData,
          meta: {
            timestamp: new Date().toISOString(),
            offline: true,
            cache: {
              hit: true,
              mock: true
            }
          }
        };
      }
      
      // Αν δοθεί defaultData στο apiOptions, χρησιμοποίησέ το
      if (apiOptions.defaultData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        logger.debug('Using default data from API options', {
          context: {
            feature: domain,
            action: 'useDefaultData'
          }
        });
        
        return {
          data: apiOptions.defaultData,
          meta: {
            timestamp: new Date().toISOString(),
            offline: true,
            cache: {
              hit: true,
              default: true
            }
          }
        };
      }
      
      // Σε περίπτωση που δεν έχουμε τίποτα, επέστρεψε null
      logger.debug('No fallback data available', {
        context: {
          feature: domain,
          action: 'noFallbackData'
        }
      });
      
      return null;
    } catch (fallbackError) {
      logger.error('Error getting fallback data', {
        context: {
          feature: domain,
          action: 'fallbackDataError'
        },
        data: fallbackError
      });
      
      return null;
    }
  }, [client, domain, apiOptions, options, lastOnline]);
  
  // Συνάρτηση για χειρισμό σφαλμάτων
  const handleApiError = useCallback(async (error: any) => {
    logger.error(`API error for ${JSON.stringify(queryKey)}`, {
      context: {
        feature: domain,
        action: 'apiError'
      },
      data: error
    });
    
    // Σημειώνουμε την αποτυχία σύνδεσης
    markConnectionFailure(error);
    
    // Αν το offlineMode είναι error, κάνουμε throw το σφάλμα
    if (apiOptions.offlineMode === 'error') {
      throw error;
    }
    
    // Αλλιώς προσπαθούμε να βρούμε fallback δεδομένα
    const fallbackResult = await getFallbackData(queryKey, error);
    if (fallbackResult) {
      return fallbackResult;
    }
    
    // Αν δεν έχουμε fallback δεδομένα και το offlineMode είναι silent,
    // επιστρέφουμε κενό αποτέλεσμα
    if (apiOptions.offlineMode === 'silent') {
      offlineDataRef.current = true;
      offlineTimestampRef.current = new Date();
      
      return {
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          offline: true,
          error: {
            message: error.message,
            type: error.type
          }
        }
      } as ApiResponse<TData>;
    }
    
    // Αλλιώς κάνουμε throw το σφάλμα
    throw error;
  }, [queryKey, domain, apiOptions, getFallbackData, markConnectionFailure]);
  
  // Βασικό queryFn που θα χρησιμοποιηθεί στο useQuery
  const wrappedQueryFn = useCallback(async () => {
    // Έλεγχος αν πρέπει να χρησιμοποιήσουμε το κανονικό API ή fallback
    // Ανανεώνουμε πρώτα την κατάσταση δικτύου
    checkConnection();
    
    const useFallback = shouldUseFallback();
    
    if (useFallback) {
      logger.info(`Using fallback data for ${JSON.stringify(queryKey)} due to network conditions`, {
        context: {
          feature: domain,
          action: 'usingFallback'
        }
      });
      
      const fallbackData = await getFallbackData(queryKey);
      if (fallbackData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        return fallbackData;
      }
      
      // Αν δεν έχουμε fallback δεδομένα και το offlineMode είναι error, κάνουμε throw σφάλμα
      if (apiOptions.offlineMode === 'error') {
        throw new Error('Offline mode: No fallback data available');
      }
      
      // Αν το offlineMode είναι silent, επιστρέφουμε κενό αποτέλεσμα
      if (apiOptions.offlineMode === 'silent') {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        return {
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            offline: true
          }
        } as ApiResponse<TData>;
      }
    }
    
    // Αν φτάσουμε εδώ, είτε είμαστε online, είτε το offlineMode είναι error
    try {
      // Εκτέλεση του ερωτήματος
      const result = await queryFn(params as TParams, apiOptions);
      
      // Επισήμανση επιτυχίας σύνδεσης
      markConnectionSuccess();
      
      // Επαναφορά offline flags
      offlineDataRef.current = false;
      
      return result;
    } catch (error) {
      // Χειρισμός σφάλματος API
      return handleApiError(error);
    }
  }, [
    queryKey, 
    queryFn, 
    params, 
    apiOptions, 
    shouldUseFallback, 
    getFallbackData, 
    handleApiError, 
    markConnectionSuccess,
    checkConnection,
    domain
  ]);
  
  // Έλεγχος για επαναφορά μετά από offline
  useEffect(() => {
    if (online && offlineDataRef.current) {
      logger.info(`Back online, refetching data for ${JSON.stringify(queryKey)}`, {
        context: {
          feature: domain,
          action: 'refetchOnReconnect'
        }
      });
      
      // Invalidate the query to refetch when we're back online
      client.invalidateQueries({ queryKey });
    }
  }, [online, queryKey, client, domain]);
  
  // Χρήση του React Query hook
  const queryResult = useQuery<ApiResponse<TData>, ApiError, TData>({
    queryKey,
    queryFn: wrappedQueryFn,
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    retry: (failureCount, error) => {
      // Μην ξαναδοκιμάσεις για συγκεκριμένα σφάλματα
      if (error.status === 404 || error.status === 403 || error.status === 401) {
        return false;
      }
      
      // Μην ξαναδοκιμάσεις αν είμαστε offline
      if (!online) {
        return false;
      }
      
      // Δοκίμασε ξανά για σφάλματα δικτύου και server σφάλματα
      if (error.type === 'network' || error.type === 'server') {
        return failureCount < (retry as number);
      }
      
      return false;
    },
    select: (response) => response.data,
    ...restOptions,
  });
  
  // Επιστροφή του αποτελέσματος με επιπλέον πληροφορίες για offline κατάσταση
  return {
    ...queryResult,
    // Προσθήκη επιπλέον ιδιοτήτων για offline support
    online,
    isOfflineData: offlineDataRef.current,
    lastOnlineUpdate: lastOnline,
    offlineTimestamp: offlineTimestampRef.current,
    loading: queryResult.isPending
  };
}

/**
 * Hook για ερωτήματα με υποστήριξη Suspense
 */
export function useUnifiedSuspenseQuery<TData = unknown, TParams = any>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData, TParams>,
  options?: UnifiedQueryOptions<TData>,
  queryClient?: QueryClient
): UseSuspenseQueryResult<TData, ApiError> & OfflineQueryResult {
  // Σε αυτή την περίπτωση χρησιμοποιούμε το useSuspenseQuery αντί για το useQuery
  
  // Πρόσβαση στο QueryClient αν δεν έχει παρασχεθεί
  const defaultQueryClient = useQueryClient();
  const client = queryClient || defaultQueryClient;
  
  // Εξαγωγή παραμέτρων και επιλογών
  const domain = options?.domain || 'app';
  const params = queryKey.length > 1 && typeof queryKey[1] === 'object' ? queryKey[1] as TParams : undefined;
  
  // Network state για έλεγχο σύνδεσης και offline mode
  const {
    online,
    hasResourceError,
    connectionFailureCount,
    lastOnline,
    markConnectionSuccess,
    markConnectionFailure,
    shouldUseFallback,
    checkConnection
  } = useNetworkState(domain);
  
  // Αναφορά για το αν τα δεδομένα προέρχονται από offline cache
  const offlineDataRef = useRef<boolean>(false);
  const offlineTimestampRef = useRef<Date | null>(null);
  
  // Προεπιλεγμένες τιμές για τις επιλογές
  const {
    staleTime = 5 * 60 * 1000, // 5 λεπτά
    gcTime = 30 * 60 * 1000,   // 30 λεπτά
    ...restOptions
  } = options || {};
  
  // Επιλογές για το API call
  const apiOptions = options?.apiOptions || {};
  
  // Fallback handler για offline mode και σφάλματα
  const getFallbackData: FallbackHandler<TData> = useCallback(async (queryKey, error) => {
    // Ίδια υλοποίηση με το useUnifiedQuery
    try {
      logger.debug(`Getting fallback data for ${JSON.stringify(queryKey)}`, {
        context: {
          feature: domain,
          action: 'getFallbackData'
        }
      });
      
      // Έλεγχος αν υπάρχουν cached δεδομένα στο React Query cache
      const cachedData = client.getQueryData<ApiResponse<TData>>(queryKey);
      if (cachedData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        logger.debug('Using cached data from React Query', {
          context: {
            feature: domain,
            action: 'useCachedData'
          }
        });
        
        return {
          ...cachedData,
          meta: {
            ...cachedData.meta,
            offline: true,
            cache: {
              hit: true,
              updated_at: lastOnline?.toISOString() || new Date().toISOString()
            }
          }
        };
      }
      
      // Αν δοθεί mockData στις επιλογές, χρησιμοποίησέ το
      if (options?.mockData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        logger.debug('Using provided mock data', {
          context: {
            feature: domain,
            action: 'useMockData'
          }
        });
        
        return {
          data: options.mockData,
          meta: {
            timestamp: new Date().toISOString(),
            offline: true,
            cache: {
              hit: true,
              mock: true
            }
          }
        };
      }
      
      // Αν δοθεί defaultData στο apiOptions, χρησιμοποίησέ το
      if (apiOptions.defaultData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        logger.debug('Using default data from API options', {
          context: {
            feature: domain,
            action: 'useDefaultData'
          }
        });
        
        return {
          data: apiOptions.defaultData,
          meta: {
            timestamp: new Date().toISOString(),
            offline: true,
            cache: {
              hit: true,
              default: true
            }
          }
        };
      }
      
      // Σε περίπτωση που δεν έχουμε τίποτα, επέστρεψε null
      logger.debug('No fallback data available', {
        context: {
          feature: domain,
          action: 'noFallbackData'
        }
      });
      
      return null;
    } catch (fallbackError) {
      logger.error('Error getting fallback data', {
        context: {
          feature: domain,
          action: 'fallbackDataError'
        },
        data: fallbackError
      });
      
      return null;
    }
  }, [client, domain, apiOptions, options, lastOnline]);
  
  // Συνάρτηση για χειρισμό σφαλμάτων
  const handleApiError = useCallback(async (error: any) => {
    // Ίδια υλοποίηση με το useUnifiedQuery
    logger.error(`API error for ${JSON.stringify(queryKey)}`, {
      context: {
        feature: domain,
        action: 'apiError'
      },
      data: error
    });
    
    // Σημειώνουμε την αποτυχία σύνδεσης
    markConnectionFailure(error);
    
    // Σε Suspense mode, είναι καλύτερα να κάνουμε πάντα throw το σφάλμα
    // ώστε να πιαστεί από το error boundary
    // Αλλά αν έχουμε ρητά ορίσει offlineMode, το σεβόμαστε
    
    // Αν το offlineMode είναι error, κάνουμε throw το σφάλμα
    if (apiOptions.offlineMode === 'error') {
      throw error;
    }
    
    // Αλλιώς προσπαθούμε να βρούμε fallback δεδομένα
    const fallbackResult = await getFallbackData(queryKey, error);
    if (fallbackResult) {
      return fallbackResult;
    }
    
    // Αν δεν έχουμε fallback δεδομένα και το offlineMode είναι silent,
    // επιστρέφουμε κενό αποτέλεσμα
    if (apiOptions.offlineMode === 'silent') {
      offlineDataRef.current = true;
      offlineTimestampRef.current = new Date();
      
      return {
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          offline: true,
          error: {
            message: error.message,
            type: error.type
          }
        }
      } as ApiResponse<TData>;
    }
    
    // Αλλιώς κάνουμε throw το σφάλμα (default συμπεριφορά για Suspense)
    throw error;
  }, [queryKey, domain, apiOptions, getFallbackData, markConnectionFailure]);
  
  // Βασικό queryFn που θα χρησιμοποιηθεί στο useSuspenseQuery
  const wrappedQueryFn = useCallback(async () => {
    // Ίδια υλοποίηση με το useUnifiedQuery
    // Έλεγχος αν πρέπει να χρησιμοποιήσουμε το κανονικό API ή fallback
    // Ανανεώνουμε πρώτα την κατάσταση δικτύου
    checkConnection();
    
    const useFallback = shouldUseFallback();
    
    if (useFallback) {
      logger.info(`Using fallback data for ${JSON.stringify(queryKey)} due to network conditions`, {
        context: {
          feature: domain,
          action: 'usingFallback'
        }
      });
      
      const fallbackData = await getFallbackData(queryKey);
      if (fallbackData) {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        return fallbackData;
      }
      
      // Αν δεν έχουμε fallback δεδομένα και το offlineMode είναι error, κάνουμε throw σφάλμα
      if (apiOptions.offlineMode === 'error') {
        throw new Error('Offline mode: No fallback data available');
      }
      
      // Αν το offlineMode είναι silent, επιστρέφουμε κενό αποτέλεσμα
      if (apiOptions.offlineMode === 'silent') {
        offlineDataRef.current = true;
        offlineTimestampRef.current = new Date();
        
        return {
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            offline: true
          }
        } as ApiResponse<TData>;
      }
    }
    
    // Αν φτάσουμε εδώ, είτε είμαστε online, είτε το offlineMode είναι error
    try {
      // Εκτέλεση του ερωτήματος
      const result = await queryFn(params as TParams, apiOptions);
      
      // Επισήμανση επιτυχίας σύνδεσης
      markConnectionSuccess();
      
      // Επαναφορά offline flags
      offlineDataRef.current = false;
      
      return result;
    } catch (error) {
      // Χειρισμός σφάλματος API
      return handleApiError(error);
    }
  }, [
    queryKey, 
    queryFn, 
    params, 
    apiOptions, 
    shouldUseFallback, 
    getFallbackData, 
    handleApiError, 
    markConnectionSuccess,
    checkConnection,
    domain
  ]);
  
  // Χρήση του React Query Suspense hook
  const queryResult = useSuspenseQuery<ApiResponse<TData>, ApiError, TData>({
    queryKey,
    queryFn: wrappedQueryFn,
    staleTime,
    gcTime,
    select: (response) => response.data,
    ...restOptions,
  });
  
  // Επιστροφή του αποτελέσματος με επιπλέον πληροφορίες για offline κατάσταση
  return {
    ...queryResult,
    // Προσθήκη επιπλέον ιδιοτήτων για offline support
    online,
    isOfflineData: offlineDataRef.current,
    lastOnlineUpdate: lastOnline,
    offlineTimestamp: offlineTimestampRef.current,
    loading: false // Πάντα false σε Suspense mode
  };
}

export default useUnifiedQuery;