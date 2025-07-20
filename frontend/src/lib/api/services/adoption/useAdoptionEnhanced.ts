'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

// Enhanced Adoption Hooks - Following existing patterns from useProductsEnhanced.ts
// Single, consistent API pattern for all adoption operations

import { useQuery, useMutation, queryOptions, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';
import {
  AdoptableItem,
  Adoption,
  AdoptionUpdate,
  AdoptableItemsResponse,
  AdoptionsResponse,
  AdoptionUpdatesResponse,
  AdoptionFilterOptions,
  CreateAdoptionData,
  AdoptionUpdateData
} from '../../models/adoption/types';

// ===== QUERY KEYS =====
export const AdoptionQueryKeys = {
  adoptableItems: {
    all: ['adoptable-items'] as const,
    lists: () => [...AdoptionQueryKeys.adoptableItems.all, 'list'] as const,
    list: (filters: AdoptionFilterOptions) => [...AdoptionQueryKeys.adoptableItems.lists(), filters] as const,
    details: () => [...AdoptionQueryKeys.adoptableItems.all, 'detail'] as const,
    detail: (slug: string) => [...AdoptionQueryKeys.adoptableItems.details(), slug] as const,
  },
  adoptions: {
    all: ['adoptions'] as const,
    lists: () => [...AdoptionQueryKeys.adoptions.all, 'list'] as const,
    list: (filters?: any) => [...AdoptionQueryKeys.adoptions.lists(), filters] as const,
    details: () => [...AdoptionQueryKeys.adoptions.all, 'detail'] as const,
    detail: (id: number) => [...AdoptionQueryKeys.adoptions.details(), id] as const,
  },
  updates: {
    all: ['adoption-updates'] as const,
    lists: () => [...AdoptionQueryKeys.updates.all, 'list'] as const,
    list: (adoptionId: number) => [...AdoptionQueryKeys.updates.lists(), adoptionId] as const,
  }
};

// ===== API BASE URL =====
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// ===== QUERY OPTIONS =====
const getQueryOptions = (options: any = {}) => ({
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  ...options
});

// ===== ADOPTABLE ITEMS QUERIES =====

/**
 * Get adoptable items with filtering
 */
export const adoptableItemsQueryOptions = (filters: AdoptionFilterOptions = {}) => {
  return queryOptions({
    queryKey: AdoptionQueryKeys.adoptableItems.list(filters),
    queryFn: async ({ signal }) => {
      try {
        // Clean params
        const cleanParams = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        const queryString = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
        const fullUrl = `${API_BASE}/adoptable-items${queryString}`;

        logger.debug('Fetching adoptable items:', { url: fullUrl });

        const response = await fetch(fullUrl, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: AdoptableItemsResponse = await response.json();
        return data;
      } catch (error) {
        logger.error('Failed to fetch adoptable items:', toError(error), errorToContext(error));
        throw error;
      }
    },
    ...getQueryOptions({
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  });
};

/**
 * Get single adoptable item by slug
 */
export const adoptableItemDetailQueryOptions = (slug: string) => {
  return queryOptions({
    queryKey: AdoptionQueryKeys.adoptableItems.detail(slug),
    queryFn: async ({ signal }) => {
      try {
        const fullUrl = `${API_BASE}/adoptable-items/${slug}`;

        logger.debug('Fetching adoptable item:', { url: fullUrl });

        const response = await fetch(fullUrl, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: AdoptableItem = await response.json();
        return data;
      } catch (error) {
        logger.error('Failed to fetch adoptable item:', toError(error), errorToContext(error));
        throw error;
      }
    },
    ...getQueryOptions({
      staleTime: 10 * 60 * 1000, // 10 minutes for individual items
    })
  });
};

// ===== HOOKS =====

/**
 * Hook to get adoptable items
 */
export const useAdoptableItems = (filters: AdoptionFilterOptions = {}) => {
  return useQuery(adoptableItemsQueryOptions(filters));
};

/**
 * Hook to get single adoptable item
 */
export const useAdoptableItem = (slug: string) => {
  return useQuery(adoptableItemDetailQueryOptions(slug));
};

/**
 * Hook to get user's adoptions
 */
export const useUserAdoptions = (filters: any = {}) => {
  return useQuery({
    queryKey: AdoptionQueryKeys.adoptions.list(filters),
    queryFn: async ({ signal }) => {
      try {
        const cleanParams = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        const queryString = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
        const fullUrl = `${API_BASE}/adoptions${queryString}`;

        const response = await fetch(fullUrl, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: AdoptionsResponse = await response.json();
        return data;
      } catch (error) {
        logger.error('Failed to fetch adoptions:', toError(error), errorToContext(error));
        throw error;
      }
    },
    ...getQueryOptions()
  });
};

/**
 * Hook to get single adoption
 */
export const useAdoption = (id: number) => {
  return useQuery({
    queryKey: AdoptionQueryKeys.adoptions.detail(id),
    queryFn: async ({ signal }) => {
      try {
        const fullUrl = `${API_BASE}/adoptions/${id}`;

        const response = await fetch(fullUrl, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: Adoption = await response.json();
        return data;
      } catch (error) {
        logger.error('Failed to fetch adoption:', toError(error), errorToContext(error));
        throw error;
      }
    },
    ...getQueryOptions()
  });
};

/**
 * Hook to get adoption updates
 */
export const useAdoptionUpdates = (adoptionId: number) => {
  return useQuery({
    queryKey: AdoptionQueryKeys.updates.list(adoptionId),
    queryFn: async ({ signal }) => {
      try {
        const fullUrl = `${API_BASE}/adoptions/${adoptionId}/updates`;

        const response = await fetch(fullUrl, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: AdoptionUpdatesResponse = await response.json();
        return data;
      } catch (error) {
        logger.error('Failed to fetch adoption updates:', toError(error), errorToContext(error));
        throw error;
      }
    },
    ...getQueryOptions()
  });
};

// ===== MUTATIONS =====

/**
 * Hook to create adoption
 */
export const useCreateAdoption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdoptionData) => {
      try {
        const response = await fetch(`${API_BASE}/adoptions`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        logger.error('Failed to create adoption:', toError(error), errorToContext(error));
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate adoptions queries
      queryClient.invalidateQueries({ queryKey: AdoptionQueryKeys.adoptions.all });
      queryClient.invalidateQueries({ queryKey: AdoptionQueryKeys.adoptableItems.all });
    }
  });
};

export default {
  useAdoptableItems,
  useAdoptableItem,
  useUserAdoptions,
  useAdoption,
  useAdoptionUpdates,
  useCreateAdoption
};
