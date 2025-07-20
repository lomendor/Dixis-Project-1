'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Temporary simplified types
interface Producer {
  id: number;
  business_name: string;
  description?: string;
  region?: string;
  rating?: number;
  is_verified?: boolean;
  is_featured?: boolean;
  created_at?: string;
}

interface ProducerFilters {
  search?: string;
  region?: string;
  min_rating?: number;
  is_verified?: boolean;
  is_featured?: boolean;
  sort_by?: string;
  sort_dir?: string;
  page?: number;
  per_page?: number;
}

interface ProducerListResponse {
  data: Producer[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  regions?: string[];
}

// Temporary mock data
const mockProducers: Producer[] = [
  { id: 1, business_name: "Φάρμα Αλεξόπουλου", region: "Κρήτη", rating: 4.5, is_verified: true, is_featured: true },
  { id: 2, business_name: "Βιολογικές Καλλιέργειες Παπαδάκη", region: "Πελοπόννησος", rating: 4.2, is_verified: true, is_featured: false },
];

// Temporary query keys
const producerKeys = {
  all: ['producers'] as const,
  lists: () => [...producerKeys.all, 'list'] as const,
  list: (filters: ProducerFilters) => [...producerKeys.lists(), filters] as const,
  details: () => [...producerKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...producerKeys.details(), id] as const,
  products: (id: number | string) => [...producerKeys.detail(id), 'products'] as const,
  media: (id: number | string) => [...producerKeys.detail(id), 'media'] as const,
  reviews: (id: number | string) => [...producerKeys.detail(id), 'reviews'] as const,
  questions: (id: number | string, page?: number) => [...producerKeys.detail(id), 'questions', page] as const,
  seasonality: (id: number | string) => [...producerKeys.detail(id), 'seasonality'] as const,
  environmental: (id: number | string) => [...producerKeys.detail(id), 'environmental'] as const,
  featured: () => [...producerKeys.all, 'featured'] as const,
  dashboardStats: () => [...producerKeys.all, 'dashboard-stats'] as const,
};

/**
 * Hook για λήψη λίστας παραγωγών με φιλτράρισμα
 * 
 * @param params Παράμετροι φιλτραρίσματος και σελιδοποίησης
 * @returns Λίστα παραγωγών και πληροφορίες σελιδοποίησης
 */
export function useProducers(params: ProducerFilters = {}) {
  return useQuery<ProducerListResponse>({
    queryKey: producerKeys.list(params),
    queryFn: async () => {
      return getFallbackProducers(params);
    },
    staleTime: 5 * 60 * 1000, // 5 λεπτά
    gcTime: 10 * 60 * 1000, // 10 λεπτά
  });
}

/**
 * Hook για λήψη ενός συγκεκριμένου παραγωγού
 * 
 * @param id ID του παραγωγού
 * @returns Δεδομένα παραγωγού
 */
export function useProducer(id: number | string) {
  return useQuery<Producer>({
    queryKey: producerKeys.detail(id),
    queryFn: async () => {
      const result = getFallbackProducer(id);
      if (!result) throw new Error('Producer not found');
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 λεπτά
    gcTime: 10 * 60 * 1000, // 10 λεπτά
    enabled: !!id
  });
}

/**
 * Hook για λήψη προβεβλημένων παραγωγών
 * 
 * @param limit Αριθμός παραγωγών προς επιστροφή
 * @returns Λίστα προβεβλημένων παραγωγών
 */
export function useFeaturedProducers(limit: number = 3) {
  return useQuery<{ data: Producer[] }>({
    queryKey: producerKeys.featured(),
    queryFn: async () => {
      return { 
        data: getFallbackFeaturedProducers(limit) 
      };
    },
    staleTime: 10 * 60 * 1000, // 10 λεπτά
    gcTime: 30 * 60 * 1000, // 30 λεπτά
  });
}

// Βοηθητικές συναρτήσεις για fallback data

function getFallbackProducers(params: ProducerFilters = {}): ProducerListResponse {
  let filteredProducers = [...mockProducers];
  
  // Εφαρμογή φίλτρων
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredProducers = filteredProducers.filter((producer: Producer) =>
      producer.business_name.toLowerCase().includes(searchLower) ||
      (producer.description && producer.description.toLowerCase().includes(searchLower))
    );
  }
  
  if (params.region) {
    filteredProducers = filteredProducers.filter((producer: Producer) =>
      producer.region === params.region
    );
  }
  
  if (params.min_rating !== undefined) {
    filteredProducers = filteredProducers.filter((producer: Producer) =>
      producer.rating !== null && producer.rating !== undefined && producer.rating >= (params.min_rating || 0)
    );
  }
  
  if (params.is_verified !== undefined) {
    filteredProducers = filteredProducers.filter((producer: Producer) =>
      producer.is_verified === params.is_verified
    );
  }
  
  if (params.is_featured !== undefined) {
    filteredProducers = filteredProducers.filter((producer: Producer) =>
      producer.is_featured === params.is_featured
    );
  }
  
  // Ταξινόμηση
  if (params.sort_by) {
    const sortDir = params.sort_dir === 'desc' ? -1 : 1;
    
    switch (params.sort_by) {
      case 'business_name':
        filteredProducers.sort((a, b) => sortDir * a.business_name.localeCompare(b.business_name));
        break;
      case 'rating':
        filteredProducers.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return sortDir * (ratingB - ratingA);
        });
        break;
      case 'created_at':
        filteredProducers.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return sortDir * (dateB - dateA);
        });
        break;
      case 'id':
        filteredProducers.sort((a, b) => sortDir * (a.id - b.id));
        break;
    }
  }
  
  // Σελιδοποίηση
  const page = params.page || 1;
  const perPage = params.per_page || 10;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedProducers = filteredProducers.slice(startIndex, endIndex);
  
  // Επιστροφή μιας δομής παρόμοιας με αυτή του API
  return {
    data: paginatedProducers,
    current_page: page,
    last_page: Math.ceil(filteredProducers.length / perPage),
    total: filteredProducers.length,
    per_page: perPage,
    regions: [...new Set(mockProducers.map((p: Producer) => p.region).filter(Boolean))] as string[]
  };
}

function getFallbackProducer(id: number | string): Producer | undefined {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  return mockProducers.find((p: Producer) => p.id === numericId);
}

function getFallbackFeaturedProducers(limit: number = 3): Producer[] {
  return mockProducers
    .filter((producer: Producer) => producer.is_featured)
    .slice(0, limit);
}