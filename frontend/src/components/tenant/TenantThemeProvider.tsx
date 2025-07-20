'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useEffect, useState } from 'react';
import { useTenantStore } from '@/stores/tenantStore';

interface TenantThemeProviderProps {
  children: React.ReactNode;
}

export default function TenantThemeProvider({ children }: TenantThemeProviderProps) {
  const { currentTenant, tenantTheme, setCurrentTenant, setTenantTheme } = useTenantStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeTenantContext();
  }, []);

  useEffect(() => {
    if (tenantTheme && isInitialized) {
      applyThemeToDocument();
    }
  }, [tenantTheme, isInitialized]);

  const initializeTenantContext = async () => {
    try {
      // Detect tenant from current domain
      const tenant = await detectTenantFromDomain();
      
      if (tenant) {
        setCurrentTenant(tenant);
        
        // Load tenant theme
        if (tenant.theme) {
          setTenantTheme(tenant.theme);
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      logger.error('Failed to initialize tenant context:', toError(error), errorToContext(error));
      setIsInitialized(true);
    }
  };

  const detectTenantFromDomain = async () => {
    // In a real implementation, this would make an API call
    // For now, we'll simulate tenant detection
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    // Check if this is a subdomain
    if (hostname.includes('.dixis.gr') && hostname !== 'dixis.gr') {
      const subdomain = hostname.split('.')[0];
      
      // Mock tenant data - in real app, fetch from API
      return {
        id: 1,
        name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Marketplace`,
        slug: subdomain,
        subdomain: subdomain,
        plan: 'premium' as const,
        status: 'active' as const,
        owner_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        theme: {
          id: 1,
          tenant_id: 1,
          primary_color: '#16a34a',
          secondary_color: '#059669',
          accent_color: '#10b981',
          background_color: '#ffffff',
          text_color: '#1f2937',
          font_family: 'Inter',
          logo_url: null,
          favicon_url: null,
          custom_css: '',
          settings: {}
        }
      };
    }
    
    return null;
  };

  const applyThemeToDocument = () => {
    if (!tenantTheme) return;

    // Apply CSS custom properties
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', tenantTheme.primary_color);
    root.style.setProperty('--color-secondary', tenantTheme.secondary_color);
    root.style.setProperty('--color-accent', tenantTheme.accent_color);
    root.style.setProperty('--color-background', tenantTheme.background_color);
    root.style.setProperty('--color-text', tenantTheme.text_color);
    root.style.setProperty('--font-family', `'${tenantTheme.font_family}', sans-serif`);

    // Apply custom CSS if provided
    if (tenantTheme.custom_css) {
      let customStyleElement = document.getElementById('tenant-custom-css');
      
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'tenant-custom-css';
        document.head.appendChild(customStyleElement);
      }
      
      customStyleElement.textContent = tenantTheme.custom_css;
    }

    // Update favicon if provided
    if (tenantTheme.favicon_url) {
      updateFavicon(tenantTheme.favicon_url);
    }

    // Update document title if tenant name is available
    if (currentTenant?.name) {
      document.title = `${currentTenant.name} - Marketplace`;
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = faviconUrl;
      document.head.appendChild(newFavicon);
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for using tenant theme in components
export function useTenantTheme() {
  const { tenantTheme, updateTheme, applyColorScheme } = useTenantStore();

  const getCSSVariable = (variable: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
  };

  const setCSSVariable = (variable: string, value: string) => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(variable, value);
  };

  const getThemeColors = () => {
    if (!tenantTheme) return null;
    
    return {
      primary: tenantTheme.primary_color,
      secondary: tenantTheme.secondary_color,
      accent: tenantTheme.accent_color,
      background: tenantTheme.background_color,
      text: tenantTheme.text_color
    };
  };

  const updateColor = (colorType: string, color: string) => {
    const colorMap: Record<string, string> = {
      primary: 'primary_color',
      secondary: 'secondary_color',
      accent: 'accent_color',
      background: 'background_color',
      text: 'text_color'
    };

    const themeProperty = colorMap[colorType];
    if (themeProperty) {
      updateTheme({ [themeProperty]: color });
      setCSSVariable(`--color-${colorType}`, color);
    }
  };

  const updateFont = (fontFamily: string) => {
    updateTheme({ font_family: fontFamily });
    setCSSVariable('--font-family', `'${fontFamily}', sans-serif`);
  };

  const resetToDefault = () => {
    applyColorScheme('green');
    updateFont('Inter');
  };

  return {
    theme: tenantTheme,
    colors: getThemeColors(),
    updateColor,
    updateFont,
    updateTheme,
    applyColorScheme,
    resetToDefault,
    getCSSVariable,
    setCSSVariable
  };
}

// Hook for tenant context
export function useTenantContext() {
  const { 
    currentTenant, 
    isCurrentTenantActive, 
    canCurrentTenantAddProducts,
    getCurrentTenantCommissionRate,
    getTenantPlanFeatures,
    getCurrentTenantUrl
  } = useTenantStore();

  return {
    tenant: currentTenant,
    isActive: isCurrentTenantActive(),
    canAddProducts: canCurrentTenantAddProducts(),
    commissionRate: getCurrentTenantCommissionRate(),
    planFeatures: getTenantPlanFeatures(),
    tenantUrl: getCurrentTenantUrl(),
    isTrial: currentTenant?.status === 'trial',
    isExpired: currentTenant?.subscription_expires_at 
      ? new Date(currentTenant.subscription_expires_at) < new Date()
      : false
  };
}
