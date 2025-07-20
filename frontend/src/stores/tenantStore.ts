import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  subdomain: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  owner_id: number;
  settings?: Record<string, any>;
  subscription_expires_at?: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantTheme {
  id: number;
  tenant_id: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
  settings?: Record<string, any>;
}

export interface RevenueShare {
  id: number;
  tenant_id: number;
  order_id?: number;
  transaction_type: 'order' | 'subscription' | 'setup_fee' | 'refund' | 'chargeback';
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  platform_fee: number;
  payment_processor_fee: number;
  status: 'pending' | 'calculated' | 'approved' | 'paid' | 'disputed' | 'cancelled';
  processed_at?: string;
  payout_date?: string;
  payout_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantAnalytics {
  current_month: {
    revenue: number;
    commission: number;
    orders: number;
    products: number;
    users: number;
  };
  last_month: {
    revenue: number;
    orders: number;
  };
  plan_features: {
    max_products: number;
    max_orders_per_month: number;
    custom_domain: boolean;
    white_label: boolean;
    analytics: string;
    support: string;
    commission_rate: number;
    monthly_fee: number;
  };
  subscription_status: {
    is_trial: boolean;
    trial_ends_at?: string;
    subscription_expires_at?: string;
    is_expired: boolean;
  };
}

interface TenantState {
  // Current tenant context
  currentTenant: Tenant | null;
  tenantTheme: TenantTheme | null;
  
