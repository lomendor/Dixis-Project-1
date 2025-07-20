'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Shield, 
  Activity,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import { ErrorSeverity, ErrorCategory, productionErrorHandler } from '@/lib/monitoring/productionErrorHandler';

interface ErrorStatistics {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  byCategory: Record<ErrorCategory, number>;
  resolved: number;
  pending: number;
}

interface SystemHealth {
  database: { status: 'healthy' | 'warning' | 'critical'; responseTime: number };
  redis: { status: 'healthy' | 'warning' | 'critical'; responseTime: number };
  payments: { status: 'healthy' | 'warning' | 'critical'; successRate: number };
  taxCalculation: { status: 'healthy' | 'warning' | 'critical'; accuracy: number };
  overallStatus: 'healthy' | 'warning' | 'critical';
}

export default function ErrorMonitoringDashboard() {
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeWindow, autoRefresh]);

  const fetchMonitoringData = async () => {
    try {
      setIsLoading(true);
      
      // Get error statistics
      const timeWindowMs = getTimeWindowMs(selectedTimeWindow);
      const stats = productionErrorHandler.getErrorStatistics(timeWindowMs);
      setErrorStats(stats);
      
      // Fetch system health data
      const healthResponse = await fetch('/api/monitoring/health');
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        setSystemHealth(health.data);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      logger.error('Failed to fetch monitoring data', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeWindowMs = (window: string): number => {
    switch (window) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return 'text-red-600 bg-red-50 border-red-200';
      case ErrorSeverity.HIGH: return 'text-orange-600 bg-orange-50 border-orange-200';
      case ErrorSeverity.MEDIUM: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ErrorSeverity.LOW: return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryDisplayName = (category: ErrorCategory): string => {
    const names = {
      [ErrorCategory.PAYMENT]: 'Πληρωμές',
      [ErrorCategory.TAX_CALCULATION]: 'Υπολογισμός ΦΠΑ',
      [ErrorCategory.AUTHENTICATION]: 'Ταυτοποίηση',
      [ErrorCategory.PRODUCT_CATALOG]: 'Κατάλογος Προϊόντων',
      [ErrorCategory.ORDER_PROCESSING]: 'Επεξεργασία Παραγγελιών',
      [ErrorCategory.SHIPPING]: 'Αποστολές',
      [ErrorCategory.INTEGRATION]: 'Ενσωματώσεις',
      [ErrorCategory.PERFORMANCE]: 'Απόδοση',
      [ErrorCategory.SECURITY]: 'Ασφάλεια',
      [ErrorCategory.USER_INTERFACE]: 'Διεπαφή Χρήστη'
    };
    return names[category] || category;
  };

  if (isLoading && !errorStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Φόρτωση δεδομένων παρακολούθησης...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Παρακολούθηση Σφαλμάτων</h2>
          <p className="text-sm text-gray-500">
            Τελευταία ενημέρωση: {lastUpdated.toLocaleString('el-GR')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Window Selector */}
          <select
            value={selectedTimeWindow}
            onChange={(e) => setSelectedTimeWindow(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="1h">Τελευταία ώρα</option>
            <option value="6h">Τελευταίες 6 ώρες</option>
            <option value="24h">Τελευταίες 24 ώρες</option>
            <option value="7d">Τελευταίες 7 ημέρες</option>
          </select>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Αυτόματη Ανανέωση' : 'Χειροκίνητη Ανανέωση'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={fetchMonitoringData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Ανανέωση</span>
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Υγεία Συστήματος</span>
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getHealthStatusColor(systemHealth.overallStatus)}`}>
              {systemHealth.overallStatus === 'healthy' && '✅ Υγιές'}
              {systemHealth.overallStatus === 'warning' && '⚠️ Προσοχή'}
              {systemHealth.overallStatus === 'critical' && '🚨 Κρίσιμο'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Βάση Δεδομένων</span>
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth.database.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.database.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <p className="text-xs text-gray-500">Χρόνος απόκρισης: {systemHealth.database.responseTime}ms</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Redis Cache</span>
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth.redis.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.redis.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <p className="text-xs text-gray-500">Χρόνος απόκρισης: {systemHealth.redis.responseTime}ms</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Πληρωμές</span>
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth.payments.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.payments.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <p className="text-xs text-gray-500">Ποσοστό επιτυχίας: {systemHealth.payments.successRate}%</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Υπολογισμός ΦΠΑ</span>
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth.taxCalculation.status === 'healthy' ? 'bg-green-500' :
                  systemHealth.taxCalculation.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              <p className="text-xs text-gray-500">Ακρίβεια: {systemHealth.taxCalculation.accuracy}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Statistics */}
      {errorStats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Συνολικά Σφάλματα</p>
                  <p className="text-2xl font-bold text-gray-900">{errorStats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Κρίσιμα Σφάλματα</p>
                  <p className="text-2xl font-bold text-red-600">
                    {errorStats.bySeverity[ErrorSeverity.CRITICAL] || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Επιλυμένα</p>
                  <p className="text-2xl font-bold text-green-600">{errorStats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Εκκρεμή</p>
                  <p className="text-2xl font-bold text-yellow-600">{errorStats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Error Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Errors by Severity */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Σφάλματα ανά Σοβαρότητα</span>
              </h3>
              
              <div className="space-y-3">
                {Object.entries(errorStats.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(severity as ErrorSeverity)}`}>
                        {severity.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600">
                        {severity === 'critical' && 'Κρίσιμα'}
                        {severity === 'high' && 'Υψηλής Σοβαρότητας'}
                        {severity === 'medium' && 'Μέτριας Σοβαρότητας'}
                        {severity === 'low' && 'Χαμηλής Σοβαρότητας'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            severity === 'critical' ? 'bg-red-500' :
                            severity === 'high' ? 'bg-orange-500' :
                            severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${errorStats.total > 0 ? (count / errorStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors by Category */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Σφάλματα ανά Κατηγορία</span>
              </h3>
              
              <div className="space-y-3">
                {Object.entries(errorStats.byCategory)
                  .filter(([_, count]) => count > 0)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {getCategoryDisplayName(category as ErrorCategory)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${errorStats.total > 0 ? (count / errorStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Ποσοστό Επίλυσης Σφαλμάτων</span>
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Επιλυμένα</span>
                  <span className="text-sm font-medium text-gray-900">
                    {errorStats.total > 0 ? Math.round((errorStats.resolved / errorStats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-green-500 rounded-full"
                    style={{ 
                      width: `${errorStats.total > 0 ? (errorStats.resolved / errorStats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {errorStats.resolved} από {errorStats.total} σφάλματα
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Ενέργειες Παρακολούθησης</h4>
            <p className="text-sm text-gray-600">Εργαλεία για τη διαχείριση και ανάλυση σφαλμάτων</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Eye className="w-4 h-4" />
              <span>Προβολή Λεπτομερειών</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Φίλτρα</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
              <AlertCircle className="w-4 h-4" />
              <span>Αναφορά Σφάλματος</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}