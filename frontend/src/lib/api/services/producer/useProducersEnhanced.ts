'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useQuery } from '@tanstack/react-query';
import { Producer, ProducerFilters } from '@/lib/api/models/producer/types';
import { mockProducers } from '@/lib/api/models/producer/mockData';
import { QueryKeys } from '@/lib/api/utils/queryUtils';
import { logger } from '@/utils/logger';
import { API_ENDPOINTS } from '@/lib/apiConstants';

// Real API call to Laravel backend
const fetchProducers = async (filters?: ProducerFilters): Promise<Producer[]> => {
  logger.info('Fetching producers from Laravel API with filters:', filters);
  
  try {
    const queryParams = new URLSearchParams();
    
    if (filters?.search) {
      queryParams.append('search', filters.search);
    }
    if (filters?.location) {
      queryParams.append('location', filters.location);
    }
    if (filters?.specialties && filters.specialties.length > 0) {
      filters.specialties.forEach(specialty => {
        queryParams.append('specialties[]', specialty);
      });
    }
    
    const url = `${API_ENDPOINTS.PRODUCERS.LIST()}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch producers');
    }

    // Transform API response to match frontend types
    const transformedProducers: Producer[] = data.data.map((producer: any) => ({
      ...producer,
      // Parse specialties if they're JSON strings
      specialties: typeof producer.specialties === 'string' 
        ? JSON.parse(producer.specialties) 
        : producer.specialties || [],
    }));

    return transformedProducers;
  } catch (error) {
    logger.error('Failed to fetch producers from API, falling back to mock data:', toError(error), errorToContext(error));
    
    // Fallback to mock data if API fails
    let filteredProducers = [...mockProducers];
  
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducers = filteredProducers.filter(producer =>
          producer.business_name.toLowerCase().includes(searchLower) ||
          producer?.bio?.toLowerCase().includes(searchLower) ||
          producer?.location?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.location) {
        filteredProducers = filteredProducers.filter(producer =>
          producer?.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      if (filters.specialties && filters.specialties.length > 0) {
        filteredProducers = filteredProducers.filter(producer =>
          producer?.specialties?.some(specialty =>
            filters.specialties!.some(filterSpecialty =>
              specialty.toLowerCase().includes(filterSpecialty.toLowerCase())
            )
          )
        );
      }
      
      if (filters.verification_status) {
        filteredProducers = filteredProducers.filter(producer =>
          producer.verification_status === filters.verification_status
        );
      }
    }
    
    logger.info(`Returning ${filteredProducers.length} producers`);
    return filteredProducers;
  }
};

export const useEnhancedProducers = (filters?: ProducerFilters) => {
  const queryKey = filters ? [QueryKeys.PRODUCERS, filters] : [QueryKeys.PRODUCERS];
  
  const query = useQuery({
    queryKey,
    queryFn: () => fetchProducers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    producers: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
  };
};

// Fetch individual producer details
const fetchProducer = async (id: number): Promise<Producer> => {
  logger.info('Fetching producer with id:', id);
  
  try {
    const url = API_ENDPOINTS.PRODUCERS.DETAIL(id);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch producer');
    }

    // Transform API response to match frontend types
    const transformedProducer: Producer = {
      ...data.data,
      // Parse specialties if they're JSON strings
      specialties: typeof data.data.specialties === 'string' 
        ? JSON.parse(data.data.specialties) 
        : data.data.specialties || [],
    };

    return transformedProducer;
  } catch (error) {
    logger.error('Failed to fetch producer from API, falling back to mock data:', toError(error), errorToContext(error));
    
    // Fallback to mock data if API fails
    const producer = mockProducers.find(p => p.id === id);
    if (!producer) {
      throw new Error(`Producer with id ${id} not found`);
    }
    
    return producer;
  }
};

export const useEnhancedProducer = (id: number) => {
  const query = useQuery({
    queryKey: [QueryKeys.PRODUCERS, id],
    queryFn: () => fetchProducer(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!id,
  });

  return {
    producer: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
  };
};