  // Franchise management (admin)
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  tenantAnalytics: TenantAnalytics | null;
  revenueShares: RevenueShare[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentTenant: (tenant: Tenant | null) => void;
  setTenantTheme: (theme: TenantTheme | null) => void;
  setTenants: (tenants: Tenant[]) => void;
  setSelectedTenant: (tenant: Tenant | null) => void;
  setTenantAnalytics: (analytics: TenantAnalytics | null) => void;
  setRevenueShares: (shares: RevenueShare[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Tenant management
  addTenant: (tenant: Tenant) => void;
  updateTenant: (id: number, updates: Partial<Tenant>) => void;
  removeTenant: (id: number) => void;
  
  // Theme management
  updateTheme: (updates: Partial<TenantTheme>) => void;
  applyColorScheme: (scheme: string) => void;
  
  // Utility functions
  getCurrentTenantUrl: () => string;
  getTenantPlanFeatures: () => any;
  isCurrentTenantActive: () => boolean;
  canCurrentTenantAddProducts: () => boolean;
  getCurrentTenantCommissionRate: () => number;
  
  // Reset functions
  reset: () => void;
  resetTenantData: () => void;
}

const initialState = {
  currentTenant: null,
  tenantTheme: null,
  tenants: [],
  selectedTenant: null,
  tenantAnalytics: null,
  revenueShares: [],
  isLoading: false,
  error: null,
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
      setTenantTheme: (theme) => set({ tenantTheme: theme }),
      setTenants: (tenants) => set({ tenants }),
      setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
      setTenantAnalytics: (analytics) => set({ tenantAnalytics: analytics }),
      setRevenueShares: (shares) => set({ revenueShares: shares }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Tenant management
      addTenant: (tenant) => set((state) => ({
        tenants: [...state.tenants, tenant]
      })),

      updateTenant: (id, updates) => set((state) => ({
        tenants: state.tenants.map(tenant =>
          tenant.id === id ? { ...tenant, ...updates } : tenant
        ),
        selectedTenant: state?.selectedTenant?.id === id
          ? { ...state.selectedTenant, ...updates }
          : state.selectedTenant,
        currentTenant: state?.currentTenant?.id === id
          ? { ...state.currentTenant, ...updates }
          : state.currentTenant
      })),

      removeTenant: (id) => set((state) => ({
        tenants: state.tenants.filter(tenant => tenant.id !== id),
        selectedTenant: state?.selectedTenant?.id === id ? null : state.selectedTenant,
        currentTenant: state?.currentTenant?.id === id ? null : state.currentTenant
      })),

      // Theme management
      updateTheme: (updates) => set((state) => ({
        tenantTheme: state.tenantTheme ? { ...state.tenantTheme, ...updates } : null
      })),

      applyColorScheme: (scheme) => {
        const colorSchemes: Record<string, Partial<TenantTheme>> = {
          green: {
            primary_color: '#16a34a',
            secondary_color: '#059669',
            accent_color: '#10b981',
            background_color: '#ffffff',
            text_color: '#1f2937'
          },
          blue: {
            primary_color: '#2563eb',
            secondary_color: '#1d4ed8',
            accent_color: '#3b82f6',
            background_color: '#ffffff',
            text_color: '#1f2937'
          },
          purple: {
            primary_color: '#7c3aed',
            secondary_color: '#6d28d9',
            accent_color: '#8b5cf6',
            background_color: '#ffffff',
            text_color: '#1f2937'
          },
          dark: {
            primary_color: '#10b981',
            secondary_color: '#059669',
            accent_color: '#34d399',
            background_color: '#111827',
            text_color: '#f9fafb'
          }
        };

        const colors = colorSchemes[scheme];
        if (colors) {
          get().updateTheme(colors);
        }
      },

      // Utility functions
      getCurrentTenantUrl: () => {
        const { currentTenant } = get();
        if (!currentTenant) return '';
        
        if (currentTenant.domain) {
          return `https://${currentTenant.domain}`;
        }
        
        return `https://${currentTenant.subdomain}.dixis.gr`;
      },

      getTenantPlanFeatures: () => {
        const { currentTenant } = get();
        if (!currentTenant) return null;
        
        const features = {
          basic: {
            max_products: 100,
            max_orders_per_month: 500,
            custom_domain: false,
            white_label: false,
            analytics: 'basic',
            support: 'email',
            commission_rate: 15.0,
            monthly_fee: 99.00
          },
          premium: {
            max_products: 1000,
            max_orders_per_month: 2000,
            custom_domain: true,
            white_label: true,
            analytics: 'advanced',
            support: 'priority',
            commission_rate: 12.0,
            monthly_fee: 299.00
          },
          enterprise: {
            max_products: -1,
            max_orders_per_month: -1,
            custom_domain: true,
            white_label: true,
            analytics: 'enterprise',
            support: 'dedicated',
            commission_rate: 10.0,
            monthly_fee: 999.00
          }
        };
        
        return features[currentTenant.plan];
      },

      isCurrentTenantActive: () => {
        const { currentTenant } = get();
        if (!currentTenant) return false;
        
        if (currentTenant.status === 'suspended' || currentTenant.status === 'inactive') {
          return false;
        }
        
        // Check trial expiration
        if (currentTenant.status === 'trial' && currentTenant.trial_ends_at) {
          return new Date(currentTenant.trial_ends_at) > new Date();
        }
        
        // Check subscription expiration
        if (currentTenant.status === 'active' && currentTenant.subscription_expires_at) {
          return new Date(currentTenant.subscription_expires_at) > new Date();
        }
        
        return true;
      },

      canCurrentTenantAddProducts: () => {
        const { currentTenant, tenantAnalytics } = get();
        if (!currentTenant || !tenantAnalytics) return false;
        
        const features = get().getTenantPlanFeatures();
        if (!features) return false;
        
        if (features.max_products === -1) return true; // unlimited
        
        return tenantAnalytics.current_month.products < features.max_products;
      },

      getCurrentTenantCommissionRate: () => {
        const features = get().getTenantPlanFeatures();
        return features?.commission_rate || 15.0;
      },

      // Reset functions
      reset: () => set(initialState),
      
      resetTenantData: () => set((state) => ({
        ...state,
        tenants: [],
        selectedTenant: null,
        tenantAnalytics: null,
        revenueShares: [],
        error: null
      }))
    }),
    {
      name: 'tenant-store',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        tenantTheme: state.tenantTheme
      })
    }
  )
);
