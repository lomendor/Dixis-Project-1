'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useState, useEffect } from 'react';
import { useTenantStore } from '@/stores/tenantStore';
import { 
  BuildingStorefrontIcon, 
  CurrencyEuroIcon, 
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface FranchiseDashboardProps {
  isAdmin?: boolean;
}

export default function FranchiseDashboard({ isAdmin = false }: FranchiseDashboardProps) {
  const { 
    tenants, 
    selectedTenant, 
    tenantAnalytics,
    revenueShares,
    isLoading,
    setTenants,
    setSelectedTenant,
    setTenantAnalytics,
    setRevenueShares,
    setLoading
  } = useTenantStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'revenue' | 'analytics'>('overview');

  useEffect(() => {
    if (isAdmin) {
      loadFranchiseData();
    }
  }, [isAdmin]);

  const loadFranchiseData = async () => {
    setLoading(true);
    try {
      // In real app, these would be API calls
      await Promise.all([
        loadTenants(),
        loadPlatformStats(),
        loadRevenueData()
      ]);
    } catch (error) {
      logger.error('Failed to load franchise data:', toError(error), errorToContext(error));
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    // Mock data - replace with actual API call
    const mockTenants = [
      {
        id: 1,
        name: 'Κρητικά Προϊόντα',
        slug: 'kreta',
        subdomain: 'kreta',
        plan: 'premium' as const,
        status: 'active' as const,
        owner_id: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z'
      },
      {
        id: 2,
        name: 'Μακεδονικές Γεύσεις',
        slug: 'makedonia',
        subdomain: 'makedonia',
        plan: 'basic' as const,
        status: 'trial' as const,
        owner_id: 2,
        trial_ends_at: '2024-02-15T10:00:00Z',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];
    
    setTenants(mockTenants);
  };

  const loadPlatformStats = async () => {
    // Mock analytics data
    const mockAnalytics = {
      current_month: {
        revenue: 15420.50,
        commission: 1850.25,
        orders: 156,
        products: 89,
        users: 234
      },
      last_month: {
        revenue: 12340.00,
        orders: 134
      },
      plan_features: {
        max_products: 1000,
        max_orders_per_month: 2000,
        custom_domain: true,
        white_label: true,
        analytics: 'advanced',
        support: 'priority',
        commission_rate: 12.0,
        monthly_fee: 299.00
      },
      subscription_status: {
        is_trial: false,
        trial_ends_at: null,
        subscription_expires_at: '2024-12-31T23:59:59Z',
        is_expired: false
      }
    };
    
    setTenantAnalytics(mockAnalytics);
  };

  const loadRevenueData = async () => {
    // Mock revenue shares
    const mockRevenueShares = [
      {
        id: 1,
        tenant_id: 1,
        order_id: 101,
        transaction_type: 'order' as const,
        gross_amount: 125.50,
        commission_rate: 12.0,
        commission_amount: 15.06,
        net_amount: 110.44,
        platform_fee: 2.51,
        payment_processor_fee: 3.99,
        status: 'approved' as const,
        processed_at: '2024-01-20T10:00:00Z',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ];
    
    setRevenueShares(mockRevenueShares);
  };

  const handleCreateFranchise = () => {
    // Navigate to create franchise form
    logger.info('Create new franchise');
  };

  const handleSelectTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setActiveTab('analytics');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Franchise Management' : 'Franchise Dashboard'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isAdmin ? 'Διαχείριση όλων των franchise' : 'Επισκόπηση της επιχείρησής σας'}
              </p>
            </div>
            
            {isAdmin && (
              <button
                onClick={handleCreateFranchise}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Νέο Franchise
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Επισκόπηση', icon: ChartBarIcon },
                { id: 'tenants', name: 'Franchise', icon: BuildingStorefrontIcon },
                { id: 'revenue', name: 'Έσοδα', icon: CurrencyEuroIcon },
                { id: 'analytics', name: 'Αναλυτικά', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab analytics={tenantAnalytics} />}
        {activeTab === 'tenants' && <TenantsTab tenants={tenants} onSelectTenant={handleSelectTenant} />}
        {activeTab === 'revenue' && <RevenueTab revenueShares={revenueShares} />}
        {activeTab === 'analytics' && <AnalyticsTab tenant={selectedTenant} analytics={tenantAnalytics} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ analytics }: { analytics: any }) {
  const stats = [
    {
      name: 'Μηνιαίος Τζίρος',
      value: `€${analytics?.current_month?.revenue?.toFixed(2) || '0.00'}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: CurrencyEuroIcon
    },
    {
      name: 'Παραγγελίες',
      value: analytics?.current_month?.orders || 0,
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingBagIcon
    },
    {
      name: 'Προϊόντα',
      value: analytics?.current_month?.products || 0,
      change: '+5.1%',
      changeType: 'positive',
      icon: BuildingStorefrontIcon
    },
    {
      name: 'Χρήστες',
      value: analytics?.current_month?.users || 0,
      change: '+15.3%',
      changeType: 'positive',
      icon: UsersIcon
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Γρήγορες Ενέργειες</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <BuildingStorefrontIcon className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Νέο Προϊόν</h4>
            <p className="text-sm text-gray-600">Προσθήκη νέου προϊόντος</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <ChartBarIcon className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Αναφορές</h4>
            <p className="text-sm text-gray-600">Προβολή αναλυτικών</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <CogIcon className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Ρυθμίσεις</h4>
            <p className="text-sm text-gray-600">Διαχείριση λογαριασμού</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Tenants Tab Component
function TenantsTab({ tenants, onSelectTenant }: { tenants: any[], onSelectTenant: (tenant: any) => void }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Franchise Καταστήματα</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Όνομα
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Πλάνο
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Κατάσταση
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Δημιουργήθηκε
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ενέργειες
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.subdomain}.dixis.gr</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                    tenant.plan === 'premium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                    tenant.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tenant.created_at).toLocaleDateString('el-GR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onSelectTenant(tenant)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Προβολή
                  </button>
                  <button className="text-blue-600 hover:text-blue-900">
                    Επεξεργασία
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Revenue Tab Component
function RevenueTab({ revenueShares }: { revenueShares: any[] }) {
  const totalRevenue = revenueShares.reduce((sum, share) => sum + share.gross_amount, 0);
  const totalCommission = revenueShares.reduce((sum, share) => sum + share.commission_amount, 0);

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Συνολικός Τζίρος</p>
              <p className="text-2xl font-semibold text-gray-900">€{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Προμήθειες</p>
              <p className="text-2xl font-semibold text-gray-900">€{totalCommission.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Συναλλαγές</p>
              <p className="text-2xl font-semibold text-gray-900">{revenueShares.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Shares Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Πρόσφατες Συναλλαγές</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Παραγγελία
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ποσό
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Προμήθεια
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Καθαρό
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Κατάσταση
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ημερομηνία
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueShares.map((share) => (
                <tr key={share.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{share.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{share.gross_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{share.commission_amount.toFixed(2)} ({share.commission_rate}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{share.net_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      share.status === 'paid' ? 'bg-green-100 text-green-800' :
                      share.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {share.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(share.created_at).toLocaleDateString('el-GR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ tenant, analytics }: { tenant: any, analytics: any }) {
  if (!tenant) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Επιλέξτε Franchise</h3>
        <p className="mt-1 text-sm text-gray-500">
          Επιλέξτε ένα franchise από τη λίστα για να δείτε τα αναλυτικά του.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Αναλυτικά για {tenant.name}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              €{analytics?.current_month?.revenue?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-600">Μηνιαίος Τζίρος</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics?.current_month?.orders || 0}
            </div>
            <div className="text-sm text-gray-600">Παραγγελίες</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics?.current_month?.products || 0}
            </div>
            <div className="text-sm text-gray-600">Προϊόντα</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics?.current_month?.users || 0}
            </div>
            <div className="text-sm text-gray-600">Χρήστες</div>
          </div>
        </div>
      </div>
    </div>
  );
}
