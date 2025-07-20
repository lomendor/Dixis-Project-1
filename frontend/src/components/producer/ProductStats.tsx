'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useEffect, useState } from 'react';
import { 
  CubeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';

interface ProductStatsData {
  total_products: number;
  active_products: number;
  pending_products: number;
  inactive_products: number;
  out_of_stock: number;
  low_stock: number;
}

export default function ProductStats() {
  const [stats, setStats] = useState<ProductStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/producer/products/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      logger.error('Error fetching product stats:', toError(error), errorToContext(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: 'Σύνολο Προϊόντων',
      value: stats.total_products,
      icon: CubeIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Ενεργά Προϊόντα',
      value: stats.active_products,
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Υπό Έγκριση',
      value: stats.pending_products,
      icon: ClockIcon,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'Ανενεργά',
      value: stats.inactive_products,
      icon: XCircleIcon,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      label: 'Εξαντλημένα',
      value: stats.out_of_stock,
      icon: ArchiveBoxXMarkIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Χαμηλό Απόθεμα',
      value: stats.low_stock,
      icon: ExclamationTriangleIcon,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
              <div className={`${item.bgColor} rounded-full p-2`}>
                <Icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}