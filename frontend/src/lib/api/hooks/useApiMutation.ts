'use client';

import { useMutation, useQueryClient, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useNetworkAwareApi } from './useNetworkAwareApi';
import { ApiError, ApiOptions, ApiResponse, HttpMethod } from '../client/apiTypes';
import apiClient from '../client/apiClient';
import { useError } from '@/providers/ErrorProvider';
// import { getErrorSummary } from '../core/apiErrors'; // Temporarily commented out

/**
 * Επιλογές για το useApiMutation hook
 */
export interface ApiMutationOptions<TData, TVariables> {
  apiOptions?: ApiOptions;
  mutationOptions?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  invalidateQueries?: string[];
}

/**
 * Hook για εκτέλεση API mutations με network-aware λειτουργικότητα
 * @param method - Η HTTP μέθοδος (POST, PUT, DELETE, PATCH)
 * @param endpoint - Το endpoint του API
 * @param options - Επιλογές για το API call και το React Query
 * @param domain - Το domain του service για το caching (π.χ. 'products', 'auth')
 * @returns Το αποτέλεσμα του useMutation
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  method: HttpMethod,
  endpoint: string,
  options?: ApiMutationOptions<TData, TVariables>,
  domain: string = 'api'
): UseMutationResult<TData, ApiError, TVariables> {
  // Χρήση του network-aware API
  const networkAwareApi = useNetworkAwareApi(options?.apiOptions, domain);
  
  // Χρήση του query client για cache invalidation
  const queryClient = useQueryClient();
  
  // Χρήση του error provider για toasts
  const { showError } = useError();
  
  // Εκτέλεση του useMutation
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      // Έλεγχος αν πρέπει να χρησιμοποιηθεί το API
      if (!networkAwareApi.shouldUseApi) {
        throw {
          code: 'OFFLINE_ERROR',
          message: 'Δεν μπορείτε να εκτελέσετε αυτή την ενέργεια σε λειτουργία εκτός σύνδεσης.',
          status: 0,
          type: 'network'
        } as ApiError;
      }

      try {
        let response;
        const config = {
          timeout: options?.apiOptions?.timeout || 30000
        };
        
        // Εκτέλεση του κατάλληλου API call ανάλογα με τη μέθοδο
        switch (method) {
          case 'GET':
            response = await apiClient.get<ApiResponse<TData>>(endpoint, { 
              params: variables as Record<string, any>,
              ...config
            });
            break;
          case 'POST':
            response = await apiClient.post<ApiResponse<TData>>(endpoint, variables, config);
            break;
          case 'PUT':
            response = await apiClient.put<ApiResponse<TData>>(endpoint, variables, config);
            break;
          case 'PATCH':
            response = await apiClient.patch<ApiResponse<TData>>(endpoint, variables, config);
            break;
          case 'DELETE':
            response = await apiClient.delete<ApiResponse<TData>>(
              variables ? `${endpoint}/${String(variables)}` : endpoint,
              config
            );
            break;
          default:
            throw new Error(`Μη υποστηριζόμενη HTTP μέθοδος: ${method}`);
        }
        
        // Επισήμανση επιτυχίας σύνδεσης
        networkAwareApi.markConnectionSuccess();
        
        // Επιστροφή των δεδομένων από το response
        return response.data.data as TData;
      } catch (error) {
        // Χειρισμός σφάλματος μέσω του network-aware API
        const apiError = await networkAwareApi.handleApiError<ApiError>(error, endpoint, variables);
        throw apiError;
      }
    },
    
    // onSuccess handler - Εμφάνιση toast επιτυχίας και invalidation queries
    onSuccess: (data, variables, context) => {
      // Ακύρωση των queries που επηρεάζονται από αυτή την mutation
      if (options?.invalidateQueries && options.invalidateQueries.length > 0) {
        options.invalidateQueries.forEach(query => {
          queryClient.invalidateQueries({ queryKey: [query] });
        });
      }
      
      // Εμφάνιση toast επιτυχίας
      if (options?.showSuccessToast !== false) {
        showError({
          error: options?.successMessage || getDefaultSuccessMessage(method),
          title: 'Επιτυχία',
          type: 'toast',
          autoDisappear: true,
          disappearAfter: 3000
        });
      }
      
      // Κλήση του αρχικού onSuccess callback
      if (options?.mutationOptions?.onSuccess) {
        options.mutationOptions.onSuccess(data, variables, context);
      }
    },
    
    // onError handler - Εμφάνιση toast σφάλματος
    onError: (error, variables, context) => {
      // Εμφάνιση toast σφάλματος
      if (options?.showErrorToast !== false) {
        const errorMessage = error?.message || 'API call failed';
        showError({
          error,
          title: 'Error',
          message: errorMessage,
          type: 'toast',
          autoDisappear: true
        });
      }
      
      // Κλήση του αρχικού onError callback
      if (options?.mutationOptions?.onError) {
        options.mutationOptions.onError(error, variables, context);
      }
    },
    
    // Υπόλοιπες επιλογές από το options?.mutationOptions
    ...options?.mutationOptions
  });
}

/**
 * Επιστρέφει προεπιλεγμένο μήνυμα επιτυχίας με βάση τη μέθοδο
 * @param method - Η HTTP μέθοδος
 * @returns Προεπιλεγμένο μήνυμα επιτυχίας
 */
