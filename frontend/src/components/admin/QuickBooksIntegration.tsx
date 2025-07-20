'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Settings, Zap } from 'lucide-react';

interface IntegrationStatus {
  connected: boolean;
  lastSync: string | null;
  companyName: string | null;
  realmId: string | null;
  accessTokenExpiry: string | null;
}

interface SyncStats {
  customers: { synced: number; total: number };
  orders: { synced: number; total: number };
  products: { synced: number; total: number };
}

export default function QuickBooksIntegration() {
  const [status, setStatus] = useState<IntegrationStatus>({
    connected: false,
    lastSync: null,
    companyName: null,
    realmId: null,
    accessTokenExpiry: null
  });
  
  const [syncStats, setSyncStats] = useState<SyncStats>({
    customers: { synced: 0, total: 0 },
    orders: { synced: 0, total: 0 },
    products: { synced: 0, total: 0 }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/integrations/quickbooks/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setSyncStats(data.syncStats);
      }
    } catch (err) {
      logger.error('Failed to fetch QuickBooks status:', toError(err), errorToContext(err));
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/integrations/quickbooks/auth');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        setError('Failed to initiate QuickBooks connection');
      }
    } catch (err) {
      setError('Connection error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/integrations/quickbooks/disconnect', {
        method: 'POST'
      });
      if (response.ok) {
        setStatus({
          connected: false,
          lastSync: null,
          companyName: null,
          realmId: null,
          accessTokenExpiry: null
        });
      }
    } catch (err) {
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: 'customers' | 'orders' | 'products' | 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/integrations/quickbooks/sync/${type}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSyncStats(data.syncStats);
        setStatus(prev => ({ ...prev, lastSync: new Date().toISOString() }));
      } else {
        setError(`Failed to sync ${type}`);
      }
    } catch (err) {
      setError('Sync error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">QuickBooks Integration</h2>
        <Badge variant={status.connected ? "default" : "secondary"}>
          {status.connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Connected to {status.companyName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Company:</strong> {status.companyName}
                </div>
                <div>
                  <strong>Realm ID:</strong> {status.realmId}
                </div>
                <div>
                  <strong>Last Sync:</strong> {status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}
                </div>
                <div>
                  <strong>Token Expires:</strong> {status.accessTokenExpiry ? new Date(status.accessTokenExpiry).toLocaleString() : 'Unknown'}
                </div>
              </div>
              <Button 
                onClick={handleDisconnect} 
                variant="outline" 
                disabled={loading}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Not connected to QuickBooks</span>
              </div>
              <Button 
                onClick={handleConnect} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Connect to QuickBooks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Statistics */}
      {status.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Synchronization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {syncStats.customers.synced}/{syncStats.customers.total}
                </div>
                <div className="text-sm text-gray-600">Customers</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => handleSync('customers')}
                  disabled={loading}
                >
                  Sync
                </Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {syncStats.orders.synced}/{syncStats.orders.total}
                </div>
                <div className="text-sm text-gray-600">Orders</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => handleSync('orders')}
                  disabled={loading}
                >
                  Sync
                </Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {syncStats.products.synced}/{syncStats.products.total}
                </div>
                <div className="text-sm text-gray-600">Products</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => handleSync('products')}
                  disabled={loading}
                >
                  Sync
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={() => handleSync('all')} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Syncing...' : 'Sync All'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
