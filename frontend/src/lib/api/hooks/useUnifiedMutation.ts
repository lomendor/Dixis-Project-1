'use client';

import { 
  useMutation, 
  UseMutationOptions, 
  UseMutationResult,
  QueryClient,
  useQueryClient
} from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { useNetworkState } from './useNetworkState';
import { ApiError, ApiResponse, HttpMethod } from '../client/apiTypes';
import { useError } from '@/providers/ErrorProvider';
import { logger } from '@/utils/logger';

/**
 * Επιλογές για το API mutation
 */
export interface ApiMutationOptions {
  timeout?: number;
  offlineMode?: 'queue' | 'error' | 'optimistic';
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * Επιλογές για το useUnifiedMutation hook
 */
export interface UnifiedMutationOptions<TData = unknown, TVariables = unknown, TContext = unknown> 
  extends Omit<UseMutationOptions<TData, ApiError, TVariables, TContext>, 'mutationFn'> {
  apiOptions?: ApiMutationOptions;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  invalidateQueries?: string[][];
  domain?: string;
}

/**
 * Τύπος για τη συνάρτηση mutation
 */
export type MutationFunction<TData = unknown, TVariables = unknown> = 
  (data: TVariables, options?: ApiMutationOptions) => Promise<ApiResponse<TData>>;

/**
 * Το κύριο hook για mutations με υποστήριξη offline
 * 
 * @param method - HTTP μέθοδος (GET, POST, PUT, PATCH, DELETE)
 * @param mutationFn - Η συνάρτηση που εκτελεί το mutation
 * @param options - Επιλογές για το mutation και το API call
 * @param queryClient - Προαιρετικό instance του QueryClient
 * @returns Το αποτέλεσμα του mutation
 */
export function useUnifiedMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  method: HttpMethod,
  mutationFn: MutationFunction<TData, TVariables>,
  options?: UnifiedMutationOptions<TData, TVariables, TContext>,
  queryClient?: QueryClient
): UseMutationResult<TData, ApiError, TVariables, TContext> {
  // Πρόσβαση στο QueryClient αν δεν έχει παρασχεθεί
  const defaultQueryClient = useQueryClient();
  const client = queryClient || defaultQueryClient;
  
  // Χρήση του ErrorProvider για διαχείριση των toast
  const { showError } = useError();
  
  // Εξαγωγή παραμέτρων και επιλογών
  const domain = options?.domain || 'app';
  
  // Network state για έλεγχο σύνδεσης και offline mode
  const {
    online,
    hasResourceError,
    markConnectionSuccess,
    markConnectionFailure,
    shouldUseFallback,
    checkConnection
  } = useNetworkState(domain);
  
  // Επιλογές για το API call
  const apiOptions = options?.apiOptions || {};
  
  // Αναφορά για offline mutations που είναι σε αναμονή
  const pendingOfflineMutationsRef = useRef<{
    variables: TVariables;
    timestamp: Date;
    retries: number;
  }[]>([]);
  
  // Βασική συνάρτηση mutation που θα χρησιμοποιηθεί στο useMutation
  const wrappedMutationFn = useCallback(async (variables: TVariables): Promise<TData> => {
    // Ανανεώνουμε πρώτα την κατάσταση δικτύου
    checkConnection();
    
    // Έλεγχος αν μπορούμε να εκτελέσουμε το mutation
    const useFallback = shouldUseFallback();
    
    if (useFallback && online === false) {
      logger.warn(`Cannot perform ${method} operation while offline`, {
        context: {
          feature: domain,
          action: 'offlineMutation'
        },
        data: { method, variables }
      });
      
      // Αν το offlineMode είναι error, κάνουμε throw ένα σφάλμα
      if (apiOptions.offlineMode === 'error') {
        const error = new Error('Cannot perform operations while offline') as ApiError;
        error.type = 'network';
        error.status = 0;
        throw error;
      }
      
      // Αν το offlineMode είναι queue, προσθέτουμε το mutation στην ουρά
      if (apiOptions.offlineMode === 'queue') {
        logger.info(`Queueing ${method} operation for later`, {
          context: {
            feature: domain,
            action: 'queueMutation'
          },
          data: { method, variables }
        });
        
        pendingOfflineMutationsRef.current.push({
          variables,
          timestamp: new Date(),
          retries: 0
        });
        
        // Αποθήκευση στο localStorage για persistence
        if (typeof localStorage !== 'undefined') {
          try {
            const key = `offline_mutations_${domain}_${method}`;
            const existingData = localStorage.getItem(key);
            const existingMutations = existingData ? JSON.parse(existingData) : [];
            
            localStorage.setItem(key, JSON.stringify([
              ...existingMutations,
              {
                variables,
                timestamp: new Date().toISOString(),
                retries: 0
              }
            ]));
          } catch (storageError) {
            logger.error('Error storing offline mutation in localStorage', {
              context: {
                feature: domain,
                action: 'storeMutation'
              },
              data: storageError
            });
          }
        }
        
        // Επιστρέφουμε ένα κενό αποτέλεσμα
        return null as TData;
      }
      
      // Αν το offlineMode είναι optimistic, συνεχίζουμε με το optimistic update
      // που θα χειριστεί το onMutate callback του useMutation
    }
    
    if (useFallback && hasResourceError) {
      logger.warn(`Cannot perform ${method} operation due to resource limitations`, {
        context: {
          feature: domain,
          action: 'resourceLimitedMutation'
        },
        data: { method, variables }
      });
      
      const error = new Error('Cannot perform operations due to resource limitations') as ApiError;
      error.type = 'resource';
      error.status = 0;
      throw error;
    }
    
    try {
      // Εκτέλεση του mutation
      const result = await mutationFn(variables, apiOptions);
      
      // Επισήμανση επιτυχίας σύνδεσης
      markConnectionSuccess();
      
      // Επιστροφή των δεδομένων
      return result.data;
    } catch (error) {
      // Σημειώνουμε την αποτυχία σύνδεσης
      markConnectionFailure(error);
      
      // Επαναφορούμε το σφάλμα
      throw error;
    }
  }, [
    method,
    mutationFn,
    domain,
    apiOptions,
    online,
    hasResourceError,
    shouldUseFallback,
    checkConnection,
    markConnectionSuccess,
    markConnectionFailure
  ]);
  
  // Συνάρτηση για προετοιμασία toast μηνύματος επιτυχίας
  const getSuccessMessage = useCallback((method: HttpMethod): string => {
    if (options?.successMessage) {
      return options.successMessage;
    }
    
    switch (method) {
      case 'POST':
        return 'Η δημιουργία ολοκληρώθηκε με επιτυχία.';
      case 'PUT':
      case 'PATCH':
        return 'Η ενημέρωση ολοκληρώθηκε με επιτυχία.';
      case 'DELETE':
        return 'Η διαγραφή ολοκληρώθηκε με επιτυχία.';
      default:
        return 'Η ενέργεια ολοκληρώθηκε με επιτυχία.';
    }
  }, [options?.successMessage]);
  
  // Προσθήκη event listener για επαναλήψεις queued mutations όταν επανέρχεται το δίκτυο
  useEffect(() => {
    // Εκτέλεση queued mutations όταν επανέρχεται το δίκτυο
    if (online && pendingOfflineMutationsRef.current.length > 0) {
      logger.info(`Attempting to process ${pendingOfflineMutationsRef.current.length} queued mutations`, {
        context: {
          feature: domain,
          action: 'processQueuedMutations'
        }
      });
      
      // Αντιγραφή της ουράς για να μην έχουμε race conditions
      const queuedMutations = [...pendingOfflineMutationsRef.current];
      // Καθαρισμός της ουράς
      pendingOfflineMutationsRef.current = [];
      
      // Προσπάθεια εκτέλεσης των queued mutations
      for (const mutation of queuedMutations) {
        wrappedMutationFn(mutation.variables)
          .then(() => {
            logger.info(`Successfully processed queued mutation from ${mutation.timestamp}`, {
              context: {
                feature: domain,
                action: 'queuedMutationSuccess'
              }
            });
          })
          .catch((error) => {
            logger.error(`Failed to process queued mutation from ${mutation.timestamp}`, {
              context: {
                feature: domain,
                action: 'queuedMutationError'
              },
              data: error
            });
            
            // Αν έχουμε λιγότερες από 3 προσπάθειες, ξαναπροσθέτουμε το mutation στην ουρά
            if (mutation.retries < 3) {
              pendingOfflineMutationsRef.current.push({
                ...mutation,
                retries: mutation.retries + 1
              });
            }
          });
      }
      
      // Καθαρισμός του localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          const key = `offline_mutations_${domain}_${method}`;
          localStorage.removeItem(key);
        } catch (storageError) {
          logger.error('Error clearing offline mutations from localStorage', {
            context: {
              feature: domain,
              action: 'clearStoredMutations'
            },
            data: storageError
          });
        }
      }
    }
  }, [online, domain, method, wrappedMutationFn]);
  
  // Χρήση του React Query Mutation hook
  const mutationResult = useMutation<TData, ApiError, TVariables, TContext>({
    mutationFn: wrappedMutationFn,
    
    // onSuccess callback
    onSuccess: (data, variables, context) => {
      // Ακύρωση των queries που επηρεάζονται από αυτή την mutation
      if (options?.invalidateQueries && options.invalidateQueries.length > 0) {
        options.invalidateQueries.forEach(queryKey => {
          client.invalidateQueries({ queryKey });
        });
      }
      
      // Εμφάνιση toast επιτυχίας αν έχει οριστεί
      if (options?.showSuccessToast !== false) {
        showError({
          error: getSuccessMessage(method),
          title: 'Επιτυχία',
          type: 'toast',
          autoDisappear: true,
          disappearAfter: 3000
        });
      }
      
      // Κλήση του αρχικού onSuccess callback αν υπάρχει
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    
    // onError callback
    onError: (error, variables, context) => {
      // Εμφάνιση toast σφάλματος αν έχει οριστεί
      if (options?.showErrorToast !== false) {
        showError({
          error,
          title: error.code || 'Σφάλμα',
          message: error.message,
          type: 'toast',
          autoDisappear: true
        });
      }
      
      // Κλήση του αρχικού onError callback αν υπάρχει
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    
    // Υπόλοιπες επιλογές από το options
    ...options
  });
  
  return mutationResult;
}

export default useUnifiedMutation;