function getDefaultSuccessMessage(method: HttpMethod): string {
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
}

/**
 * Hook για δημιουργία νέου πόρου
 * @param resourceType - Ο τύπος του πόρου (π.χ. 'products', 'orders')
 * @param options - Επιλογές για το API call και το React Query
 * @param domain - Το domain του service
 * @returns Το αποτέλεσμα του useMutation
 */
export function useApiCreate<TData = unknown, TVariables = unknown>(
  resourceType: string,
  options?: ApiMutationOptions<TData, TVariables>,
  domain: string = 'api'
): UseMutationResult<TData, ApiError, TVariables> {
  return useApiMutation<TData, TVariables>(
    'POST',
    `/${resourceType}`,
    {
      invalidateQueries: [resourceType, ...(options?.invalidateQueries || [])],
      successMessage: 'Η δημιουργία ολοκληρώθηκε με επιτυχία.',
      ...options
    },
    domain || resourceType
  );
}

/**
 * Hook για ενημέρωση υπάρχοντος πόρου
 * @param resourceType - Ο τύπος του πόρου (π.χ. 'products', 'orders')
 * @param id - Το ID του πόρου
 * @param options - Επιλογές για το API call και το React Query
 * @param domain - Το domain του service
 * @returns Το αποτέλεσμα του useMutation
 */
export function useApiUpdate<TData = unknown, TVariables = unknown>(
  resourceType: string,
  id: string | number,
  options?: ApiMutationOptions<TData, TVariables>,
  domain: string = 'api'
): UseMutationResult<TData, ApiError, TVariables> {
  return useApiMutation<TData, TVariables>(
    'PUT',
    `/${resourceType}/${id}`,
    {
      invalidateQueries: [resourceType, ...(options?.invalidateQueries || [])],
      successMessage: 'Η ενημέρωση ολοκληρώθηκε με επιτυχία.',
      ...options
    },
    domain || resourceType
  );
}

/**
 * Hook για διαγραφή υπάρχοντος πόρου
 * @param resourceType - Ο τύπος του πόρου (π.χ. 'products', 'orders')
 * @param id - Το ID του πόρου
 * @param options - Επιλογές για το API call και το React Query
 * @param domain - Το domain του service
 * @returns Το αποτέλεσμα του useMutation
 */
export function useApiDelete<TData = unknown>(
  resourceType: string,
  id: string | number,
  options?: ApiMutationOptions<TData, string | number>,
  domain: string = 'api'
): UseMutationResult<TData, ApiError, string | number> {
  return useApiMutation<TData, string | number>(
    'DELETE',
    `/${resourceType}/${id}`,
    {
      invalidateQueries: [resourceType, ...(options?.invalidateQueries || [])],
      successMessage: 'Η διαγραφή ολοκληρώθηκε με επιτυχία.',
      ...options
    },
    domain || resourceType
  );
}

export default useApiMutation;