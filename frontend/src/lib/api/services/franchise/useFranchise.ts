import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client/apiClient';
import { useTenantStore } from '@/stores/tenantStore';

// Types
export interface CreateFranchiseRequest {
  name: string;
  owner_email: string;
  owner_name: string;
  owner_password: string;
  plan: 'basic' | 'premium' | 'enterprise';
  domain?: string;
  trial_days?: number;
}

export interface UpdateTenantRequest {
  name?: string;
  plan?: 'basic' | 'premium' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  domain?: string;
  subscription_expires_at?: string;
  trial_ends_at?: string;
}

export interface UpdateThemeRequest {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  settings?: Record<string, any>;
}

export interface ProcessPayoutRequest {
  tenant_ids: number[];
  payout_reference: string;
}

// Franchise Management Hooks
export function useFranchises(params?: {
  status?: string;
  plan?: string;
  search?: string;
  per_page?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ['franchises', params],
    queryFn: async () => {
      const response = await apiClient.get('/api/franchise', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFranchise(tenantId: number) {
  return useQuery({
    queryKey: ['franchise', tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/franchise/${tenantId}`);
      return response.data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateFranchise() {
  const queryClient = useQueryClient();
  const { addTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (data: CreateFranchiseRequest) => {
      const response = await apiClient.post('/api/franchise', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update local store
      addTenant(data.tenant);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['franchises'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

export function useUpdateFranchise() {
  const queryClient = useQueryClient();
  const { updateTenant } = useTenantStore();

  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: number; data: UpdateTenantRequest }) => {
      const response = await apiClient.put(`/api/franchise/${tenantId}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update local store
      updateTenant(variables.tenantId, data.tenant);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['franchise', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['franchises'] });
    },
  });
}

export function useSuspendFranchise() {
  const queryClient = useQueryClient();
  const { updateTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (tenantId: number) => {
      const response = await apiClient.post(`/api/franchise/${tenantId}/suspend`);
      return response.data;
    },
    onSuccess: (data, tenantId) => {
      // Update local store
      updateTenant(tenantId, { status: 'suspended' });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['franchise', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['franchises'] });
    },
  });
}

export function useActivateFranchise() {
  const queryClient = useQueryClient();
  const { updateTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (tenantId: number) => {
      const response = await apiClient.post(`/api/franchise/${tenantId}/activate`);
      return response.data;
    },
    onSuccess: (data, tenantId) => {
      // Update local store
      updateTenant(tenantId, { status: 'active' });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['franchise', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['franchises'] });
    },
  });
}

export function useDeleteFranchise() {
  const queryClient = useQueryClient();
  const { removeTenant } = useTenantStore();

  return useMutation({
    mutationFn: async (tenantId: number) => {
      const response = await apiClient.delete(`/api/franchise/${tenantId}`);
      return response.data;
    },
    onSuccess: (data, tenantId) => {
      // Update local store
      removeTenant(tenantId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['franchises'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

// Analytics Hooks
export function useFranchiseAnalytics(tenantId: number) {
  return useQuery({
    queryKey: ['franchise-analytics', tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/franchise/${tenantId}/analytics`);
      return response.data;
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/api/franchise/platform-stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Revenue Share Hooks
export function useRevenueShares(tenantId: number, params?: {
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ['revenue-shares', tenantId, params],
    queryFn: async () => {
      const response = await apiClient.get(`/api/franchise/${tenantId}/revenue-shares`, { params });
      return response.data;
    },
    enabled: !!tenantId,
  });
}

export function usePendingPayouts() {
  return useQuery({
    queryKey: ['pending-payouts'],
    queryFn: async () => {
      const response = await apiClient.get('/api/franchise/pending-payouts');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProcessPayoutRequest) => {
      const response = await apiClient.post('/api/franchise/process-payout', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-shares'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

// Theme Management Hooks
export function useTenantTheme(tenantId: number) {
  return useQuery({
    queryKey: ['tenant-theme', tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/franchise/${tenantId}/theme`);
      return response.data;
    },
    enabled: !!tenantId,
  });
}

export function useUpdateTenantTheme() {
  const queryClient = useQueryClient();
  const { updateTheme } = useTenantStore();

  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: number; data: UpdateThemeRequest }) => {
      const response = await apiClient.put(`/api/franchise/${tenantId}/theme`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update local store
      updateTheme(data.theme);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tenant-theme', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['franchise', variables.tenantId] });
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId, file }: { tenantId: number; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await apiClient.post(`/api/franchise/${tenantId}/theme/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tenant-theme', variables.tenantId] });
    },
  });
}

export function useUploadFavicon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId, file }: { tenantId: number; file: File }) => {
      const formData = new FormData();
      formData.append('favicon', file);
      
      const response = await apiClient.post(`/api/franchise/${tenantId}/theme/favicon`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['tenant-theme', variables.tenantId] });
    },
  });
}

// Utility Hooks
export function useCurrentTenantData() {
  const { currentTenant } = useTenantStore();
  
  const analyticsQuery = useFranchiseAnalytics(currentTenant?.id || 0);
  const themeQuery = useTenantTheme(currentTenant?.id || 0);
  const revenueQuery = useRevenueShares(currentTenant?.id || 0);

  return {
    tenant: currentTenant,
    analytics: analyticsQuery.data,
    theme: themeQuery.data,
    revenue: revenueQuery.data,
    isLoading: analyticsQuery.isLoading || themeQuery.isLoading || revenueQuery.isLoading,
    error: analyticsQuery.error || themeQuery.error || revenueQuery.error,
  };
}

// Franchise Plan Features
export function usePlanFeatures(plan: 'basic' | 'premium' | 'enterprise') {
  const features = {
    basic: {
      max_products: 100,
      max_orders_per_month: 500,
      custom_domain: false,
      white_label: false,
      analytics: 'basic',
      support: 'email',
      commission_rate: 15.0,
      monthly_fee: 99.00,
      features: [
        'Μέχρι 100 προϊόντα',
        'Μέχρι 500 παραγγελίες/μήνα',
        'Βασικά αναλυτικά',
        'Email υποστήριξη',
        'Subdomain (yourstore.dixis.gr)'
      ]
    },
    premium: {
      max_products: 1000,
      max_orders_per_month: 2000,
      custom_domain: true,
      white_label: true,
      analytics: 'advanced',
      support: 'priority',
      commission_rate: 12.0,
      monthly_fee: 299.00,
      features: [
        'Μέχρι 1000 προϊόντα',
        'Μέχρι 2000 παραγγελίες/μήνα',
        'Προχωρημένα αναλυτικά',
        'Προτεραιότητα υποστήριξης',
        'Custom domain',
        'White-label branding',
        'Προσαρμογή θέματος'
      ]
    },
    enterprise: {
      max_products: -1,
      max_orders_per_month: -1,
      custom_domain: true,
      white_label: true,
      analytics: 'enterprise',
      support: 'dedicated',
      commission_rate: 10.0,
      monthly_fee: 999.00,
      features: [
        'Απεριόριστα προϊόντα',
        'Απεριόριστες παραγγελίες',
        'Enterprise αναλυτικά',
        'Αφιερωμένη υποστήριξη',
        'Custom domain',
        'Πλήρης white-label',
        'Custom CSS',
        'API access',
        'Προτεραιότητα features'
      ]
    }
  };

  return features[plan];
}
